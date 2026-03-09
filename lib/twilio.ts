import { Twilio } from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  console.warn(
    "⚠️  TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN is not set. SMS notifications will be disabled."
  );
}

export const twilioClient =
  accountSid && authToken ? new Twilio(accountSid, authToken) : null;

export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER ?? "";
