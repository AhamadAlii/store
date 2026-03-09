import { twilioClient, TWILIO_PHONE_NUMBER } from "@/lib/twilio";

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

async function sendSMS(to: string, body: string): Promise<boolean> {
  if (!twilioClient || !TWILIO_PHONE_NUMBER) {
    console.log(`[SMS disabled] To: ${to} | ${body}`);
    return false;
  }

  try {
    await twilioClient.messages.create({
      body,
      from: TWILIO_PHONE_NUMBER,
      to: formatPhone(to),
    });
    return true;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return false;
  }
}

const STATUS_MESSAGES: Record<string, (orderId: string) => string> = {
  CONFIRMED:
    (orderId) =>
      `Your order ${orderId} has been confirmed! We'll start preparing it shortly.`,
  PREPARING:
    (orderId) =>
      `Your order ${orderId} is now being prepared. We'll notify you when it's ready for pickup.`,
  READY:
    (orderId) =>
      `Your order ${orderId} is ready for pickup! Please visit the store to collect it.`,
  DELIVERED:
    (orderId) =>
      `Your order ${orderId} has been marked as delivered. Thank you for shopping with us!`,
  CANCELLED:
    (orderId) =>
      `Your order ${orderId} has been cancelled. If you have questions, please contact the store.`,
};

export const notificationService = {
  async sendOrderPlaced(phone: string, orderId: string, tokenAmount: number) {
    const body =
      `Your order ${orderId} has been received! ` +
      `Token amount: ₹${tokenAmount}. ` +
      `Please complete payment to confirm your order.`;
    return sendSMS(phone, body);
  },

  async sendStatusUpdate(phone: string, orderId: string, status: string) {
    const messageFn = STATUS_MESSAGES[status];
    if (!messageFn) return false;
    return sendSMS(phone, messageFn(orderId));
  },

  async sendPickupReminder(phone: string, orderId: string, status: string) {
    const body =
      `Reminder: Your order ${orderId} is ${status.toLowerCase()}. ` +
      `Please pick it up from the store at your earliest convenience.`;
    return sendSMS(phone, body);
  },
};
