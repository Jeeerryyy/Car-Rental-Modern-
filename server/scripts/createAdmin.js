const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
require('dotenv').config();

const ACCOUNTS = [
  {
    name: 'Modern Selfdrive Admin',
    email: 'admin@modernselfdrivecar.com',
    phone: '+918792492717',
    role: 'admin',
    password: 'ModernSDC@2025!',
  },
  {
    name: 'Junagadh Owner',
    email: 'owner@modernselfdrivecar.com',
    phone: '+918792492717',
    role: 'admin',
    password: 'Journey@Junagadh25',
  },
];

async function createAdmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[admin] connected to MongoDB');

    const User = require('../models/User');

    for (const acct of ACCOUNTS) {
      const hashed = await bcrypt.hash(acct.password, 12);
      await User.findOneAndUpdate(
        { email: acct.email },
        { ...acct, password: hashed },
        { upsert: true, new: true },
      );
      console.log(`[admin] created: ${acct.email} (${acct.role})`);
    }

    console.log('[admin] all accounts ready');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[admin] failed:', err.message);
    process.exit(1);
  }
}

createAdmins();
