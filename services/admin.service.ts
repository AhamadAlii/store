import { orderRepository } from "@/db/repositories/order.repository";
import { auditRepository } from "@/db/repositories/audit.repository";

export const adminService = {
  async getAnalytics() {
    return orderRepository.getAnalytics();
  },

  async getAuditLogs(page: number = 1, limit: number = 20) {
    return auditRepository.findAll(page, limit);
  },
};
