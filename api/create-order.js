import Razorpay from "razorpay";

// =========================
// MAIN HANDLER
// =========================
export default async function handler(req, res) {

  // =========================
  // CORS HEADERS
  // =========================
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // =========================
  // HANDLE PREFLIGHT
  // =========================
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // =========================
  // ONLY POST ALLOWED
  // =========================
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {

    // =========================
    // GET DATA
    // =========================
    const { amount } = req.body || {};

    // =========================
    // VALIDATION (IMPORTANT)
    // =========================
    if (amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        error: "Amount missing from request"
      });
    }

    const numericAmount = Number(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount received",
        received: amount
      });
    }

    // =========================
    // INIT RAZORPAY
    // =========================
    const razorpay = new Razorpay({
      key_id: process.env.RZP_KEY_ID,
      key_secret: process.env.RZP_KEY_SECRET
    });

    if (!process.env.RZP_KEY_ID || !process.env.RZP_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        error: "Razorpay keys missing in environment variables"
      });
    }

    // =========================
    // CREATE ORDER
    // =========================
    const options = {
      amount: Math.round(numericAmount * 100), // paise
      currency: "INR",
      receipt: "rcpt_" + Date.now()
    };

    const order = await razorpay.orders.create(options);

    // =========================
    // SUCCESS RESPONSE
    // =========================
    return res.status(200).json({
      success: true,
      order
    });

  } catch (err) {

    // =========================
    // ERROR RESPONSE
    // =========================
    return res.status(500).json({
      success: false,
      error: err.message || "Server error"
    });
  }
}