// api/price.js  (Vercel serverless function — uses global fetch)
export default async function handler(req, res) {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ success: false, error: "missing url query parameter" });

    const PROVIDER = (process.env.PROVIDER || "collectapi").toLowerCase();
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) return res.status(500).json({ success: false, error: "API_KEY not set in environment variables" });

    const fetchWithTimeout = (input, init = {}, timeout = 15000) =>
      Promise.race([
        fetch(input, init),
        new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), timeout)),
      ]);

    if (PROVIDER === "collectapi") {
      const endpoint = `https://api.collectapi.com/ecommerce/amazon/product?url=${encodeURIComponent(url)}`;
      const r = await fetchWithTimeout(endpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: API_KEY },
      }, 15000);

      const json = await r.json().catch(() => ({}));
      const result = json.result ?? json.data ?? json;
      const norm = {
        raw: json,
        title: result?.title ?? result?.name ?? null,
        price: result?.price ?? result?.mrp ?? result?.discountedPrice ?? null,
        image: result?.image ?? (result?.images?.[0]) ?? null,
        url,
      };
      return res.status(r.status >= 200 && r.status < 300 ? 200 : r.status).json({ success: true, result: norm });
    }

    if (PROVIDER === "priceapi") {
      const endpoint = `https://api.priceapi.com/v2/jobs?token=${encodeURIComponent(API_KEY)}&source=amazon&country=in&topic=product_and_offers&key=ean&values=${encodeURIComponent(url)}`;
      const r = await fetchWithTimeout(endpoint, {}, 20000);
      const json = await r.json().catch(() => ({}));
      const jobResult = Array.isArray(json) ? json[0] : (json.result ?? json);
      const norm = {
        raw: json,
        title: jobResult?.title ?? jobResult?.result?.title ?? null,
        price: jobResult?.price ?? jobResult?.result?.price ?? null,
        image: jobResult?.image ?? jobResult?.result?.image ?? null,
        url,
      };
      return res.status(200).json({ success: true, result: norm });
    }

    return res.status(400).json({ success: false, error: "Unknown PROVIDER configured (set PROVIDER env to 'collectapi' or 'priceapi')" });
  } catch (err) {
    console.error("api/price error:", err);
    return res.status(500).json({ success: false, error: err.message || "server error" });
  }
}
