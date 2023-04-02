export async function getCurrentUserArtistList()
{
    var artistList
    const response = await fetch("http://localhost:8888/session/getArtistList")
                           .then(res => { return res.json() })
                           .then(res => { artistList = res.artistList });

    return artistList
}

export async function setCurrentUserArtistList(artistList)
{
    console.log(JSON.stringify(artistList))
    const response = await fetch("http://localhost:8888/session/setArtistList", {
        method: "POST",
        body: JSON.stringify(artistList),
        headers: {
            "Content-type": "application/json"
        }
    })
}

export async function setCurrentArtist(artist)
{
    const response2 = await fetch(`http://localhost:8888/session/updateCurrentArtist/${artist}`, {
        method: 'POST',
        headers: {
            "Content-type": "application/json; charset=UTF-8"}
    })
    
    if(response2.ok)
        console.log("Current artist updated to", artist)
}