const rawBaseUrl = process.env.SITE_URL ?? process.env.SITE_ADDRESS;

if (!rawBaseUrl) {
  console.error("Set SITE_URL or SITE_ADDRESS before running product smoke checks.");
  process.exit(1);
}

const baseUrl = rawBaseUrl.startsWith("http://") || rawBaseUrl.startsWith("https://")
  ? rawBaseUrl.replace(/\/$/, "")
  : `https://${rawBaseUrl.replace(/\/$/, "")}`;

const routes = [
  "/",
  "/incognito",
  "/projects",
  "/connectors",
  "/tools",
  "/settings",
  "/api/health/live",
  "/api/health/ready",
];

let failed = false;

for (const route of routes) {
  try {
    const response = await fetch(`${baseUrl}${route}`, {
      redirect: "manual",
    });
    const acceptable = response.status !== 404 && response.status < 500;
    const marker = acceptable ? "OK" : "FAIL";
    console.log(`${marker} ${response.status} ${route}`);
    if (!acceptable) {
      failed = true;
    }
  } catch (error) {
    failed = true;
    console.error(`FAIL network ${route}`, error);
  }
}

if (failed) {
  console.error("Product surface smoke checks failed.");
  process.exit(1);
}

console.log("Product surface smoke checks passed.");
