
import { createServer } from "node:http";
import {
  chat,
  closeChatService,
  planDay,
} from "./chat.ts";

const HOST = "127.0.0.1";
const PORT = 8080;

const httpServer = createServer(async (request, response) => {
  const url = new URL(
    request.url ?? "/",
    `http://${HOST}:${PORT}`
  );

  response.setHeader("Content-Type", "text/plain; charset=utf-8");

  try {
    if (request.method !== "GET") {
      response.writeHead(405);
      response.end("Method not allowed");
      return;
    }

    let result;

    if (url.pathname === "/ask") {
      const message = url.searchParams.get("message");

      if (!message?.trim()) {
        response.writeHead(400);
        response.end("Query parameter 'message' is required.");
        return;
      }

      result = await chat(message.trim());
    } else if (url.pathname === "/plan") {
      const hoursParam = url.searchParams.get("hours");

      if (!hoursParam?.trim()) {
        response.writeHead(400);
        response.end("Query parameter 'hours' is required.");
        return;
      }

      const hours = Number(hoursParam);

      if (!Number.isFinite(hours) || hours <= 0) {
        response.writeHead(400);
        response.end("'hours' must be a positive number.");
        return;
      }

      result = await planDay(hours);
    } else {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200);
    response.end(result);
  } catch (error) {
    console.error("Request failed:", error);

    if (!response.headersSent) {
      response.writeHead(500);
    }

    if (!response.writableEnded) {
      response.end("Unable to process the request.");
    }
  }
});

httpServer.listen(PORT, HOST, () => {
  console.log(`Task client running at http://${HOST}:${PORT}`);
});

let shuttingDown = false;

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log("Shutting down task client...");

  httpServer.close(async () => {
    try {
      await closeChatService();
      console.log("MCP client closed.");
    } catch (error) {
      console.error("Error closing MCP client:", error);
      process.exitCode = 1;
    }
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
