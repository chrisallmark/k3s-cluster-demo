const http = require("http");
const fs = require("fs");
const path = require("path");

const favicon = fs.readFileSync(path.join(__dirname, "favicon.ico"));

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if ((req.method === "GET" || req.method === "HEAD") && req.url === "/favicon.ico") {
    res.writeHead(200, {
      "Cache-Control": "public, max-age=86400",
      "Content-Length": favicon.length,
      "Content-Type": "image/x-icon",
    });
    res.end(req.method === "HEAD" ? undefined : favicon);
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ hostname: process.env.HOSTNAME }));
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(1337, () => console.log("Listening on port 1337..."));
