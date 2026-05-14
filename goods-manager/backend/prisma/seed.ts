import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";
import * as fs from "fs";
import * as path from "path";

function loadEnvVarFromBackendDotEnv(varName: string): string | undefined {
  try {
    const envPath = path.resolve(__dirname, "..", ".env");
    const raw = fs.readFileSync(envPath, "utf8");

    // Simple .env line parser: KEY=value (ignores comments/blank lines)
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;

      const key = trimmed.slice(0, idx).trim();
      if (key !== varName) continue;

      const val = trimmed.slice(idx + 1).trim();

      // strip optional surrounding quotes
      const unquoted =
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
          ? val.slice(1, -1)
          : val;

      return unquoted;
    }
  } catch {
    // ignore
  }

  return undefined;
}

// Ensure prisma datasource has correct DATABASE_URL during `ts-node` seed runs.
// (Nest CLI uses dotenv, but direct ts-node execution may not.)
if (
  !process.env.DATABASE_URL ||
  !process.env.DATABASE_URL.startsWith("mysql://")
) {
  const fromEnv = loadEnvVarFromBackendDotEnv("DATABASE_URL");
  if (fromEnv) process.env.DATABASE_URL = fromEnv;
}

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: adminPassword,
      name: "Administrator",
      role: Role.ADMIN,
      phone: "0900000001",
      isActive: true,
    },
  });
  console.log("✅ Admin created:", admin.email);

  // Create regular user
  const userPassword = await bcrypt.hash("User@123", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      password: userPassword,
      name: "Nguyễn Văn A",
      role: Role.USER,
      phone: "0901234567",
      address: "Hà Nội",
      isActive: true,
    },
  });
  console.log("✅ User created:", user.email);

  // Create root categories
  const electronics = await prisma.category.upsert({
    where: { id: "cat-electronics" },
    update: {},
    create: {
      id: "cat-electronics",
      name: "Điện tử",
      icon: "💻",
      description: "Thiết bị điện tử, công nghệ",
      sortOrder: 1,
    },
  });

  const vehicles = await prisma.category.upsert({
    where: { id: "cat-vehicles" },
    update: {},
    create: {
      id: "cat-vehicles",
      name: "Xe cộ",
      icon: "🚗",
      description: "Xe máy, ô tô, xe đạp",
      sortOrder: 2,
    },
  });

  const realEstate = await prisma.category.upsert({
    where: { id: "cat-realestate" },
    update: {},
    create: {
      id: "cat-realestate",
      name: "Bất động sản",
      icon: "🏠",
      description: "Nhà đất, căn hộ, phòng trọ",
      sortOrder: 3,
    },
  });

  const fashion = await prisma.category.upsert({
    where: { id: "cat-fashion" },
    update: {},
    create: {
      id: "cat-fashion",
      name: "Thời trang",
      icon: "👗",
      description: "Quần áo, giày dép, phụ kiện",
      sortOrder: 4,
    },
  });

  console.log("✅ Root categories created");

  // Create sub categories
  await prisma.category.upsert({
    where: { id: "cat-phones" },
    update: {},
    create: {
      id: "cat-phones",
      name: "Điện thoại",
      icon: "📱",
      parentId: electronics.id,
      sortOrder: 1,
    },
  });

  await prisma.category.upsert({
    where: { id: "cat-laptops" },
    update: {},
    create: {
      id: "cat-laptops",
      name: "Laptop",
      icon: "💻",
      parentId: electronics.id,
      sortOrder: 2,
    },
  });

  await prisma.category.upsert({
    where: { id: "cat-tablets" },
    update: {},
    create: {
      id: "cat-tablets",
      name: "Máy tính bảng",
      icon: "📲",
      parentId: electronics.id,
      sortOrder: 3,
    },
  });

  await prisma.category.upsert({
    where: { id: "cat-motorbikes" },
    update: {},
    create: {
      id: "cat-motorbikes",
      name: "Xe máy",
      icon: "🏍️",
      parentId: vehicles.id,
      sortOrder: 1,
    },
  });

  await prisma.category.upsert({
    where: { id: "cat-cars" },
    update: {},
    create: {
      id: "cat-cars",
      name: "Ô tô",
      icon: "🚗",
      parentId: vehicles.id,
      sortOrder: 2,
    },
  });

  console.log("✅ Sub categories created");

  // Create sample posts
  const post1 = await prisma.post.upsert({
    where: { slug: "ban-iphone-15-pro-max-256gb" },
    update: {},
    create: {
      title: "Bán iPhone 15 Pro Max 256GB còn bảo hành",
      slug: "ban-iphone-15-pro-max-256gb",
      content:
        "<p>Máy mới 99%, còn bảo hành 10 tháng. Đầy đủ hộp phụ kiện.</p><p>Liên hệ để được tư vấn thêm.</p>",
      price: "28000000",
      priceUnit: "VNĐ",
      location: "Quận 1, TP.HCM",
      status: "APPROVED",
      isFeatured: true,
      views: 142,
      userId: user.id,
    },
  });

  await prisma.postCategory.upsert({
    where: {
      postId_categoryId: { postId: post1.id, categoryId: "cat-phones" },
    },
    update: {},
    create: { postId: post1.id, categoryId: "cat-phones" },
  });

  const post2 = await prisma.post.upsert({
    where: { slug: "can-ban-xe-wave-alpha-2022" },
    update: {},
    create: {
      title: "Cần bán xe Wave Alpha 2022 ít đi",
      slug: "can-ban-xe-wave-alpha-2022",
      content:
        "<p>Xe đi được 8.000km, máy êm không lạnh lẽo, không đâm đụng, còn bảo hiểm xe máy.</p>",
      price: "17500000",
      priceUnit: "VNĐ",
      location: "Hà Nội",
      status: "APPROVED",
      isFeatured: false,
      views: 87,
      userId: user.id,
    },
  });

  await prisma.postCategory.upsert({
    where: {
      postId_categoryId: { postId: post2.id, categoryId: "cat-motorbikes" },
    },
    update: {},
    create: { postId: post2.id, categoryId: "cat-motorbikes" },
  });

  const post3 = await prisma.post.upsert({
    where: { slug: "cho-thue-phong-tro-quan-binh-thanh" },
    update: {},
    create: {
      title: "Cho thuê phòng trọ Quận Bình Thạnh, gần ĐH Hutech",
      slug: "cho-thue-phong-tro-quan-binh-thanh",
      content:
        "<p>Phòng rộng 25m2, có gác lửng, toilet riêng, ban công, cửa sổ thoáng mát. Giá 3.5 triệu/tháng bao điện nước.</p>",
      price: "3500000",
      priceUnit: "VNĐ/tháng",
      location: "Bình Thạnh, TP.HCM",
      status: "PENDING",
      isFeatured: false,
      views: 0,
      userId: user.id,
    },
  });

  await prisma.postCategory.upsert({
    where: {
      postId_categoryId: { postId: post3.id, categoryId: "cat-realestate" },
    },
    update: {},
    create: { postId: post3.id, categoryId: "cat-realestate" },
  });

  console.log("✅ Sample posts created");
  console.log("🎉 Seeding completed!");
  console.log("");
  console.log("📋 Test accounts:");
  console.log("   Admin: admin@example.com / Admin@123");
  console.log("   User:  user@example.com  / User@123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
