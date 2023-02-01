const { Server } = require("net");
var colors = require('colors')

const host = "0.0.0.0";
const END = "END";

const connections = new Map();
const userNames = new Set();
const error = (message) => {
  console.error(message);
  process.exit(1);
};

const sendMessage = (message, origin) => {
  for (const socket of connections.keys()) {
    if (socket !== origin) {
      socket.write(message);
    }
  }
};

const listen = (port) => {
  const server = new Server();

  server.on("connection", (socket) => {
    const remoteSocket = `${socket.remoteAddress}:${socket.remotePort}`;
    console.log(`Se ha detectado una nueva conexión desde:  ${remoteSocket}`.green);
    socket.setEncoding("utf-8");

    socket.on("data", (message) => {
      connections.values();

      if (!connections.has(socket)) {
        if (userNames.has(message)) {
          console.log('Lo sentimos, pero este usuario ya ha sido registrado'.red);
          return;
        } else {
          console.log(`El usuario ${message} está conectado desde:  ${remoteSocket}`.gray);
          connections.set(socket, message);
          userNames.add(message);
        }

      } else if (message === END) {
        connections.delete(`${message}`)
        socket.end();
      } else {
        const fullMessage = `[${connections.get(socket)}]`.magenta.underline + ":" + ` ${message}`.blue;
        console.log(`${remoteSocket} -> ${fullMessage}`);
        sendMessage(fullMessage, socket);
      }
    });

    socket.on("error", (err) => console.error(err));

    socket.on("close", () => {
      console.log(connections.get(socket), " finalizó su conexión");
      sendMessage(connections.get(socket) + " finalizó su conexión");
      connections.delete(socket);
      userNames.delete(connections.get(socket));
    });
  });

  server.listen({ port: 3000, host: '0.0.0.0' }, () => {
    console.log(`Conectado desde el puerto: 3000`.bgMagenta);
  });

  server.on("error", (err) => error(err.message));
};

const main = () => {

  listen();
};

if (require.main === module) {
  main();
}