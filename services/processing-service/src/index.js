require('dotenv').config();
const { connectMongo } = require('./db/mongo');
const { startConsumer } = require('./kafka/consumer');

(async () => {
  console.log('[processing-service] Starting...');
  await connectMongo();
  await startConsumer();
  console.log('[processing-service] Running');
})();