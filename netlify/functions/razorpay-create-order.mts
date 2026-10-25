import siteConfig from "../../inniya/site-config.json" with { type: "json" };

function env(name) {
  try {
    return Netlify.env.get(name) || "";
  } catch {
    return "";
  }
}

function allowedOrigins() {
  const configured = env("PAYMENT_ALLOWED_ORIGINS");
  return (configured || "https://rajatsinghboss.github.io,https://inniya-payments.netlify.app")
    .split(",").map((value) => value.trim()).filter(Boolean);
}

function respond(request, data, status = 200) {
  const origin = request.headers.get("origin") || "";
  const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "vary": "Origin" };
  if (origin && allowedOrigins().includes(origin)) {
    headers["access-control-allow-origin"] = origin;
    headers["access-control-allow-methods"] = "POST, OPTIONS";
    headers["access-control-allow-headers"] = "Content-Type";
    headers["access-control-max-age"] = "600";
  }
  return new Response(JSON.stringify(data), { status, headers });
}

function validRequestOrigin(request) {
  const origin = request.headers.get("origin") || "";
  return Boolean(origin && allowedOrigins().includes(origin));
}

function safeString(value, maxLength = 240) {
  return typeof value === "string" ? value.trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, maxLength) : "";
}

function authHeader(keyId, keySecret) {
  return "Basic " + btoa(keyId + ":" + keySecret);
}

export default async function handler(request) {
  if (request.method === "OPTIONS") {
    if (!validRequestOrigin(request)) return respond(request, { error: "Origin is not allowed." }, 403);
    return respond(request, { ok: true });
  }
  if (request.method !== "POST") return respond(request, { error: "Method not allowed." }, 405);
  if (!validRequestOrigin(request)) return respond(request, { error: "Origin is not allowed." }, 403);

  const keyId = env("RAZORPAY_KEY_ID");
  const keySecret = env("RAZORPAY_KEY_SECRET");
  if (!keyId || !keySecret) {
    return respond(request, { error: "Online payments are not configured yet. Store admin: add Razorpay test keys in Netlify environment variables." }, 503);
  }

  let body;
  try { body = await request.json(); } catch {
    return respond(request, { error: "Invalid request body." }, 400);
  }

  const customer = body && body.customer && typeof body.customer === "object" ? body.customer : {};
  const name = safeString(customer.name, 100);
  const phone = safeString(customer.phone, 24);
  const address = safeString(customer.address, 350);
  const note = safeString(customer.note, 200);
  if (name.length < 2 || !/^[+0-9() .-]{8,24}$/.test(phone) || phone.replace(/\D/g, "").length < 10 || address.length < 8) {
    return respond(request, { error: "Please provide a valid name, phone number and delivery address." }, 400);
  }

  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 20) {
    return respond(request, { error: "Your cart is empty or contains too many line items." }, 400);
  }

  const catalog = Array.isArray(siteConfig.products) ? siteConfig.products : [];
  const seen = new Set();
  let amount = 0;
  const itemSummary = [];
  for (const entry of body.items) {
    const id = safeString(entry && entry.id, 100);
    const quantity = Number(entry && entry.quantity);
    if (!id || seen.has(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return respond(request, { error: "Invalid cart item or quantity." }, 400);
    }
    seen.add(id);
    const product = catalog.find((item) => item && item.id === id && item.published !== false);
    if (!product || !Number.isFinite(Number(product.price)) || Number(product.price) <= 0) {
      return respond(request, { error: "One or more products are not currently available. Refresh your cart and try again." }, 400);
    }
    const priceRupees = Math.round(Number(product.price) * 100) / 100;
    amount += Math.round(priceRupees * 100) * quantity;
    itemSummary.push((safeString(product.name, 70) || id) + " x " + quantity);
  }
  if (!Number.isSafeInteger(amount) || amount < 100 || amount > 5000000) {
    return respond(request, { error: "The order total must be between ₹1 and ₹50,000." }, 400);
  }

  const receipt = "inniya_" + Date.now().toString(36) + "_" + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const orderPayload = {
    amount,
    currency: "INR",
    receipt,
    notes: {
      merchant: "INNIYA",
      customer_name: name,
      customer_phone: phone,
      delivery_address: address,
      customer_note: note,
      items: itemSummary.join("; ").slice(0, 250)
    }
  };

  try {
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "authorization": authHeader(keyId, keySecret), "content-type": "application/json" },
      body: JSON.stringify(orderPayload)
    });
    const result = await response.json();
    if (!response.ok || !result.id) {
      console.error("Razorpay order creation failed with status", response.status);
      return respond(request, { error: "Razorpay could not create your order. Please try again or choose WhatsApp ordering." }, 502);
    }
    return respond(request, {
      keyId,
      orderId: result.id,
      amount: result.amount,
      currency: result.currency,
      name: "INNIYA",
      description: "INNIYA food order",
      receipt
    }, 200);
  } catch {
    return respond(request, { error: "Unable to connect to the payment service. Please try again." }, 502);
  }
}
