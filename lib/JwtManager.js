/**
 * identity
 * Copyright(c) 2021 Mostapha Rammo
 * MIT Licensed
 */

/**
 * Module Dependencies
 */
const fs = require('fs');
const path = require('path');
const { generateKeyPairSync } = require('crypto');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

/**
* Auth Prototype
*/

const JwtManager = {};
exports = JwtManager;
module.exports = JwtManager;

function generateKeyPair() {
  const {
    publicKey,
    privateKey,
  } = generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase: uuidv4(),
    },
  });

  return { publicKey, privateKey };
}

/**
 * Initialize the JwtManager module
 * This must be run in order to use module
 * @param {Object} initOptions ttl = '1h'
 */
JwtManager.init = function init(initOptions) {
  this.algorithm = 'RS256';
  this.accessTtl = initOptions.accessTtl || '1 hour';
  this.refreshTtl = initOptions.refreshTtl || '1 week';

  this.publicAccessKeyPath = path.join(__dirname, initOptions.publicAccessKeyPath || '../keys/access.key.pub');
  this.privateAccessKeyPath = path.join(__dirname, initOptions.privateAccessKeyPath || '../keys/access.key');
  this.publicRefreshKeyPath = path.join(__dirname, initOptions.publicRefreshKeyPath || '../keys/refresh.key.pub');
  this.privateRefreshKeyPath = path.join(__dirname, initOptions.privateRefreshKeyPath || '../keys/refresh.key');

  if (!fs.existsSync(this.privateAccessKeyPath)) {
    const { publicAccessKey, privateAccessKey } = generateKeyPair();
    this.publicAccessKey = publicAccessKey;
    this.privateAccessKey = privateAccessKey;
    fs.writeFileSync(this.privateAccessKeyPath, privateAccessKey);
    fs.writeFileSync(this.publicAccessKeyPath, publicAccessKey);
  }

  if (!fs.existsSync(this.privateRefreshKeyPath)) {
    const { publicRefreshKey, privateRefreshKey } = generateKeyPair();
    this.publicRefreshKey = publicRefreshKey;
    this.privateRefreshKey = privateRefreshKey;
    fs.writeFileSync(this.privateRefreshKeyPath, privateRefreshKey);
    fs.writeFileSync(this.publicRefreshKeyPath, publicRefreshKey);
  }
};

/**
 * Read key from file specified
 * @param {String} keyPath path to key
 * @returns {String} data at file path specified
 * @private
 */
function readKey(keyPath) {
  return fs.readFileSync(keyPath).toString();
}

/**
 * Generate JWT with specified options
 * @param {String} type 'access' or 'refresh'
 * @param {Object} jwtPayload Data object to be encoded in JWT
 * @param {String} expiresIn Time length key is valid for (ex. '1 hour', '1 week')
 * @returns {Promise} Promise resolving to JWT token
 */
JwtManager.generateToken = function generateToken(type, jwtPayload, expiresIn) {
  return new Promise((resolve, reject) => {
    let privateKey = null;
    switch (type) {
      case 'access':
        privateKey = this.privateAccessKey;
        if (!privateKey) {
          privateKey = readKey(this.privateAccessKeyPath);
          this.privateAccessKey = privateKey;
        }
        break;
      case 'refresh':
        privateKey = this.privateRefreshKey;
        if (!privateKey) {
          privateKey = readKey(this.privateRefreshKeyPath);
          this.privateRefreshKey = privateKey;
        }
        break;
      default:
        reject(new TypeError('type expected to be access or refresh'));
    }

    const options = {
      algorithm: this.algorithm,
      expiresIn: expiresIn || type === 'access' ? this.accessTtl : this.refreshTtl,
    };

    jwt.sign(jwtPayload, privateKey, options, (error, token) => {
      if (error) {
        return reject(error);
      }
      return resolve(token);
    });
  });
};

/**
 * Verify token authenticity
 * @param {String} type 'access' or 'refresh'
 * @param {String} token JWT to be evaluated
 * @returns {Object} JWT Payload if authenticated
 */
JwtManager.authenticateToken = function authenticateToken(type, token) {
  return new Promise((resolve, reject) => {
    let publicKey = null;
    switch (type) {
      case 'access':
        publicKey = this.publicAccessKey;
        if (!publicKey) {
          publicKey = readKey(this.publicAccessKeyPath);
          this.publicAccessKey = publicKey;
        }
        break;
      case 'refresh':
        publicKey = this.publicRefreshKey;
        if (!publicKey) {
          publicKey = readKey(this.publicRefreshKeyPath);
          this.publicRefreshKey = publicKey;
        }
        break;
      default:
        reject(new TypeError('type expected to be access or refresh'));
    }

    const options = {
      algorithm: this.algorithm,
    };

    jwt.verify(token, publicKey, options, (error, payload) => {
      if (error) {
        return reject(error);
      }
      return resolve(payload);
    });
  });
};
