import crypto from "crypto";

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {

      return res.status(400).json({
        success: false,
        error: "Missing Razorpay fields"
      });
    }

    const body =
      razorpay_order_id +
      "|" +
      razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RZP_KEY_SECRET
      )
      .update(body)
      .digest("hex");

    const isValid =
      expectedSignature ===
      razorpay_signature;

    if (!isValid) {

      return res.status(400).json({
        success: false,
        error: "Signature verification failed"
      });
    }

    return res.status(200).json({
      success: true
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      error: err?.message || "Unknown Error",
      name: err?.name || "Unknown",
      secretExists: !!process.env.RZP_KEY_SECRET
    });
  }
}