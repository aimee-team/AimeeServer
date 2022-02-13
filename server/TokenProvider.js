const jwt = require('jsonwebtoken');
const config = require('./config');


const TokenProvider = {
    generateAccessToken: function(memID, username) {
        const access_token = jwt.sign( {memberID: memID, name: username}, config.secret, { algorithm: 'HS256', expiresIn: "5 minutes"}); //change to 15 minutes for release
        const refresh_token = jwt.sign( {memberID: memID, name: username}, config.refreshTokenSecret);  //To Do: add expiree date for refresh token ~14 days
        return response = {
            "token": access_token,
            "refresh_token": refresh_token,
        }
    },

    /**
     * Returns an ID token with the given payload
     * @param {*} data The payload for the JWT, which should have fields for `username`, `firstName`, `lastName`, `email`, and `age`
     * @returns The JWT id token
     */
    generateIDToken: function(data) {
        const id_token = jwt.sign(data, config.idTokenSecret, { algorithm: 'HS256'});
        return id_token;
    },

    /**
     * Takes an HTTP request with a refresh token, validates it, and if valid, returns a new access and refresh token 
     */
    generateNewTokens: function(req, res) {

        const refresh = req.headers['refresh_token'];

        if (typeof refresh != 'undefined' && refresh != null) {
            //if access token is valid
            if (req.isValid.success) {
                const header = req.headers['authorization'];
                const [scheme, access_token] = header.split(' ');

                console.log('Access token is still valid')
                res.json({
                    success: true,
                    message: "Access token is still valid",
                    token: {
                        token: access_token,
                        refresh_token: refresh
                    }
                })
            }
            else {
                try {
                    // console.log('yes')
                    let payload = jwt.verify(refresh, config.refreshTokenSecret);
                    //if refresh token is valid
                    let response = this.generateAccessToken(payload.memberID, payload.name);
                    console.log('Successfully refreshed tokens')
                    res.json({
                        success: true,
                        message: 'Successfully refreshed tokens', 
                        token: response
                    });

                } catch (err) {
                    console.log(err);
                    res.status(401).json({
                        success: false,
                        message: "Invalid or expired refresh token"
                    })
                }
            }
        }
        else {
            res.status(401).json({
                success: false,
                message: "Invalid request"
            })
        }
    }
}

module.exports = TokenProvider; /** EXPORT FUNCTIONS */