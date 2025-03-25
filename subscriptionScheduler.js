const cron = require('node-cron');
const { Op } = require('sequelize');
const connectToDatabase = require('./misc/db');

async function updateSubscriptions() {
  try {
    const { PaymentService } = await connectToDatabase();

    // Get current date
    const currentDate = new Date();

    // Find and update expired subscriptions where is_subscribed is 1
    await PaymentService.update(
      { is_subscribed: 0 },
      {
        where: {
          subscribe_expired_on: {
            [Op.lt]: currentDate, // Less than current date
          },
          is_subscribed: 1, // Only update if currently subscribed
        },
      }
    );

    console.log('Subscriptions updated successfully');
  } catch (error) {
    console.error('Error updating subscriptions:', error);
  }
}

// Schedule the task to run daily at midnight
cron.schedule('0 0 * * *', updateSubscriptions);

module.exports = { updateSubscriptions };
