import { startTimer, pauseTimer, resetTimer } from "./Timer.mjs";
import { loadVisualizer, renderFrame } from "./Visualizer.mjs";
import { getCurrentUserArtistList, setCurrentArtist, getCurrentArtist, setCurrentUserArtistList, setUserStatistics } from "./Session.mjs";

// DOM Variables
var player = document.getElementById('player');
player.volume = 0.2;
player.crossOrigin = "anonymous";

var lastGuessElem = document.getElementById("last-guess");
var bestGuessElem = document.getElementById("best-guess");
// var sessionAvgElem = document.getElementById("session-avg");

var buttonList = document.getElementById("button-list");
var addButton = document.getElementById("add-button").addEventListener("click", addArtist);
// TODO User can click button multiple times and speed up timer
// TODO Disable replay button until after 30 seconds
// TODO Decide whether replay button can be pressed during song or only after
var replayButton = document.getElementById("replay-button").addEventListener("click", replayTrack);
var revealButton = document.getElementById("reveal-button").addEventListener("click", () => {  globalGuessFlag = true; revealTrack(globalGuessFlag); });
var searchArtistInput = document.getElementById("lookup-input");
// When user presses enter in input box, call add artist function
searchArtistInput.addEventListener("keyup", ({key}) => {
    if(key === "Enter") {
        addArtist()
    }
})

var albumArt = document.getElementById("album-art");
var guessInput = document.getElementById("input-box");

// Fetch Variables
var songs = []; 
var songNames = [];
var artist = "";

// Global var
var currentSong = "";
var currentFocus;
var songIndex = 0;
var firstSongFlag = 0;
// var sessionAvg = 0;
// var guessedSongCount = 0;
var bestGuess = Number.MAX_SAFE_INTEGER;
var globalGuessFlag = false;

var userAddedArtists = []
var statistics;
var currentArtistStatisticsList = [];

//initialize visualizer
loadVisualizer(player);
renderFrame();

// Data Types
function Song(name, albumPicture, previewUrl, artistName) {
    this.name = name;
    this.albumPicture = albumPicture;
    this.previewUrl = previewUrl;
    this.artistName = artistName;
}

function ArtistStatistics(name, attempts, bestAttempt)
{
    this.name = name;

    if(attempts.length == 0)
        this.attempts = [];
    else
        this.attempts = attempts;

    this.bestAttempt = bestAttempt;
}

async function setArtist()
{
    var usersArtist;

    // sends a GET request to grab the current artist that the user has
    usersArtist = await getCurrentArtist();
   
    // sends a GET request for the user's current list of artists
    userAddedArtists = await getCurrentUserArtistList()

    if(userAddedArtists == undefined)
        userAddedArtists = []

    // Plan: add a user's previously added artists to the drop down dynamically
    // Here just for testing purposes as of now
    if(userAddedArtists != undefined)
        userAddedArtists.forEach(addArtists);

    // user doesnt have previous artist
    if(usersArtist == "" || usersArtist == undefined)
    {
        artist = "Mac Miller";
    }
    else
    {
        artist = usersArtist;
    }

    // sends in the artist to update the webpage with the correct artist
    await fetchSongs(artist)
}

async function setArtistStatistics(artist)
{
    // TODO: Add in retrieval functionality
    
    
    var i;
    
    // iterates through the list of artistStatistic objects to find the current artist. if
    // the current artist is found, then set the working 'statistics' variable to it. else
    // create a new object for the artist and add it to the list
    if(currentArtistStatisticsList.length != 0)
    {
        for(i = 0; i < currentArtistStatisticsList.length; i++)
        {
            if(currentArtistStatisticsList[i].name === artist)
            {
                console.log("Artist object exists")

                statistics = new ArtistStatistics(currentArtistStatisticsList[i].name, currentArtistStatisticsList[i].attempts, currentArtistStatisticsList[i].bestAttempt);

                console.log(statistics)
                return
            }
        }    

        console.log("Creating a new object")
        currentArtistStatisticsList.push(new ArtistStatistics(artist, [], 0))

        statistics = new ArtistStatistics(currentArtistStatisticsList[i].name, currentArtistStatisticsList[i].attempts, currentArtistStatisticsList[i].bestAttempt);

        console.log(statistics)
    }   
    else
    {
        console.log("List is empty initalizing the list with the default artist")
        currentArtistStatisticsList.push(new ArtistStatistics(artist, [], 0))

        statistics = new ArtistStatistics(currentArtistStatisticsList[0].name, currentArtistStatisticsList[0].attempts, currentArtistStatisticsList[0].bestAttempt);

        console.log(statistics)
    }

    console.log(currentArtistStatisticsList)
}

