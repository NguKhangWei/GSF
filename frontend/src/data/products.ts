export type ProductCategory =
  | 'Driver & Wood'
  | 'Iron / Wedge'
  | 'Putter'
  | 'Grip'
  | 'Shaft'
  | 'Accessories & Apparel'
  | 'Pre-Owned'

/** A concrete purchasable variant, needed to add a line item to the Medusa cart. */
export interface ProductVariant {
  id: string
  title?: string
  sku?: string
  /** Option title -> value, e.g. { Loft: "10.5°", Flex: "S" }. */
  options: Record<string, string>
}

export interface Product {
  id: string
  handle?: string
  name: string
  brand: string
  category: ProductCategory
  price: number
  description: string
  specs: string[]
  image: string
  sourceUrl?: string
  variants?: ProductVariant[]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const img = (w: number, h: number, _bg: string, _fg: string) =>
  `https://placehold.co/${w}x${h}/18181B/B8923A?text=+`

export const products: Product[] = [
  // Driver & Wood
  {
    id: 'epon-af-705',
    name: 'AF-705 Driver',
    brand: 'EPON',
    category: 'Driver & Wood',
    price: 1890,
    description: 'The EPON AF-705 is engineered for golfers demanding maximum distance with uncompromising feel. Precision-milled titanium face delivers explosive ball speed across the entire face.',
    specs: ['Loft: 9.5° / 10.5°', 'Face: Titanium', 'Head: 460cc', 'Custom shaft fitting available'],
    image: img(480, 480, '1A3B28', '2C5A3C'),
  },
  {
    id: 'baldo-competizione-568',
    name: 'Competizione 568 Driver',
    brand: 'Baldo',
    category: 'Driver & Wood',
    price: 2150,
    description: 'Italian craftsmanship meets cutting-edge aerodynamics. The Baldo Competizione 568 is a tournament-grade driver with an adjustable hosel system for dialling in ball flight.',
    specs: ['Loft: 8°–12° adjustable', 'Face: Maraging steel insert', 'Head: 455cc', 'Italian-made'],
    image: img(480, 480, '0C2215', '1A3B28'),
  },
  {
    id: 'ping-g430-max',
    name: 'G430 MAX Driver',
    brand: 'PING',
    category: 'Driver & Wood',
    price: 1650,
    description: 'PING\'s most forgiving driver. Movable tungsten weighting and a PING-exclusive CARBONFLY WRAP technology crown combine for maximum forgiveness.',
    specs: ['Loft: 9° / 10.5°', 'Movable tungsten weight', 'Carbon crown', 'LST & SFT variants'],
    image: img(480, 480, '2C5A3C', '4A7A5A'),
  },

  // Iron / Wedge
  {
    id: 'baldo-corsa-cb',
    name: 'Corsa CB Iron Set',
    brand: 'Baldo',
    category: 'Iron / Wedge',
    price: 3200,
    description: 'Tour-preferred cavity back irons forged from soft 1025 carbon steel. The Baldo Corsa CB delivers a piercing trajectory and exceptional workability for the discerning golfer.',
    specs: ['Forged 1025 carbon steel', 'Set: 4–PW', 'Cavity back design', 'Custom shaft options'],
    image: img(480, 480, '1A3B28', '0C2215'),
  },
  {
    id: 'epon-af-503',
    name: 'AF-503 Iron Set',
    brand: 'EPON',
    category: 'Iron / Wedge',
    price: 2980,
    description: 'A seamless blend of forgiveness and control. The EPON AF-503 features a hollow blade construction with a tungsten insert for optimal CG placement.',
    specs: ['Hollow blade construction', 'Tungsten insert', 'Set: 4–W', 'High-spin design'],
    image: img(480, 480, '0C2215', '2C5A3C'),
  },
  {
    id: 'kuro-kage-iron',
    name: 'Kage Iron Set',
    brand: 'Kuro',
    category: 'Iron / Wedge',
    price: 2750,
    description: 'Kuro\'s flagship iron set, developed in collaboration with tour professionals. Ultra-soft forging process creates exceptional feel and feedback.',
    specs: ['Soft forged steel', 'Set: 5–GW', 'Muscle back / CB variants', 'Tour-proven design'],
    image: img(480, 480, '2C5A3C', '1A3B28'),
  },
  {
    id: 'ping-i230-iron',
    name: 'i230 Iron Set',
    brand: 'PING',
    category: 'Iron / Wedge',
    price: 1980,
    description: 'PING i230 offers the ultimate in precision and consistency. Compact, tour-inspired head shape with a thinner topline for players seeking total shot control.',
    specs: ['Custom-tuned face', 'Set: 3–UW', 'Hydropearl chrome finish', 'AWT 2.0 shaft standard'],
    image: img(480, 480, '1A3B28', '4A7A5A'),
  },

  // Putter
  {
    id: 'epon-af-putter-1',
    name: 'AF Blade Putter',
    brand: 'EPON',
    category: 'Putter',
    price: 980,
    description: 'Precision-milled from a single block of carbon steel. The EPON AF blade putter delivers an unmatched pure roll with tour-standard head weight.',
    specs: ['CNC milled face', 'Carbon steel body', 'Length: 33–35"', 'Custom finish options'],
    image: img(480, 480, '0C2215', '1A3B28'),
  },
  {
    id: 'baldo-putter-spider',
    name: 'Spider Mallet Putter',
    brand: 'Baldo',
    category: 'Putter',
    price: 1120,
    description: 'High-MOI mallet design for superior stability at impact. Baldo\'s proprietary face insert creates a soft, consistent roll from any distance.',
    specs: ['High-MOI mallet', 'Face insert technology', 'Alignment aids', 'Adjustable hosel'],
    image: img(480, 480, '1A3B28', '0C2215'),
  },
  {
    id: 'ping-anser-putter',
    name: 'Anser 2 Putter',
    brand: 'PING',
    category: 'Putter',
    price: 890,
    description: 'The iconic Anser 2 — the world\'s most copied putter design. PING\'s precision-milled stainless steel delivers the same feel trusted by champions for decades.',
    specs: ['303 stainless steel', 'Classic blade design', 'Custom fitting available', 'Multiple sole options'],
    image: img(480, 480, '2C5A3C', '0C2215'),
  },

  // Grip
  {
    id: 'kuro-pro-grip',
    name: 'Pro Tour Grip',
    brand: 'Kuro',
    category: 'Grip',
    price: 45,
    description: 'All-weather tour performance grip. Kuro\'s micro-texture rubber compound provides exceptional tackiness in both dry and wet conditions.',
    specs: ['Multi-compound rubber', 'Mid-size / Standard', 'All-weather performance', 'Tour preferred weight'],
    image: img(480, 480, '1A3B28', '2C5A3C'),
  },
  {
    id: 'golf-pride-tour-velvet',
    name: 'Tour Velvet 360',
    brand: 'Golf Pride',
    category: 'Grip',
    price: 38,
    description: 'The world\'s best-selling golf grip. Golf Pride Tour Velvet 360 features all-around brushed cotton cord for consistent feel regardless of hand position.',
    specs: ['Brushed cotton cord', 'All-round texture', 'Standard / Midsize / Jumbo', '60R / 58R compound'],
    image: img(480, 480, '0C2215', '4A7A5A'),
  },
  {
    id: 'superstroke-traxion',
    name: 'Traxion Pistol GT',
    brand: 'SuperStroke',
    category: 'Grip',
    price: 55,
    description: 'SuperStroke\'s Traxion Pistol GT combines a classic pistol shape with a unique Traction Control texture for the ultimate putting grip.',
    specs: ['Traction Control texture', 'Pistol profile', 'SuperStroke Slim 2.0 core', 'Counter-core compatible'],
    image: img(480, 480, '2C5A3C', '1A3B28'),
  },
  {
    id: 'lamkin-crossline',
    name: 'Crossline 360',
    brand: 'Lamkin',
    category: 'Grip',
    price: 42,
    description: 'Lamkin\'s most popular grip for 40+ years. The Crossline\'s distinctive cord pattern provides reliable traction and feedback on every shot.',
    specs: ['Cord pattern texture', 'Pistol + round profile', 'Available in 6 sizes', 'Tour-tested durability'],
    image: img(480, 480, '0C2215', '2C5A3C'),
  },

  // Shafts
  {
    id: 'kaen-shaft',
    name: 'KAEN Prototype Shaft',
    brand: 'KAEN',
    category: 'Shaft',
    price: 680,
    description: 'KAEN Prototype shafts are engineered for the elite golfer. Japanese nano-resin carbon fiber construction delivers a low-torque, high-launch profile.',
    specs: ['Japanese carbon fiber', 'Flex: S / X / TX', 'Low torque design', 'Tour-proven'],
    image: img(480, 480, '1A3B28', '0C2215'),
  },
  {
    id: 'oban-devotion',
    name: 'Devotion Series',
    brand: 'OBAN Golf',
    category: 'Shaft',
    price: 720,
    description: 'OBAN\'s Devotion series is crafted with an 11-layer carbon fiber construction, producing a stable tip section and mid-launch characteristics suited to aggressive swingers.',
    specs: ['11-layer carbon fiber', 'Flex: R / S / X', 'Mid-launch / Mid-spin', 'GSF authorized dealer'],
    image: img(480, 480, '0C2215', '1A3B28'),
  },
  {
    id: 'fujikura-ventus',
    name: 'Ventus Blue 6',
    brand: 'Fujikura',
    category: 'Shaft',
    price: 590,
    description: 'The Ventus Blue is Fujikura\'s benchmark performance shaft. VeloCore technology reinforces the shaft tip 360° for consistent energy transfer and a mid-launch trajectory.',
    specs: ['VeloCore technology', 'Flex: R / S / X', 'Mid-launch / Mid-spin', 'Tour-proven stability'],
    image: img(480, 480, '2C5A3C', '0C2215'),
  },
  {
    id: 'mitsubishi-tensei',
    name: 'Tensei AV Raw White',
    brand: 'Mitsubishi Chemical',
    category: 'Shaft',
    price: 640,
    description: 'Mitsubishi\'s Tensei AV Raw White utilizes an ultra-high modulus carbon fiber wrap for a penetrating ball flight and tour-level stability.',
    specs: ['Ultra-high modulus carbon', 'Flex: S / X', 'Low launch / Low spin', 'Tour-preferred profile'],
    image: img(480, 480, '1A3B28', '2C5A3C'),
  },
  {
    id: 'nippon-modus3',
    name: 'Modus3 Tour 120',
    brand: 'Nippon',
    category: 'Shaft',
    price: 320,
    description: 'Nippon\'s Modus3 Tour 120 is the iron shaft of choice for tour professionals worldwide. Precision steel construction delivers tour-level consistency and feel.',
    specs: ['High-strength steel', 'Weight: 120g', 'Flex: S / X / TX', 'Low torque iron shaft'],
    image: img(480, 480, '0C2215', '4A7A5A'),
  },
  {
    id: 'true-temper-dg',
    name: 'Dynamic Gold Tour Issue',
    brand: 'True Temper',
    category: 'Shaft',
    price: 290,
    description: 'The original tour iron shaft. True Temper\'s Dynamic Gold Tour Issue is hand-selected and serialized for the most demanding players in the world.',
    specs: ['Tour-grade steel', 'Weight: 130g (X100)', 'Flex: S300 / X100', 'Hand-selected blanks'],
    image: img(480, 480, '2C5A3C', '1A3B28'),
  },

  // Accessories & Apparel
  {
    id: 'dw-polo',
    name: 'Performance Polo',
    brand: 'DW',
    category: 'Accessories & Apparel',
    price: 185,
    description: 'DW Performance Polo engineered for the modern golfer. Moisture-wicking stretch fabric with UV50+ protection ensures comfort from the first tee to the 18th hole.',
    specs: ['Moisture-wicking fabric', 'UV50+ protection', 'Available: S / M / L / XL', 'Machine washable'],
    image: img(480, 480, '1A3B28', '4A7A5A'),
  },
  {
    id: 'kuro-tour-jacket',
    name: 'Tour Performance Jacket',
    brand: 'KURO Tour Performance',
    category: 'Accessories & Apparel',
    price: 380,
    description: 'KURO Tour Performance Jacket — built for the range and the course. Wind-resistant outer shell with a stretch fleece lining provides warmth without restricting swing movement.',
    specs: ['Wind-resistant shell', 'Stretch fleece lining', 'Water-repellent finish', 'Available: S–XXL'],
    image: img(480, 480, '0C2215', '2C5A3C'),
  },

  // Pre-Owned
  {
    id: 'preowned-callaway-driver',
    name: 'Pre-Owned Driver Bundle',
    brand: 'Various',
    category: 'Pre-Owned',
    price: 480,
    description: 'GSF-certified pre-owned drivers professionally cleaned, inspected, and re-gripped. Each club comes with a condition report and 30-day satisfaction guarantee.',
    specs: ['GSF-certified condition', 'Re-gripped with new grip', '30-day guarantee', 'Contact us for current stock'],
    image: img(480, 480, '1A3B28', '0C2215'),
  },
  {
    id: 'preowned-iron-set',
    name: 'Pre-Owned Iron Set',
    brand: 'Various',
    category: 'Pre-Owned',
    price: 750,
    description: 'Professionally refurbished iron sets sourced from our fitting studio trade-ins. All sets are re-shafted or re-gripped as needed and verified by our master club builder.',
    specs: ['Studio trade-ins', 'Professionally refurbished', 'Master builder verified', 'Contact for current stock'],
    image: img(480, 480, '0C2215', '1A3B28'),
  },
]

export const categories: ProductCategory[] = [
  'Driver & Wood',
  'Iron / Wedge',
  'Putter',
  'Grip',
  'Shaft',
  'Accessories & Apparel',
  'Pre-Owned',
]
