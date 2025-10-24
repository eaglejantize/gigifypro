export type ServiceInfo = {
  key: string;
  label: string;
  summary: string;
  expanded: string;
  recommendedGear?: string[];
  requirements?: string[];
  badges?: string[];
};

export const serviceInfo: ServiceInfo[] = [
  {
    key: "lawncare",
    label: "Lawn Care",
    summary:
      "Flexible options: bring your tools or use the customer's. Offer a small discount when using customer equipment.",
    expanded: `
<p><strong>How it works:</strong> Choose equipment mode per booking. Using customer tools means faster transit and lower overhead—great for new gigers.</p>
<p><strong>Before you start:</strong> Confirm tool condition, fuel type, and yard boundaries in chat. Take quick photos (pre/post).</p>
<p><strong>Compliance:</strong> Follow local noise ordinances; wear PPE. Use the Equipment Use Agreement.</p>
<p><strong>Upsells:</strong> Leaf clean-up, edging, weed control, seasonal care.</p>
`,
    recommendedGear: ["Mower/Edger or Customer Tools", "PPE (glasses/ear protection)", "Trash bags", "Fuel can"],
    requirements: ["Background check", "Local noise/environmental rules"],
    badges: ["Lawncare Basics", "Safety Verified"],
  },
  {
    key: "meal-prep",
    label: "Meal Prep / Personal Chef",
    summary:
      "Cook in the client's kitchen or deliver prepped meals. Show food-safety certs and follow local rules.",
    expanded: `
<p><strong>Models:</strong> In-home cooking or off-site prep + delivery. Label allergens and dates; sanitize and avoid cross-contamination.</p>
<p><strong>Compliance:</strong> Many areas require food-handler certificates; some require licensed kitchens for off-site prep. Check our Local Law & Licensing Map.</p>
<p><strong>Business tips:</strong> Offer weekly menus, subscriptions, and grocery add-on.</p>
`,
    recommendedGear: ["Chef jacket/hat", "Waterproof apron", "Food-safe containers", "Cooler/thermal bags"],
    requirements: ["Background check", "Food-handler certificate (region-dependent)"],
    badges: ["Meal Prep Safety Verified", "Chef Giger Certified"],
  },
  {
    key: "laundry-fold",
    label: "Laundry & Fold",
    summary:
      "Four-bag system: Whites, Colors, Linens, Intimates (mesh wash-in). Pickup → Wash → Dry → Fold → Return.",
    expanded: `
<p><strong>System:</strong> Customer pre-sorts into branded bags. You keep each load separate and return folded in the same bag. Intimates remain in the mesh bag for wash/dry to protect delicate items.</p>
<p><strong>Pricing:</strong> By bag, by pound, or subscription. Add express and stain-treat upgrades.</p>
<p><strong>Hygiene:</strong> Sanitize machines, use liners, and communicate allergies.</p>
`,
    recommendedGear: ["GigifyPro Laundry Bag Kit (4 bags)", "Gentle detergents", "Vehicle liners"],
    requirements: ["Background check"],
    badges: ["Laundry Giger Certified", "Safety Verified"],
  },
  {
    key: "childcare",
    label: "Childcare / Emergency Childcare",
    summary:
      "Short-term, non-medical childcare. Verified background; follow household rules and emergency contacts.",
    expanded: `
<p><strong>Scope:</strong> Short-term care, activities, meals, and homework support (non-medical). Always follow parental instructions.</p>
<p><strong>Requirements:</strong> Background check is mandatory; local childcare rules may apply. Consider First Aid/CPR training.</p>
`,
    recommendedGear: ["ID badge", "Activity kit (books/games)"],
    requirements: ["Background check", "Local childcare guidelines"],
    badges: ["Safety Verified"],
  },
  {
    key: "handyman",
    label: "Handyman",
    summary:
      "Light home tasks only. Bring your tools or use customer tools with an equipment agreement.",
    expanded: `
<p><strong>Scope:</strong> Minor repairs, installations, assembly. Avoid licensed trades unless you hold the proper license.</p>
<p><strong>Protection:</strong> Use Equipment Use Agreement when using customer tools. Wear PPE.</p>
`,
    recommendedGear: ["Basic toolkit", "PPE", "Stud finder", "Level"],
    requirements: ["Background check", "Local licensing for regulated tasks"],
    badges: ["Safety Verified"],
  },
  {
    key: "massage",
    label: "Massage",
    summary:
      "Licensed & insured only. Upload credentials. Set clear boundaries and hygiene standards.",
    expanded: `
<p><strong>Compliance:</strong> Massage typically requires state licensure and insurance. Upload documents to activate this category.</p>
<p><strong>Setup:</strong> Clean linens, sanitization, professional conduct.</p>
`,
    recommendedGear: ["Portable table", "Clean linens", "Sanitizer"],
    requirements: ["Background check", "Massage license", "Insurance"],
    badges: ["Business Ready", "Safety Verified"],
  },
  {
    key: "personal-trainer",
    label: "Personal Trainer",
    summary:
      "Certifications recommended. Train at client home, outdoors, or gym with permission.",
    expanded: `
<p><strong>Compliance:</strong> Certifications (NASM/ACE/ISSA) recommended; follow gym rules if on premises.</p>
<p><strong>Offerings:</strong> Programs, nutrition guidance (non-medical), progress tracking.</p>
`,
    recommendedGear: ["Bands/dumbbells", "Timer", "Mat"],
    requirements: ["Background check"],
    badges: ["Safety Verified"],
  },
  {
    key: "personal-shopper",
    label: "Personal Shopper",
    summary:
      "Smart routing & receipts. Offer weekly routes, deal-finding, and special requests.",
    expanded: `
<p><strong>Process:</strong> Confirm list/budget, share receipts, deliver on time. Offer recurring slots.</p>
`,
    recommendedGear: ["Insulated bags", "Receipt envelope"],
    requirements: ["Background check"],
    badges: ["Safety Verified"],
  },
  {
    key: "maid-service",
    label: "Maid Service",
    summary:
      "Bring your kit or use customer supplies for sensitivities. Room-by-room checklist and photos.",
    expanded: `
<p><strong>Process:</strong> Checklist per room, photos (before/after) if approved, eco-friendly options.</p>
`,
    recommendedGear: ["Cleaning kit", "Gloves", "Microfiber cloths"],
    requirements: ["Background check"],
    badges: ["Safety Verified"],
  },
  {
    key: "event-planner",
    label: "Event Planner",
    summary:
      "Plan small events; vendor coordination and timelines. Liability coverage recommended.",
    expanded: `
<p><strong>Scope:</strong> Birthdays, small weddings, community events. Contracts with vendors; clear timelines.</p>
`,
    recommendedGear: ["Planner templates", "Vendor list", "Checklists"],
    requirements: ["Background check"],
    badges: ["Business Ready"],
  },
  {
    key: "gift-buyer",
    label: "Gift Buyer",
    summary:
      "Budget-based gifting with taste profiles. Provide options and wrap/deliver.",
    expanded: `
<p><strong>Process:</strong> Collect preferences, propose 3 options per budget tier, handle purchase and wrap.</p>
`,
    recommendedGear: ["Wrapping kit", "Card stock"],
    requirements: ["Background check"],
    badges: ["Safety Verified"],
  },
  {
    key: "transportation",
    label: "Transportation & Errands",
    summary:
      "Non-medical transport & airport runs. Valid license/insurance required.",
    expanded: `
<p><strong>Compliance:</strong> Valid driver license, insurance, and vehicle standards. Clarify wait times and tolls.</p>
`,
    recommendedGear: ["Phone mount", "Car safety kit"],
    requirements: ["Background check", "Driver license + insurance"],
    badges: ["Business Ready", "Safety Verified"],
  },
  {
    key: "senior-checkin",
    label: "Light Senior Care Check-Ins",
    summary:
      "Non-medical check-ins: meals, conversation, reminders. Background check required.",
    expanded: `
<p><strong>Scope:</strong> Companionship, light chores, wellness reminders (non-medical). Emergency contacts on file.</p>
`,
    recommendedGear: ["ID badge", "Notebook/app for notes"],
    requirements: ["Background check"],
    badges: ["Safety Verified"],
  },
];
