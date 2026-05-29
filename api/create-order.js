import Razorpay from "razorpay";

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
  // ONLY ALLOW POST
  // =========================
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  }

  try {
    const { amount } = req.body;

    const razorpay = new Razorpay({
      key_id: process.env.RZP_KEY_ID,
      key_secret: process.env.RZP_KEY_SECRET
    });

    const options = {
      amount: amount * 100, // INR → paise
      currency: "INR",
      receipt: "rcpt_" + Date.now()
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json(order);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}