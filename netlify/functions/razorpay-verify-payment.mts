import { createHmac, timingSafeEqual } from "node:crypto";

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

function safeEqualHex(left, right) {
  if (!/^[a-f0-9]{64}$/i.test(left) || !/^[a-f0-9]{64}$/i.test(right)) return false;
  const a = Buffer.from(left, "hex");
  const b = Buffer.from(right, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

function authHeader(keyId, keySecret) {
  return "Basic " + btoa(keyId + ":" + keySecret);
}

export const config = {
  path: "/api/razorpay/verify-payment",
  rateLimit: { windowSize: 60, windowLimit: 20, aggregateBy: ["ip"] }
};

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
    return respond(request, { error: "Online payments are not configured yet." }, 503);
  }

  let body;
  try { body = await request.json(); } catch {
    return respond(request, { error: "Invalid request body." }, 400);
  }

  const orderId = typeof body.orderId === "string" ? body.orderId : "";
  const paymentId = typeof body.paymentId === "string" ? body.paymentId : "";
  const signature = typeof body.signature === "string" ? body.signature : "";
  if (!/^order_[A-Za-z0-9]+$/.test(orderId) || !/^pay_[A-Za-z0-9]+$/.test(paymentId) || !/^[a-f0-9]{64}$/i.test(signature)) {
    return respond(request, { error: "Payment verification details are invalid." }, 400);
  }

  const expected = createHmac("sha256", keySecret).update(orderId + "|" + paymentId).digest("hex");
  if (!safeEqualHex(expected, signature)) {
    return respond(request, { error: "Payment signature verification failed. Do not treat this order as paid." }, 400);
  }

  try {
    const headers = { "authorization": authHeader(keyId, keySecret) };
    const [orderResponse, paymentResponse] = await Promise.all([
      fetch("https://api.razorpay.com/v1/orders/" + encodeURIComponent(orderId), { headers }),
      fetch("https://api.razorpay.com/v1/payments/" + encodeURIComponent(paymentId), { headers })
    ]);
    const [order, payment] = await Promise.all([orderResponse.json(), paymentResponse.json()]);
    if (!orderResponse.ok || !paymentResponse.ok) {
      return respond(request, { error: "Unable to verify the payment with Razorpay. Please contact support before retrying." }, 502);
    }
    if (order.receipt?.startsWith("inniya_") !== true || order.notes?.merchant !== "INNIYA") {
      return respond(request, { error: "This payment does not match an INNIYA checkout order." }, 400);
    }
    if (payment.order_id !== orderId || payment.amount !== order.amount || payment.currency !== "INR") {
      return respond(request, { error: "The payment details do not match the order." }, 400);
    }
    if (payment.status !== "captured" || order.status !== "paid") {
      return respond(request, { ok: false, status: payment.status || "unknown", message: "Payment is not confirmed as captured yet. Please wait and check your Razorpay dashboard before retrying." }, 409);
    }

    return respond(request, {
      ok: true,
      status: "captured",
      orderId,
      paymentId,
      receipt: order.receipt,
      amount: order.amount,
      currency: order.currency
    }, 200);
  } catch {
    return respond(request, { error: "Unable to confirm payment status. Please contact support before making another payment." }, 502);
  }
}
