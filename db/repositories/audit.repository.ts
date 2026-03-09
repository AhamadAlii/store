import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export const auditRepository = {
  async create(
    action: string,
    actorId: number | null,
    entity: string,
    details?: string
  ) {
    return prisma.auditLog.create({
      data: {
        action,
        actorId,
        entity,
        ...(details !== undefined && { details }),
      },
    });
  },

  async findAll(page: number = DEFAULT_PAGE, limit: number = DEFAULT_LIMIT) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { timestamp: "desc" },
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      }),
      prisma.auditLog.count(),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },
};
