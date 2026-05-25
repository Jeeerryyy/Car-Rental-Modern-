import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  await mongoose.connect(MONGO_URI, { dbName: 'test' });
  console.log('Connected to DB (test)');

  const Booking = mongoose.connection.collection('bookings');

  // IDs to DELETE (9 bookings the user wants removed)
  const idsToDelete = [
    '6a01d7fb8a3d06f7709fd122', // Kushal / Kia Sonet / completed / pending / ₹2000
    '6a01e4278071e1b03d9d1366', // Kushal / Burgman / completed / pending / ₹500
    '6a01f0e78071e1b03d9d1405', // Kushal / Burgman / pending / pending / ₹500
    '6a01f31c8071e1b03d9d1548', // Kushal / Thar / completed / paid / ₹3000
    '6a0612ccc5da9195a650e7f7', // Parth / TVS Raider / confirmed / paid / ₹700
    '6a0616b757d973ed494325e0', // Parth / Pulsar 125 / completed / paid / ₹1400
    '6a06d2741b7d3c0bcf6dd516', // Kushal / Burgman / confirmed / pay_at_car / ₹1000
    '6a06da6a79fa8875f579b01b', // N/A Customer / Burgman / completed / pay_at_car / ₹500
    '6a06f82279fa8875f579b642', // N/A Customer / Ertiga / confirmed / pay_at_car / ₹2200
  ];

  // Delete the bookings
  const objectIds = idsToDelete.map(id => new mongoose.Types.ObjectId(id));
  const deleteResult = await Booking.deleteMany({ _id: { $in: objectIds } });
  console.log(`\nDeleted ${deleteResult.deletedCount} bookings`);

  // Verify: Divyesh's booking should already be 'active'
  const divyeshBooking = await Booking.findOne({ _id: new mongoose.Types.ObjectId('6a0701f1142be6eff5d26e64') });
  console.log(`\nDivyesh's booking status: ${divyeshBooking?.status}`);
  if (divyeshBooking && divyeshBooking.status !== 'active') {
    await Booking.updateOne(
      { _id: new mongoose.Types.ObjectId('6a0701f1142be6eff5d26e64') },
      { $set: { status: 'active' } }
    );
    console.log('  -> Updated to active');
  } else {
    console.log('  -> Already active, no change needed');
  }

  // Show remaining bookings
  const remaining = await Booking.find({}).toArray();
  console.log(`\n=== REMAINING BOOKINGS (${remaining.length}) ===`);
  for (const b of remaining) {
    console.log(`  ${b._id} | Status: ${b.status} | Payment: ${b.paymentStatus} | Price: ₹${b.totalPrice}`);
  }

  await mongoose.disconnect();
  console.log('\nDone!');
}

run().catch(err => { console.error(err); process.exit(1); });
