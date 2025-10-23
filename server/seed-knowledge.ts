import { db } from "./db";
import { knowledgeArticles, badges } from "@shared/schema";
import { eq } from "drizzle-orm";

// Badges configuration
const badgesData = [
  {
    type: "verified_identity",
    name: "Verified Identity",
    description: "Basic ID and background check completed",
    icon: "👤",
    color: "#3b82f6",
    order: 1,
  },
  {
    type: "business_ready",
    name: "Business Ready",
    description: "Business license and insurance uploaded",
    icon: "🪪",
    color: "#10b981",
    order: 2,
  },
  {
    type: "safety_verified",
    name: "Safety Verified",
    description: "Completed safety and compliance training",
    icon: "🔒",
    color: "#f59e0b",
    order: 3,
  },
  {
    type: "ambassador",
    name: "Gigify Ambassador",
    description: "Maintain 4+ star rating and active jobs",
    icon: "⭐",
    color: "#8b5cf6",
    order: 4,
  },
  {
    type: "lawncare_basics",
    name: "Lawncare Basics",
    description: "Certified in professional lawncare techniques",
    icon: "🌿",
    color: "#22c55e",
    order: 5,
  },
  {
    type: "culinary_safety",
    name: "Culinary Safety",
    description: "Food safety and meal prep certification",
    icon: "🍱",
    color: "#ef4444",
    order: 6,
  },
  {
    type: "shopper_pro",
    name: "Shopper Pro",
    description: "Professional personal shopping certification",
    icon: "🛒",
    color: "#06b6d4",
    order: 7,
  },
  {
    type: "handy_essentials",
    name: "Handy Essentials",
    description: "Basic handyman skills and safety certification",
    icon: "🔧",
    color: "#f97316",
    order: 8,
  },
  {
    type: "companion_care",
    name: "Companion Care",
    description: "Senior check-in and companion care certified",
    icon: "❤️",
    color: "#ec4899",
    order: 9,
  },
];

