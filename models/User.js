const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ['user', 'admin'],
    default: 'user',
  },
  profileImageUrl: {
    type: String,
    default: '',
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hairstyle'
  }],
  savedLooks: [{ 
    type: String 
  }],
  followers: [{ 
    type: mongoose.Schema.Types.ObjectId, ref: 'User' 
  }],
  following: [{ 
    type: mongoose.Schema.Types.ObjectId, ref: 'User' 
  }],
  salonName: [{ 
    type: String, default: '' 
  }],
  salonMapUrl: [{ 
    type: String, default: '' 
  }],
  
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;