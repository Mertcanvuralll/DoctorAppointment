const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  googleId: {
    type: String,
    sparse: true,  
    unique: true, 
    index: true
  },
  picture: String,
  role: {
    type: String,
    enum: ['user', 'doctor', 'admin', 'pending_doctor'],
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Token generation method
userSchema.methods.getSignedToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Convert email address to lowercase
userSchema.pre('save', function(next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

// Method to check user role
userSchema.methods.hasRole = function(role) {
  return this.role === role;
};

// For users logging in with Google
userSchema.statics.findOrCreateGoogle = async function(profile) {
  try {
    // First, search by Google ID
    let user = await this.findOne({ googleId: profile.sub });
    
    // If no user is found, check by email
    if (!user) {
      user = await this.findOne({ email: profile.email });
    }

    // If the user still doesn't exist, create a new one
    if (!user) {
      user = await this.create({
        googleId: profile.sub,
        email: profile.email,
        name: profile.name,
        picture: profile.picture
      });
    } else if (!user.googleId) {
      // Add Google ID to the existing user
      user.googleId = profile.sub;
      user.picture = profile.picture;
      await user.save();
    }

    return user;
  } catch (error) {
    console.error('Error in findOrCreateGoogle:', error);
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User; 