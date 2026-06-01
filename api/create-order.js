import Razorpay from "razorpay";

export default async function handler(req, res) {

  // =========================
  // CORS HEADERS
  // =========================
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // =========================
  // PREFLIGHT
  // =========================
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // =========================
  // METHOD CHECK
  // =========================
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {

    // =========================
    // DEBUG: REQUEST BODY
    // =========================
    console.log("🔵 Incoming Request Body:", req.body);

    const { amount } = req.body || {};

    console.log("🟡 Raw Amount:", amount);
    console.log("🟡 Amount Type:", typeof amount);

    // =========================
    // VALIDATION
    // =========================
    if (amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        error: "Amount missing from request",
        debug: req.body
      });
    }

    const numericAmount = Number(amount);

    console.log("🟡 Parsed Number:", numericAmount);

    if (isNaN(numericAmount)) {
      return res.status(400).json({
        success: false,
        error: "Amount is NaN",
        received: amount
      });
    }

    if (numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: "Amount must be greater than 0",
        received: numericAmount
      });
    }

    // =========================
    // CHECK ENV VARIABLES
    // =========================
    console.log("🔵 ENV CHECK:", {
      key_id: !!process.env.RZP_KEY_ID,
      key_secret: !!process.env.RZP_KEY_SECRET
    });

    if (!process.env.RZP_KEY_ID || !process.env.RZP_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        error: "Missing Razorpay env variables"
      });
    }

    // =========================
    // INIT RAZORPAY
    // =========================
    const razorpay = new Razorpay({
      key_id: process.env.RZP_KEY_ID,
      key_secret: process.env.RZP_KEY_SECRET
    });

    // =========================
    // BUILD ORDER OPTIONS
    // =========================
    const options = {
      amount: Math.floor(numericAmount * 100), // paise
      currency: "INR",
      receipt: "rcpt_" + Date.now()
    };

    console.log("🟣 Razorpay Options:", options);

    // =========================
    // CREATE ORDER (SAFE)
    // =========================
    let order;

    try {
      order = await razorpay.orders.create(options);
      console.log("🟢 Razorpay Order Success:", order);

    } catch (rzpError) {
      console.log("🔴 Razorpay Error:", rzpError);

      return res.status(500).json({
        success: false,
        error: "Razorpay order creation failed",
        details: rzpError.message,
        fullError: rzpError
      });
    }

    // =========================
    // SUCCESS RESPONSE
    // =========================
    return res.status(200).json({
      success: true,
      order
    });

  } catch (err) {

    console.log("🔥 SERVER CRASH:", err);

    return res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack
    });
  }
}