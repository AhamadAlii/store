import { NextResponse } from "next/server";
import { orderService } from "@/services/order.service";
import { orderRepository } from "@/db/repositories/order.repository";
import { razorpay, RAZORPAY_KEY_ID } from "@/lib/razorpay";
import { AppError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    if (!razorpay) {
      return NextResponse.json(
        { error: "Payment gateway is not configured" },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { phone, items } = body as {
      phone: string;
      items: { productId: number; quantity: number }[];
    };

    const order = await orderService.createOrder(phone, items);

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: order.tokenAmount * 100,
        currency: "INR",
        receipt: order.id,
      });
    } catch (rzpError) {
      await orderRepository.updateStatus(order.id, "CANCELLED");
      console.error("Razorpay order creation failed:", rzpError);
      return NextResponse.json(
        { error: "Payment gateway error. Please try again." },
        { status: 502 }
      );
    }

    await orderRepository.linkRazorpayOrder(order.id, razorpayOrder.id);

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: RAZORPAY_KEY_ID,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    console.error("Payment order creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}
