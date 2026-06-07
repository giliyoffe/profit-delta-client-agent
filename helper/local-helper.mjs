import http from "node:http";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const helperDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(helperDir, "..");
const host = "127.0.0.1";
const port = Number(process.env.PD_HELPER_PORT || 17874);

function runGit(args) {
  return new Promise((resolve) => {
    execFile("git", args, { cwd: projectDir, timeout: 120000 }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        code: error?.code || 0,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      });
    });
  });
}

function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "http://localhost:4174",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(body, null, 2));
}

async function handle(req, res) {
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${host}:${port}`);

  if (url.pathname === "/health" && req.method === "GET") {
    json(res, 200, { ok: true, projectDir });
    return;
  }

  if (url.pathname === "/git/status" && req.method === "GET") {
    const result = await runGit(["status", "-sb"]);
    json(res, result.ok ? 200 : 500, result);
    return;
  }

  if (url.pathname === "/git/push" && req.method === "POST") {
    const before = await runGit(["status", "-sb"]);
    const push = await runGit(["push"]);
    const after = await runGit(["status", "-sb"]);
    json(res, push.ok ? 200 : 500, { ok: push.ok, before, push, after });
    return;
  }

  json(res, 404, { ok: false, error: "Unknown helper route" });
}

const server = http.createServer((req, res) => {
  handle(req, res).catch((error) => {
    json(res, 500, { ok: false, error: error.message });
  });
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. The helper may already be running.`);
    process.exit(1);
  }

  if (error.code === "EPERM") {
    console.error("Could not start the helper from this sandbox.");
    console.error("Start it from your normal Terminal instead:");
    console.error(`node ${path.join(projectDir, "helper/local-helper.mjs")}`);
    process.exit(1);
  }

  console.error(error);
  process.exit(1);
});

server.listen(port, host, () => {
  console.log(`Profit Delta helper running at http://${host}:${port}`);
  console.log(`Project: ${projectDir}`);
});
