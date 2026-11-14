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

const seedData = async () => {
  try {
    const connString = process.env.MONGODB_URI || process.env.DATABASE_URI;
    await mongoose.connect(connString);
    console.log('Connected to MongoDB...');

    // 1. DROP ALL COLLECTIONS
    const models = [
      User,
      Item,
      Contract,
      Notification,
      Reservation,
      ContractAcceptance,
      Watchlist,
    ];

    await Promise.all(models.map((model) => model.deleteMany({})));

    console.log('Database cleared.');

    // 2. CREATE USERS
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
    const userA = await User.create({
      name: 'User A',
      email: 'usera@gams.com',
      password: 'password123',
      role: 'user',
    });

    // 3. CREATE ITEMS & CONTRACTS
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
    const bow = await Item.create({
      name: 'Shadow Bow',
      description: 'A silent longbow crafted for stealth missions.',
      category: 'Weapon',
      price: 600,
      stockQuantity: 2,
    });

    const amulet = await Item.create({
      name: 'Amulet of Vision',
      description: 'Reveals hidden paths and traps in dark places.',
      category: 'Quest Item',
      price: 300,
      stockQuantity: 0,
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
    const herbsContract = await Contract.create({
      title: 'Gather Sunpetal Herbs',
      description: 'Collect 10 rare Sunpetal herbs from the Whispering Meadows before they wilt.',
      type: 'Gathering',
      difficulty: 'Easy',
      rewardDescription: '250 Gold',
      rewardAmount: 250,
      maxAcceptances: 5,
      startAt: new Date(),
      endAt: new Date(Date.now() + 86400000 * 14),
    });
    const scoutContract = await Contract.create({
      title: 'Scout the Shadow Forest',
      description: 'Survey the perimeter of the Shadow Forest and report any unusual activity to the guild master.',
      type: 'Exploration',
      difficulty: 'Medium',
      rewardDescription: '500 Gold',
      rewardAmount: 500,
      maxAcceptances: 3,
      startAt: new Date(),
      endAt: new Date(Date.now() + 86400000 * 30),
    });

    // 4. CREATE RELATIONAL DATA (Reservations, Acceptances, Watchlists) - User
    await Reservation.create({ user: user._id, item: potion._id });

    await ContractAcceptance.create({
      user: user._id,
      contract: dragonQuest._id,
      instructions: 'Head to the northern caves and find the lair.',
    });

    await Watchlist.create({
      user: user._id,
      targetId: sword._id,
      targetType: 'Item',
    });

    // 5. CREATE NOTIFICATIONS
    await Notification.create({
      user: user._id,
      targetId: dragonQuest._id,
      targetType: 'Contract',
      message: 'You have been assigned to: Slay the Dragon',
      status: 'unread',
    });
    // CREATE RELATIONAL DATA (Reservations, Acceptances, Watchlists) - UserA
    await Reservation.create({ user: userA._id, item: bow._id });

    await ContractAcceptance.create({
      user: userA._id,
      contract: herbsContract._id,
      instructions: 'Deliver the herbs to the guild alchemist by next week.',
    });
    await Watchlist.create({
      user: userA._id,
      targetId: scoutContract._id,
      targetType: 'Contract',
    });
    await Watchlist.create({
      user: userA._id,
      targetId: amulet._id,
      targetType: 'Item',
    });

    await Notification.create({
      user: userA._id,
      targetId: herbsContract._id,
      targetType: 'Contract',
      message: 'You accepted: Gather Sunpetal Herbs',
      status: 'read',
    });

    console.log('Seeding completed successfully for all 7 models!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
