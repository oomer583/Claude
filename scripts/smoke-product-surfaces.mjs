const rawBaseUrl = process.env.SITE_URL ?? process.env.SITE_ADDRESS;

if (!rawBaseUrl) {
  console.error(
    "Set SITE_URL or SITE_ADDRESS before running product smoke checks."
  );
  process.exit(1);
}

const baseUrl =
  rawBaseUrl.startsWith("http://") || rawBaseUrl.startsWith("https://")
    ? rawBaseUrl.replace(/\/$/, "")
    : `https://${rawBaseUrl.replace(/\/$/, "")}`;

const routes = [
  "/",
  "/incognito",
  "/history-search",
  "/projects",
  "/styles",
  "/connectors",
  "/tools",
  "/settings",
  "/privacy",
  "/terms",
  "/api/account",
  "/api/history/search?q=test",
  "/api/styles",
  "/api/files/edit",
  "/api/health/live",
  "/api/health/ready",
];

const results = await Promise.all(
  routes.map(async (route) => {
    try {
      const response = await fetch(`${baseUrl}${route}`, {
        redirect: "manual",
      });
      const acceptable = response.status !== 404 && response.status < 500;
      return {
        acceptable,
        message: `${acceptable ? "OK" : "FAIL"} ${response.status} ${route}`,
      };
    } catch (error) {
      return {
        acceptable: false,
        message: `FAIL network ${route}: ${String(error)}`,
      };
    }
  })
);

for (const result of results) {
  console.log(result.message);
}

if (results.some((result) => !result.acceptable)) {
  console.error("Product surface smoke checks failed.");
  process.exit(1);
}

console.log("Product surface smoke checks passed.");
