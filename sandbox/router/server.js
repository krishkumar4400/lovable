import http from "http";
import app, { getAgentProxy, getProxy } from "./src/app.js";


const server = http.createServer(app);

const port = 3000;

server.on("upgrade", (req, socket, head) => {
  const hostHeader = req.headers.host;

  if (!hostHeader) {
    socket.destroy();
    return;
  }

  const [sandboxId, subdomain] = hostHeader.split(".");

  if (!sandboxId || !subdomain) {
    socket.destroy();
    return;
  }

  if (subdomain === "preview") {
    const targetUrl = `http://sandbox-service-${sandboxId}:80`;

    const proxy = getProxy(sandboxId, targetUrl);

    proxy.upgrade(req, socket, head);

    return;
  }

  if (subdomain === "agent") {
    const targetUrl = `http://sandbox-service-${sandboxId}:3000`;

    const proxy = getAgentProxy(sandboxId, targetUrl);

    proxy.upgrade(req, socket, head);

    return;
  }

  socket.destroy();
});

server.listen(port, () => {
    console.log(`Server is up and running on http://localhost:${port}`);
});
