const MARKETPLACES = {
  FR: { id: "EBAY_FR", language: "fr-FR" },
  DE: { id: "EBAY_DE", language: "de-DE" },
  IT: { id: "EBAY_IT", language: "it-IT" },
  ES: { id: "EBAY_ES", language: "es-ES" },
  NL: { id: "EBAY_NL", language: "nl-NL" }
};

let cachedToken = null;
let tokenExpiresAt = 0;

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=300");
  res.end(JSON.stringify(body));
}

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) return cachedToken;

  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("EBAY_CREDENTIALS_MISSING");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope"
  });

  if (!response.ok) throw new Error(`EBAY_AUTH_${response.status}`);
  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + Number(data.expires_in || 7200) * 1000;
  return cachedToken;
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeItem(item, country) {
  const price = number(item.price?.value);
  const shipping = number(item.shippingOptions?.[0]?.shippingCost?.value);
  const reference = number(item.marketingPrice?.originalPrice?.value) || price;
  const condition = /used|pre-owned|refurbished/i.test(item.condition || "") ? "used" : "new";
  const sellerFeedback = number(item.seller?.feedbackPercentage);
  const trust = sellerFeedback ? Math.max(1, Math.min(100, Math.round(sellerFeedback))) : 75;
  const discount = reference > price ? Math.round((1 - price / reference) * 100) : 0;

  return {
    id: `ebay-${item.itemId}`,
    name: item.title,
    store: item.seller?.username ? `eBay · ${item.seller.username}` : "eBay",
    country,
    condition,
    price,
    reference,
    shipping,
    currency: item.price?.currency || "EUR",
    trust,
    errorRisk: discount >= 55 ? 45 : discount >= 35 ? 28 : 10,
    url: item.itemWebUrl,
    image: item.image?.imageUrl || "",
    reason: discount > 0
      ? `Canlı eBay verisi. İlan fiyatı görünen referans fiyatın yaklaşık %${discount} altında.`
      : "Canlı eBay verisi. Satıcı puanı, kargo ve ürün durumu satın almadan önce kontrol edilmelidir.",
    source: "ebay-live"
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") return send(res, 405, { error: "METHOD_NOT_ALLOWED" });

  try {
    const query = String(req.query.q || "").trim();
    const country = String(req.query.country || "FR").toUpperCase();
    const limit = Math.max(1, Math.min(30, Number(req.query.limit || 18)));

    if (query.length < 2) return send(res, 400, { error: "QUERY_TOO_SHORT" });
    if (!MARKETPLACES[country]) return send(res, 400, { error: "COUNTRY_NOT_SUPPORTED" });

    const token = await getAccessToken();
    const marketplace = MARKETPLACES[country];
    const url = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
    url.searchParams.set("q", query);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("filter", "buyingOptions:{FIXED_PRICE}");

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-EBAY-C-MARKETPLACE-ID": marketplace.id,
        "Accept-Language": marketplace.language
      }
    });

    if (!response.ok) {
      const detail = await response.text();
      return send(res, response.status, { error: "EBAY_SEARCH_FAILED", detail: detail.slice(0, 400) });
    }

    const data = await response.json();
    const items = (data.itemSummaries || []).map(item => normalizeItem(item, country));
    return send(res, 200, { source: "ebay-live", count: items.length, items });
  } catch (error) {
    const code = error?.message || "UNKNOWN_ERROR";
    return send(res, code === "EBAY_CREDENTIALS_MISSING" ? 503 : 500, { error: code });
  }
}
