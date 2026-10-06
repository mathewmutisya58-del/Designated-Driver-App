const User = require('../models/User');

// 1. Update Driver Profile (License, National ID, Vehicle Details)
exports.updateDriverProfile = async (req, res) => {
  try {
    const { licenseNumber, nationalId, vehicle } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'driverDetails.licenseNumber': licenseNumber,
          'driverDetails.nationalId': nationalId,
          'driverDetails.isAvailable': isAvailable,
          'driverDetails.transmissionProficiency': transmissionProficiency
        }
      },
      { returnDocument: 'after', runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Driver profile updated successfully',
      data: { driver: updatedUser }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDriverLocation = async (req, res) => {
  try {
    const { longitude, latitude } = req.body;

    const driver = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'driverDetails.currentLocation': {
            type: 'Point',
            coordinates: [longitude, latitude]
          }
        }
      },
      { returnDocument: 'after' }
    );

    res.status(200).json({
      status: 'success',
      message: 'Location updated',
      data: { driver }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};