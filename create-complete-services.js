const fs = require('fs');

const existing = JSON.parse(fs.readFileSync('server/content/serviceInfo.json', 'utf8'));

const categoryMap = {
  'lawncare': 'Outdoor & Yard Care',
  'lawn-care-service': 'Outdoor & Yard Care',
  'backyard-movie-setup': 'Outdoor & Yard Care',
  'plant-garden-maintenance': 'Outdoor & Yard Care',
  'storm-prep-cleanup': 'Outdoor & Yard Care',
  'tool-share-setup': 'Outdoor & Yard Care',
  'trash-can-sanitation': 'Outdoor & Yard Care',
  'meal-prep': 'Food & Hospitality',
  'laundry-fold': 'Cleaning & Detailing',
  'childcare': 'Family & Child Services',
  'handyman': 'Home & Living',
  'appliance-detailing': 'Home & Living',
  'appliance-installer-basic': 'Home & Living',
  'closet-detox-donation': 'Home & Living',
  'closet-system-installer': 'Home & Living',
  'compost-recycling-collector': 'Home & Living',
  'declutter-coach': 'Home & Living',
  'declutter-sale-host': 'Home & Living',
  'doorstep-laundry-pickup': 'Home & Living',
  'filter-battery-changer': 'Home & Living',
  'massage': 'Personal Growth & Lifestyle',
  'personal-trainer': 'Personal Growth & Lifestyle',
  'personal-shopper': 'Errands & Transportation',
  'donation-dropoff-concierge': 'Errands & Transportation',
  'driveway-snow-shoveling': 'Errands & Transportation',
  'errand-cluster-runs': 'Errands & Transportation',
  'errand-scheduler-virtual': 'Errands & Transportation',
  'grocery-line-waiter': 'Errands & Transportation',
  'neighborhood-errand-runner': 'Errands & Transportation',
  'mobile-oil-change': 'Errands & Transportation',
  'prescription-pickup-buddy': 'Errands & Transportation',
  'ride-along-companion': 'Errands & Transportation',
  'transportation-errands-general': 'Errands & Transportation',
  'transportation': 'Errands & Transportation',
  'maid-service': 'Cleaning & Detailing',
  'event-planner': 'Creative, Media & Event Services',
  'birthday-surprise-delivery': 'Creative, Media & Event Services',
  'costume-prop-maker': 'Creative, Media & Event Services',
  'custom-gift-basket-creator': 'Creative, Media & Event Services',
  'memorial-gravesite-care': 'Creative, Media & Event Services',
  'personal-videographer': 'Creative, Media & Event Services',
  'popup-party-host': 'Creative, Media & Event Services',
  'proposal-surprise-planner': 'Creative, Media & Event Services',
  'social-media-moments': 'Creative, Media & Event Services',
  'gift-buyer': 'Errands & Transportation',
  'senior-checkin': 'Senior & Care Companion',
  'dog-walking-sitting': 'Pet Services',
  'dog-yard-cleanup': 'Pet Services',
  'pet-hair-cleanup': 'Pet Services',
  'pet-taxi-dropin': 'Pet Services',
  'artist-painter-portraits': 'Art, Design & Custom Creations',
  'custom-clothing-designer': 'Art, Design & Custom Creations',
  'furniture-maker-refinisher': 'Art, Design & Custom Creations',
  'home-decor-design-giger': 'Art, Design & Custom Creations',
  'upcycled-art-reclaimed': 'Art, Design & Custom Creations'
};

const categorized = existing.services.map(service => ({
  ...service,
  category: service.category || categoryMap[service.key] || 'Home & Living'
}));

const newHomeServices = [
  {
    key: "furniture-mover",
    label: "Furniture Mover (Local/In-Home)",
    category: "Home & Living",
    summary: "Move heavy furniture within homes or between nearby locations. Rearrange rooms, deliver purchases, help with staging, or relocate items to storage without the cost of full moving companies.",
    expanded: "<p><strong>How It Works:</strong> Provide affordable furniture moving services for single items or room rearrangements without full-service moving company overhead. Services include rearranging furniture within homes, moving furniture between rooms or floors, delivering purchased items from stores to homes, moving furniture in/out of storage units, helping with home staging for real estate sales.</p><p><strong>Tools & Startup Gear:</strong> Moving equipment (furniture dolly, furniture sliders, moving straps), protection supplies (furniture blankets, floor runners, corner guards), tools for disassembly, safety gear (work gloves, steel-toe boots), vehicle (pickup truck or cargo van).</p><p><strong>Certifications & Requirements:</strong> Background check required. Business license required. General liability insurance essential. Understand proper lifting techniques. Never move items over 300-400 lbs without professional equipment.</p><p><strong>Safety & Best Practices:</strong> Always lift with legs, not back. Use furniture sliders on all heavy items. Protect flooring with runners. Measure furniture and doorways before attempting move. Work with partner for heavy items.</p><p><strong>Pricing Model:</strong> Hourly rates $50-$100/hour (2-hour minimum). Per-item pricing $50-$200 depending on size. Stair surcharge $25-$75 per flight. Emergency/same-day service at 1.5x rates.</p><p><strong>Upsell & Business Growth:</strong> Partner with furniture stores for delivery. Expand to junk removal. Offer packing services. Create home staging packages. Hire crews and scale operations.</p><p><strong>Get Gigified Badge:</strong> Earn the <em>Furniture Pro</em> badge after completing 150 furniture moves with zero property damage claims and 95% client satisfaction.</p>",
    recommendedGear: ["Furniture dolly", "Furniture sliders", "Moving straps", "Hand truck", "Furniture blankets", "Floor runners", "Work gloves", "Steel-toe boots"],
    requirements: ["Background check", "Business license", "General liability insurance", "Proper lifting technique knowledge"],
    badges: ["Furniture Pro", "Safety Verified"]
  }
];

const allServices = [...categorized, ...newHomeServices];

const finalData = { services: allServices };

fs.writeFileSync('gigifypro-services-draft.json', JSON.stringify(finalData, null, 2));
console.log('Created gigifypro-services-draft.json with', allServices.length, 'services');
console.log('Ready for download!');
