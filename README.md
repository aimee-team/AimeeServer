# AimeeServer

Repository to house code for the server for the MyAimee mobile application, that provides logic for its backend processes using Node.js.

## API Documentation
The following is documentation for the different API routes that can be called and their necessary information. The routes can be appended to the server url, which is 
[`http://ec2-54-156-106-7.compute-1.amazonaws.com:5000`](http://ec2-54-156-106-7.compute-1.amazonaws.com:5000). The *application/x-www-form-urlencoded* content type
should be used for all body data when sending HTTP requests unless stated otherwise. The routes are as follows:
### `/Register`
A **`POST`** request that registers a new user account in the database.

Requires the body values `userName`, `password`, `firstName`, `lastName`, `email`, `age`. The *email* and *password* fields will be validated to make sure that their inputs
are valid and reasonable. A valid *password* should have at least 8 characters, one capital letter, one lowercase letter, and one number. An example *request*'s data may look
like the following:
```
userName: JohnDoe123
password: Password123
firstName: John
lastName: Doe
email: john.doe123@gmail.com
age: 35
```
The *response* JSON would look like the following, if successful:
``` JSON
{
  "success": true,
  "message": "User successfuly registered"
}
```
The values of the `success` and `message` keys may vary if the *request* is invalid, and the *response* object would only have one key-value pair labeled `error` if an error
were to be caught.
___

### `/Login`
A **`POST`** request that verifies that a *request* has the credentials that match an existing user within the database and returns necessary tokens if so.

Requires the body values `userName` and `password`. An example *request*'s data may look like the following:
```
userName: JohnDoe123
password: Password123
```
The *response* JSON for an unsuccessful log-in may look like the following:
``` JSON
{
  "success": false,
  "message": "Authentication failed. Wrong password."
}
```
A successful log-in attempt would yield a third field in the *response* object, `token`, which itself would be an object containing the generated *access*, *refresh*,
and *ID* tokens for the user. The *response* may look like the following:
``` JSON
{
  "success": true,
  "message": "Heres a token",
  "token": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXJJRCI6MiwiYWNjZXNzIjoxLCJuYW1lIjoic2xhc3MzMyIsImlhdCI6MTY0NjgwMTQ0NCwiZXhwIjoxNjQ2ODAxNzQ0fQ.LHHQl2AZSHBO4ydD4CEKoKep47bxtnPPzkvlStcJFz4",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXJJRCI6MiwiYWNjZXNzIjoxLCJuYW1lIjoic2xhc3MzMyIsImlhdCI6MTY0NjgwMTQ0NH0.CAE5ZiMdLXQ8AhgqsR61e9GZSqjERGYPtguCCIhr3nQ",
    "id_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRlSm9pbmVkIjoiMjAyMi0wMy0wOVQwNTowMDowMC4wMDBaIiwidXNlcm5hbWUiOiJzbGFzczMzIiwiZmlyc3ROYW1lIjoidmFydW4iLCJsYXN0TmFtZSI6InVubml0aGFuIiwiZW1haWwiOiJ2YXJ1bi51bm5pdGhhbjMzQGdtYWlsLmNvbSIsImFnZSI6MTcsImlhdCI6MTY0NjgwMTQ0NH0.TDdPsUR7KqeL3jN6-Wfz99Ih1CCawqT2eOvjfQN53Sw"
  }
}
```
Each of these tokens can be decoded to reveal their payloads. Each token's payload will contain an `iat` field, which represents the Unix time at which the token was issued.
The *access token* will also contain an `exp` field, which is when this token will expire, which is 15 minutes after issuing it. Upon expiration, the *refresh token*
must be used to generate another *access token*. Both the *access* and *refresh* tokens' payloads will contain the fields `memberID`, `access`, and `name`, while
the *ID token* will have the fields `username`, `firstName`, `lastName`, `email`, and `age`. Tools such as [jwt.io](https://jwt.io/) can be used to decode and see the payloads of these
tokens.
___

### `/Refresh`
A **`GET`** request that provides a new *access token* upon expiration if a valid *refresh token* is provided.

Requires the header keys `Authorization`, `refresh_token`, and `grant_type`. The *Authorization* field requires the *access token* to be passed in by
appending it to the end of `"Bearer "`. The *refresh_token* and *grant_type* should also be specified. An example *request*'s headers may look like the following:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXJJRCI6MiwiYWNjZXNzIjoxLCJuYW1lIjoic2xhc3MzMyIsImlhdCI6MTY0NjgwMTQ0NCwiZXhwIjoxNjQ2ODAxNzQ0fQ.LHHQl2AZSHBO4ydD4CEKoKep47bxtnPPzkvlStcJFz4
refresh_token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXJJRCI6MiwiYWNjZXNzIjoxLCJuYW1lIjoic2xhc3MzMyIsImlhdCI6MTY0NjgwMTQ0NH0.CAE5ZiMdLXQ8AhgqsR61e9GZSqjERGYPtguCCIhr3nQ
grant_type: refresh_token
```
The *response* object would contain the newly refreshed tokens, with new *access* and *refresh* tokens being issued. A successful *request* may return the 
a *response* including a field `token`, similar to the following:
``` JSON
{
    "success": true,
    "message": "Successfully refreshed tokens",
    "token": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXJJRCI6MiwibmFtZSI6InNsYXNzMzMiLCJpYXQiOjE2NDY4MDI4MjgsImV4cCI6MTY0NjgwMzEyOH0.pReazpFIbgROwDLNsQzFMaSG-eyMdL9BKgsWJ3teM2c",
        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXJJRCI6MiwibmFtZSI6InNsYXNzMzMiLCJpYXQiOjE2NDY4MDI4Mjh9.g0dGzSbEpaVytJWyTW6aZUWzLHptrFGRgxD0q1KsBiA"
    }
}
```
The values of the `success` and `message` keys may vary if the *request* is invalid, and the *response* object would only have one key-value pair labeled `"error"` if an error
were to be caught. 
___

### `/getAudio`
A **`GET`** request that returns a JSON representing the different audio tracks available for the app to the client.

Requires the header key `Authorization`, which should include the *access token* for validation purposes. The *access token* should be passed in by appending it to the end
of `"Bearer "`, such as in the following:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXJJRCI6MiwiYWNjZXNzIjoxLCJuYW1lIjoic2xhc3MzMyIsImlhdCI6MTY0NjgwMTQ0NCwiZXhwIjoxNjQ2ODAxNzQ0fQ.LHHQl2AZSHBO4ydD4CEKoKep47bxtnPPzkvlStcJFz4
```

The *response* returned, if successful, will be an array of objects, with each element being a genre that includes multiple tracks within it. For each genre object, there will be a `title` and
`voices` key, with the latter having the value of an array of track objects. Each track objects will include fields for the `artist`, `url`, `id`, and `duration`. The *response*
object that will be returned can be seen at [Audios.json](./Audios.json).
___

### `/SER`
A **`POST`** request that takes in an input of a user's entry about their day and runs it through the AI SER model to predict the percentages of each emotion they are feeling.

Requires the header key `Authorization`, which should include the *access token* for validation purposes. The *access token* should be passed in by appending it to the end
of `"Bearer "`, such as in the following:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXJJRCI6MiwiYWNjZXNzIjoxLCJuYW1lIjoic2xhc3MzMyIsImlhdCI6MTY0NjgwMTQ0NCwiZXhwIjoxNjQ2ODAxNzQ0fQ.LHHQl2AZSHBO4ydD4CEKoKep47bxtnPPzkvlStcJFz4
```
Also requires a field in the body of the *request* called `input`. The value of this key should be the String input provided by the user to be analyzed.

Calling this route will trigger the SER model to run and analyze the input. Upon completion, the results of this model are stored as a new entry into the *emotions* table within
the database. The *response* for a successful call that is sent back to the user would include the keys `time` and `emotions` and may look like the following:
``` JSON
{
  "time": 1646972439,
  "emotions": [0.17, 0.56, 0.27]
}
```
The value of the *time* field is the Unix timestamp (seconds elapsed since Epoch) of when the entry was inserted into the database. This timestamp is the primary key that 
references this specific instance of the emotional analyses and may need to be kept to reference this entry. The *emotions* field is the array of Numbers returned by the 
SER model representing the percentage of each emotion the user is predicted to be experiencing. The indices of the array correspond to the percentages for the emotions of 
*joy*, *anger*, and *sadness*, in that same order.
___

### `/SERfeedback`
A **`POST`** request that takes the user feedback on the SER analysis and stores the feedback into the `emotions` table of the database for later training
of the AI model.

Requires the header key `Authorization`, which should include the *access token* for validation purposes. The *access token* should be passed in by appending it to the end
of `"Bearer "`, such as in the following:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXJJRCI6MiwiYWNjZXNzIjoxLCJuYW1lIjoic2xhc3MzMyIsImlhdCI6MTY0NjgwMTQ0NCwiZXhwIjoxNjQ2ODAxNzQ0fQ.LHHQl2AZSHBO4ydD4CEKoKep47bxtnPPzkvlStcJFz4
```
Also requires fields to be passed through the *request* body for the keys `epochTime` and `correctEmotion`. The *epochTime* key should hold the value of the
Unix timestamp (seconds elapsed since Epoch) at which the SER analysis was stored in the database. This serves as the primary key to identify which analysis
instance to provide feedback for. The *correctEmotion* key should hold the value of the correct emotion, as identified by the user, as an integer between 1-3.
1 corresponds to *joy*, 2 to *anger*, and 3 to *sadness*. An example *request* body may look like the following:
```
epochTime: 1646972439
correctEmotion: 2
```
A successful *request* would update the database to hold the correct emotion and would return an object with just one key, `key`, corresponding to the Unix
timestamp of the emotions entry that was updated.
___

### `/getEmotions`
A **`GET`** request to retrieve all previous SER analyses and emotions for a user within a given timeframe.

Requires the header key `Authorization`, which should include the *access token* for validation purposes. The *access token* should be passed in by appending it to the end
of `"Bearer "`, such as in the following:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXJJRCI6MiwiYWNjZXNzIjoxLCJuYW1lIjoic2xhc3MzMyIsImlhdCI6MTY0NjgwMTQ0NCwiZXhwIjoxNjQ2ODAxNzQ0fQ.LHHQl2AZSHBO4ydD4CEKoKep47bxtnPPzkvlStcJFz4
```
Also requires the parameters `startTime` and `endTime`, which correspond to the start and end times of the timeframe for which to retreive the emotions, with
both times being in the Unix timestamp format (seconds elapsed since Epoch). An example of the route URL may be: `/getEmotions?startTime=1644610131&endTime=1645474131`.

The *response* JSON to a successful *request* will be an array of *[Emotion](./Controller.js/#L356)* objects, with the length of the array equaling the number
of emotion entries found within the given timeframe. An *Emotion* object will have properties for `date` (the Unix timestamp of the emotion being recorded),
`joy`, `anger`, `sadness` (the percentages, as numbers from 0-100, that the SER model predicted for each emotion), and `correct` (the correct emotion, as
returned by the user in the form of feedback). An example *Emotion* object may look like the following:
``` JSON
{
  "date": 1644926931,
  "joy": 17,
  "anger": 46,
  "sadness": 37,
  "correct": 3
}
```
