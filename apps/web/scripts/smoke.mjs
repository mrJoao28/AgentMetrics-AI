// Integration smoke test: run against a built Next.js server.
const base = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";
function ensure(condition, message) { if (!condition) throw new Error(message); }
async function check() {
  const home = await fetch(base, { redirect: "follow" });
  const html = await home.text();
  ensure(home.ok, `Homepage returned ${home.status}`);
  ensure(html.includes("AgentMetrics AI"), "Brand missing from homepage");
  ensure(html.includes('lang="pt-BR"'), "Page language metadata missing");
  ensure(html.includes('og:image'), "Open Graph image metadata missing");
  ensure(html.includes("Execute uma avaliação"), "Evaluation empty state missing");
  ensure(!html.includes("12.840") && !html.includes("91,2%"), "Illustrative KPIs still rendered");

  const image = await fetch(base + "/opengraph-image", { redirect: "follow" });
  ensure(image.ok, `Open Graph image returned ${image.status}`);
  ensure((image.headers.get("content-type") ?? "").includes("image/png"), "Open Graph image is not PNG");
  ensure((await image.arrayBuffer()).byteLength > 1000, "Open Graph image is unexpectedly small");

  const invalid = await fetch(base + "/api/evaluate", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ records: [] }),
  });
  ensure([400, 503].includes(invalid.status), `Invalid evaluation returned ${invalid.status}`);
  console.log("Smoke tests passed: home, locale, Open Graph, empty state, API");
}
await check();
