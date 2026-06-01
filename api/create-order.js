import Razorpay from "razorpay";

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

    const razorpay = new Razorpay({
      key_id: process.env.RZP_KEY_ID,
      key_secret: process.env.RZP_KEY_SECRET
    });

    const order = await razorpay.orders.create({
      amount: 100 * 100,
      currency: "INR",
      receipt: "rcpt_" + Date.now()
    });

    return res.status(200).json({
      success: true,
      order
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      error: err?.message || "Unknown Error",
      name: err?.name || "Unknown",
      keyExists: !!process.env.RZP_KEY_ID,
      secretExists: !!process.env.RZP_KEY_SECRET
    });
  }
}