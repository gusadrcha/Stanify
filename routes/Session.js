// Node.js Libraries
const express = require('express');
const router = express.Router();

router.post('/updateCurrentArtist/:artist', (req, res) => {
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

    res.redirect('back')
})

module.exports = router