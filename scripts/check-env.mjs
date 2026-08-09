const basicChatOnly = process.env.BASIC_CHAT_ONLY === "1";
const gatewayBase =
  process.env.MODEL_GATEWAY_BASE_URL ?? process.env.ROUTER_BASE_URL;
const gatewayApiKey =
  process.env.MODEL_GATEWAY_API_KEY ?? process.env.ROUTER_API_KEY;

const required = [
  "AUTH_SECRET",
  "APP_ENCRYPTION_KEY",
  "POSTGRES_URL",
  "REDIS_URL",
];

if (!basicChatOnly) {
  required.push("ONYX_BASE_URL", "ONYX_ADMIN_API_KEY");
}

const missing = required.filter((name) => !process.env[name]?.trim());

if (!gatewayBase?.trim()) {
  missing.push("MODEL_GATEWAY_BASE_URL or ROUTER_BASE_URL");
}
if (!gatewayApiKey?.trim()) {
  missing.push("MODEL_GATEWAY_API_KEY or ROUTER_API_KEY");
}

if (missing.length > 0) {
  console.error(
    `Missing required environment variables: ${missing.join(", ")}`
  );
  process.exit(1);
}

for (const [name, value] of [
  ["POSTGRES_URL", process.env.POSTGRES_URL],
  ["REDIS_URL", process.env.REDIS_URL],
  ["MODEL_GATEWAY_BASE_URL", gatewayBase],
  ...(basicChatOnly ? [] : [["ONYX_BASE_URL", process.env.ONYX_BASE_URL]]),
]) {
  if (!URL.canParse(value)) {
    console.error(`${name} must be a valid URL`);
    process.exit(1);
  }
}

const encryptionKey = Buffer.from(process.env.APP_ENCRYPTION_KEY, "base64");
if (encryptionKey.length !== 32) {
  console.error("APP_ENCRYPTION_KEY must be a base64-encoded 32-byte key");
  process.exit(1);
}

console.log(
  basicChatOnly
    ? "Environment looks ready for basic chat testing (Onyx disabled)."
    : "Environment looks ready for deployment."
);
