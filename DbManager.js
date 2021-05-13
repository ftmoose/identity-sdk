/**
 * identity
 * Copyright(c) 2021 Mostapha Rammo
 * MIT Licensed
 */

/**
 * Module Dependencies
 * @private
 */
const mongoose = require('mongoose');
const User = require('./models/User');

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
 * Connect to the database
 * @param {String} dbHostname
 * @param {Number} dbPort
 * @param {String} dbName
 * @param {Function} callback
 * @return {DbManager} for chaining
 * @public
 */

DbManager.connect = function connect(dbHostname, dbPort, dbName, callback) {
  mongoose
    .connect(`mongodb://${dbHostname}:${dbPort}/${dbName}`, this.dbOptions)
    .then(() => {
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

module.exports = DbManager;
