import crypto from "crypto";
import { NextResponse } from "next/server";
import { orderRepository } from "@/db/repositories/order.repository";
import { orderService } from "@/services/order.service";
import { RAZORPAY_KEY_SECRET } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      body as {
        orderId: string;
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      };

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification fields" },
        { status: 400 }
      );
    }

    const order = await orderRepository.findById(orderId);
    if (!order || order.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json(
        { error: "Order mismatch" },
        { status: 400 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await orderRepository.updatePaymentStatus(orderId, "FAILED", razorpay_payment_id);
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    await orderRepository.updatePaymentStatus(orderId, "PAID", razorpay_payment_id);
    await orderService.updateOrderStatus(orderId, "CONFIRMED");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
