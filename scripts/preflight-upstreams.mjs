const routerBase = process.env.ROUTER_BASE_URL?.replace(/\/$/, "");
const routerApiKey = process.env.ROUTER_API_KEY;
const onyxBase = process.env.ONYX_BASE_URL?.replace(/\/$/, "");
const onyxAdminApiKey = process.env.ONYX_ADMIN_API_KEY;

if (!(routerBase && routerApiKey && onyxBase && onyxAdminApiKey)) {
  throw new Error(
    "ROUTER_BASE_URL, ROUTER_API_KEY, ONYX_BASE_URL and ONYX_ADMIN_API_KEY are required"
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

const routerRoot = routerBase.replace(/\/v1$/, "");
await expectOk("9Router health", `${routerRoot}/api/health`);
await expectOk("9Router authenticated models", `${routerBase}/models`, {
  headers: {
    Authorization: `Bearer ${routerApiKey}`,
  },
});

await expectOk("Onyx health", `${onyxBase}/health`);
await expectOk("Onyx admin authentication", `${onyxBase}/me`, {
  headers: {
    Authorization: `Bearer ${onyxAdminApiKey}`,
  },
});

console.log("9Router and Onyx preflight passed.");
