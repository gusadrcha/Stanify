// Node.js Libraries
const express = require('express');
const router = express.Router();

router.post('/updateCurrentArtist/:artist', async (req, res) => {
    if(req.session.currentArtist)
    {
        console.log(`You're previous artist was ${req.session.currentArtist}`)

        console.log(`Now it's ${req.params.artist}`)

        req.session.currentArtist = req.params.artist
    }
    else
    {
        console.log(`Current artist updated to ${req.params.artist}`)
        req.session.currentArtist = req.params.artist
    }

    res.send("OK")
})

router.get("/getArtist", (req, res) => {
    if(req.session.currentArtist)
    {
        console.log("User has previously selected an artist")
        console.log(req.session.currentArtist)
        res.send({ currentArtist: req.session.currentArtist })
    }
    else
    {
        res.send({ currentArtist: null })
        console.log("User has NOT previously selected an artist")
    }
})

router.get("/getArtistList", (req, res) => {
    if(req.session.artistList)
    {
        console.log("User has a list of selected artists")
        console.log(req.session.artistList)
    }
    else
    {
        console.log("User does NOT have a list of selected artists")
    }

    res.send({ artistList: req.session.artistList })
})

router.post("/setArtistList", (req, res) => {
    console.log("session route: user list updated")
    req.session.artistList = req.body
    res.send("OK")
})

module.exports = router