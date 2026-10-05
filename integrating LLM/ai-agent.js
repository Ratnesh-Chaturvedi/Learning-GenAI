import "dotenv/config";

import { GoogleGenAI } from "@google/genai";

import { calculator } from "./ai-tools/calculator.js";
import { currentWeather } from "./ai-tools/weather.js";
import { currencyExchange } from "./ai-tools/currency.js";

const MODEL = "gemini-3.1-flash-lite";

const chatSystemPrompt = `
You are a helpful AI assistant with access to external tools.

Follow these rules:

1. For arithmetic calculations, ALWAYS use the calculate tool.
2. Always use calculate even for trivial calculations.
3. For current weather, ALWAYS use the currentWeather tool.
4. For currency conversion or exchange rates, ALWAYS use the currencyExchange tool.
5. You may call multiple tools when solving a multi-step request.
6. After receiving tool results, explain the answer naturally.
7. Never invent current weather or exchange-rate information.
`;

const chatTools = [
  {
    type: "function",
    name: "calculate",
    description:
      "Performs arithmetic calculations. Supported operations: add, subtract, multiply, divide.",
    parameters: {
      type: "object",
      properties: {
        operation: {
          type: "string",
          enum: ["add", "subtract", "multiply", "divide"],
          description: "Arithmetic operation to perform.",
        },
        a: {
          type: "number",
          description: "First number.",
        },
        b: {
          type: "number",
          description: "Second number.",
        },
      },
      required: ["operation", "a", "b"],
    },
  },

  {
    type: "function",
    name: "currentWeather",
    description: "Gets the current weather for a city.",
    parameters: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "Name of the city, for example Ghaziabad.",
        },
      },
      required: ["city"],
    },
  },

  {
    type: "function",
    name: "currencyExchange",
    description: "Converts an amount from one currency to another.",
    parameters: {
      type: "object",
      properties: {
        from: {
          type: "string",
          description: "Source currency code, for example INR.",
        },
        to: {
          type: "string",
          description: "Target currency code, for example USD.",
        },
        amount: {
          type: "number",
          description: "Amount to convert.",
        },
      },
      required: ["from", "to", "amount"],
    },
  },
];

async function executeTool(name, args) {
  switch (name) {
    case "calculate": {
      const operators = {
        add: "+",
        subtract: "-",
        multiply: "*",
        divide: "/",
      };

      if (!Object.hasOwn(operators, args.operation)) {
        throw new Error("Unsupported operation");
      }

      if (!Number.isFinite(args.a) || !Number.isFinite(args.b)) {
        throw new Error("Expected finite numbers");
      }

      if (args.operation === "divide" && args.b === 0) {
        throw new Error("Cannot divide by zero");
      }

      return await calculator(
        operators[args.operation],
        args.a,
        args.b
      );
    }

    case "currentWeather":
      return await currentWeather(args.city);

    case "currencyExchange":
      return await currencyExchange(
        args.from,
        args.to,
        args.amount
      );

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export async function runAgent(
  userInput,
  ai = new GoogleGenAI({}),
  toolExecutor = executeTool
) {
  // STEP 1: Send user request to Gemini
  let interaction = await ai.interactions.create({
    model: MODEL,
    input: userInput,
    system_instruction: chatSystemPrompt,
    tools: chatTools,
  });

  // Maximum 10 rounds to avoid infinite tool-call loops
  for (let round = 0; round < 10; round++) {
    const functionCalls =
      interaction.steps?.filter(
        (step) => step.type === "function_call"
      ) ?? [];

    // If there are no more function calls,
    // Gemini has generated the final response.
    if (functionCalls.length === 0) {
      console.log("\nAI RESPONSE:\n");
      console.log(interaction.output_text);

      return interaction.output_text;
    }

    const functionResults = [];

    // STEP 2: Execute all tools requested by Gemini
    for (const call of functionCalls) {
      console.log("\n-----------------------------");
      console.log("Tool called:", call.name);
      console.log("Arguments:", call.arguments);

      try {
        const result = await toolExecutor(
          call.name,
          call.arguments
        );

        if (result === undefined) {
          throw new Error("Tool returned no result");
        }

        console.log("Tool result:", result);

        functionResults.push({
          type: "function_result",
          name: call.name,
          call_id: call.id,
          result: [
            {
              type: "text",
              text:
                typeof result === "string"
                  ? result
                  : JSON.stringify(result),
            },
          ],
        });
      } catch (error) {
        console.error(
          `Error executing ${call.name}:`,
          error
        );

        functionResults.push({
          type: "function_result",
          name: call.name,
          call_id: call.id,
          is_error: true,
          result: [
            {
              type: "text",
              text: JSON.stringify({
                error:
                  error instanceof Error
                    ? error.message
                    : String(error),
              }),
            },
          ],
        });
      }
    }

    // STEP 3: Send tool results back to Gemini
    interaction = await ai.interactions.create({
      model: MODEL,
      previous_interaction_id: interaction.id,
      tools: chatTools,
      input: functionResults,
    });
  }

  throw new Error("Agent exceeded the tool-call limit");
}

if (import.meta.main) {
  try {
    await runAgent(
      "what is 0987654345678*23456785, what is today's weather in MUmbai, and convert 1000 dollar into inr?"
    );
  } catch (error) {
    console.error(
      "Agent failed:",
      error instanceof Error
        ? error.message
        : String(error)
    );
  }
}