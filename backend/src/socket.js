'use strict';

const { Server } = require('socket.io');
const { PrismaClient } = require("@prisma/client");
const jwt = require('jsonwebtoken');
const {SECRET_KEY} = require("./config/jwt");
const { setIO } = require('./io');
const prisma = new PrismaClient();

function attach_sockets(server) {
  const io = new Server(server, { cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  }, });
  setIO(io);

  // auth
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("from socket.io: not authenticated"));

    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      socket.email = decoded.email;
      next();

    } catch (err) {
      next(new Error("from socket.io: Not authenticated"));
    }
  });
  

  io.on('connection', (socket) => {
    
    // joining personal room
    socket.join(`account:${socket.userId}`);

    console.log("connected:", socket.userId);

    // // joining room
    // socket.on("join", (room) => {
    //   socket.join(room);
    //   console.log(`${socket.id} joing ${room}`);
    // });

    // send message out
    socket.on("negotiation:message", async ({ negotiation_id, text }) => {
      if (!socket.userId) {
        return socket.emit("negotiation:error", { error: "Not authenticated", message: "You must be logged in" });
      }

      if (!negotitation_id || !text) {
        return socket.emit("negotiation:error", { error: "Negotiation not found", message: "negotiation_id and text are required" });
      }

      try {
        const negotiation = await prisma.negotation.findUnique({
          where: {negotiation_id},
          include: {user: true, business: true}
        });

        if (!negotiation || negotiation.status !== "active") {
          return socket.emit("negotiation:error", { error: "Negotiation not found"});
        }

        const isUser = negotiation.user_id === socket.userId;
        const isBusiness = negotiation.business_id === socket.userId;

        if (!isBusiness && !isUser) {
          return socket.emit("negotiation:error", { error: "ur not part of this negotitation" });
        }

        const role = isUser ? "candidate" : "business";
        const senderId = isUser ? negotiation.user_id : negotiation.business_id;

        io.to(`negotiation:${negotiation_id}`).emit("negotiation:message", {
          negotiation_id,
          sender: { role, id: senderId},
          text, 
          createdAt: new Date().toISOString()
        });

      } catch (err) {
        socket.emit("negotiation:error", { error: err.message });
      }
    });

    socket.on("disconnect", () => {
      console.log("disconnected:", socket.id);
    });

    // socket.message("message", ({ room, text }) => {
    //   socket.to(room).emit("message", {
    //     from: socket.id,
    //     text,
    //   });
    // });

    // socket.on("disconnect", () => {
    //   console.log("disconnected:", socket.id);
    // });

  });

  return io;
}

module.exports = { attach_sockets };