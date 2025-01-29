const axios = require('axios');
const logger = require('../utils/logger');

class GeocodingService {
  static async getCoordinates(address) {
    try {
      const formattedAddress = `${address.street}, ${address.district}, ${address.city}`;
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address: formattedAddress,
            key: process.env.GOOGLE_MAPS_API_KEY
          }
        }
      );

      if (response.data.results && response.data.results[0]) {
        const { lat, lng } = response.data.results[0].geometry.location;
        return { lat, lng };
      }

      return null;
    } catch (error) {
      logger.error('Error getting coordinates:', error);
      return null;
    }
  }
}

module.exports = GeocodingService; 