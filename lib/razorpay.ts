import Razorpay from "razorpay";

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

if (!key_id || !key_secret) {
  console.warn(
    "⚠️  RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not set. Payment gateway will be disabled."
  );
}

export const razorpay =
  key_id && key_secret ? new Razorpay({ key_id, key_secret }) : null;

export const RAZORPAY_KEY_ID = key_id ?? "";
export const RAZORPAY_KEY_SECRET = key_secret ?? "";
