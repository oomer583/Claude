const basicChatOnly = process.env.BASIC_CHAT_ONLY === "1";
const gatewayBase = (
  process.env.MODEL_GATEWAY_BASE_URL ??
  process.env.ROUTER_BASE_URL ??
  ""
).replace(/\/$/, "");
const gatewayApiKey =
  process.env.MODEL_GATEWAY_API_KEY ?? process.env.ROUTER_API_KEY;
const onyxBase = process.env.ONYX_BASE_URL?.replace(/\/$/, "");
const onyxAdminApiKey = process.env.ONYX_ADMIN_API_KEY;

if (!(gatewayBase && gatewayApiKey)) {
  throw new Error(
    "MODEL_GATEWAY_BASE_URL/ROUTER_BASE_URL and MODEL_GATEWAY_API_KEY/ROUTER_API_KEY are required"
  );
}

if (!basicChatOnly && !(onyxBase && onyxAdminApiKey)) {
  throw new Error(
    "ONYX_BASE_URL and ONYX_ADMIN_API_KEY are required unless BASIC_CHAT_ONLY=1"
  );
}

async function expectOk(name, url, init = {}) {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`${name} failed with HTTP ${response.status}`);
  }

  console.log(`${name} OK`);
}

await expectOk("Model gateway authenticated models", `${gatewayBase}/models`, {
  headers: {
    Authorization: `Bearer ${gatewayApiKey}`,
  },
});

if (!process.env.MODEL_GATEWAY_BASE_URL && process.env.ROUTER_BASE_URL) {
  const routerRoot = gatewayBase.replace(/\/v1$/, "");
  await expectOk("9Router health", `${routerRoot}/api/health`);
}

if (basicChatOnly) {
  console.log("Basic chat preflight passed; Onyx checks were skipped.");
} else {
  await expectOk("Onyx health", `${onyxBase}/health`);
  await expectOk("Onyx admin authentication", `${onyxBase}/me`, {
    headers: {
      Authorization: `Bearer ${onyxAdminApiKey}`,
    },
  });
  console.log("Model gateway and Onyx preflight passed.");
}
