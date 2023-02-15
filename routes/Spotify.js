const express = require('express');
const axios = require('axios');
const { response } = require('express');
const router = express.Router();

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

const tokenUrl = 'https://accounts.spotify.com/api/token';
const baseUrl = 'https://api.spotify.com/v1/';;
var accessToken = '';
var count = 0;

const reqOptions = {
    method: "POST",
    url: tokenUrl,
    data: "grant_type=client_credentials",
    auth: {
      username: SPOTIFY_CLIENT_ID,
      password: SPOTIFY_CLIENT_SECRET,
    }
};

// ----- Middleware for the base endpoint of spotify ------
router.use('/', async (req, res, next) => {
    console.log("Token Middleware Ran!")
    setInterval(async function(){
        accessToken = await generateAccessToken();
        console.log('Generated a new access token');
    }, 3600000);

    if(accessToken === '')
    {
        console.log('Generating a new token...');
        accessToken = await generateAccessToken();
        next();
        return;
    }

    next();
})

// ----- Middleware for the endpoint 'spotify/search/artist' -----

// Function to retreive the artist
router.use('/search/artist/:search', async (req, res, next) =>{
    console.log(req.params.search);
    console.log("Search for artist Middleware ran!");
    if(req.params.search === ' ' || req.params.search == undefined)
    {
        res.render('index.ejs', { artistName: []});
        return;
    }

    var response;
    var artistSearchResult;

    try{
        const customUrl = baseUrl + `search?query=${req.params.search}&type=artist&offset=0&limit=1&market=US`
        response = await axios.get(customUrl, { 
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            }
         });

        console.log("Query was a success");

        artistSearchResult = await formatArtistSearch(response.data.artists.items);
    }
    catch(err)
    {
        console.error("Error: " + err.message);
    }
    
    res.locals.artistData = artistSearchResult;
    next();
})

// Function to retreive the artist's albums
router.use('/search/artist/:search', async (req, res, next) =>{
    console.log("Grabbing artists albums Middleware Ran!");

    for(let i = 0; i < res.locals.artistData.length; i++)
    {
        res.locals.artistData[i].albums = await getArtistAlbums(res.locals.artistData[i].id);
    }

    next();
})

// Function to retreive the album's tracks
router.use('/search/artist/:search', async (req, res, next) =>{
    console.log("Grabbing the songs from each album!");
    try{
        if(res.locals.artistData[0] == undefined)
        {
            throw new Error('Cannot send an empty artist');
        }
    }
    catch(error)
    {
        console.log(error.message);
        res.redirect('https://localhost:8888/');
    }

    var tracks = [];
    var response;

    for(let i = 0; i < res.locals.artistData[0].albums.length; i++)
    {
        
        try{
            var customUrl = baseUrl + `albums/${res.locals.artistData[0].albums[i].id}/tracks?market=US`
            response = await axios.get(customUrl, { 
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                }
            })
            
            for(let i = 0; i < response.data.items.length; i++)
            {
                tracks.push(new Track(response.data.items[i].name, response.data.items[i].preview_url, response.data.items[i].id));
            }

            res.locals.artistData[0].albums[i].tracks = tracks;
            tracks = [];
        }
        catch(error)
        {
            console.log(error.message);
        }
    }

    console.log("Done getting the songs!");

    next();
})

// Endpoints
router.get('/', async (req, res) => {
    console.log(`Welcome to the Spotify Endpoint\nCurrent Token: ${accessToken}`);
    res.redirect("http://localhost:8888/");
})

router.get('/search/artist/:search', async (req, res) => {
    res.send({ artistData : res.locals.artistData });
    //res.render('index.ejs', { artistName: res.locals.artistData });
})

async function generateAccessToken() {
    const response = await axios(reqOptions);
    return response.data.access_token;
}

async function formatArtistSearch(artistData){
    var artistArray = [];

    artistData.forEach(element => {
        if(element.images[0] != null)
        {
            artistArray.push(new Artist(element.name, element.images[0].url, element.id));
        }
    })

    return artistArray;
}

async function getArtistAlbums(artistid){
    var tempArray = []
    
    try{
        const customUrl = baseUrl + `artists/${artistid}/albums?include_groups=album&market=US&limit=50`
        var response = await axios.get(customUrl, { 
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            }
         });

         tempArray = await formatArtistAlbums(response.data.items);
    }
    catch(err)
    {
        console.log(err.message);
    }

    return tempArray;
}

async function formatArtistAlbums(artistAlbums){
    var tempArray = [];

    artistAlbums.forEach(element =>{
        tempArray.push(new ArtistAlbums(element.name, element.images[0].url, element.id, null));
    })

    return tempArray;
}

function Artist(name, artistPicture, id, albums)
{
    this.name = name;
    this.artistPicture = artistPicture;
    this.id = id;
    this.albums = albums;
}

function ArtistAlbums(name, albumPicture, id, tracks)
{
    this.name = name;
    this.albumPicture = albumPicture;
    this.id = id;
    this.tracks = tracks;
}

function Track(name, previewUrl, id)
{
    this.name = name;
    this.previewUrl = previewUrl;
    this.id = id;
}

module.exports = router;
