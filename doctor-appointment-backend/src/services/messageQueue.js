const amqp = require('amqplib');

class MessageQueue {
  static connection = null;
  static channel = null;

  static async initialize() {
    this.connection = await amqp.connect(process.env.RABBITMQ_URL);
    this.channel = await this.connection.createChannel();
    
    // Define queues
    await this.channel.assertQueue('notifications');
    await this.channel.assertQueue('appointments');
  }

  static async publishMessage(queue, message) {
    await this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  }

  static async publishWithRetry(queue, message, maxRetries = 3) {
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        await this.publishMessage(queue, message);
        return;
      } catch (error) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
    throw new Error('Failed to publish message after retries');
  }
}

module.exports = MessageQueue;