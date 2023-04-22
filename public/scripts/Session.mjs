export async function getCurrentUserArtistList()
{
    var artistList
    const response = await fetch("https://stanify.herokuapp.com/session/getArtistList")
                           .then(res => { return res.json() })
                           .then(res => { artistList = res.artistList });

    return artistList
}

export async function setCurrentUserArtistList(artistList)
{
    console.log(artistList)
    const response = await fetch("https://stanify.herokuapp.com/session/setArtistList", {
        method: "POST",
        body: JSON.stringify(artistList),
        headers: {
            "Content-type": "application/json"
        }
    })
    .catch(error => {
        console.log(error.message)
    })
}

export async function setCurrentArtist(artist)
{
    const response2 = await fetch(`https://stanify.herokuapp.com/session/updateCurrentArtist/${artist}`, {
        method: 'POST',
        headers: {
            "Content-type": "application/json; charset=UTF-8"}
    })
    
    if(response2.ok)
        console.log("Current artist updated to", artist)
}

export async function getCurrentArtist()
{
    var usersArtist = undefined;

    const response1 = await fetch('https://stanify.herokuapp.com/session/getArtist')
                            .then( res => { return res.json() })
                            .then( res => { usersArtist = res.currentArtist });

    return usersArtist;
}

export async function getUserStatistics()
{
    var userStatistics = undefined;

    const response = await fetch('https://stanify.herokuapp.com/session/getUserStatistics')
                           .then( res => { return res.json() })
                           .then( res => userStatistics = res.userStatistics )

    if(response != undefined && response.ok)
        console.log("Call was a success...")

    return userStatistics;
}

export async function setUserStatistics(userStatistics)
{
    const response = await fetch('https://stanify.herokuapp.com/session/setUserStatistics', {
        method: 'POST',
        body: JSON.stringify(userStatistics),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
}