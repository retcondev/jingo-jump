export type CategoryCard = {
  title: string;
  image: string;
  href: string;
};

export type EventCard = {
  title: string;
  image: string;
};

export type LookCard = {
  title: string;
  image: string;
  price: string;
  description: string;
};

export type FAQItem = {
  question: string;
  answer: string;
};

export const productTypes: CategoryCard[] = [
  {
    title: "COMMERCIAL UNITS",
    image: "/category-images/res_icon_2021-1.jpg",
    href: "/shop?category=commercial-units",
  },
  {
    title: "LIGHT-COMMERCIAL UNITS",
    image: "/category-images/res_icon_2021-1.jpg",
    href: "/shop?category=light-commercial",
  },
  {
    title: "OPEN BOX PRODUCTS",
    image: "/category-images/open-box.png",
    href: "/shop?category=open-box",
  },
  {
    title: "CLEARANCE SALE",
    image: "/category-images/clearance.png",
    href: "/shop?category=clearance",
  },
  {
    title: "BOUNCERS 13 x 13",
    image: "/category-images/bouncer-13-13.png",
    href: "/shop?category=bouncers-13x13",
  },
  {
    title: "BOUNCERS 15×15",
    image: "/category-images/Bouncer_13-150x150-1-1.jpg",
    href: "/shop?category=bouncers-15x15",
  },
  {
    title: "WATER SLIDES",
    image: "/category-images/water_slide-150x150-2.jpg",
    href: "/shop?category=water-slides",
  },
  {
    title: "COMBO UNITS",
    image: "/category-images/combo-150x150-2.jpg",
    href: "/shop?category=combo-units",
  },
  {
    title: "PACKAGE DEALS",
    image: "/category-images/package_deals-1.jpg",
    href: "/shop?category=package-deals",
  },
  {
    title: "SLIDES & OBSTACLES",
    image: "/category-images/slide_obstacle-150x150-2.jpg",
    href: "/shop?category=obstacle-courses",
  },
  {
    title: "SPORTS & GAMES",
    image: "/category-images/sports_games-150x150-2.jpg",
    href: "/shop?category=interactive-games",
  },
  {
    title: "LIGHT-COMMERCIAL BOUNCERS",
    image: "/category-images/Bouncer_13-150x150-1-1.jpg",
    href: "/shop?category=standard-bouncers",
  },
  {
    title: "MODULAR ART PANELS",
    image: "/category-images/art_panel-2022-150x150-2-1.jpg",
    href: "/shop?category=art-panels",
  },
  {
    title: "ACCESSORIES",
    image: "/category-images/accessories-150x150-2.jpg",
    href: "/shop?category=accessories",
  },
];

export const eventCategories: EventCard[] = [
  {
    title: "Rental Companies",
    image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/d7e8f00910-761692e8ca94cfef4828.png",
  },
  {
    title: "Event Planners",
    image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/a7b25a18ec-24d69a397b1f7c050a22.png",
  },
  {
    title: "Parks & Recreation Departments",
    image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/63a0dd0a82-3932ad57f39eb360be49.png",
  },
  {
    title: "Family Entertainment Centers",
    image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/ca706de37a-64b18c3c15ffb043c2d1.png",
  },
];

export const featuredLooks: LookCard[] = [
  {
    title: "Tropical Thunder Slide",
    image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/fdafbbc948-2fc467a1c86f23e69d96.png",
    price: "$4,299",
    description: "30ft dual lane water slide with splash pool",
  },
  {
    title: "Royal Castle Bouncer",
    image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/f5df884970-b598a387f4df55683c51.png",
    price: "$2,899",
    description: "Large castle bounce house with safety netting",
  },
  {
    title: "Mega Obstacle Challenge",
    image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/0e6f8c0a68-ee94769946f006759a0d.png",
    price: "$5,499",
    description: "40ft obstacle course with multiple challenges",
  },
  {
    title: "Slam Dunk Challenge",
    image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/978f9b29cf-a8148c8649a83400ef0a.png",
    price: "$1,799",
    description: "Interactive basketball shooting game",
  },
];

export const faqs: FAQItem[] = [
  {
    question: "What material are your inflatables made from?",
    answer: "Our inflatables are made from commercial-grade 18oz PVC vinyl material, designed for durability and safety. All materials meet or exceed ASTM safety standards.",
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping takes 7-10 business days. Expedited shipping options are available at checkout. All products ship from our warehouse within 2 business days of order confirmation.",
  },
  {
    question: "Do you offer warranties?",
    answer: "Yes! All JingoJump products come with a 2-year manufacturer warranty covering defects in materials and workmanship. Extended warranty options are available for purchase.",
  },
  {
    question: "What blower is required for setup?",
    answer: "Each product listing includes recommended blower specifications. Most units require a 1.5HP to 2HP commercial blower. Blowers can be purchased separately or as part of a package deal.",
  },
  {
    question: "Can I use these inflatables for commercial rental business?",
    answer: "Absolutely! All our products are commercial-grade and designed for rental business use. We offer bulk discounts for rental companies and provide business support resources.",
  },
];