// Function fetches data and parses based off input artist
async function fetchSongs(artistInput) {
    // Reset Game
    songs = [];
    songNames = [];
    songIndex = 0;
    player.pause();
    resetTimer();
    firstSongFlag = 1;

    artist = artistInput

    // System will update the current user's artist to the artist selected
    await setCurrentArtist(artistInput);

    // When Fetching, display loading gif
    albumArt.src = "./img/load.gif";
    albumArt.classList.remove("blur");

    // Create artist URL used for fetch
    var artistURL = "http://localhost:8888/spotify/search/artist/" + artistInput

    // Use artistURL to fetch data from Spotify's API
    fetch(artistURL)
    .then(response =>{
        if(!response.ok)
        {
            console.log('Something went wrong');
            return;
        }
        return response.json();
    })
    .then(async (response) =>{
        // After the response is received, begin to parse the default arist and generate all tracks
        await parseArtist(response);
        // Load Audio Player with all generated tracks
        await loadAudioPlayer();

        await setArtistStatistics(artist);
    })
}

async function fetchNextTrack(song) {
    // Handles songs with | symbol messing with fetch requested
    // If song starts with | symbol, song won't load in
    let x;
    if(song.name.indexOf("|") != -1) {
        x = song.name.split("|")[0];
    }
    else {
        x = song.name;
    }
    
    fetch(`http://localhost:8888/spotify/search/track/${x}/${song.artistName}`)
    .then(async res => {
        if(!res.ok)
        {
            console.log('Something went wrong');
            return;
        }
        return await res.json();
    })
    .then(async res => {
        song.previewUrl = res.preview_url;
        await loadNextTrack(song)
    })
}

// https://stackoverflow.com/a/9229821
// Grabs first instance of song name literal and disregards the others following it
function uniqByKeepFirst(allSongs, key) {
    let seenSong = new Set();
    return allSongs.filter(item => {
        let songName = key(item);
        return seenSong.has(songName) ? false : seenSong.add(songName);
    });
}

// Passed fetch json, parse artist data and load into songs[] array
async function parseArtist(res) {
    var nonNullTrackCount = 0;
    var nullTrackCount = 0;
    var albumCount = 0;
    var allSongs = [];

    var artistParsed = res.artistData[0];

    // Parse through the JSON and iterate through the tracks of each album
    artistParsed.albums.forEach((album) => {
        album.tracks.forEach((track) => {
            // If the track exists
            if(track.previewUrl != null) {
                // Add track to songs array
                songs.push(new Song(track.name, album.albumPicture, track.previewUrl, artistParsed.name));

                nonNullTrackCount++;
            }
            else {
                songs.push(new Song(track.name, album.albumPicture, null, artistParsed.name))

                nullTrackCount++;
            }
        })
    })

    // Print out fetch data info
    console.log(artistParsed.name)
    // console.log('Album Count', albumCount);
    console.log("Total Song Count", nonNullTrackCount + nullTrackCount)
    console.log('Available Tracks', nonNullTrackCount);
    console.log('Not Available Tracks', nullTrackCount);

    console.log("All Songs Count Before Filtering", allSongs.length)
    allSongs = uniqByKeepFirst(allSongs, song => song.name)
    console.log("All Songs Count after Filtering", allSongs.length)

    console.log("Available Songs Count Before Filtering", songs.length)
    songs = uniqByKeepFirst(songs, song => song.name)
    console.log("Available Songs Count After Filtering", songs.length)

    console.log(songs)

    songs.forEach(song =>{
        songNames.push(song.name);
    })
}

// Loads audio player when songs have been loaded
async function loadAudioPlayer() {
    // Random Song Loaded
    songs = shuffle(songs);
    currentSong = songs[songIndex];

    if(currentSong.previewUrl == null) {
        await fetchNextTrack(currentSong);
    }
    else {
        loadNextTrack(currentSong);
    }
}

async function loadNextTrack(currentSong) {
    // Load into player
    player.src = currentSong.previewUrl;
    
    // Album Art Handling
    albumArt.src = currentSong.albumPicture;
    albumArt.classList.remove("unblur");
    albumArt.classList.add("blur");
    
    // Reset guessbox input val and style
    guessInput.value = ""
    guessInput.classList.remove("invalid");
    guessInput.classList.remove("correct");
    guessInput.style.border = "solid 2px #1DB954";

    // If the first song is loaded, don't start player
    if(firstSongFlag != 1) {
        player.play();
        // When user skips song, reset timer
        resetTimer();
        startTimer();
    }
}

