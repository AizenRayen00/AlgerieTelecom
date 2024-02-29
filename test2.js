//import { create } from "@web3-storage/w3up-client";
//const fs = require("fs"); // Use require for CommonJS modules

const fs = require("fs").promises; // Using the Promise-based version

async function myFunction(filePath) {
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
    //const filePath = "filePath"; // Replace with your file path
    const fileContent = await fs.readFile(filePath);
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
  } catch (error) {
    console.error("Error:", error);
  }
}

// Call the main function
(async () => {
  try {
    await myFunction("/home/islem-pc/islem/islemhackathon/islem.txt"); // Call with actual file path
  } catch (error) {
    console.error("Error:", error);
  }
})();
