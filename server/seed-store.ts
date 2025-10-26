import { db } from "./db";
import { products, productVariants } from "@shared/schema";
import { eq } from "drizzle-orm";

const storeProducts = [
  // Polos - G PRO over heart
  {
    slug: "navy-polo-gpro",
    name: "Navy Polo - G PRO",
    description: "Professional navy blue polo with embroidered 'G PRO' over the left chest. Premium fabric, corporate style.",
    imageUrl: "/store/navy-polo.png",
    category: "apparel" as const,
    priceCents: 3499,
    variants: [
      { name: "Small", priceCents: 3499, sku: "POLO-NAVY-S" },
      { name: "Medium", priceCents: 3499, sku: "POLO-NAVY-M" },
      { name: "Large", priceCents: 3499, sku: "POLO-NAVY-L" },
      { name: "XL", priceCents: 3499, sku: "POLO-NAVY-XL" },
      { name: "2XL", priceCents: 3799, sku: "POLO-NAVY-2XL" },
    ],
  },
  {
    slug: "charcoal-polo-gpro",
    name: "Charcoal Polo - G PRO",
    description: "Sophisticated charcoal gray polo with embroidered 'G PRO' over the left chest. Breathable, professional grade.",
    imageUrl: "/store/charcoal-polo.png",
    category: "apparel" as const,
    priceCents: 3499,
    variants: [
      { name: "Small", priceCents: 3499, sku: "POLO-CHAR-S" },
      { name: "Medium", priceCents: 3499, sku: "POLO-CHAR-M" },
      { name: "Large", priceCents: 3499, sku: "POLO-CHAR-L" },
      { name: "XL", priceCents: 3499, sku: "POLO-CHAR-XL" },
      { name: "2XL", priceCents: 3799, sku: "POLO-CHAR-2XL" },
    ],
  },
  {
    slug: "white-polo-gpro",
    name: "White Polo - G PRO",
    description: "Crisp white polo with navy 'G PRO' embroidery over the left chest. Classic, clean, professional.",
    imageUrl: "/store/white-polo.png",
    category: "apparel" as const,
    priceCents: 3499,
    variants: [
      { name: "Small", priceCents: 3499, sku: "POLO-WHITE-S" },
      { name: "Medium", priceCents: 3499, sku: "POLO-WHITE-M" },
      { name: "Large", priceCents: 3499, sku: "POLO-WHITE-L" },
      { name: "XL", priceCents: 3499, sku: "POLO-WHITE-XL" },
      { name: "2XL", priceCents: 3799, sku: "POLO-WHITE-2XL" },
    ],
  },
  
  // T-Shirts - G PRO over heart
  {
    slug: "white-tee-gpro",
    name: "White Tee - G PRO",
    description: "Premium white cotton t-shirt with 'G PRO' printed over the left chest. Comfortable, corporate casual.",
    imageUrl: "/store/white-tee.png",
    category: "apparel" as const,
    priceCents: 2499,
    variants: [
      { name: "Small", priceCents: 2499, sku: "TEE-WHITE-GPRO-S" },
      { name: "Medium", priceCents: 2499, sku: "TEE-WHITE-GPRO-M" },
      { name: "Large", priceCents: 2499, sku: "TEE-WHITE-GPRO-L" },
      { name: "XL", priceCents: 2499, sku: "TEE-WHITE-GPRO-XL" },
      { name: "2XL", priceCents: 2699, sku: "TEE-WHITE-GPRO-2XL" },
    ],
  },
  
  // T-Shirts - GIGIFYPRO across chest
  {
    slug: "black-tee-gigifypro",
    name: "Black Tee - GIGIFYPRO",
    description: "Bold black cotton t-shirt with 'GIGIFYPRO' printed across the chest in modern typography. Stylish and professional.",
    imageUrl: "/store/black-tee.png",
    category: "apparel" as const,
    priceCents: 2499,
    variants: [
      { name: "Small", priceCents: 2499, sku: "TEE-BLACK-FULL-S" },
      { name: "Medium", priceCents: 2499, sku: "TEE-BLACK-FULL-M" },
      { name: "Large", priceCents: 2499, sku: "TEE-BLACK-FULL-L" },
      { name: "XL", priceCents: 2499, sku: "TEE-BLACK-FULL-XL" },
      { name: "2XL", priceCents: 2699, sku: "TEE-BLACK-FULL-2XL" },
    ],
  },
  {
    slug: "gray-tee-gigifypro",
    name: "Gray Tee - GIGIFYPRO",
    description: "Heather gray cotton t-shirt with 'GIGIFYPRO' printed across the chest. Clean, corporate style with modern appeal.",
    imageUrl: "/store/gray-tee.png",
    category: "apparel" as const,
    priceCents: 2499,
    variants: [
      { name: "Small", priceCents: 2499, sku: "TEE-GRAY-FULL-S" },
      { name: "Medium", priceCents: 2499, sku: "TEE-GRAY-FULL-M" },
      { name: "Large", priceCents: 2499, sku: "TEE-GRAY-FULL-L" },
      { name: "XL", priceCents: 2499, sku: "TEE-GRAY-FULL-XL" },
      { name: "2XL", priceCents: 2699, sku: "TEE-GRAY-FULL-2XL" },
    ],
  },
  
  // Accessories
  {
    slug: "gig-hat",
    name: "GigifyPro Hat",
    description: "Adjustable cap with embroidered GigifyPro monogram. Stay professional and protected from the sun.",
    imageUrl: "/store/hat.jpg",
    category: "hat" as const,
    priceCents: 1499,
    variants: [
      { name: "One Size", priceCents: 1499, sku: "HAT-ONE" },
    ],
  },
  {
    slug: "gig-car-sign",
    name: "GigifyPro Car Magnet",
    description: "Removable magnetic car sign for easy identification. Perfect for mobile service professionals.",
    imageUrl: "/store/car-sign.jpg",
    category: "car_sign" as const,
    priceCents: 1299,
    variants: [
      { name: "12x8 in", priceCents: 1299, sku: "SIGN-12x8" },
      { name: "18x12 in", priceCents: 1799, sku: "SIGN-18x12" },
    ],
  },
  
  // Professional Gear & Tools
  {
    slug: "laundry-bag-kit",
    name: "G PRO Laundry Bag Kit",
    description: "Professional 4-bag system: Whites, Colors, Linens, and Intimates (mesh wash-in). Prevents mix-ups and keeps loads organized. Durable, washable mesh construction with G PRO branding. Essential for Laundry Giger certification and professional home service workers.",
    imageUrl: "@assets/generated_images/G_PRO_Laundry_Bag_Kit_eceb2b1e.png",
    category: "tools_kits" as const,
    priceCents: 3999,
    variants: [
      { name: "4-Bag Set", priceCents: 3999, sku: "LAUNDRY-KIT-4" },
    ],
  },
  {
    slug: "chef-jacket",
    name: "G PRO Chef Jacket",
    description: "Professional double-breasted chef jacket with embroidered navy blue 'G PRO' logo on left chest. Breathable, stain-resistant fabric. Perfect for personal chefs, meal prep professionals, and catering gigers. Premium quality construction for daily professional use.",
    imageUrl: "@assets/generated_images/G_PRO_Chef_Jacket_b7643ecf.png",
    category: "apparel" as const,
    priceCents: 4999,
    variants: [
      { name: "Small", priceCents: 4999, sku: "CHEF-JACKET-S" },
      { name: "Medium", priceCents: 4999, sku: "CHEF-JACKET-M" },
      { name: "Large", priceCents: 4999, sku: "CHEF-JACKET-L" },
      { name: "XL", priceCents: 4999, sku: "CHEF-JACKET-XL" },
      { name: "2XL", priceCents: 5299, sku: "CHEF-JACKET-2XL" },
    ],
  },
  {
    slug: "chef-hat",
    name: "G PRO Chef Hat",
    description: "Classic white chef toque with embroidered navy blue 'G PRO' logo on front. Professional appearance for meal prep, personal chef services, and catering. One size fits most with adjustable band for secure, comfortable fit.",
    imageUrl: "@assets/generated_images/G_PRO_Chef_Hat_68e80db3.png",
    category: "apparel" as const,
    priceCents: 1999,
    variants: [
      { name: "One Size", priceCents: 1999, sku: "CHEF-HAT-ONE" },
    ],
  },
  {
    slug: "cleaning-apron",
    name: "G PRO Cleaning Apron",
    description: "Professional navy blue cleaning apron with printed white 'G PRO' logo on chest. Durable, water-resistant fabric with adjustable neck strap and front pocket for supplies. Perfect for housekeeping, cleaning services, and professional home care workers.",
    imageUrl: "@assets/generated_images/G_PRO_Cleaning_Apron_71965aeb.png",
    category: "apparel" as const,
    priceCents: 2499,
    variants: [
      { name: "One Size", priceCents: 2499, sku: "APRON-CLEAN-ONE" },
    ],
  },
  {
    slug: "safety-jacket",
    name: "G PRO Reflective Safety Jacket",
    description: "High-visibility safety jacket in bright yellow-green with reflective 'G PRO' logo on back and silver reflective strips. ANSI Class 2 compliant. Essential for outdoor workers, delivery drivers, moving services, and any gig requiring roadside visibility. Water-resistant, durable construction.",
    imageUrl: "@assets/generated_images/G_PRO_Safety_Jacket_794ba0d0.png",
    category: "safety_gear" as const,
    priceCents: 5999,
    variants: [
      { name: "Small", priceCents: 5999, sku: "SAFETY-JACKET-S" },
      { name: "Medium", priceCents: 5999, sku: "SAFETY-JACKET-M" },
      { name: "Large", priceCents: 5999, sku: "SAFETY-JACKET-L" },
      { name: "XL", priceCents: 5999, sku: "SAFETY-JACKET-XL" },
      { name: "2XL", priceCents: 6299, sku: "SAFETY-JACKET-2XL" },
    ],
  },
];

