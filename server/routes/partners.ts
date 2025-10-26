import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

const PARTNER_FEE_PERCENT = parseInt(process.env.PARTNER_FEE_PERCENT || "15");

// Partner service types with base pricing
const PARTNER_SERVICES = {
  llc_formation: { name: "LLC Formation", basePriceCents: 29900, description: "Form your Limited Liability Company" },
  ein_application: { name: "EIN Application", basePriceCents: 9900, description: "Get your Federal Tax ID Number" },
  business_license: { name: "Business License", basePriceCents: 14900, description: "Local business license application" },
  insurance_general: { name: "General Liability Insurance", basePriceCents: 49900, description: "Protect your business with insurance" },
  dba_filing: { name: "DBA Filing", basePriceCents: 12900, description: "Doing Business As registration" },
  operating_agreement: { name: "Operating Agreement", basePriceCents: 19900, description: "Custom LLC operating agreement" }
} as const;

type ServiceType = keyof typeof PARTNER_SERVICES;

const orderSetupSchema = z.object({
  type: z.enum([
    "llc_formation",
    "ein_application", 
    "business_license",
    "insurance_general",
    "dba_filing",
    "operating_agreement"
  ] as const),
  email: z.string().email().optional(),
  notes: z.string().optional()
});

// Stub: Create a partner service order
router.post("/order-setup", async (req, res) => {
  try {
    const userId = (req.session as any)?.uid;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const data = orderSetupSchema.parse(req.body);
    const service = PARTNER_SERVICES[data.type];
    
    if (!service) {
      return res.status(400).json({ message: "Invalid service type" });
    }

    // Calculate price with platform markup
    const basePriceCents = service.basePriceCents;
    const markupCents = Math.round(basePriceCents * (PARTNER_FEE_PERCENT / 100));
    const totalPriceCents = basePriceCents + markupCents;

    // Get user details
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // In production, this would:
    // 1. Create order record in database
    // 2. Initiate partner API call
    // 3. Handle payment processing
    // 4. Track order status
    
    // For now, return stub response
    const order = {
      id: `ord_${Date.now()}`,
      userId,
      serviceType: data.type,
      serviceName: service.name,
      status: "pending",
      basePriceCents,
      markupCents,
      totalPriceCents,
      createdAt: new Date().toISOString(),
      notes: data.notes || null,
      // In production would include partner order ID and tracking URL
      partnerOrderId: null,
      trackingUrl: null
    };

    res.json({
      success: true,
      order,
      message: `Your ${service.name} order has been received. A specialist will contact you within 24 hours.`
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid request data",
        errors: error.errors
      });
    }
    
    console.error("Partner order error:", error);
    res.status(500).json({
      message: "Failed to process partner service order",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Get available partner services
router.get("/services", async (req, res) => {
  try {
    const services = Object.entries(PARTNER_SERVICES).map(([key, value]) => {
      const basePriceCents = value.basePriceCents;
      const markupCents = Math.round(basePriceCents * (PARTNER_FEE_PERCENT / 100));
      const totalPriceCents = basePriceCents + markupCents;
      
      return {
        type: key,
        name: value.name,
        description: value.description,
        basePriceCents,
        markupCents,
        totalPriceCents,
        platformFeePercent: PARTNER_FEE_PERCENT
      };
    });

    res.json({ services });
  } catch (error) {
    console.error("Failed to fetch partner services:", error);
    res.status(500).json({
      message: "Failed to fetch partner services"
    });
  }
});

export default router;
