export const DESTINATION_DATA = {
  'gir-national-park': {
    name: 'Gir National Park',
    heroImage: 'https://images.unsplash.com/photo-1581896798020-f421f2bbcb2a?auto=format&fit=crop&w=1200&q=80',
    description: 'The only natural habitat of the world popular Asiatic Lions. Enjoy thrilling wildlife safaris.',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d118949.11762111812!2d70.7206456073801!3d21.164344588506507!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3958ee66d34b22c7%3A0xe54508ecf6d90060!2sGir%20National%20Park!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    places: [
      { name: 'Devalia Safari Park', type: 'Wildlife', desc: 'A fenced area offering a high chance to spot lions in a shorter time.' },
      { name: 'Kamleshwar Dam', type: 'Scenic Point', desc: 'A beautiful dam inside the sanctuary, home to many crocodiles.' },
      { name: 'Tulsi Shyam Springs', type: 'Hot Springs', desc: 'Natural hot water springs with mythological significance.' }
    ],
    hiddenGems: [
      { name: 'Jamjir Waterfall', type: 'Nature', desc: 'A spectacular hidden waterfall surrounded by dense forest, 40km from the park core.' },
      { name: 'Shirvan Village', type: 'Culture', desc: 'A remote settlement offering insights into the Siddi community living in Gujarat.' }
    ],
    itinerary: [
      { day: 'Day 1', title: 'Arrival & Jungle Safari', details: 'Arrive in the morning, check-in to your resort. Take the afternoon open-jeep safari. Evening cultural program at the resort.' },
      { day: 'Day 2', title: 'Devalia & Departure', details: 'Morning visit to Devalia Safari Park. Check-out and head back.' }
    ],
    partners: {
      hotels: [
        { name: 'Gir Jungle Lodge', perk: '15% Off with Modern Selfdrive', rating: 4.5, roomsLeft: 2, price: '₹4,500' },
        { name: 'The Fern Gir Forest Resort', perk: 'Free Safari Assistance', rating: 4.8, roomsLeft: 1, price: '₹8,200' }
      ],
      dining: [
        { name: 'Terracotta Restaurant', cuisine: 'Gujarati Thali', perk: 'Free Welcome Drink', rating: 4.4 },
        { name: 'Lion\'s Den Cafe', cuisine: 'Multi-cuisine', perk: '10% Discount on Bill', rating: 4.1 }
      ]
    }
  },
  'somnath-temple': {
    name: 'Somnath Temple',
    heroImage: 'https://images.unsplash.com/photo-1623864756531-df621a6ab430?auto=format&fit=crop&w=1200&q=80',
    description: 'First among the twelve Aadi Jyotirlings of India. A magnificent temple with beautiful ocean views.',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.326842065538!2d70.39869507567794!3d20.899144880718536!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba32d0c2ee4cd17%3A0xcabfdbd422ec2af8!2sSomnath%20Temple!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    places: [
      { name: 'Bhalka Tirtha', type: 'Pilgrimage', desc: 'The site where Lord Krishna is believed to have been hit by an arrow.' },
      { name: 'Somnath Beach', type: 'Relaxation', desc: 'A serene beach to watch the sunset.' },
      { name: 'Triveni Sangam', type: 'Holy site', desc: 'Confluence of three rivers: Hiran, Kapila, and Saraswati.' }
    ],
    hiddenGems: [
      { name: 'Prabhas Patan Museum', type: 'History', desc: 'Houses remnants of the ancient Somnath temple ruins and ancient stone inscriptions.' },
      { name: 'Bakhalka Caves', type: 'Ancient', desc: 'Lesser-known rock-cut caves offering a quiet retreat from the temple crowds.' }
    ],
    itinerary: [
      { day: 'Day 1', title: 'Temple Visit & Light Show', details: 'Reach by afternoon. Visit the main temple for evening Aarti. Do not miss the spectacular Light and Sound show at 8 PM.' },
      { day: 'Day 2', title: 'Local Sightseeing', details: 'Visit Bhalka Tirtha and Triveni Sangam before departing.' }
    ],
    partners: {
      hotels: [
        { name: 'Lords Inn Somnath', perk: '10% Flat Discount', rating: 4.2, roomsLeft: 4, price: '₹3,200' },
        { name: 'The Fern Residency', perk: 'Complimentary Dinner', rating: 4.4, roomsLeft: 3, price: '₹5,500' }
      ],
      dining: [
        { name: 'Sugar N Spice', cuisine: 'Punjabi & Chinese', perk: 'Free Dessert', rating: 4.3 },
        { name: 'Bhai Bhai Dabeli', cuisine: 'Street Food', perk: 'VIP Service', rating: 4.6 }
      ]
    }
  },
  'diu': {
    name: 'Diu',
    heroImage: 'https://images.unsplash.com/photo-1616428751557-0b16f3900d72?auto=format&fit=crop&w=1200&q=80',
    description: 'A beautiful island offering a blend of Portuguese history and serene beaches.',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d60064.29314995293!2d70.92341995820313!3d20.720231500000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be31ce46da7863f%3A0xc0fb1d60cebc2dd8!2sDiu%2C%20Dadra%20and%20Nagar%20Haveli%20and%20Daman%20and%20Diu!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    places: [
      { name: 'Nagoa Beach', type: 'Beach', desc: 'Popular horseshoe-shaped beach with water sports.' },
      { name: 'Diu Fort', type: 'Historical', desc: 'A magnificent Portuguese fort offering panoramic ocean views.' },
      { name: 'Naida Caves', type: 'Exploration', desc: 'A network of man-made caves with natural sunlight seeping through.' }
    ],
    hiddenGems: [
      { name: 'Ghoghla Beach', type: 'Beach', desc: 'A Blue-Flag certified beach, much cleaner and less crowded than Nagoa.' },
      { name: 'St. Paul\'s Church', type: 'Architecture', desc: 'An exquisite piece of Portuguese baroque architecture.' }
    ],
    itinerary: [
      { day: 'Day 1', title: 'Forts & Sunsets', details: 'Visit Diu Fort in the morning. Explore Naida caves before lunch. Spend the evening relaxing at Jallandhar Beach.' },
      { day: 'Day 2', title: 'Water Sports', details: 'Head to Nagoa beach for parasailing and banana boat rides. Return in the evening.' }
    ],
    partners: {
      hotels: [
        { name: 'Radhika Beach Resort', perk: 'Free Welcome Drinks', rating: 4.6, roomsLeft: 1, price: '₹7,500' },
        { name: 'Kostamar Beach Resort', perk: 'Late Checkout', rating: 4.3, roomsLeft: 5, price: '₹6,000' }
      ],
      dining: [
        { name: 'O\'Coqueiro Music Garden', cuisine: 'Seafood & Goan', perk: '15% Off Total Bill', rating: 4.5 },
        { name: 'Night Heron', cuisine: 'Continental', perk: 'Free Mocktails', rating: 4.2 }
      ]
    }
  }
};
