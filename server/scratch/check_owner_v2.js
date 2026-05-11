import mongoose from 'mongoose';
import Owner from '../src/models/Owner.js';
import config from '../src/config/index.js';

const checkOwner = async () => {
  try {
    await mongoose.connect(config.database.uri);
    const owner = await Owner.findOne({ email: 'admin@modernselfdrive.in' });
    console.log('--- OWNER DOCUMENT ---');
    console.log(JSON.stringify(owner, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkOwner();