// https://stackoverflow.com/a/2450976
function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

// Audio Player Functionality
document.onkeydown = async function (e) {

    //ignore key press if user is in a text field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }

    // Start Player by pressing 0
    if(e.code == "Digit0"){
        // If the player is paused, begin playing -- vice versa
        if (player.paused) {
            player.play();

            // loadVisualizer(player);
            // renderFrame();

            startTimer();
        }
        else {
            player.pause();
        }
        
        firstSongFlag = 0;
    }
    // Play Random Song by pressing Right Arrow Key
    if(e.code == "ArrowRight"){
        closeAllLists();
        songIndex++;
        currentSong = songs[songIndex];

        if(currentSong.previewUrl == null) {
            await fetchNextTrack(currentSong);
        }
        else {
            loadNextTrack(currentSong);
        }
        globalGuessFlag = false;

        firstSongFlag = 0;
    }
    // Play previous song in queue
    if(e.code == "ArrowLeft"){
        // Do nothing when the user tries to go back further than first track
        if(songIndex == 0){
            return;
        }

        closeAllLists();
        songIndex--;
        currentSong = songs[songIndex];
        
        loadNextTrack(currentSong);
    }
};

// Adds artist to dropdown menu when add button is clicked
async function addArtist() {
    let newArtistName = searchArtistInput.value;
    // TODO Check if input is a legitamate artist
    // If no artist was input, do nothing
    if(newArtistName == "" || newArtistName == undefined) {
        return;
    }

    if(userAddedArtists != undefined)
    {
        if(!userAddedArtists.includes(newArtistName))
            userAddedArtists.push(newArtistName)
    }
    else
    {
        userAddedArtists.push(newArtistName)
    }

    // Create <a> tag
    let newArtist = document.createElement("a");
    // Set tag HTML to value in input box 
    newArtist.innerHTML = newArtistName;
    newArtist.href = "#";
    // Add class for styling/functionality
    newArtist.classList += "dropdown-item";
    // Add onclick function with user input
    newArtist.addEventListener("click", () => {
        fetchSongs(newArtistName);
    });

    // makes a request to save the list of artists
    await setCurrentUserArtistList(userAddedArtists)
        .then(console.log("SUCCESS"))
        .catch(error => {
            console.log(error.message)
         });
    
    // Call because song was entered through input box
    fetchSongs(newArtistName);

    buttonList.appendChild(newArtist);

    // Reset input box when finished
    searchArtistInput.value = "";
}

// Temporary function used to generate artists through dropdown menu for dev purposes
function addArtists(input) {
    let newArtist = document.createElement("a");
    // Set tag HTML to value in input box
    newArtist.innerHTML = input;
    newArtist.href = "#";
    // Add class for styling/functionality
    newArtist.classList += "dropdown-item";
    // Add onclick function with user input
    newArtist.addEventListener("click", async () => {
        await setUserStatistics(currentArtistStatisticsList)
        await fetchSongs(input);
    });
    buttonList.appendChild(newArtist);
}

// On each input event for the Guess box
guessInput.addEventListener('input', function(e) {
    // Update input animation
    updateInputAnimation()
    
    var possibleSongDiv, possibleSongItem, i, val = this.value;
    // Close any already open lists of autocompleted values
    closeAllLists();
    if (!val) { return false;}
    currentFocus = -1;

    // Create a DIV element that will contain the items (values):
    possibleSongDiv = document.createElement("DIV");
    possibleSongDiv.setAttribute("id", this.id + "autocomplete-list");
    possibleSongDiv.setAttribute("class", "autocomplete-items");
    // Append the DIV element as a child of the autocomplete container:
    this.parentNode.appendChild(possibleSongDiv);

    var possible_song_count = 0;
    // For each item in the array...
    for (i = 0; i < songNames.length; i++) {
        // Check if the item starts with the same letters as the text field value:
        if (songNames[i].substr(0, val.length).toUpperCase() == val.toUpperCase() && possible_song_count <= 3) {
            // Create a DIV element for each matching element:
            possibleSongItem = document.createElement("DIV");
            // Make the matching letters bold:
            possibleSongItem.innerHTML = "<strong>" + songNames[i].substr(0, val.length) + "</strong>";
            possibleSongItem.innerHTML += songNames[i].substr(val.length);
            possibleSongItem.innerHTML += `<input type='hidden' value="${songNames[i]}">`;
            // Execute a function when someone clicks on the item value (DIV element):
            possibleSongItem.addEventListener("click", function(e) {
                // Insert the value for the autocomplete text field:
                guessInput.value = this.getElementsByTagName("input")[0].value;
                // Check if input is correct
                checkGuessInput();
                // Close the list of autocompleted values,(or any other open lists of autocompleted values)
                closeAllLists();
            });
            possibleSongDiv.appendChild(possibleSongItem);

            possible_song_count += 1;
        }
    }
});

