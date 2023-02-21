# Stanify

# Installing
After cloning the repository, inside the folder run `npm install` for all the needed dependencies

# After Installing
Next create a file named `.env` in the root directory of the project. Then head over to this url, https://developer.spotify.com/dashboard/, and gather your own Spotify Client ID and Spotify Client Secret Key. Then create the following variables inside the `.env` file named, `SPOTIFY_CLIENT_ID = ''`, `SPOTIFY_CLIENT_SECRET = ''`, and `PORT = 8888`, port number is entirely up to you.

To run application in development mode run the command `npm run dev` to have nodemon start up the server. After every save related to the server the server should restart automatically and show the changes made.

After this, go to your preferred browser and type in `http://localhost:8888/`.

# Tutorial
Press the `0` Key to begin playing. The timer will start and you can type your guess into the guess box. To skip to the next song, press the `right arrow` key. To add a new artist, type in their name into the top left input box and press "Add" or the enter key. To switch to your new artist, click the dropdown and click the newly added artist's name.
