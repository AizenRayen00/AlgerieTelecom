const express = require("express");
const multer = require("multer");
const fs = require("fs");
const mysql = require("mysql");

const app = express();
const upload = multer({ dest: "filestore/" }); // Set destination for uploaded files

// Serve your HTML file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/interface", (req, res) => {
  res.sendFile(__dirname + "/public/interface.html");
});

async function storeToFileInDatabase(fileName, fileCid) {
  try {
    // Connect to the MySQL database
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "islem",
      password: "Islemmysql23201410@",
      database: "islemtest",
    });

    // Execute SQL INSERT statement to store file data in the database
    const query = "INSERT INTO IPSF (fileName, fileHash) VALUES (?, ?)";
    const values = [fileName, fileCid];
    await connection.execute(query, values);

    console.log("File data stored in the database successfully.");

    // Close the database connection
    await connection.end();
  } catch (error) {
    console.error("Error storing file data in the database:", error);
    throw error;
  }
}

// Helper function to acquire a connection from the pool
function getConnectionFromPool() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      } else {
        resolve(connection);
      }
    });
  });
}

// Helper function to execute a SQL query
function executeQuery(connection, query, values) {
  return new Promise((resolve, reject) => {
    connection.query(query, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Function to store the uploaded file to IPFS
async function storeToIPFSAndFile(filePath, fileName) {
  try {
    const { create } = await import("@web3-storage/w3up-client"); // Use dynamic import()

    // Create a client instance
    const client = await create();

    // 1. Create a space (optional name provided)
    const space = await client.createSpace("my-awesome-space");

    // 2. Login or create an account (replace with your email)
    const myAccount = await client.login("islem.lachgueur99@gmail.com"); // Replace with your email

    // 4. Provision the space with your account
    await myAccount.provision(space.did());

    // 5. Save the space to your agent's state store
    await space.save();

    // 6. Set the space as current (optional)
    await client.setCurrentSpace(space.did());

    // 7. Upload a single file
    const fileContent = await fs.promises.readFile(filePath);
    const fileBlob = new Blob([fileContent], { type: "text/plain" }); // Replace 'text/plain' if needed

    const fileCid = await client.uploadFile(fileBlob);

    console.log(`File uploaded successfully! CID: ${fileCid}`);

    // 8. Setup space recovery (highly recommended)
    const recovery = await space.createRecovery(myAccount.did());
    await client.capability.access.delegate({
      space: space.did(),
      delegations: [recovery],
    });

    console.log(
      "Space created, provisioned, uploaded file, and recovery set up!"
    );

    await storeToFileInDatabase(fileName, fileCid);

    return fileCid;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// Handle file upload
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send("No file uploaded");
    }

    const filePath = `${__dirname}/filestore/${file.originalname}`;
    fs.renameSync(file.path, filePath);
    const fileName = file.originalname;

    // Call the storeToIPFS function with the file path
    const fileCid = await storeToIPFSAndFile(filePath, fileName);

    // Respond with the file CID
    res.json({ cid: fileCid });
  } catch (error) {
    console.error("Error handling file upload:", error);
    res.status(500).send("Error handling file upload");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
