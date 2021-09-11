const jwt = require('jsonwebtoken');
const config = require('./config');


const TokenProvider = {
    generateAccessToken: function(memID, username) {
        const access_token = jwt.sign( {memberID: memID, name: username}, config.secret, { algorithm: 'HS256', expiresIn: "10 minutes"});
        const refresh_token = jwt.sign( {memberID: memID, name: username}, config.refreshTokenSecret, { algorithm: 'HS256', expiresIn: "10 minutes"});
        return response = {
            "token": access_token,
            "refresh_token": refresh_token,
        }
    },

    /**
     * Returns an ID token with the given payload
     * @param {*} data The payload for the JWT, which should have fields for username, firstName, lastName, email, and age
     * @returns The JWT id token
     */
    generateIDToken: function(data) {
        const id_token = jwt.sign(data, config.idTokenSecret, { algorithm: 'HS256'});
        console.log(id_token);
        return id_token;
    }
}

module.exports = TokenProvider; /** EXPORT FUNCTIONS */