const asyncHandler = require('express-async-handler');
const User = require('../models/User.js');
const Post = require('../models/Post.js');
const Notification = require('../models/Notification.js');
const jwt = require('jsonwebtoken');

// Helper function to create a consistent user object for responses
const createAuthResponse = (user) => {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    profileImageUrl: user.profileImageUrl,
    following: user.following,
    salonName: user.salonName,
    salonMapUrl: user.salonMapUrl,
    token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' }),
  };
};

// @desc    Register a new user
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }
  const user = await User.create({ username, email, password });
  if (user) {
    // --- ✨ 2. ใช้ Helper Function ✨ ---
    res.status(201).json(createAuthResponse(user));
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    // --- ✨ 3. ใช้ Helper Function ✨ ---
    res.json(createAuthResponse(user));
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get current user's profile (for self)
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            profileImageUrl: user.profileImageUrl,
            following: user.following,
            salonName: user.salonName,
            salonMapUrl: user.salonMapUrl,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    if (req.body.salonName !== undefined) user.salonName = req.body.salonName;
    if (req.body.salonMapUrl !== undefined) user.salonMapUrl = req.body.salonMapUrl;
    if (req.file) {
      user.profileImageUrl = req.file.path;
    }
    if (req.body.password) {
      user.password = req.body.password;
    }
    const updatedUser = await user.save();
    // --- ✨ 4. ใช้ Helper Function ✨ ---
    res.json(createAuthResponse(updatedUser));
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Delete user profile
const deleteUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        await user.deleteOne();
        res.json({ message: 'User account deleted' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get user's favorite hairstyles
const getFavoriteHairstyles = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('favorites');
  if (user) res.json(user.favorites);
  else { res.status(404); throw new Error('User not found'); }
});

// @desc    Add hairstyle to favorites
const addFavoriteHairstyle = asyncHandler(async (req, res) => {
  const { hairstyleId } = req.body;
  const user = await User.findById(req.user._id);
  if (user) {
    if (!user.favorites.includes(hairstyleId)) {
      user.favorites.push(hairstyleId);
      await user.save();
    }
    res.status(200).json({ message: 'Added to favorites' });
  } else { res.status(404); throw new Error('User not found'); }
});

// @desc    Remove hairstyle from favorites
const removeFavoriteHairstyle = asyncHandler(async (req, res) => {
  const hairstyleId = req.params.id;
  const user = await User.findById(req.user._id);
  if (user) {
    user.favorites.pull(hairstyleId);
    await user.save();
    res.status(200).json({ message: 'Removed from favorites' });
  } else { res.status(404); throw new Error('User not found'); }
});

// @desc    Upload a saved look image
const addSavedLook = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        if (req.file) {
            user.savedLooks.push(req.file.path);
            await user.save();
            res.status(201).json({ message: 'Look saved', savedLooks: user.savedLooks });
        } else { res.status(400); throw new Error('No image file provided'); }
    } else { res.status(404); throw new Error('User not found'); }
});

// @desc    Get all saved looks for a user
const getSavedLooks = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) res.json(user.savedLooks);
    else { res.status(404); throw new Error('User not found'); }
});

// @desc    Delete a saved look
const deleteSavedLook = asyncHandler(async (req, res) => {
    const { imageUrl } = req.body;
    const user = await User.findById(req.user._id);
    if (user) {
        user.savedLooks.pull(imageUrl);
        await user.save();
        res.json({ message: 'Look deleted' });
    } else { res.status(404); throw new Error('User not found'); }
});

// @desc    Follow a user
const followUser = asyncHandler(async (req, res) => {
  const userToFollow = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user._id);
  if (userToFollow && currentUser) {
    if (req.user._id.equals(userToFollow._id)) {
      res.status(400); throw new Error("You can't follow yourself");
    }
    if (!currentUser.following.includes(userToFollow._id)) {
      currentUser.following.push(userToFollow._id);
    }
    if (!userToFollow.followers.includes(currentUser._id)) {
      userToFollow.followers.push(currentUser._id);
    }
    await currentUser.save();
    await userToFollow.save();
    await Notification.create({ recipient: userToFollow._id, sender: currentUser._id, type: 'follow' });
    res.json({ message: `Successfully followed ${userToFollow.username}` });
  } else { res.status(404); throw new Error('User not found'); }
});

// @desc    Unfollow a user
const unfollowUser = asyncHandler(async (req, res) => {
  const userToUnfollow = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user._id);
  if (userToUnfollow && currentUser) {
    currentUser.following.pull(userToUnfollow._id);
    userToUnfollow.followers.pull(currentUser._id);
    await currentUser.save();
    await userToUnfollow.save();
    res.json({ message: `Successfully unfollowed ${userToUnfollow.username}` });
  } else { res.status(404); throw new Error('User not found'); }
});

// @desc    Get a user's public profile
const getUserPublicProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        const postCount = await Post.countDocuments({ author: user._id });
        res.json({
            _id: user._id,
            username: user.username,
            profileImageUrl: user.profileImageUrl,
            followers: user.followers,
            followingCount: user.following.length,
            followerCount: user.followers.length,
            postCount: postCount,
            salonName: user.salonName,       
            salonMapUrl: user.salonMapUrl,
        });
    } else { res.status(404); throw new Error('User not found'); }
});

// @desc    Search for users by username
const searchUsers = asyncHandler(async (req, res) => {
    const query = req.query.q ? { username: { $regex: req.query.q, $options: 'i' } } : {};
    const users = await User.find(query).select('username profileImageUrl _id');
    res.json(users);
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getFavoriteHairstyles,
  addFavoriteHairstyle,
  removeFavoriteHairstyle,
  addSavedLook,
  getSavedLooks,
  deleteSavedLook,
  followUser,
  unfollowUser,
  getUserPublicProfile,
  searchUsers,
};