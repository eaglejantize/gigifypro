import { db } from "./db";
import { products, productVariants } from "@shared/schema";
import { eq } from "drizzle-orm";

const storeProducts = [
  {
    slug: "gig-shirt",
    name: "GigifyPro Shirt",
    description: "Breathable, quick-dry performance tee with GigifyPro mark. Perfect for active service professionals.",
    imageUrl: "/store/shirt.jpg",
    category: "shirt" as const,
    priceCents: 1999,
    variants: [
      { name: "Small", priceCents: 1999, sku: "SHIRT-S" },
      { name: "Medium", priceCents: 1999, sku: "SHIRT-M" },
      { name: "Large", priceCents: 1999, sku: "SHIRT-L" },
      { name: "XL", priceCents: 1999, sku: "SHIRT-XL" },
    ],
  },
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
