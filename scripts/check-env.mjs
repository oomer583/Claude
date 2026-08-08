const required = [
  "AUTH_SECRET",
  "APP_ENCRYPTION_KEY",
  "POSTGRES_URL",
  "REDIS_URL",
  "ROUTER_BASE_URL",
  "ROUTER_API_KEY",
  "ONYX_BASE_URL",
  "ONYX_ADMIN_API_KEY",
];

const missing = required.filter((name) => !process.env[name]?.trim());

if (missing.length > 0) {
  console.error(
    `Missing required environment variables: ${missing.join(", ")}`
  );
  process.exit(1);
}

for (const name of [
  "POSTGRES_URL",
  "REDIS_URL",
  "ROUTER_BASE_URL",
  "ONYX_BASE_URL",
]) {
  try {
    URL.parse(process.env[name]);
  } catch {
    console.error(`${name} must be a valid URL`);
    process.exit(1);
  }
}

const encryptionKey = Buffer.from(process.env.APP_ENCRYPTION_KEY, "base64");
if (encryptionKey.length !== 32) {
  console.error("APP_ENCRYPTION_KEY must be a base64-encoded 32-byte key");
  process.exit(1);
}

console.log("Environment looks ready for deployment.");
