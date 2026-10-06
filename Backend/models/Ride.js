const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    // The personal vehicle owned/provided by the customer
    customerVehicle: {
      make: { type: String, required: true },
      model: { type: String, required: true },
      plateNumber: { type: String, required: true },
      transmission: { 
        type: String, 
        enum: ['automatic', 'manual'], 
        default: 'automatic' 
      }
    },
    pickupLocation: {
      address: { type: String, required: true },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true } // [longitude, latitude]
      }
    },
    dropoffLocation: {
      address: { type: String, required: true },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }
      }
    },
    serviceType: {
      type: String,
      enum: ['one-way-trip', 'hourly-chauffeur', 'event-night'],
      default: 'one-way-trip'
    },
    handoffNotes: { type: String, default: '' },
    estimatedFare: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        'requested',       // Customer created booking request
        'driver-assigned', // Driver accepted the assignment
        'arrived',         // Driver arrived at customer's vehicle
        'in-progress',     // Driver is actively driving customer's vehicle
        'completed',       // Arrived safely & keys returned
        'cancelled'
      ],
      default: 'requested'
    }
  },
  { timestamps: true }
);

// Geospatial index to search requests by location
rideSchema.index({ 'pickupLocation.location': '2dsphere' });

module.exports = mongoose.model('Ride', rideSchema);