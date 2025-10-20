const cron = require('node-cron');
const Court = require('../models/Court');
const { generateSlotsForDateRange } = require('../controllers/courtController'); // Assuming this is exported

const scheduleSlotGeneration = () => {
  cron.schedule('0 0 * * * ', async () => { // Run daily at midnight
    console.log('Running daily slot generation task...');
    try {
      const courts = await Court.find({});
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeMonthsLater = new Date();
      threeMonthsLater.setDate(today.getDate() + 90);
      threeMonthsLater.setHours(23, 59, 59, 999);

      for (const court of courts) {
        const existingBookedSlots = court.slots.filter(s => s.isBooked);
        const newOperatingHoursSlots = generateSlotsForDateRange(today, threeMonthsLater, court.operatingHours);

        const combinedSlots = [...existingBookedSlots];
        newOperatingHoursSlots.forEach(newSlot => {
          const exists = combinedSlots.some(existing =>
            new Date(existing.date).setHours(0,0,0,0) === new Date(newSlot.date).setHours(0,0,0,0) &&
            existing.time === newSlot.time
          );
          if (!exists) {
            combinedSlots.push(newSlot);
          }
        });
        court.slots = combinedSlots;
        await court.save();
        console.log(`Updated slots for court: ${court.name} (${court._id})`);
      }
      console.log('Daily slot generation complete.');
    } catch (error) {
      console.error('Error during daily slot generation:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Or your desired timezone
  });
};

module.exports = scheduleSlotGeneration;
