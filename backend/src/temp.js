const mongoose = require('mongoose');

// Replace with your actual connection string from MongoDB Atlas
const MONGO_URI = 'mongodb+srv://dhananjayaggarwal6561:2gld0WeRkmdcYEcl@cluster0.4qu4otu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const scheduleSlotSchema = new mongoose.Schema({}, { strict: false });
const ScheduleSlot = mongoose.model('ScheduleSlot', scheduleSlotSchema, 'substitutions'); // 3rd arg is collection name

async function deleteOldSlots() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB ✅");

    const cutoffDate = new Date("2025-06-26T23:59:59.999Z");

    const result = await ScheduleSlot.deleteMany({
      createdAt: { $lte: cutoffDate }
    });

    console.log(`🗑 Deleted ${result.deletedCount} old schedule slots.`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB ✅");
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

deleteOldSlots();