async function seedStore() {
  console.log("🌱 Seeding store products...");

  for (const productData of storeProducts) {
    // Check if product already exists
    const existing = await db
      .select()
      .from(products)
      .where(eq(products.slug, productData.slug))
      .limit(1);

    let product;
    if (existing.length > 0) {
      console.log(`  ✓ Product "${productData.name}" already exists`);
      product = existing[0];
    } else {
      const [newProduct] = await db
        .insert(products)
        .values({
          slug: productData.slug,
          name: productData.name,
          description: productData.description,
          imageUrl: productData.imageUrl,
          category: productData.category,
          priceCents: productData.priceCents,
          active: true,
        })
        .returning();
      product = newProduct;
      console.log(`  ✓ Created product: ${productData.name}`);
    }

    // Add variants
    for (const variantData of productData.variants) {
      const existingVariant = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.sku, variantData.sku))
        .limit(1);

      if (existingVariant.length === 0) {
        await db.insert(productVariants).values({
          productId: product.id,
          name: variantData.name,
          priceCents: variantData.priceCents,
          sku: variantData.sku,
          active: true,
        });
        console.log(`    ✓ Added variant: ${variantData.name}`);
      }
    }
  }

  console.log("✅ Store seed complete!");
}

seedStore()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Store seeding failed:", error);
    process.exit(1);
  });