// Trigger function when input box is selected and key down is pressed
guessInput.addEventListener("keydown", function(e) {
    
    var possibleSongItem = document.getElementById(this.id + "autocomplete-list");
    if (possibleSongItem) possibleSongItem = possibleSongItem.getElementsByTagName("div");
    if (e.code == "ArrowDown") {
        // If the arrow DOWN key is pressed, increase the currentFocus variable:
        currentFocus++;
        // Make the current item more visible:
        addActive(possibleSongItem);
    } else if (e.code == "ArrowUp") {
        // If the arrow UP key is pressed, decrease the currentFocus variable
        currentFocus--;
        // Make the current item more visible:
        addActive(possibleSongItem);
    } else if (e.code == "Enter") {
        // If the ENTER key is pressed, prevent the form from being submitted,
        e.preventDefault();
        if (currentFocus > -1) {
            // Simulate a click on the "active" item:
            if (possibleSongItem) possibleSongItem[currentFocus].click();
        }
        
        checkGuessInput()
    }
});

// Function checks the current guess box input with the correct song name
function checkGuessInput() {
    if(guessInput.value.toLowerCase() === currentSong.name.toLowerCase()) {
        revealTrack(globalGuessFlag);
    }
    // If incorrect
    else {
        // Change border to red, add invalid aniamtion class
        guessInput.style.border = "solid 2px red";
        guessInput.classList.add("invalid");
        guessInput.classList.remove("correct");
    }
}

// Function classifies a potential song guess as "Active" for functionality
function addActive(possibleSongItem) {
    if (!possibleSongItem) return false;
    // Start by removing the "active" class on all items:
    removeActive(possibleSongItem);
    if (currentFocus >= possibleSongItem.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (possibleSongItem.length - 1);
    // Add class "autocomplete-active":
    possibleSongItem[currentFocus].classList.add("autocomplete-active");
}

// A function to remove the "active" class from all autocomplete items
function removeActive(possibleSongItem) {
    for (var i = 0; i < possibleSongItem.length; i++) {
        possibleSongItem[i].classList.remove("autocomplete-active");
    }
}

// Close all autocomplete lists in the document, except the one passed as an argument
function closeAllLists(elmnt) {
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != guessInput) {
            x[i].parentNode.removeChild(x[i]);
        }
    }
}

// Close autocomplete div when user clicks away from guess input box
document.addEventListener("click", function (e) {
    closeAllLists(e.target);
});

// Called by HTML when input is changed, allows animation to replay
function updateInputAnimation() {
    guessInput.classList.remove("invalid");
    guessInput.classList.remove("correct");
}

function replayTrack() {
    startTimer();
    player.play();
}

function revealTrack(guessFlag) {
    const [seconds, miliseconds] = pauseTimer();
    
    // If user clicks revealTrack button, don't save last time
    if(!guessFlag) {
        // Update Lastest Score
        let score = seconds * 1000 + miliseconds;
        
        if(score <= bestGuess) {
            bestGuess = score;
            bestGuessElem.innerHTML = String(seconds + "." + miliseconds + " seconds");
        }

        lastGuessElem.innerHTML = String(seconds + "." + miliseconds + " seconds");
    }
    else{
        guessInput.value = currentSong.name;
    }

    // Begin Unblur Animation
    albumArt.classList.remove("blur");
    albumArt.classList.add("unblur");

    // Change border to green, add correct animation class
    guessInput.style.border = "solid 2px #1DB954";
    guessInput.classList.remove("invalid");
    guessInput.classList.add("correct");
}

document.addEventListener("DOMContentLoaded", () => { setArtist() })




//volume stuff
/*
 let volume = document.querySelector("#volume-control");
 volume.addEventListener("change", function(e) {
 audio.volume = e.currentTarget.value / 100;
 })
 */

 



