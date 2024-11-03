import { Server, OPEN } from "ws";

const wss = new Server({ port: 3001 });

let counts = [0, 0, 0];

wss.on("connection", (ws) => {
    console.log("Client connected");

    // Send initial counts to the new client
    ws.send(JSON.stringify(counts));

    ws.on("message", (message) => {
        const data = JSON.parse(message);

        if (data.action === "select") {
            counts[data.button]++;
        } else if (data.action === "deselect") {
            counts[data.button]--;
        }

        // Broadcast updated counts to all clients
        wss.clients.forEach((client) => {
            if (client.readyState === OPEN) {
                client.send(JSON.stringify(counts));
            }
        });
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });
});

console.log("WebSocket server running on ws://localhost:3001");
