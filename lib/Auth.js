/**
 * identity
 * Copyright(c) 2021 Mostapha Rammo
 * MIT Licensed
 */

/**
 * Module Dependencies
 */
const bcrypt = require('bcryptjs');

/**
 * Auth Prototype
 */

const Auth = {};
exports = Auth;
module.exports = Auth;

/**
 * Hash a password
 * @param {String} plainText plain text password to be hashed
 * @returns {Promise} Promise
 * @public
 */
Auth.hashPassword = function hashPassword(plainText) {
  if (!plainText || typeof plainText !== 'string') {
    throw new TypeError('expected a string to hash');
  }

  return bcrypt
    .hash(plainText, 10)
    .catch((error) => {
      throw error;
    });
};

/**
 * Compare text to a hash
 * @param {String} plainText text to be compared
 * @param {String} hash hash that text will be compared to
 * @returns {Promise} Promise resolving to boolean
 * @public
 */
Auth.comparePassword = function comparePassword(plainText, hash) {
  if (!plainText || typeof plainText !== 'string') {
    throw new TypeError('expected a plain text string to compare');
  }
  if (!hash || typeof hash !== 'string') {
    throw new TypeError('expected hash to compare to');
  }

  return bcrypt
    .compare(plainText, hash)
    .catch((error) => {
      throw error;
    });
};
