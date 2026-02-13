const playAreas = [
  {
    id: 1,
    name: "Krater's Arena",
    location: "Cuttack, CDA Sector 9",
    city: "Cuttack",
    distance: "1.2 km",
    pricePerHour: 1200,
    images: [
      "https://images.unsplash.com/photo-1521412644187-c49fa049e84d",
      "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf",
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018"
    ],
    // Logic: PhysicalID links sports that share the same ground
    sportsManaged: {
      "Cricket": [
        { name: "Main Turf (Pitch A)", physicalID: "COURT_ALPHA" },
        { name: "Practice Net 1", physicalID: "NET_1" }
      ],
      "Football": [
        { name: "Main Turf (Field A)", physicalID: "COURT_ALPHA" } // Shared with Cricket
      ],
      "Pickleball": [
        { name: "Pro Court 1", physicalID: "PB_1" },
        { name: "Pro Court 2", physicalID: "PB_2" }
      ]
    },
    pricingRules: [
      { start: 18, end: 22, rate: 1500 }, // Peak hours (6 PM - 10 PM)
      { start: 6, end: 9, rate: 1000 }    // Morning discount
    ]
  },
  {
    id: 2,
    name: "Green Turf Academy",
    location: "Cuttack, Link Road",
    city: "Cuttack",
    distance: "3.5 km",
    pricePerHour: 1000,
    images: [
      "https://images.unsplash.com/photo-1546519638-68e109498ffc",
      "https://images.unsplash.com/photo-1605296867304-46d5465a13f1"
    ],
    sportsManaged: {
      "Football": [
        { name: "Five-a-side", physicalID: "GT_A" }
      ],
      "Badminton": [
        { name: "Court 1", physicalID: "B_1" },
        { name: "Court 2", physicalID: "B_2" }
      ]
    }
  }
];

export default playAreas;