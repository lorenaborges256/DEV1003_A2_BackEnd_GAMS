/* eslint-disable no-console */
const mongoose = require('mongoose');
require('dotenv').config();

// Import All 7 Models
const User = require('./models/User');
const Item = require('./models/Item');
const Contract = require('./models/Contract');
const Notification = require('./models/Notification');
const Reservation = require('./models/Reservation');
const ContractAcceptance = require('./models/ContractAcceptance');
const Watchlist = require('./models/Watchlist');

const models = [User, Item, Contract, Notification, Reservation, ContractAcceptance, Watchlist];

const clearDatabase = async () => Promise.all(models.map((model) => model.deleteMany({})));

const seedData = async () => {
  try {
    const connString = process.env.MONGODB_URI || process.env.DATABASE_URI;
    await mongoose.connect(connString);
    console.log('Connected to MongoDB...');

    await clearDatabase();
    console.log('Database cleared.');

    // 1. CREATE USERS
    await User.create({
      name: 'Admin',
      email: 'admin@gams.com',
      password: 'password123',
      role: 'admin',
    });

    const genericUser = await User.create({
      name: 'User',
      email: 'user@gams.com',
      password: 'password123',
      role: 'user',
    });

    // Create Laura for testing the new dashboard logic
    const lauraUser = await User.create({
      name: 'Laura',
      email: 'laura@email.com',
      password: 'password123',
      role: 'user',
    });

    // 2. CREATE ITEMS
    const sword = await Item.create({
      name: 'Excalibur',
      description: 'Legendary sword',
      category: 'Weapon',
      price: 1000,
      stockQuantity: 1,
    });

    const potion = await Item.create({
      name: 'Mana Potion',
      description: 'Restores mana',
      category: 'Consumable',
      price: 50,
      stockQuantity: 100,
    });

    // Specific items for Laura's dashboard
    const lauraItems = await Item.insertMany([
      { 
        name: 'Item Name 1', 
        category: 'Category', 
        price: 50, 
        stockQuantity: 10,
        description: 'A basic item for testing Laura\'s dashboard.' // Added description
      },
      { 
        name: 'Item Name 2', 
        category: 'Category', 
        price: 80, 
        stockQuantity: 10,
        description: 'A medium-tier item for testing Laura\'s dashboard.' // Added description
      },
      { 
        name: 'Item Name 3', 
        category: 'Category', 
        price: 100, 
        stockQuantity: 10,
        description: 'A high-tier item for testing Laura\'s dashboard.' // Added description
      }
    ]);

    // 3. CREATE CONTRACTS
    const dragonQuest = await Contract.create({
      title: 'Slay the Dragon',
      description: 'Dangerous mission',
      type: 'Bounty',
      difficulty: 'Hard',
      rewardDescription: '10,000 Gold',
      rewardAmount: 10000,
      maxAcceptances: 1,
      startAt: new Date(),
      endAt: new Date(Date.now() + 86400000 * 7),
    });

    // Specific contracts for Laura's dashboard
    const lauraContracts = await Contract.insertMany([
     { 
        title: 'Contract Title 1', 
        description: 'First test contract for Laura\'s dashboard.',
        type: 'Bounty', 
        difficulty: 'Easy', 
        rewardDescription: '200 Gold pieces',
        rewardAmount: 200, 
        maxAcceptances: 5,
        startAt: new Date(),
        endAt: new Date('2026-03-20')
      },
      { 
        title: 'Contract Title 2', 
        description: 'Second test contract for Laura\'s dashboard.',
        type: 'Gathering', 
        difficulty: 'Medium', 
        rewardDescription: '500 Gold pieces',
        rewardAmount: 500, 
        maxAcceptances: 5,
        startAt: new Date(),
        endAt: new Date('2026-03-25')
      }
    ]);

    // 4. CREATE RELATIONAL DATA
    await Promise.all([
      // Generic User Data
      Reservation.create({ user: genericUser._id, item: potion._id }),
      ContractAcceptance.create({
        user: genericUser._id,
        contract: dragonQuest._id,
        instructions: 'Head to the northern caves and find the lair.',
      }),
      Watchlist.create({ user: genericUser._id, targetId: sword._id, targetType: 'Item' }),
      Notification.create({
        user: genericUser._id,
        targetId: dragonQuest._id,
        targetType: 'Contract',
        message: 'You have been assigned to: Slay the Dragon',
        status: 'unread',
      }),

      

      // Laura's Specific Dashboard Data
      Reservation.create({ user: lauraUser._id, item: lauraItems[0]._id }),
      Reservation.create({ user: lauraUser._id, item: lauraItems[1]._id }),
      Reservation.create({ user: lauraUser._id, item: lauraItems[2]._id }),
      ContractAcceptance.create({ 
        user: lauraUser._id, 
        contract: lauraContracts[0]._id,
        instructions: 'Deliver the bounty to the guild master by sunset.' // Added required field
      }),
      ContractAcceptance.create({ 
        user: lauraUser._id, 
        contract: lauraContracts[1]._id,
        instructions: 'Gather the required herbs from the enchanted forest.' // Added required field
      }),
      
    ]);

    console.log('Seeding completed successfully for all users and models!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();