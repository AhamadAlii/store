import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const userRepository = {
  async findByPhone(phone: string) {
    return prisma.user.findUnique({
      where: { phone },
    });
  },

  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
    });
  },
};
