-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "lastReminderAt" TIMESTAMP(3),
ADD COLUMN     "notifiedAt" TIMESTAMP(3);
