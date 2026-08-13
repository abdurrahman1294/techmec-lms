import prisma from "../lib/prisma";

/**
 * Lightweight audit logger for the MVP.
 * Writes to the SystemLog table so administrators can demonstrate an audit trail.
 */
export async function writeSystemLog(
  action: string,
  options?: {
    userId?: number | null;
    details?: string | null;
    ipAddress?: string | null;
  }
): Promise<void> {
  try {
    await prisma.systemLog.create({
      data: {
        action,
        userId: options?.userId ?? null,
        details: options?.details ?? null,
        ipAddress: options?.ipAddress ?? null,
      },
    });
  } catch (err) {
    // Never fail the main request because of logging
    console.error("SystemLog write failed:", err);
  }
}