// Knowledge articles by section
const articlesData = [
  // 1️⃣ Getting Started
  {
    slug: "do-i-need-business-license",
    section: "getting_started",
    title: "Do I Need a Business License?",
    summary: "Understanding when and why you need a business license to operate legally",
    content: `# Do I Need a Business License?

The short answer: **it depends on your location and the type of services you offer**.

## When You Need a License

Most states and cities require a business license if you:
- Operate under a business name (not your legal name)
- Earn over a certain threshold (varies by location)
- Provide regulated services (food prep, childcare, construction)
- Work from a commercial location

## When You Might Not Need One

You may not need a license if you:
- Do occasional odd jobs under your own name
- Earn below your city's threshold (often $500-1,000/year)
- Provide unregulated personal services

## How to Find Out

1. Visit your city or county clerk's website
2. Search "business license requirements [your city]"
3. Call your local Small Business Development Center (SBDC)
4. Use the SBA.gov local license lookup tool

## What Happens If You Don't Get One?

Operating without a required license can result in:
- Fines ranging from $50-$1,000+
- Inability to deduct business expenses on taxes
- Difficulty getting business insurance
- Legal liability if something goes wrong

**Bottom line:** Check your local requirements. Most business licenses cost $50-200 and are worth the peace of mind.`,
    icon: "📋",
    readTimeMinutes: 3,
    order: 1,
  },
  {
    slug: "register-llc-sole-proprietorship",
    section: "getting_started",
    title: "How to Register an LLC or Sole Proprietorship",
    summary: "Step-by-step guide to choosing and registering your business structure",
    content: `# How to Register an LLC or Sole Proprietorship

Choosing the right business structure protects you legally and affects your taxes.

## Sole Proprietorship (Simplest Option)

**Pros:**
- Easiest and cheapest to set up
- No separate business taxes
- Complete control

**Cons:**
- You're personally liable for business debts
- Harder to get business credit
- Less credibility with clients

**How to Register:**
1. Choose a business name (can be your legal name)
2. Register a "Doing Business As" (DBA) name if needed
3. Get an EIN from IRS.gov (free)
4. Open a business bank account

**Cost:** $0-100 depending on state

## Limited Liability Company (LLC) (Recommended)

**Pros:**
- Personal assets protected from business liabilities
- More professional image
- Flexible tax options
- Easier to get business credit

**Cons:**
- Costs $50-500 to register depending on state
- Annual fees in some states
- More paperwork required

**How to Register:**
1. Choose a unique business name (check availability)
2. File Articles of Organization with your state
3. Create an Operating Agreement
4. Get an EIN from IRS.gov
5. Open a business bank account

**Cost:** $50-500 setup + possible annual fees

## Which Should You Choose?

- **Start as a Sole Proprietor** if you're testing the waters and doing low-risk work
- **Form an LLC** if you're serious about the business or doing higher-risk work (handyman, meal prep, etc.)

## State-by-State Resources

Most states allow online LLC filing through the Secretary of State website. Search "[Your State] Secretary of State LLC" to find your state's portal.`,
    icon: "🏢",
    readTimeMinutes: 5,
    order: 2,
  },
  {
    slug: "get-ein-for-taxes",
    section: "getting_started",
    title: "How to Get an EIN for Taxes (Free via IRS.gov)",
    summary: "Get your Employer Identification Number in minutes - free and easy",
    content: `# How to Get an EIN for Taxes

An **Employer Identification Number (EIN)** is like a Social Security Number for your business. It's free and takes about 10 minutes to get.

## Why You Need an EIN

- Required to open a business bank account
- Needed to hire employees (even one)
- Keeps your SSN off business documents
- Required for certain business structures (LLC, Corporation)

## Who Needs an EIN?

You **must** have one if you:
- Have employees
- Operate as an LLC or Corporation
- File employment or excise taxes

You **should** get one even if you're a sole proprietor to protect your SSN.

## How to Get Your EIN (100% Free)

### Option 1: Online (Instant - Recommended)
1. Go to IRS.gov/EIN
2. Click "Apply for an EIN Online"
3. Fill out the online form (about 10 questions)
4. Receive your EIN immediately
5. Print and save your confirmation letter

**Time:** 10-15 minutes

### Option 2: By Mail
1. Download Form SS-4 from IRS.gov
2. Mail completed form to the IRS
3. Wait 4-6 weeks for your EIN letter

### Option 3: By Fax
1. Complete Form SS-4
2. Fax to the IRS
3. Receive EIN in 4 business days

## Important Notes

- The EIN is **100% free** - never pay for this service
- You can only apply online Monday-Friday, 7am-10pm ET
- Keep your EIN confirmation letter safe - you'll need it for banks and taxes
- Your EIN never expires, even if you close the business

## What to Do After You Get Your EIN

1. Save the confirmation letter (PDF and paper copy)
2. Use it to open a business bank account
3. Include it on all business tax forms
4. Give it to clients who need it for 1099 forms`,
    icon: "🔢",
    readTimeMinutes: 4,
    order: 3,
  },

  // 2️⃣ Safety & Compliance
  {
    slug: "when-you-need-background-check",
    section: "safety_compliance",
    title: "When You Need a Background Check",
    summary: "Understanding background check requirements for gig workers",
    content: `# When You Need a Background Check and How to Complete It

Background checks build trust with clients and are required for certain types of gig work on GigifyPro.

## When Background Checks Are Required

**Always Required:**
- Working in clients' homes unsupervised
- Providing services to vulnerable populations (seniors, children)
- Handling clients' property or finances
- Food preparation in client homes

**Strongly Recommended:**
- Any service requiring access to private property
- Jobs involving expensive equipment or vehicles

## What's Included in Our Background Check

- Criminal history (7-10 years depending on state law)
- Sex offender registry
- Identity verification
- (Optional) Driving record for delivery/transportation gigs

## How to Complete Your Background Check

1. **During Sign-Up:**
   - You'll be prompted to complete a background check
   - Cost: $25-40 (one-time fee)
   - Processed through our verified partner

2. **Processing Time:**
   - Most results in 24-48 hours
   - May take up to 5 business days if additional verification needed

3. **What Happens Next:**
   - Pass: You receive the "Safety Verified" badge
   - Issues: You'll be contacted to discuss findings

## Understanding Results

**Minor infractions** (traffic tickets, misdemeanors over 7 years old) typically don't disqualify you.

**Serious concerns** (violent crimes, theft, fraud) may prevent approval for certain job types but not all.

## Background Check FAQs

**Q: How often do I need to renew?**
A: Every 2 years for active gig workers.

**Q: Will clients see my full background check?**
A: No. They only see that you're "Safety Verified."

**Q: What if I have something on my record?**
A: Each case is reviewed individually. Minor or old offenses rarely disqualify you.

**Q: Can I dispute the results?**
A: Yes. You have the right to dispute inaccurate information through our background check partner.`,
    icon: "🔍",
    readTimeMinutes: 4,
    order: 1,
  },
  {
    slug: "gigify-safety-policy",
    section: "safety_compliance",
    title: "GigifyPro's Safety Policy & Conduct Standards",
    summary: "Our community standards and safety expectations for all Gigers",
    content: `# GigifyPro's Safety Policy & Conduct Standards

Our platform is built on trust. These standards ensure safety for everyone.

## Core Safety Principles

1. **Respect:** Treat everyone with dignity and professionalism
2. **Honesty:** Accurately represent your skills and availability
3. **Safety First:** Never compromise safety for speed or profit
4. **Communication:** Keep clients informed and respond promptly
5. **Responsibility:** Own your work and make things right if issues arise

## Prohibited Conduct

**Automatic Account Suspension:**
- Harassment, discrimination, or threatening behavior
- Asking clients to pay outside the platform
- Misrepresenting credentials or certifications
- Working under the influence of drugs or alcohol
- Bringing unauthorized people to job sites

**Warning and Potential Suspension:**
- Persistent no-shows or late arrivals without notice
- Pressuring clients for tips or higher ratings
- Entering areas of a home not related to the job
- Taking photos/videos without explicit permission

## Client Home Safety Rules

- Arrive and leave at agreed times
- Park in designated areas only
- Ask before using client facilities (bathroom, water, etc.)
- Clean up work areas completely
- Report any property damage immediately, no matter how small
- Never accept food or drinks from clients (professional boundary)

## Equipment & Work Safety

- Use only properly maintained tools and equipment
- Wear appropriate Personal Protective Equipment (PPE)
- Follow manufacturer instructions for all products and tools
- Don't attempt work you're not qualified or equipped to do
- Stop work immediately if unsafe conditions arise

## Emergency Protocols

**If someone is injured:**
1. Call 911 immediately
2. Provide first aid if trained
3. Contact GigifyPro support
4. Document the incident

**If property is damaged:**
1. Stop work and assess the situation
2. Take photos immediately
3. Inform the client
4. Contact GigifyPro support
5. File an incident report within 24 hours

## Consequences of Violations

- **First minor violation:** Warning and required safety training
- **Second violation:** Temporary suspension (7-30 days)
- **Serious violation:** Permanent ban from platform
- **Illegal activity:** Reported to authorities, permanent ban

We want you to succeed. If you're ever unsure about a safety issue, contact support before proceeding.`,
    icon: "⚠️",
    readTimeMinutes: 5,
    order: 2,
  },

  // 3️⃣ Skill Builder
  {
    slug: "lawncare-basics",
    section: "skill_builder",
    title: "Lawncare Basics: Mowing Patterns, Edging & Safety",
    summary: "Essential lawn care techniques for professional results",
    content: `# Lawncare Basics: Mowing Patterns, Edging & Safety

Professional lawn care is about more than just cutting grass. Master these fundamentals.

## Equipment Essentials

**Must-Have:**
- Push or self-propelled mower (21" minimum)
- String trimmer (gas or battery)
- Edger
- Safety glasses
- Hearing protection
- Closed-toe shoes

**Nice-to-Have:**
- Leaf blower
- Hedge trimmer
- Work gloves

## Mowing Best Practices

### Height Matters
- **Warm season grass** (Bermuda, St. Augustine): 1-2 inches
- **Cool season grass** (Fescue, Bluegrass): 2.5-3.5 inches
- Never remove more than 1/3 of blade height at once

### Mowing Patterns
- **Week 1:** Horizontal stripes
- **Week 2:** Vertical stripes
- **Week 3:** Diagonal stripes
- **Week 4:** Opposite diagonal

Changing patterns prevents soil compaction and ruts.

### When to Mow
- **Best:** Mid-morning when dew has dried
- **Avoid:** Middle of hot days (stresses grass)
- **Never:** When grass is wet (uneven cut, clumping)

## Edging Like a Pro

1. **First pass:** Use edger along all hard surfaces (sidewalks, driveways)
2. **Second pass:** String trimmer along fences, trees, flower beds
3. **Clean up:** Blow clippings back onto lawn (free fertilizer!)

**Pro Tip:** A sharp, clean edge makes lawns look 10x better. This is where the "wow" factor comes from.

## Safety Rules (Non-Negotiable)

1. **Eye protection always** - Rocks and debris fly up
2. **Check for obstacles** before starting - toys, sticks, pet waste
3. **Keep children and pets 50+ feet away** while mowing
4. **Shut off equipment** before unclogging or adjusting
5. **Fuel equipment when cool** - never while hot
6. **Inspect equipment** before each use - loose parts can cause injury

## Common Mistakes to Avoid

- Mowing too short ("scalping") - weakens grass and invites weeds
- Dull blades - tear grass instead of cutting cleanly
- Not blowing off hard surfaces - makes you look unprofessional
- Leaving gates open - always close and latch gates
- Not asking about sprinkler systems - mark heads with flags

## Upselling Opportunities

Once you've proven your skills:
- Fertilization (spring and fall)
- Weed control treatments
- Mulch installation
- Shrub trimming

**Earn the Lawncare Basics badge** by completing this module and the safety quiz.`,
    icon: "🌿",
    readTimeMinutes: 6,
    order: 1,
  },
  {
    slug: "meal-prep-food-safety",
    section: "skill_builder",
    title: "Meal Prep: Food Safety & Client Agreements",
    summary: "Safe food handling and professional meal prep service",
    content: `# Meal Prep: Food Safety & Client Agreements

Meal prep is one of the highest-paying gigs. It's also highly regulated. Here's what you need to know.

## Legal Requirements (By State)

**Most states require:**
- Food Handler's Certificate or ServSafe certification
- Cottage Food License (for home-based prep)
- Liability insurance specific to food preparation

**Check your state requirements:** Search "[Your State] cottage food law" or "[Your State] food handler permit"

## Food Safety Fundamentals

### Temperature is Everything

**Danger Zone:** 40°F - 140°F (bacteria multiply rapidly)

**Safe Temperatures:**
- Refrigerator: 40°F or below
- Freezer: 0°F or below
- Cooking poultry: 165°F
- Cooking ground meats: 160°F
- Cooking whole cuts: 145°F

### The Two-Hour Rule
- Perishable food left out for 2+ hours = throw it away
- In hot weather (90°F+), the limit is 1 hour

### Cross-Contamination Prevention
1. Separate cutting boards for raw meat and produce
2. Wash hands between handling different foods
3. Store raw meat on bottom shelf of fridge (prevents dripping)
4. Clean and sanitize all surfaces after raw meat contact

## Meal Prep Best Practices

### Client Consultation
- Document all allergies and dietary restrictions IN WRITING
- Confirm portions and meal count
- Agree on storage: their fridge or yours?
- Set expectations for shelf life (typically 4-5 days)

### Professional Setup
- Bring your own knives and tools
- Use client's appliances unless agreed otherwise
- Clean as you go - leave kitchen spotless
- Label all containers with date, contents, reheating instructions

### Packaging & Storage
- Use BPA-free, microwave-safe containers
- Portion control: one meal per container
- Separate components if needed (salad dressing, sauce)
- Include reheating/serving instructions on each label

## Liability Protection

**Always:**
- Have clients sign a waiver acknowledging dietary restrictions
- Keep copies of all meal plans and client communications
- Take "before and after" photos of the kitchen
- Carry at least $1M in food liability insurance

**Never:**
- Prepare food in an unlicensed, uninspected kitchen
- Ignore a client's allergy information
- Reuse leftovers from previous clients
- Make medical or nutritional claims unless you're a licensed dietitian

## Pricing Guidelines

**Hourly + Ingredients:**
$25-40/hour prep time + grocery costs + 20% markup

**Per Meal Pricing:**
- Basic meals: $8-12 per serving
- Specialty diets: $12-18 per serving
- Gourmet/complex: $15-25 per serving

Minimum order: 5 meals or $100

## Common Client Requests

- Keto, paleo, vegan, gluten-free
- Bodybuilding/high-protein meals
- Family-friendly dinners
- Senior-friendly soft foods
- Diabetes-friendly meals

**Earn the Culinary Safety badge** by completing a food safety course and uploading your certificate.`,
    icon: "🍱",
    readTimeMinutes: 7,
    order: 2,
  },

  // 4️⃣ Customer Service & Growth
  {
    slug: "building-repeat-clients",
    section: "customer_service",
    title: "Building Repeat Clients Through Trust",
    summary: "Turn one-time gigs into long-term clients and steady income",
    content: `# Building Repeat Clients Through Trust and Follow-Up

Your best clients are the ones you already have. Here's how to keep them coming back.

## The First Impression

**Before the job:**
- Confirm appointment 24 hours in advance
- Arrive 5 minutes early (never late)
- Dress appropriately (clean, professional)
- Bring all promised tools/materials

**During the job:**
- Introduce yourself professionally
- Protect their property (drop cloths, shoe covers)
- Communicate about what you're doing
- Work efficiently but don't rush
- Ask questions rather than guess

**After the job:**
- Show them the completed work
- Clean up completely - leave it better than you found it
- Ask if they're satisfied before you leave
- Provide a simple invoice or receipt

## The Follow-Up Strategy

**24 hours after:** Send a thank-you message
"Hi [Name], thanks for trusting me with your [service]. If you need anything adjusted or have any questions, please let me know!"

**1 week after:** Check-in message
"Hi [Name], just wanted to make sure everything is still working great with [service]. Let me know if you need anything!"

**Based on service type:**
- Lawn care: "Would you like me to put you on a weekly/bi-weekly schedule?"
- Meal prep: "I'm planning next week's menu. Would you like me to include you?"
- Handyman: "I noticed your gutters could use cleaning. Would you like me to take care of that next time?"

## Creating Recurring Revenue

### Weekly/Monthly Contracts
- Lawn care (weekly during growing season)
- House cleaning (bi-weekly or monthly)
- Senior check-ins (weekly)
- Meal prep (weekly)

**Benefits for clients:**
- Guaranteed spot on your schedule
- Slight discount (5-10% off) for commitment
- No rebooking hassle

**Benefits for you:**
- Predictable income
- Efficient routing (group nearby clients)
- Easier scheduling

### Subscription Pricing Example

**Lawn Care:**
- One-time service: $45
- Weekly subscription: $40/week ($160/month)
- Bi-weekly subscription: $42/visit

## Asking for Referrals (The Right Way)

**Bad:** "Do you know anyone who needs help?"
**Good:** "I'm taking on 2-3 new regular clients this month. If you know anyone who could use [service], I'd love to help them out."

**Best time to ask:**
- Right after they compliment your work
- After you've completed a job exceptionally well
- When they renew a recurring contract

**Referral incentive:**
"If you refer someone who books a service, I'll give you $25 off your next visit and they'll get $25 off their first visit."

## Handling Issues Like a Pro

**If something goes wrong:**
1. Don't make excuses
2. Apologize sincerely: "I'm sorry this happened."
3. Fix it immediately if possible
4. If not immediately fixable: "Here's what I'm going to do to make this right..."
5. Follow through no matter what

**Recovery script:**
"I understand this isn't what you expected, and I take full responsibility. I'm going to [specific action] to fix this right away. This won't cost you anything extra, and if you're still not satisfied, I'll refund your payment entirely. Your satisfaction is my priority."

**Pro tip:** Clients who have a problem that you fix quickly often become more loyal than clients who never had an issue at all.

## The Long Game

Don't sell - serve. When you consistently:
- Show up on time
- Do great work
- Communicate well
- Handle problems professionally
- Follow up thoughtfully

...clients will:
- Rebook automatically
- Refer you constantly
- Pay premium rates willingly
- Forgive occasional mistakes

Your reputation is your business. Protect it by treating every client like your only client.

**Earn the Ambassador badge** by maintaining a 4+ star rating and completing 25+ jobs.`,
    icon: "🤝",
    readTimeMinutes: 6,
    order: 1,
  },

  // 5️⃣ Local Law & Licensing
  {
    slug: "local-law-licensing-map",
    section: "local_law",
    title: "Local Law & Licensing Requirements",
    summary: "Understanding location-specific business requirements",
    content: `# Local Law & Licensing Map

Requirements vary dramatically by state, county, and city. Here's how to find YOUR specific requirements.

## By Service Type

### Food Preparation
**Most states require:**
- Food Handler's Certificate ($10-50, online)
- Cottage Food License or Home Food Permit ($50-300/year)
- Kitchen inspection (home-based businesses)

**Search:** "[Your State] cottage food law"
**Resource:** [Your State] Department of Agriculture website

### Lawncare & Landscaping
**Some states/cities require:**
- Business license ($50-200/year)
- Pesticide/herbicide applicator license (if using chemicals)
- Commercial vehicle registration
- Noise ordinance compliance (limits on early/late work)

**Environmental regulations:**
- Proper disposal of grass clippings and yard waste
- Water runoff management
- Protection of storm drains

### Handyman Services
**General requirements:**
- Business license for jobs over $500-1,000
- Contractor's license for jobs over $1,000-5,000 (varies by state)
- Specialty licenses (electrical, plumbing) for licensed trades

**What you CAN do without a license (usually):**
- Minor repairs (fixing doors, drywall patches)
- Assembly and installation
- Painting
- Minor carpentry

**What ALWAYS requires a license:**
- Electrical work beyond changing light fixtures
- Plumbing beyond basic repairs
- HVAC work
- Gas line work
- Structural modifications

### Personal Shopping & Errands
**Generally minimal requirements:**
- Business license in some cities
- Commercial auto insurance if transporting goods frequently
- Bond or insurance if handling client payments

### Senior Care & Companion Services
**Requirements vary but often include:**
- Background check (required by most agencies)
- First Aid/CPR certification (highly recommended)
- State-specific caregiver certification (non-medical)
- Specialized training for dementia/Alzheimer's care

**Not allowed without nursing license:**
- Administering medication
- Medical procedures (injections, wound care, etc.)
- Medical advice or diagnosis

## How to Find Your Local Requirements

### Step 1: City/County Requirements
1. Visit your city or county website
2. Search for "business license" or "business regulations"
3. Look for your specific industry (food service, landscaping, etc.)
4. Note all required permits and fees

### Step 2: State Requirements
1. Visit your Secretary of State website
2. Check Department of Labor for occupational licenses
3. Review state-specific regulations for your industry

### Step 3: Professional Associations
Many industries have associations that outline requirements:
- National Association of Landscape Professionals
- Professional Handyman Association
- National Association of Senior Move Managers

### Step 4: Small Business Development Center (SBDC)
- Free counseling on licensing and legal requirements
- Often hosted at local universities or chambers of commerce
- Search "SBDC [your city]" or visit sba.gov/sbdc

## Cost Overview

**Low barrier services** (errands, pet sitting, basic cleaning):
- Business license: $0-200
- Insurance: $300-600/year
- Total startup: $300-800

**Medium barrier services** (lawn care, handyman):
- Business license: $50-300
- Insurance: $500-1,200/year
- Tools/equipment: $500-2,000
- Total startup: $1,050-3,500

**Higher barrier services** (food prep, specialized trades):
- Licenses/permits: $100-1,000
- Insurance: $800-2,000/year
- Certification/training: $100-500
- Equipment/kitchen: $1,000-5,000
- Total startup: $2,000-8,500

## Common Questions

**Q: What if I can't afford all the licenses right away?**
A: Start with services that require minimal licensing, build your income, then expand into higher-barrier services.

**Q: Can I work while my licenses are "pending"?**
A: Generally no. Wait for approval before accepting jobs that require that license.

**Q: What if I get caught working without a license?**
A: Fines typically range from $500-5,000, plus you may be barred from getting that license in the future.

**Q: Do I need insurance if I have a license?**
A: Usually, yes. Many licenses require proof of insurance to be issued or renewed.`,
    icon: "📍",
    readTimeMinutes: 8,
    order: 1,
  },

  // 6️⃣ Insurance & Financial
  {
    slug: "liability-insurance-overview",
    section: "insurance_financial",
    title: "Liability Insurance for Gig Workers",
    summary: "Protecting yourself and your clients with the right insurance coverage",
    content: `# Liability Coverage Overview (Per Job)

Insurance isn't optional - it's essential. Here's what you need to know.

## Why You Need Insurance

**One accident can destroy your business:**
- Client slips on wet floor you just mopped: $50,000 medical bills
- Lawnmower throws rock through car window: $2,000 repair
- Client has allergic reaction to meal you prepared: $100,000+ lawsuit
- Your car crashes while running errands for client: $30,000 property damage

Without insurance, YOU pay these out of pocket. With insurance, your carrier pays.

## Types of Coverage for Gig Workers

### General Liability Insurance (Most Important)
**What it covers:**
- Bodily injury to clients or third parties
- Property damage caused by your work
- Legal defense costs
- Completed operations (issues discovered after you finish)

**Cost:** $30-80/month for $1M coverage
**Recommended minimum:** $1M per occurrence, $2M aggregate

**Best for:** Almost everyone (lawn care, handyman, house sitting, errands)

### Professional Liability (E&O - Errors & Omissions)
**What it covers:**
- Mistakes in your professional services
- Failure to complete work properly
- Financial losses due to your errors

**Cost:** $40-100/month for $1M coverage
**Best for:** Consultants, organizers, planners

### Product Liability
**What it covers:**
- Illness or injury from food you prepared
- Reactions to cleaning products you used
- Injuries from products you sold or recommended

**Cost:** Usually included in general liability or $25-50/month add-on
**Best for:** Meal prep, catering, product resale

### Commercial Auto Insurance
**What it covers:**
- Accidents while using vehicle for business
- Damage to client property while transporting
- Medical bills from accidents during work trips

**Cost:** $100-200/month (or $50-75/month add-on to personal policy)
**Best for:** Personal shopping, delivery, mobile services

**Important:** Personal auto insurance does NOT cover business use. You must disclose business use or add a commercial rider.

### Workers' Compensation
**What it covers:**
- YOUR medical bills if you're injured on the job
- Lost wages during recovery

**Cost:** $500-1,500/year for sole proprietors (varies by state)
**Required:** Only in some states, but highly recommended

## How Much Coverage Do You Need?

**Minimum recommended:**
- General Liability: $1M per occurrence / $2M aggregate
- Auto (if using vehicle): $500K liability
- Workers' Comp: State minimum (if required)

**Premium recommendation:**
- General Liability: $2M per occurrence / $4M aggregate
- Auto: $1M liability
- Umbrella policy: Additional $1M-2M over all policies

## Where to Get Insurance

### Specialized Gig Worker Insurance
- **Thimble** - Pay-per-job or monthly, starts at $12/job
- **Hiscox** - Small business policies, competitive rates
- **Next Insurance** - Fully online, instant quotes
- **FLIP Insurance** - Designed for gig workers

### Traditional Business Insurance
- State Farm
- Nationwide
- Progressive Commercial
- The Hartford

**Pro tip:** Get 3-5 quotes before buying. Rates vary dramatically for the same coverage.

## Common Mistakes

**Mistake 1:** "I'm careful, so I don't need insurance"
Reality: Accidents happen even to the most careful people. You can't control everything.

**Mistake 2:** "My homeowner's insurance covers business activities"
Reality: It almost never does. You need separate business insurance.

**Mistake 3:** "Insurance is too expensive"
Reality: One uninsured claim will cost more than a decade of insurance premiums.

**Mistake 4:** "I'm an independent contractor, so I'm covered by the client's insurance"
Reality: Client insurance rarely covers contractors. You're responsible for your own coverage.

## Insurance Proof for Clients

Many clients (especially businesses and property managers) require:
- Certificate of Insurance (COI) before hiring you
- Proof of minimum coverage amounts
- You to name them as "additional insured" on your policy

Most insurance companies provide COIs for free and can add additional insureds at no cost.

## Tax Benefits

Insurance premiums are fully tax-deductible as a business expense. If you pay $1,000/year in insurance and you're in the 22% tax bracket, your actual cost is $780.

## Bottom Line

Insurance is:
- Required by many clients
- Needed to get certain business licenses
- Essential for protecting your personal assets
- A tax-deductible business expense
- Cheaper than you think (especially pay-per-job options)

Don't wait until you need it. Get insured BEFORE your first job.`,
    icon: "🛡️",
    readTimeMinutes: 7,
    order: 1,
  },
];

async function seedKnowledge() {
  console.log("🧠 Seeding Knowledge Hub content...");

  // Seed badges
  console.log("\n📛 Seeding badges...");
  for (const badgeData of badgesData) {
    const existing = await db
      .select()
      .from(badges)
      .where(eq(badges.type, badgeData.type as any))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(badges).values(badgeData as any);
      console.log(`  ✓ Created badge: ${badgeData.name}`);
    } else {
      console.log(`  ✓ Badge "${badgeData.name}" already exists`);
    }
  }

  // Seed articles
  console.log("\n📚 Seeding knowledge articles...");
  for (const articleData of articlesData) {
    const existing = await db
      .select()
      .from(knowledgeArticles)
      .where(eq(knowledgeArticles.slug, articleData.slug))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(knowledgeArticles).values(articleData as any);
      console.log(`  ✓ Created article: ${articleData.title}`);
    } else {
      console.log(`  ✓ Article "${articleData.title}" already exists`);
    }
  }

  console.log("\n✅ Knowledge Hub seed complete!");
  console.log(`   ${badgesData.length} badges available`);
  console.log(`   ${articlesData.length} articles published`);
}

seedKnowledge()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Knowledge Hub seeding failed:", error);
    process.exit(1);
  });
