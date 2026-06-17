import crypto from "crypto";
import { sha256 } from "../src/lib/crypto.js";

async function run() {
  const testStr = "Vayo-1234";
  
  // Node standard
  const nodeHash = crypto.createHash("sha256").update(testStr).digest("hex");
  
  // Web crypto
  const webHash = await sha256(testStr);
  
  console.log("Node hash:", nodeHash);
  console.log("Web hash: ", webHash);
  console.log("Matches:  ", nodeHash === webHash);
}

run();
