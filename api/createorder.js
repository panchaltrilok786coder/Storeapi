import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

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
  // allow only POST
  if (req.method !== "POST") {

    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });

  }

  try {

    const { amount } = req.body;

    // validation
    if (!amount || amount <= 0) {

      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });

    }

    const options = {

      amount: amount * 100,
      currency: "INR",

      receipt: "receipt_" + Date.now()

    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
}
