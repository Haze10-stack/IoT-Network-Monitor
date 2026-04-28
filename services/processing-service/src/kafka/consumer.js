const { Kafka } = require('kafkajs');
const { Packet }        = require('../db/mongo');
const { processPacket } = require('../anomaly/detector');

const kafka = new Kafka({
  clientId: 'processing-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

const consumer = kafka.consumer({ groupId: 'processing-group' });

async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'raw-packets', fromBeginning: false });

  console.log('[kafka] Consumer subscribed to raw-packets');

  await consumer.run({
    eachMessage: async ({ message }) => {
      let record;
      try {
        record = JSON.parse(message.value.toString());
      } catch {
        console.warn('[kafka] Skipping malformed message');
        return;
      }

      // Persist raw packet
      await Packet.create({
        nodeId:     record.nodeId,
        mac:        record.mac,
        rssi:       record.rssi,
        frameType:  record.type,
        subtype:    record.subtype,
        receivedAt: new Date(record.receivedAt),
      });

      // Run anomaly detection
      await processPacket(record);
    },
  });
}

module.exports = { startConsumer };