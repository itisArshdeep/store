import connectDB from './mongodb';
import Product from '../models/Product';

export const seedProducts = async () => {
  try {
    await connectDB();
    
    // Check if products already exist
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      console.log('Products already exist, skipping seed');
      return;
    }

    const sampleProducts = [
      {
        name: 'Samosa',
        description: 'Crispy fried pastry filled with spiced potatoes and aromatic herbs.',
        basePrice: 15,
        hasWeightPricing: false,
        category: 'snacks',
        isBestseller: false,
        available: true,
        rating: { stars: 4.5, count: 127 }
      },
      {
        name: 'Jalebi',
        description: 'Sweet, crispy spirals soaked in sugar syrup with a hint of saffron.',
        basePrice: 20,
        hasWeightPricing: false,
        category: 'sweets',
        isBestseller: false,
        available: true,
        rating: { stars: 4.3, count: 89 }
      },
      {
        name: 'Pakode Mix',
        description: 'Mixed vegetable fritters - onion, potato, and more with authentic spices.',
        basePrice: 400,
        hasWeightPricing: true,
        category: 'pakoda',
        isBestseller: true,
        available: true,
        rating: { stars: 4.6, count: 203 }
      },
      {
        name: 'Paneer Pakoda',
        description: 'Fresh cottage cheese fritters with aromatic spices and herbs.',
        basePrice: 600,
        hasWeightPricing: true,
        category: 'pakoda',
        isBestseller: false,
        available: true,
        rating: { stars: 4.7, count: 156 }
      },
      {
        name: 'Fresh Paneer',
        description: 'Fresh homemade cottage cheese made with pure milk.',
        basePrice: 400,
        hasWeightPricing: true,
        category: 'paneer',
        isBestseller: false,
        available: true,
        rating: { stars: 4.4, count: 98 }
      }
    ];

    await Product.insertMany(sampleProducts);
    console.log('Sample products seeded successfully!');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
};
