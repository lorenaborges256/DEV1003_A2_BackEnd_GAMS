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

    await User.create({
      name: 'Admin',
      email: 'admin@gams.com',
      password: 'password123',
      role: 'admin',
    });

    const user = await User.create({
      name: 'User',
      email: 'user@gams.com',
      password: 'password123',
      role: 'user',
    });

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

    await Promise.all([
      Reservation.create({
        user: user._id,
        item: potion._id,
      }),
      ContractAcceptance.create({
        user: user._id,
        contract: dragonQuest._id,
        instructions: 'Head to the northern caves and find the lair.',
      }),
      Watchlist.create({
        user: user._id,
        targetId: sword._id,
        targetType: 'Item',
      }),
      Notification.create({
        user: user._id,
        targetId: dragonQuest._id,
        targetType: 'Contract',
        message: 'You have been assigned to: Slay the Dragon',
        status: 'unread',
      }),
    ]);

    console.log('Seeding completed successfully for all 7 models!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
