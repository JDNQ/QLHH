import { PrismaClient, Role, PostStatus } from "@prisma/client";
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

function pick<T>(arr: T[], index: number) {
  return arr[index % arr.length];
}

function moneyToNumber(price: string | null | undefined) {
  if (!price) return null;
  // Keep digits only
  const n = parseFloat(String(price).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

async function upsertPostWithCats(params: {
  slug: string;
  title: string;
  content: string;
  price: string | null;
  priceUnit: string | null;
  location: string | null;
  status: PostStatus;
  isFeatured: boolean;
  views: number;
  userId: string;
  categoryIds: string[];
}) {
  const {
    slug,
    title,
    content,
    price,
    priceUnit,
    location,
    status,
    isFeatured,
    views,
    userId,
    categoryIds,
  } = params;

  const post = await prisma.post.upsert({
    where: { slug },
    update: {},
    create: {
      title,
      slug,
      content,
      price: price ?? undefined,
      priceUnit: priceUnit ?? undefined,
      priceValue: moneyToNumber(price),
      location: location ?? undefined,
      status,
      isFeatured,
      views,
      userId,
    },
  });

  // Ensure at least 1-3 categories
  for (const categoryId of categoryIds) {
    await prisma.postCategory.upsert({
      where: {
        postId_categoryId: { postId: post.id, categoryId },
      },
      update: {},
      create: { postId: post.id, categoryId },
    });
  }

  return post;
}

async function upsertPostImages(params: { postId: string; urls: string[] }) {
  const { postId, urls } = params;
  const existingImagesCount = await prisma.postImage.count({
    where: { postId },
  });

  // Create only if missing (avoid ballooning on repeated seed)
  if (existingImagesCount > 0) return;

  await prisma.postImage.createMany({
    data: urls.map((url, index) => ({
      postId,
      url,
      isMain: existingImagesCount === 0 && index === 0,
    })),
  });
}

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

  // Root categories
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

  // Sub categories
  const catIds = [
    "cat-phones",
    "cat-laptops",
    "cat-tablets",
    "cat-motorbikes",
    "cat-cars",
    "cat-realestate",
    // fashion placeholders (optional, just to have variety)
    "cat-fashion-men",
    "cat-fashion-women",
  ];

  // Electronics children
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

  // Vehicles children
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

  // Real estate children
  await prisma.category.upsert({
    where: { id: "cat-realestate" },
    update: {},
    create: {
      id: "cat-realestate",
      name: "Nhà đất",
      icon: "🏠",
      parentId: realEstate.id,
      sortOrder: 1,
    },
  });

  // Fashion children (new)
  await prisma.category.upsert({
    where: { id: "cat-fashion-men" },
    update: {},
    create: {
      id: "cat-fashion-men",
      name: "Thời trang nam",
      icon: "🧥",
      parentId: fashion.id,
      sortOrder: 1,
    },
  });

  await prisma.category.upsert({
    where: { id: "cat-fashion-women" },
    update: {},
    create: {
      id: "cat-fashion-women",
      name: "Thời trang nữ",
      icon: "👠",
      parentId: fashion.id,
      sortOrder: 2,
    },
  });

  console.log("✅ Categories ready");

  // Keep existing sample posts
  await upsertPostWithCats({
    slug: "ban-iphone-15-pro-max-256gb",
    title: "Bán iPhone 15 Pro Max 256GB còn bảo hành",
    content:
      "<p>Máy mới 99%, còn bảo hành 10 tháng. Đầy đủ hộp phụ kiện.</p><p>Liên hệ để được tư vấn thêm.</p>",
    price: "28000000",
    priceUnit: "VNĐ",
    location: "Quận 1, TP.HCM",
    status: PostStatus.APPROVED,
    isFeatured: true,
    views: 142,
    userId: user.id,
    categoryIds: ["cat-phones"],
  });

  await upsertPostWithCats({
    slug: "can-ban-xe-wave-alpha-2022",
    title: "Cần bán xe Wave Alpha 2022 ít đi",
    content:
      "<p>Xe đi được 8.000km, máy êm không lạnh lẽo, không đâm đụng, còn bảo hiểm xe máy.</p>",
    price: "17500000",
    priceUnit: "VNĐ",
    location: "Hà Nội",
    status: PostStatus.APPROVED,
    isFeatured: false,
    views: 87,
    userId: user.id,
    categoryIds: ["cat-motorbikes"],
  });

  await upsertPostWithCats({
    slug: "cho-thue-phong-tro-quan-binh-thanh",
    title: "Cho thuê phòng trọ Quận Bình Thạnh, gần ĐH Hutech",
    content:
      "<p>Phòng rộng 25m2, có gác lửng, toilet riêng, ban công, cửa sổ thoáng mát. Giá 3.5 triệu/tháng bao điện nước.</p>",
    price: "3500000",
    priceUnit: "VNĐ/tháng",
    location: "Bình Thạnh, TP.HCM",
    status: PostStatus.PENDING,
    isFeatured: false,
    views: 0,
    userId: user.id,
    categoryIds: ["cat-realestate"],
  });

  const approvedCountTarget = 85; // total ~60-100 approved enough for listing
  const totalToGenerate = 90; // final total posts generated (additional to 3 sample)

  const locations = [
    "Quận 1, TP.HCM",
    "Quận 3, TP.HCM",
    "Quận 7, TP.HCM",
    "Bình Thạnh, TP.HCM",
    "Hà Nội",
    "Đà Nẵng",
    "Cần Thơ",
  ];

  const categories = [
    { pool: ["cat-phones", "cat-laptops", "cat-tablets"], prefix: "Bán" },
    { pool: ["cat-motorbikes", "cat-cars"], prefix: "Cần bán" },
    { pool: ["cat-realestate"], prefix: "Cho thuê" },
    { pool: ["cat-fashion-men", "cat-fashion-women"], prefix: "Đồ" },
  ];

  const priceGroups = [
    {
      // phones
      pool: ["28000000", "32000000", "45000000", "18000000"],
      unit: "VNĐ",
    },
    {
      // laptops/tablets
      pool: ["52000000", "39000000", "26000000", "48000000"],
      unit: "VNĐ",
    },
    {
      // vehicles
      pool: ["17500000", "42000000", "68000000", "95000000"],
      unit: "VNĐ",
    },
    {
      // real estate
      pool: ["3500000", "4800000", "6200000", "7500000"],
      unit: "VNĐ/tháng",
    },
    {
      // fashion
      pool: ["250000", "390000", "150000", "520000"],
      unit: "VNĐ",
    },
  ];

  let generated = 0;
  let approvedGenerated = 0;

  for (let i = 0; generated < totalToGenerate; i++) {
    const groupIndex = i % categories.length;
    const group = pick(categories, groupIndex);

    const categoryA = pick(group.pool, i);
    const categoryB = pick(group.pool, i + 2);
    const categoryC = pick(group.pool, i + 5);

    // choose 1-3 categories (ensure uniqueness)
    const catSet = new Set<string>([categoryA]);
    if (generated % 3 !== 0) catSet.add(categoryB);
    if (generated % 5 === 0) catSet.add(categoryC);
    const categoryIds = Array.from(catSet).slice(0, 3);

    const priceGroup = pick(priceGroups, i);
    const priceValue = pick(priceGroup.pool, i + 1);
    const priceUnit = priceGroup.unit;

    // status distribution (mostly approved)
    const statusRoll = generated % 20;
    let status: PostStatus = PostStatus.APPROVED;
    if (statusRoll === 5) status = PostStatus.PENDING;
    if (statusRoll === 10) status = PostStatus.REJECTED;
    if (statusRoll === 15) status = PostStatus.EXPIRED;

    // If we somehow exceed approved target, force some to PENDING
    if (
      status === PostStatus.APPROVED &&
      approvedGenerated >= approvedCountTarget
    ) {
      status = PostStatus.PENDING;
    }

    if (status === PostStatus.APPROVED) approvedGenerated++;

    const featured =
      status === PostStatus.APPROVED ? generated % 4 === 0 : false;
    const views =
      status === PostStatus.APPROVED ? 20 + ((generated * 7) % 420) : 0;

    const slug = `${group.prefix.toLowerCase().replace(/\s+/g, "-")}-${categoryIds[0]}-${generated}`;

    // To avoid slug uniqueness issues on repeated runs, keep stable enough per index.
    // Date part makes it unique per run, but upsert uses slug. We'll rely on this script being run occasionally.

    const title = `${group.prefix} ${categoryIds[0]} #${generated + 1}`;
    const location = pick(locations, i + 3);

    const content =
      "<p>Thông tin mô tả chi tiết cho bài đăng.</p>" +
      `<p>Vị trí: ${location}</p>` +
      `<p>Giá: ${priceValue} (${priceUnit})</p>` +
      "<p>Liên hệ để xem thêm hình và tư vấn nhanh.</p>";

    const post = await upsertPostWithCats({
      slug,
      title,
      content,
      price: priceValue,
      priceUnit,
      location,
      status,
      isFeatured: featured,
      views,
      userId: user.id,
      categoryIds,
    });

    // seed images (optional, but enabled)
    const imgCount = generated % 4 === 0 ? 3 : generated % 3 === 0 ? 2 : 1;
    const base = `https://picsum.photos/seed/qlhh-${post.id}/600/400`;
    const urls = Array.from({ length: imgCount }).map((_, idx) => {
      // add query string to vary image deterministically
      return idx === 0
        ? base
        : `https://picsum.photos/seed/qlhh-${post.id}-${idx}/600/400`;
    });
    await upsertPostImages({ postId: post.id, urls });

    generated++;
  }

  console.log("✅ Additional posts created:", generated);
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
