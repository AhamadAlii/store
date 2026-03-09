import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // --- Admin User ---
  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { phone: "9999999999" },
    update: {
      name: "Admin",
      passwordHash,
      role: Role.ADMIN,
    },
    create: {
      name: "Admin",
      phone: "9999999999",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log(`✅ Admin user ready  — id: ${admin.id}, phone: ${admin.phone}`);

  // --- Products ---
  const products = [
    {
      name: "Stainless Steel Spatula",
      description:
        "Durable stainless steel spatula with a heat-resistant ergonomic handle. Perfect for flipping dosas, parathas, and pancakes.",
      price: 250,
      imageUrl: "",
      inStock: true,
      stockQuantity: 40,
    },
    {
      name: "Nylon Serving Ladle",
      description:
        "Lightweight nylon ladle safe for non-stick cookware. Ideal for serving dal, soups, and curries without scratching your pots.",
      price: 150,
      imageUrl: "",
      inStock: true,
      stockQuantity: 50,
    },
    {
      name: "Stainless Steel Balloon Whisk",
      description:
        "Professional-grade balloon whisk with comfortable grip. Great for beating eggs, whisking batters, and blending sauces smoothly.",
      price: 350,
      imageUrl: "",
      inStock: true,
      stockQuantity: 30,
    },
    {
      name: "Silicone-Tipped Kitchen Tongs",
      description:
        "12-inch locking kitchen tongs with silicone tips to protect cookware. Sturdy enough for grilling and gentle enough for plating.",
      price: 450,
      imageUrl: "",
      inStock: true,
      stockQuantity: 25,
    },
    {
      name: "Stainless Steel Y-Peeler",
      description:
        "Sharp swivel-blade Y-peeler for effortless peeling of vegetables and fruits. Compact design with a rust-resistant blade.",
      price: 180,
      imageUrl: "",
      inStock: true,
      stockQuantity: 45,
    },
    {
      name: "4-in-1 Box Grater",
      description:
        "Multi-purpose stainless steel box grater with four grating surfaces — fine, medium, coarse, and slicer. Non-slip rubber base for stability.",
      price: 550,
      imageUrl: "",
      inStock: true,
      stockQuantity: 20,
    },
    {
      name: "Wooden Rolling Pin (Belan)",
      description:
        "Classic handcrafted wooden rolling pin made from seasoned sheesham wood. Smooth finish for even rolling of chapatis and rotis.",
      price: 300,
      imageUrl: "",
      inStock: true,
      stockQuantity: 35,
    },
    {
      name: "7-Piece Stainless Steel Knife Set",
      description:
        "Complete knife set including chef's knife, bread knife, utility knife, paring knife, and scissors with a wooden block stand.",
      price: 2500,
      imageUrl: "",
      inStock: true,
      stockQuantity: 10,
    },
    {
      name: "Stainless Steel Mixing Bowl Set (3-Piece)",
      description:
        "Nesting set of three polished stainless steel mixing bowls (1L, 2L, 3L). Flat base for stability, perfect for prep and serving.",
      price: 850,
      imageUrl: "",
      inStock: true,
      stockQuantity: 15,
    },
    {
      name: "Bamboo Cutting Board",
      description:
        "Eco-friendly bamboo cutting board with juice groove and easy-grip handles. Naturally antibacterial and knife-friendly surface.",
      price: 750,
      imageUrl: "",
      inStock: true,
      stockQuantity: 20,
    },
  ];

  // Clean existing products and recreate for a consistent seed
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  const created = await prisma.product.createMany({ data: products });

  console.log(`✅ ${created.count} products seeded`);
  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
