/**
 * identity
 * Copyright(c) 2021 Mostapha Rammo
 * MIT Licensed
 */

/**
 * Model Dependencies
 */
const { Schema, model } = require('mongoose');
const User = require('./User');

const { ObjectId } = Schema.Types;

const RefreshTokenSchema = Schema({
  token: { type: String, required: true, unique: true },
  user: { type: ObjectId, ref: 'User', required: true },
  updated_at: { type: Date, required: true },
  created_at: { type: Date, required: true },
});

/**
 * Create a new refresh token for user
 * @param {String} userId User to link refresh token to
 * @param {String} refreshToken token to be added
 */
RefreshTokenSchema.statics.addRefreshToken = async function addRefreshToken(userId, refreshToken) {
  const user = await User.findById(userId);

  const rightNow = new Date();

  const newRefreshToken = new this({
    token: refreshToken,
    user: user._id,
    updated_at: rightNow,
    created_at: rightNow,
  });

  return newRefreshToken.save();
};

/**
 * Delete a refresh token
 * @param {String} refreshToken token to be deleted
 */
RefreshTokenSchema.statics.removeRefreshToken = async function removeRefreshToken(refreshToken) {
  await this.deleteOne({ token: refreshToken });
};

/**
 * Delete all user's refresh tokens
 * @param {String} userId User to have refresh tokens deleted
 */
RefreshTokenSchema.statics.removeRefreshTokensByUserId = async function
removeRefreshTokensByUserId(userId) {
  await this.deleteMany({ user: userId });
};

module.exports = model('RefreshToken', RefreshTokenSchema);
