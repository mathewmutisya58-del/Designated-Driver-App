const Ride = require('../models/Ride');

// 1. Customer creates a request for a driver for their personal car
exports.createDesignatedDriverRequest = async (req, res) => {
  try {
    const { 
      customerVehicle, 
      pickupAddress, 
      pickupCoords, 
      dropoffAddress, 
      dropoffCoords, 
      serviceType,
      estimatedFare,
      handoffNotes 
    } = req.body;

    const ride = await Ride.create({
      customer: req.user._id,
      customerVehicle,
      pickupLocation: {
        address: pickupAddress,
        location: { type: 'Point', coordinates: pickupCoords }
      },
      dropoffLocation: {
        address: dropoffAddress,
        location: { type: 'Point', coordinates: dropoffCoords }
      },
      serviceType,
      estimatedFare,
      handoffNotes
    });

    res.status(201).json({
      status: 'success',
      message: 'Designated driver requested successfully',
      data: { ride }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Driver views all open booking requests
exports.getPendingRequests = async (req, res) => {
  try {
    const rides = await Ride.find({ status: 'requested' }).populate('customer', 'fullName phone');

    res.status(200).json({
      status: 'success',
      results: rides.length,
      data: { rides }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Driver accepts job
exports.acceptRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride request not found' });
    }

    if (ride.status !== 'requested') {
      return res.status(400).json({ message: 'Ride is no longer available' });
    }

    ride.driver = req.user._id;
    ride.status = 'driver-assigned';
    await ride.save();

    res.status(200).json({
      status: 'success',
      message: 'Driver assigned to job successfully',
      data: { ride }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Driver updates trip lifecycle ('arrived', 'in-progress', 'completed')
exports.updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    ride.status = status;
    await ride.save();

    res.status(200).json({
      status: 'success',
      message: `Ride status updated to ${status}`,
      data: { ride }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};