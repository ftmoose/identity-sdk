/**
 * identity
 * Copyright(c) 2021 Mostapha Rammo
 * MIT Licensed
 */

/**
 * Module Dependencies
 */
const DbManager = require('./DbManager');
const JwtManager = require('./JwtManager');
const { comparePassword } = require('./Auth');

/**
 * Identity Prototype
 */

const Identity = {};
exports = Identity;
module.exports = Identity;

/**
 * Find the user object
 * @param {Object} UsernameOrEmail Object with username or email keys
 * @returns {Object} User Mongodb Object
 * @private
 */
async function findUserByUsernameOrEmail({ username, email }) {
  let user = null;
  if (username) {
    user = await DbManager.findUserByUsername(username);
  } else if (email) {
    user = await DbManager.findUserByEmail(email);
  } else {
    throw new Error('username or email is required');
  }

  return user;
}

Identity.init = function init(dbHostname, dbPort, dbName, initAdmin, callback) {
  JwtManager.init();
  DbManager.connect(dbHostname, dbPort, dbName, initAdmin, callback);
  return this;
};

/**
 * Creates a new user
 * @param {Object} newUserObject New user data
 * @returns {Object} Newly created user
 * @public
 */
Identity.createNewUser = function createNewUser(newUserObject) {
  return DbManager.addUser(newUserObject);
};

/**
 * Authenticate a user
 *  - requires username or email
 *  - required password
 * @param {Object} UserCredentials (username|email), password
 * @returns {Object} accessToken, refreshToken, User object
 * @public
 */
Identity.loginUser = async function loginUser({ username, email, password }) {
  let user = await findUserByUsernameOrEmail({ username, email });

  // Check password
  const passwordsMatch = comparePassword(password, user.password);
  if (!passwordsMatch) {
    throw new Error('invalid password');
  }

  // Update user's last_login
  user.last_login = new Date();
  user.save();

  // Normalize user
  user = user.toObject();
  delete user.password;

  // Generate tokens
  const accessToken = await JwtManager.generateToken('access', user);
  const refreshToken = await JwtManager.generateToken('refresh', user);

  // Save refresh token for user
  await DbManager.addRefreshToken(user._id, refreshToken);

  return { accessToken, refreshToken, user };
};

/**
 * Check access token authenticity and get payload (user)
 * @param {*} accessToken Access token to be validated
 * @returns {Object} user (if token validated), validated (Boolean)
 */
Identity.validateAccessToken = async function validateAccessToken(accessToken) {
  let validated = false;
  let user = null;
  await JwtManager.authenticateToken('access', accessToken)
    .then((u) => {
      user = u;
      validated = true;
      return user;
    })
    .catch(() => {
      validated = false;
    });

  return { user, validated };
};

/**
 * Get a new access token using refresh token
 * @param {String} refreshToken Valid refresh token
 * @returns Access token
 */
Identity.getNewAccessToken = async function getNewAccessToken(refreshToken) {
  const user = await JwtManager.authenticateToken('refresh', refreshToken)
    .catch((error) => {
      DbManager.removeRefreshToken(refreshToken);
      throw error;
    });

  const accessToken = await JwtManager.generateToken('access', user);

  return accessToken;
};

/**
 * Logout user from single session
 * @param {String} refreshToken Refresh JWT token
 * @public
 */
Identity.logoutUser = async function logoutUser(refreshToken) {
  await DbManager.removeRefreshToken(refreshToken);
};

/**
 * Logout user from every session
 * @param {Object} UsernameOrEmail Object containing user's username or email
 * @public
 */
Identity.logoutUserEverywhere = async function logoutUserEverywhere({ username, email }) {
  const user = await findUserByUsernameOrEmail({ username, email });

  await DbManager.removeRefreshTokensByUserId(user._id);
};
