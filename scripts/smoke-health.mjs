const baseUrl = (process.env.APP_URL ?? "http://127.0.0.1:3000").replace(/\/$/, "");

async function check(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`${path} failed with ${response.status}: ${body}`);
  }

  console.log(`${path} OK`);
}

await check("/api/health/live");
await check("/api/health/ready");
console.log("Deployment health smoke test passed.");
