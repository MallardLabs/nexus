const express = require('express');

const startServer = () => {
  const app = express();
  const port = process.env.PORT || 3000; // Render sets PORT

  // Health check endpoint for Render
  app.get('/', (req, res) => {
    res.status(200).send('Discord bot is running!');
  });

  // Start the server
  app.listen(port, () => {
    console.log(`Web server running on port ${port}`);
  });
};

module.exports = { startServer };