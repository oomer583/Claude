const rawBaseUrl = process.env.SITE_URL ?? process.env.SITE_ADDRESS;
const sessionCookie = process.env.E2E_SESSION_COOKIE?.trim();
const runActive = process.env.E2E_ACTIVE === "1";

if (!rawBaseUrl) {
  console.error(
    "Set SITE_URL or SITE_ADDRESS before running functional verification."
  );
  process.exit(1);
}

if (!sessionCookie) {
  console.error(
    "Set E2E_SESSION_COOKIE to the Cookie header value from a signed-in browser session."
  );
  process.exit(1);
}

const baseUrl =
  rawBaseUrl.startsWith("http://") || rawBaseUrl.startsWith("https://")
    ? rawBaseUrl.replace(/\/$/, "")
    : `https://${rawBaseUrl.replace(/\/$/, "")}`;

const headers = {
  cookie: sessionCookie,
};

async function request(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...headers,
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...init.headers,
    },
    redirect: "manual",
  });

  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  return { body, response };
}

function assertOk(label, result) {
  if (!result.response.ok) {
    throw new Error(`${label} failed with HTTP ${result.response.status}`);
  }
  console.log(`OK ${label} (${result.response.status})`);
  return result.body;
}

function assertShape(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function getUsage() {
  const result = await request("/api/usage");
  const body = assertOk("usage snapshot", result);
  assertShape(
    body && ["free", "premium", "owner"].includes(body.plan),
    "Usage snapshot did not return a valid plan"
  );
  return body;
}

function usedFor(snapshot, resource) {
  return snapshot?.limits?.[resource]?.used ?? null;
}

async function verifyReadOnlySurfaces() {
  const usage = await getUsage();

  const memories = assertOk("memory read", await request("/api/memories"));
  assertShape(
    memories && Array.isArray(memories.memories),
    "Memory endpoint did not return a memories array"
  );

  const connectors = assertOk(
    "connector discovery",
    await request("/api/connectors")
  );
  assertShape(
    Array.isArray(connectors),
    "Connectors endpoint did not return an array"
  );

  const projects = assertOk("project list", await request("/api/projects"));
  assertShape(
    Array.isArray(projects),
    "Projects endpoint did not return an array"
  );

  const account = assertOk("account export", await request("/api/account"));
  assertShape(
    account?.account?.id,
    "Account export did not include account metadata"
  );
  assertShape(
    !("password" in account.account),
    "Account export exposed a password field"
  );
  assertShape(
    !account.onyxIdentity || !("encryptedCredential" in account.onyxIdentity),
    "Account export exposed an encrypted credential"
  );

  return usage;
}

async function verifySearch() {
  const body = assertOk(
    "web search",
    await request("/api/search", {
      body: JSON.stringify({
        maxResults: 2,
        queries: ["OpenAI official website"],
      }),
      method: "POST",
    })
  );
  assertShape(
    Array.isArray(body?.sources),
    "Web search did not return sources"
  );
}

async function verifyCodeExecution() {
  const body = assertOk(
    "code execution",
    await request("/api/code", {
      body: JSON.stringify({ code: 'print("functional-e2e-ok")' }),
      method: "POST",
    })
  );
  assertShape(
    String(body?.result ?? "").includes("functional-e2e-ok"),
    "Code execution did not return the expected marker"
  );
}

function extractHttpUrls(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  return [...new Set(text.match(/https?:\/\/[^\s)\]}>"']+/g) ?? [])];
}

async function verifyFileGeneration() {
  const body = assertOk(
    "PDF generation",
    await request("/api/files/generate", {
      body: JSON.stringify({
        filename: "functional-e2e.pdf",
        format: "pdf",
        instructions:
          "Create a one-page PDF containing the exact text functional-e2e-file-ok.",
      }),
      method: "POST",
    })
  );

  const urls = extractHttpUrls(body?.answer);
  assertShape(
    urls.length > 0,
    "File generation returned no downloadable HTTP(S) URL"
  );

  const download = await fetch(urls[0], { redirect: "manual" });
  assertShape(
    download.status >= 200 && download.status < 400,
    `Generated file URL was not reachable (HTTP ${download.status})`
  );
  console.log(`OK generated file download (${download.status})`);
}

async function verifyResearch() {
  const body = assertOk(
    "deep research",
    await request("/api/research", {
      body: JSON.stringify({
        query:
          "In one short paragraph, summarize what the Python programming language is. Use web research if configured.",
      }),
      method: "POST",
    })
  );
  assertShape(
    typeof body?.answer === "string" && body.answer.length > 0,
    "Deep research returned no answer"
  );
}

function verifyQuotaDeltas(before, after) {
  if (before.plan === "owner" || after.plan === "owner") {
    console.log("OK quota delta check skipped for unlimited owner plan");
    return;
  }

  for (const resource of ["webSearch", "code", "fileGeneration", "research"]) {
    const previous = usedFor(before, resource);
    const current = usedFor(after, resource);
    assertShape(
      typeof previous === "number" && typeof current === "number",
      `Missing live quota counters for ${resource}`
    );
    assertShape(
      current > previous,
      `Quota counter did not increase for ${resource}`
    );
    console.log(`OK quota counter ${resource}: ${previous} -> ${current}`);
  }
}

try {
  const before = await verifyReadOnlySurfaces();

  if (!runActive) {
    console.log(
      "Functional read-only verification passed. Set E2E_ACTIVE=1 to run real search, research, code, file generation, download, and quota-delta probes."
    );
    process.exit(0);
  }

  await verifySearch();
  await verifyCodeExecution();
  await verifyFileGeneration();
  await verifyResearch();

  const after = await getUsage();
  verifyQuotaDeltas(before, after);

  console.log("Authenticated functional verification passed.");
} catch (error) {
  console.error(
    `FAIL ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
}
