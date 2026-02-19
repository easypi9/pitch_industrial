import http from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const ROOT_DIR = process.cwd();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (ROOT_DIR !== __dirname) {
  // Run from project directory to avoid serving unexpected files.
  process.chdir(__dirname);
}

const PORT = Number.parseInt(process.env.PORT || "8080", 10);
const AUTH_USER = process.env.PITCH_USER || "";
const AUTH_PASS = process.env.PITCH_PASS || "";
const AUTH_USER_NEXT = process.env.PITCH_USER_NEXT || "";
const AUTH_PASS_NEXT = process.env.PITCH_PASS_NEXT || "";

if (!AUTH_USER || !AUTH_PASS) {
  console.error("Missing credentials. Set PITCH_USER and PITCH_PASS environment variables.");
  process.exit(1);
}

if ((AUTH_USER_NEXT && !AUTH_PASS_NEXT) || (!AUTH_USER_NEXT && AUTH_PASS_NEXT)) {
  console.error(
    "Rotation credentials are incomplete. Set both PITCH_USER_NEXT and PITCH_PASS_NEXT, or neither."
  );
  process.exit(1);
}

const AUTH_CREDENTIALS = [{ user: AUTH_USER, pass: AUTH_PASS }];

if (AUTH_USER_NEXT && AUTH_PASS_NEXT) {
  AUTH_CREDENTIALS.push({ user: AUTH_USER_NEXT, pass: AUTH_PASS_NEXT });
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".m4a": "audio/mp4",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
};

function constantTimeEqual(a, b) {
  const aBuffer = Buffer.from(a, "utf8");
  const bBuffer = Buffer.from(b, "utf8");

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function parseBasicAuth(headerValue) {
  if (!headerValue || !headerValue.startsWith("Basic ")) {
    return null;
  }

  const encoded = headerValue.slice(6).trim();

  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex < 0) {
      return null;
    }

    return {
      user: decoded.slice(0, separatorIndex),
      pass: decoded.slice(separatorIndex + 1),
    };
  } catch {
    return null;
  }
}

function isAuthorized(request) {
  const credentials = parseBasicAuth(request.headers.authorization);

  if (!credentials) {
    return false;
  }

  return AUTH_CREDENTIALS.some(
    (allowed) =>
      constantTimeEqual(credentials.user, allowed.user) &&
      constantTimeEqual(credentials.pass, allowed.pass)
  );
}

function sendUnauthorized(response) {
  response.writeHead(401, {
    "WWW-Authenticate": 'Basic realm="Pitch Industrial", charset="UTF-8"',
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end("Unauthorized");
}

function sendNotFound(response) {
  response.writeHead(404, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end("Not found");
}

function sendForbidden(response) {
  response.writeHead(403, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end("Forbidden");
}

function getFilePathFromUrl(rawUrl) {
  const url = new URL(rawUrl || "/", "http://localhost");
  let pathname = decodeURIComponent(url.pathname);

  if (pathname === "/") {
    pathname = "/index.html";
  }

  const normalizedPath = path.normalize(pathname).replace(/^([.]{2}[/\\])+/, "");
  const filePath = path.resolve(__dirname, `.${normalizedPath}`);

  if (!filePath.startsWith(__dirname)) {
    return null;
  }

  return filePath;
}

const server = http.createServer(async (request, response) => {
  const requestPath = new URL(request.url || "/", "http://localhost").pathname;

  if (requestPath === "/healthz") {
    response.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    });
    response.end("ok");
    return;
  }

  if (!isAuthorized(request)) {
    sendUnauthorized(response);
    return;
  }

  const filePath = getFilePathFromUrl(request.url || "/");

  if (!filePath) {
    sendForbidden(response);
    return;
  }

  try {
    let finalPath = filePath;
    const fileStat = await fs.stat(finalPath);

    if (fileStat.isDirectory()) {
      finalPath = path.join(finalPath, "index.html");
    }

    const ext = path.extname(finalPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const fileBuffer = await fs.readFile(finalPath);

    response.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=300",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(fileBuffer);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      sendNotFound(response);
      return;
    }

    response.writeHead(500, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    });
    response.end("Internal Server Error");
  }
});

server.listen(PORT, () => {
  console.log(`Pitch Industrial server is running on http://localhost:${PORT}`);
  console.log("Basic Auth enabled. Share only login/password with allowed users.");
});
