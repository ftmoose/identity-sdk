# Identity
Identity is an authentication sdk build for [Node.js](https://nodejs.org/en/) apps using [MongoDB](https://www.mongodb.com/).

Identity's purpose is to make authenticating and authorizing user's in your application as easy as possible. Just install the SDK, initialize it, and call `Identity.addUser()`
to add a new user to your application. The users are stored in your local database, giving you full control with maximum security.

## Install
```bash
$ npm install identity-sdk 
```

## Usage

#### Table of Contents

* [Adding Identity to your application](#adding-identity-to-your-application)
* [Log a user in](#log-a-user-in)
* [Log a user out](#log-a-user-out)
* [Create a new user](#create-a-new-user)
* [Get a new Access Token](#get-a-new-access-token)
* [License](#license)

### Adding Identity to your application
```javascript
const Identity = require('identity-sdk').init();

// or

const Identity = require('identity-sdk');
Identity.init();
```

### Log a user in

By default, Identity adds an initial `admin` user to the database:
```javascript
const userCredentials = {
  username: 'admin',
  email: 'admin@example.com', // only a username OR an email is required, not both.
  password: 'admin'
};

const {
  accessToken,  // you would send this to your user (client)
  refreshToken, // for subsequent resource requests
  user
} = await Identity.loginUser(userCredentials);

// accessToken: String (JWT with user as payload)
// refreshToken: String (JWT with user as payload)
// user: Object (admin user document)
```

### Log a user out

```javascript
await Identity.logoutUser(refreshToken);

// or
const userCredentials = {
  username: 'admin',
  email: 'admin@example.com', // only a username OR an email is required, not both.
};

await Identity.logoutUserEverywhere(userCredentials);
```

### Validate and get user from an Access Token (JWT)

```javascript
const {
  user,
  validated
} = Identity.validateAccessToken(accessToken);

// user: Object (user data object), null if invalid jwt
// validated: Boolean (is access token valid)
```

### Create a new user

To create a new user, you just need to give Identity a **username** and **password**. 
The **username** and **email** field must be unique.
All other fields described are optional for your convenience.

```javascript
const newUserObject = {
  username,         // (required) (unique) User's username
  password,         // (required) User's plaintext password, gets hashed for you
  email,            // (unique) User's email
  name,             // User's full name
  given_name,       // User's given name
  family_name,      // User's family name
  nickname,         // User's nickname
  phone_number,     // User's phone number
  picture,          // URL pointing to the user's profile picture
};

newlyCreatedUserDocument = await Identity.createNewUser(newUserObject);

// newlyCreatedUserDocument: Object (new user document)
```

### Get a new Access Token

Access tokens expire, when they do pass in the refresh token to get a new one.

```javascript
const newAccessToken = await Identity.getNewAccessToken(refreshToken);
```

## License

[The MIT License](https://opensource.org/licenses/MIT)

Copyright (c) 2021 Mostapha Rammo <[mrammo.ca](https://mrammo.ca/)>





