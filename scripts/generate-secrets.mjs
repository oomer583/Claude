import { randomBytes } from "node:crypto";

function secret(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

function encryptionKey() {
  return randomBytes(32).toString("base64");
}

console.log(`AUTH_SECRET=${secret()}`);
console.log(`APP_ENCRYPTION_KEY=${encryptionKey()}`);
console.log(`POSTGRES_PASSWORD=${secret()}`);
console.log(`OWNER_PROMO_CODE=${secret(24)}`);
