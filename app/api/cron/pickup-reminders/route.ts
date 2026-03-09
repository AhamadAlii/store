import { NextRequest, NextResponse } from "next/server";
import { orderRepository } from "@/db/repositories/order.repository";
import { notificationService } from "@/services/notification.service";

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret");

  if (secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await orderRepository.findOrdersNeedingReminder(TWO_HOURS_MS);

  let sent = 0;

  for (const order of orders) {
    const ok = await notificationService.sendPickupReminder(
      order.phone,
      order.id,
      order.status
    );

    if (ok) {
      await orderRepository.markReminderSent(order.id);
      sent++;
    }
  }

  return NextResponse.json({
    success: true,
    checked: orders.length,
    sent,
  });
}
