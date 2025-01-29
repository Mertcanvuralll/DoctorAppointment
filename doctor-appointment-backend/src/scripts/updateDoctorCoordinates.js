const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
require('dotenv').config();

const cityCoordinates = {
  'İZMİR': { lat: 38.4192, lng: 27.1287 },
  'İSTANBUL': { lat: 41.0082, lng: 28.9784 },
  'ANKARA': { lat: 39.9334, lng: 32.8597 },
};

async function updateDoctorCoordinates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const doctors = await Doctor.find({ 'address.coordinates': null });
    console.log(`Found ${doctors.length} doctors without coordinates`);

    for (const doctor of doctors) {
      const cityName = doctor.address?.cityName;
      if (cityName && cityCoordinates[cityName]) {
        doctor.address.coordinates = cityCoordinates[cityName];
        await doctor.save();
        console.log(`Updated coordinates for doctor in ${cityName}`);
      }
    }

    console.log('Coordinates update completed');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error updating coordinates:', error);
    process.exit(1);
  }
}

updateDoctorCoordinates(); 