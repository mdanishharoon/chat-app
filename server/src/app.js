const uWS = require('uWebSockets.js');
const { randomUUID } = require('crypto'); // For generating unique IDs



const app = uWS.App();
const clients = new Map(); // Map to store client WebSocket connections and their IDs

app.ws('/*', {
  // When a client connects
  open: (ws) => {
    let numclients = 0;
    const clientId = ++numclients; // Generate a unique ID for the client
    ws.id = clientId; // Assign the ID to the WebSocket object
    clients.set(ws, clientId);

    console.log(`Client connected: ${clientId}`);
    ws.send(JSON.stringify({ type: 'connected', id: clientId })); // Notify the client of its ID
  },
  
  // When a client sends a message
  message: (ws, message, isBinary) => {
    const decodedMessage = Buffer.from(message).toString('utf-8');
    console.log(`Received from ${ws.id}: ${decodedMessage}`);

    // Broadcast the message with sender's ID to all other clients
    clients.forEach((clientId, client) => {
      if (client !== ws) {
        client.send(
          JSON.stringify({
            type: 'broadcast',
            senderId: ws.id,
            message: decodedMessage,
          }),
          isBinary
        );
      }
    });
  },
  
  // When a client disconnects
  close: (ws, code, message) => {
    console.log(`Client disconnected: ${ws.id}`);
    clients.delete(ws); // Remove the client from the Map
  }
});

// Start the server
app.listen(9001, (listenSocket) => {
  if (listenSocket) {
    console.log('Server is listening on port 9001');
  } else {
    console.error('Failed to start the server');
  }
});
