/**
 * identity
 * Copyright(c) 2021 Mostapha Rammo
 * MIT Licensed
 */

/**
 * Module Dependencies
 */
const mongoose = require('mongoose');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

/**
 * DbManager Prototype
 */

const DbManager = {};
exports = DbManager;
module.exports = DbManager;

/**
 * Options passed to mongoose.connect()
 */
const defaultMongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

Object.defineProperty(DbManager, 'dbOptions', {
  value: defaultMongooseOptions,
});

/**
 * Initialize an admin user if not already created
 * @private
 */
function createAdminUser() {
  User
    .findOne({ username: 'admin' })
    .then((user) => {
      if (!user) {
        const newUserObject = {
          username: 'admin',
          name: 'admin',
          given_name: 'admin',
          family_name: 'admin',
          nickname: 'admin',
          password: 'admin',
        };

        DbManager.addUser(newUserObject);
      }
    });
}

/**
 * Connect to the database
 * @param {String} dbHostname
 * @param {Number} dbPort
 * @param {String} dbName
 * @param {Function} callback
 * @return {DbManager} for chaining
 * @public
 */

DbManager.connect = function connect(dbHostname, dbPort, dbName, initAdmin = true, callback) {
  mongoose
    .connect(`mongodb://${dbHostname}:${dbPort}/${dbName}`, this.dbOptions)
    .then(() => {
      if (initAdmin) {
        createAdminUser();
      }
      if (callback && typeof callback === 'function') {
        callback();
      }
    })
    .catch((error) => {
      throw error;
    });

  return this;
};

/**
 * Add a new user to the database
 * @param {Object} newUserObject fields corresponding to User model
 * @returns {Promise} Promise
 * @public
 */
DbManager.addUser = function addUser(newUserObject) {
  return User.addUser(newUserObject);
};

/**
 * Find a user by it's username
 * @param {String} username User's username
 * @returns {Promise} Resolving to User object
 */
DbManager.findUserByUsername = function findUserByUsername(username) {
  return new Promise((resolve, reject) => {
    User
      .findOne({ username })
      .then((user) => {
        if (!user) {
          return reject(new Error('no user found'));
        }
        return resolve(user);
      });
  });
};

/**
 * Find a user by it's email
 * @param {String} email User's email
 * @returns {Promise} Resolving to User object
 */
DbManager.findUserByEmail = function findUserByUsername(email) {
  return new Promise((resolve, reject) => {
    User
      .findOne({ email })
      .then((user) => {
        if (!user) {
          return reject(new Error('no user found'));
        }
        return resolve(user);
      });
  });
};

/**
 * Find a user by _id
 * @param {String} userId User's _id
 * @returns {Promise} Resolving to User object
 */
DbManager.findUserById = function findUserByUsername(userId) {
  return new Promise((resolve, reject) => {
    User
      .findById(userId)
      .then((user) => {
        if (!user) {
          return reject(new Error('no user found'));
        }
        return resolve(user);
      });
  });
};

/**
 * Create a new refresh token for user
 * @param {String} userId User to link refresh token to
 * @param {String} refreshToken token to be added
 * @returns {Promise} Promise
 */
DbManager.addRefreshToken = async function addRefreshToken(userId, refreshToken) {
  return RefreshToken.addRefreshToken(userId, refreshToken);
};

/**
 * Delete a refresh token
 * @param {String} refreshToken token to be deleted
 * @returns {Promise} Promise
 */
DbManager.removeRefreshToken = function removeRefreshToken(refreshToken) {
  return RefreshToken.removeRefreshToken(refreshToken);
};

/**
 * Delete all user's refresh tokens
 * @param {String} userId User to have refresh tokens deleted
 * @returns {Promise} Promise
 */
DbManager.removeRefreshTokensByUserId = function removeRefreshTokensByUserId(userId) {
  return RefreshToken.removeRefreshTokensByUserId(userId);
};

module.exports = DbManager;
