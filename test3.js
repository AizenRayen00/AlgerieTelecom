const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default to 3000

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Your Node.js server logic goes here (e.g., defining endpoints for requests)
app.post("/your-endpoint", (req, res) => {
  const data = req.body.data; // Access the data from the request body
  console.log("Received data:", data);

  //
});

app.listen(port, () => {
  console.log(`Server listening on porttt ${port}`);
});
