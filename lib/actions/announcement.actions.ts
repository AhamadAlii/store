"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { AppError } from "@/lib/errors";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new AppError("Forbidden: admin access required", 403, "FORBIDDEN");
  }
  return session;
}

/**
 * Create a new announcement
 * - validates input
 * - deactivates previous announcements
 * - creates new active announcement
 * - refreshes homepage cache
 */
export async function createAnnouncement(
  title: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    // ✅ validation
    if (!title?.trim() || !message?.trim()) {
      return {
        success: false,
        error: "Title and message are required",
      };
    }

    // ✅ only ONE active announcement allowed
    await prisma.announcement.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // ✅ create new announcement
    await prisma.announcement.create({
      data: {
        title: title.trim(),
        message: message.trim(),
        isActive: true,
      },
    });

    // ✅ refresh homepage cache
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Create announcement error:", error);

    return {
      success: false,
      error: "Failed to create announcement",
    };
  }
}

/**
 * Dismiss (deactivate) the currently active announcement
 */
export async function dismissAnnouncement(): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    await prisma.announcement.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Dismiss announcement error:", error);
    return { success: false, error: "Failed to dismiss announcement" };
  }
}

/**
 * Get latest active announcement
 */
export async function getActiveAnnouncement() {
  try {
    return await prisma.announcement.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Fetch announcement error:", error);
    return null;
  }
}