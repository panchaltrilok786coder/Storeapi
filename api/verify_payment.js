import crypto from "crypto";

export default async function handler(req, res) {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {

    return res.status(200).end();

  }

  // only allow POST requests
  if (req.method !== "POST") {

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  }

  try {

    const {

      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature

    } = req.body;

    // generate signature
    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        razorpay_order_id + "|" + razorpay_payment_id
      )
      .digest("hex");

    // verify signature
    if (generatedSignature === razorpay_signature) {

      return res.status(200).json({
        success: true,
        message: "Payment verified"
      });

    } else {

      return res.status(400).json({
        success: false,
        message: "Invalid signature"
      });

    }

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
}
