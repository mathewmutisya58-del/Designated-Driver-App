const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please add a full name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
      unique: true
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false // Excludes password hashes from default queries
    },
    role: {
      type: String,
      enum: ['customer', 'driver', 'admin'],
      default: 'customer'
    },
    // Driver Details
    driverDetails: {
      licenseNumber: { type: String, default: null },
      nationalId: { type: String, default: null },
      isVerified: { type: Boolean, default: false },
      isAvailable: { type: Boolean, default: false },
     transmissionProficiency: {
        type: String,
        enum: ['automatic', 'manual', 'both'],
        default: 'both'
      },
      rating: { type: Number, default: 5.0 },
      totalTripsCompleted: { type: Number, default: 0 },
 
      currentLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
      }
    }
  },
  { timestamps: true }
);

// Geospatial index for live driver distance calculations
userSchema.index({ 'driverDetails.currentLocation': '2dsphere' });

module.exports = mongoose.model('User', userSchema);