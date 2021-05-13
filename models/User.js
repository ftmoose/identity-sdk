/**
 * identity
 * Copyright(c) 2021 Mostapha Rammo
 * MIT Licensed
 */

/**
 * Module Dependencies
 * @private
 */

const { Schema, model } = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { hashPassword } = require('../Auth');

const { Mixed } = Schema.Types;

/**
 * Check if value conforms to username requirements
 *  - first character is a letter
 *  - all letters are lowercase
 *  - number(s) (optional)
 *  - underscore (optional)
 * @param {String} value
 * @returns {Boolean} True if value conforms to requirements
 */
function isValidUsername(value) {
  return /^[a-z][a-z0-9]*(_[a-z0-9]*)?$/.test(value);
}

/**
 * User Schema
 * @param {String} user_id  User's unique identifier
 * @param {String} username User's username, lowercase letters, numbers and _
 * @param {String} password Hashed value of user's password
 * @param {String} name User's full name
 * @param {String} given_name User's given name
 * @param {String} family_name User's family name
 * @param {String} nickname User's nickname
 * @param {String} permissions Permissions assigned to the user
 * @param {String} phone_number User's phone number
 * @param {Boolean} phone_verified Indicates whether the user has verified their phone number
 * @param {String} picture URL pointing to the user's profile picture
 * @param {String} email User's email
 * @param {Boolean} email_verified Indicates whether the user has verified their email address
 * @param {Object} identities Contains info retrieved from the identity provider with which
 * the user authenticates
 * @param {Date} last_login Timestamp indicating when the user last logged in
 * @param {Date} last_password_reset Timestamp indicating the last time the
 * user's password was reset/changed
 * @param {Date} updated_at Timestamp indicating when the user's profile was last updated/modified
 * @param {Date} created_at Timestamp indicating when the user profile was first created
 * @private
 */

const UserSchema = Schema({
  user_id: { type: String, unique: true, required: true },
  username: {
    type: String,
    unique: true,
    validate: {
      validator: isValidUsername,
      message: 'invalid username',
    },
    required: [true, 'username required'],
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: (value) => value.length > 0,
    },
  },
  name: { type: String },
  given_name: { type: String },
  family_name: { type: String },
  nickname: { type: String },
  permissions: { type: String },
  phone_number: { type: String },
  phone_verified: { type: Boolean },
  picture: { type: String },
  email: { type: String, unique: true },
  email_verified: { type: Boolean, default: false },
  identities: [{ type: Mixed }],
  last_login: { type: Date },
  last_password_reset: { type: Date },
  updated_at: { type: Date, required: true },
  created_at: { type: Date, required: true },
});
module.exports = model('User', UserSchema);

/**
 * Create a new User document
 * @param {Object} newUserObject fields corresponding to User model
 * @returns {Promise} Promise
 * @public
 */
UserSchema.statics.addUser = async function addUser(newUserObject) {
  if (!newUserObject || typeof newUserObject !== 'object') {
    throw new TypeError('user object expected as parameter');
  }

  const rightNow = new Date();
  const passwordHash = newUserObject.password ? await hashPassword(newUserObject.password) : null;

  const startingFields = {
    user_id: uuidv4(),
    password: passwordHash,
    last_login: null,
    last_password_reset: null,
    updated_at: rightNow,
    created_at: rightNow,
  };

  const newUser = new this({ ...newUserObject, ...startingFields });
  return newUser.save();
};
