const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany();
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});


// This code sets up a test database using MongoDB in memory.
// It uses the `mongodb-memory-server` package to create a temporary MongoDB instance for testing purposes.
// The `beforeAll` function initializes the in-memory database and connects Mongoose to it.
// The `afterEach` function clears all collections after each test to ensure a clean state for the next test.
// The `afterAll` function disconnects Mongoose and stops the in-memory MongoDB server after all tests are completed.
// This setup is useful for unit tests and integration tests where you want to avoid using a real database,
// allowing for faster and isolated tests without affecting the production database.
// This setup is useful for unit tests and integration tests where you want to avoid using a real database,