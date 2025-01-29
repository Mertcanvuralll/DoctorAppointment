const RedisService = require('../services/redisService');
const logger = require('../utils/logger');

exports.getCities = async (req, res) => {
  try {
    const cities = await RedisService.getCities();
    res.json({
      success: true,
      data: cities
    });
  } catch (error) {
    logger.error('Error fetching cities:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cities'
    });
  }
};

exports.getDistricts = async (req, res) => {
  try {
    const districts = await RedisService.getDistricts(req.params.cityId);
    res.json({
      success: true,
      data: districts
    });
  } catch (error) {
    logger.error('Error fetching districts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching districts'
    });
  }
}; 