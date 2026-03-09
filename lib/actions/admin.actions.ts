"use server";

import { auth } from "@/auth";
import { adminService } from "@/services/admin.service";
import { createSafeResponse, AppError } from "@/lib/errors";

async function requireAdmin() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new AppError("Forbidden: admin access required", 403, "FORBIDDEN");
  }

  return session;
}

export async function getAnalytics() {
  return createSafeResponse(async () => {
    await requireAdmin();
    return adminService.getAnalytics();
  });
}

export async function getAuditLogs(page?: number, limit?: number) {
  return createSafeResponse(async () => {
    await requireAdmin();
    return adminService.getAuditLogs(page, limit);
  });
}
