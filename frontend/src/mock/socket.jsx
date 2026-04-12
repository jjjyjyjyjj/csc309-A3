// A fake socket that mimics the Socket.IO interface
const mockSocket = {
  listeners: {},

  on(event, callback) {
    this.listeners[event] = callback;
  },

  off(event) {
    delete this.listeners[event];
  },

  emit(event, data) {          // <-- replace everything inside here
    if (event === "negotiation:message") {
      // Echo your own message back
      setTimeout(() => {
        this.listeners["negotiation:message"]?.({
          negotiation_id: data.negotiation_id,
          sender: { role: "user", id: 1 },
          text: data.text,
          createdAt: new Date().toISOString(),
        });
      }, 300);

      // Simulate a reply from the other party
      setTimeout(() => {
        this.listeners["negotiation:message"]?.({
          negotiation_id: data.negotiation_id,
          sender: { role: "business", id: 3 },
          text: "Got your message! Let me check and get back to you.",
          createdAt: new Date().toISOString(),
        });
      }, 1200);
    }
  },
};

export default mockSocket;