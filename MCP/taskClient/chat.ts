
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Set GEMINI_API_KEY in the .env file");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const model =  "gemini-3.5-flash-lite";
const mcpUrl =process.env.MCP_SERVER_URL

const mcpClient = new Client({
  name: "task-client",
  version: "1.0.0",
});

const transport = new StreamableHTTPClientTransport(
  new URL(mcpUrl)
);

await mcpClient.connect(transport);

const MAX_TOOL_ROUNDS = 10;

function toGeminiTools(mcpTools: Awaited<ReturnType<typeof mcpClient.listTools>>["tools"]) {
  return mcpTools.map((tool) => ({
    type: "function" as const,
    name: tool.name,
    description: tool.description ?? "",
    parameters: tool.inputSchema,
  }));
}

function toolResultText(result: {
  content?: Array<{
    type: string;
    text?: string;
    [key: string]: unknown;
  }>;
  isError?: boolean;
}) {
  const content = (result.content ?? [])
    .map((block) =>
      block.type === "text"
        ? block.text ?? ""
        : JSON.stringify(block)
    )
    .join("\n");

  return result.isError
    ? `Tool execution failed: ${content}`
    : content;
}

async function askModel(
  message: string,
  instructions = "You are a helpful task management assistant."
): Promise<string> {
  const { tools: mcpTools } = await mcpClient.listTools();
  const tools = toGeminiTools(mcpTools);
  const availableTools = new Set(mcpTools.map((tool) => tool.name));

  let interaction = await ai.interactions.create({
    model,
    input: `${instructions}\n\nUSER REQUEST:\n${message}`,
    tools,
  });

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const functionCalls = (interaction.steps ?? []).filter(
      (step) => step.type === "function_call"
    );

    if (functionCalls.length === 0) {
      return interaction.output_text ?? "";
    }

    const functionResults = await Promise.all(
      functionCalls.map(async (call) => {
        if (!call.name || !availableTools.has(call.name)) {
          throw new Error(
            `Unknown MCP tool "${call.name ?? "undefined"}".`
          );
        }

        if (!call.id) {
          throw new Error(
            `Gemini returned a function call without an ID: ${call.name}`
          );
        }

        const args =
          call.arguments &&
          typeof call.arguments === "object" &&
          !Array.isArray(call.arguments)
            ? (call.arguments as Record<string, unknown>)
            : {};

        const result = await mcpClient.callTool({
          name: call.name,
          arguments: args,
        });

        return {
          type: "function_result" as const,
          name: call.name,
          call_id: call.id,
          result: [
            {
              type: "text" as const,
              text: toolResultText(result),
            },
          ],
        };
      })
    );

    interaction = await ai.interactions.create({
      model,
      previous_interaction_id: interaction.id,
      tools,
      input: functionResults,
    });
  }

  throw new Error("The model used too many tool-calling rounds.");
}

export async function chat(message: string): Promise<string> {
  const result = await mcpClient.readResource({
    uri: "task://guidelines",
  });

  const guidelines = result.contents
    .map((item) => ("text" in item ? item.text : ""))
    .filter(Boolean)
    .join("\n");

  const instructions = `
You are a task management assistant.

Use the following task management guidelines whenever relevant.
Use the MCP task tools to perform task-management actions.
Base your answers on the actual results returned by those tools.
Do not claim an action succeeded unless the tool result confirms it.

TASK GUIDELINES:
${guidelines}
`;

  return askModel(message, instructions);
}

export async function planDay(hours: number): Promise<string> {
  const prompt = await mcpClient.getPrompt({
    name: "plan_day",
    arguments: {
      availableHours: hours,
    },
  });

  const promptText = prompt.messages
    .map((message) => {
      const content = message.content;

      if (content.type === "text") {
        return content.text;
      }

      return JSON.stringify(content);
    })
    .join("\n");

  return askModel(
    promptText,
    "You are a task planning assistant. Follow the supplied planning prompt and use MCP task tools when needed."
  );
}

export async function closeChatService(): Promise<void> {
  await mcpClient.close();
}
