const jwt = require('jsonwebtoken');
const config = require('./config');


const TokenProvider = {
    generateAccessToken: function(username) {
        const access_token = jwt.sign( {name: username}, config.secret, { algorithm: 'HS256', expiresIn: "10 minutes"});
        const refresh_token = jwt.sign( {name: username}, config.refreshTokenSecret, { algorithm: 'HS256', expiresIn: "10 minutes"});
        return response = {
            "token": access_token,
            "refresh_token": refresh_token,
        }
    }
}

module.exports = TokenProvider; /** EXPORT FUNCTIONS */