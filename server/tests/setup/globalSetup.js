/**
 * Global setup — runs ONCE before all test suites.
 * Pre-warms the MongoDB binary and verifies it can start.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';

export default async function globalSetup() {
  console.log('\n🔧 Pre-warming MongoDB binary...');
  const mongod = await MongoMemoryServer.create({
    binary: { version: '7.0.0' },
    instance: { launchTimeout: 120000 },
  });
  console.log(`✅ MongoDB ready at ${mongod.getUri()}`);
  await mongod.stop();
  console.log('✅ Global setup complete\n');
}
