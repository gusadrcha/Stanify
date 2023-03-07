# Stanify

# Installing
After cloning the repository, inside the folder run `npm install` for all the needed dependencies

# After Installing
Next create a file named `.env` in the root directory of the project. Then head over to this url, https://developer.spotify.com/dashboard/, and gather your own Spotify Client ID and Spotify Client Secret Key. Then create the following variables inside the `.env` file named, `SPOTIFY_CLIENT_ID = ''`, `SPOTIFY_CLIENT_SECRET = ''`, and `PORT = 8888`, port number is entirely up to you.

To run application in development mode run the command `npm run dev` to have nodemon start up the server. After every save related to the server the server should restart automatically and show the changes made.

After this, go to your preferred browser and type in `http://localhost:8888/`.

# DB Configuration
As of right now we have not yet setup a system where the database is available so for now you need to supply the DB url. First you are going to want to visit, https://www.mongodb.com/, then you are going to want to create a new account and setup a database cluster. Once you have done that then you are going to want to get the database url. Once you have it go into the `.env` file and create a new variable called `MONGO_DB_URL` and set it equal to your database.

# Tutorial
Press the `0` Key to begin playing. The timer will start and you can type your guess into the guess box. To skip to the next song, press the `right arrow` key. To add a new artist, type in their name into the top left input box and press "Add" or the enter key. To switch to your new artist, click the dropdown and click the newly added artist's name.
