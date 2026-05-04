import qrcode from "qrcode-terminal";
import { Client, LocalAuth } from "whatsapp-web.js";

async function createInstance(id: string) {
  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: id,
      dataPath: `./sessions/${id}`,
    }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  // 1. Generate QR
  client.on("qr", (qr: string) => {
    console.log(`\n📱 [${id}] SCAN QR:`);
    qrcode.generate(qr, { small: true });
  });

  // 2. Connection Success
  client.on("ready", () => {
    console.log(`✅ [${id}] Connected and listening for messages...`);
  });

  // 3. AUTO-REPLY LOGIC
  client.on("message", async (msg) => {
    console.log(`📩 [${id}] Received message from ${msg.from}: "${msg.body}"`);
    // Convert message to lowercase to catch "Hello", "HELLO", etc.
    if (msg.body.toLowerCase() === "hello") {
      console.log(
        `📩 [${id}] Received "hello" from ${msg.from}. Sending "hi"...`,
      );

      try {
        await msg.reply("hi");
        // Note: msg.reply sends it back to the person who messaged you
      } catch (err) {
        console.error(`❌ [${id}] Failed to send reply:`, err);
      }
    }
  });

  // Handle Disconnection
  client.on("disconnected", (reason) => {
    console.log(`❌ [${id}] Logged out`, reason);
  });

  await client.initialize();
}

// Start your two instances
createInstance("Device_One");
createInstance("Device_Two");
