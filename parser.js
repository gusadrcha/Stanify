var res;
var nonNullTrackCount = 0;
var nullTrackCount = 0;
var albumCount = 0;

var songs = [];

function Song(name, albumPicture, previewUrl) {
    this.name = name;
    this.albumPicture = albumPicture;
    this.previewUrl = previewUrl;
}

fetch('http://localhost:8888/spotify/search/artist/Kendrick Lamar')
    .then(response =>{
        if(!response.ok)
        {
            console.log('Something went wrong');
            return;
        }
        return response.json();
    })
    .then(async (response) =>{
        res = response;

        await parseArtist(res);
    })

async function parseArtist(res) {
    var artist = res.artistData[0];
    // var artist = new ArtistType(curArtist.name, curArtist.artistPicture, curArtist.id, curArtist.albums);
    // console.log(artist)
    artist.albums.forEach((album) => {
        album.tracks.forEach((track) => {
            if(track.previewUrl != null) {
                songs.push(new Song(track.name, album.albumPicture, track.previewUrl));

                nonNullTrackCount++;
            }
            else {
                nullTrackCount++;
            }
        })

        albumCount++;
    })

    // console.log(artist.name)
    // console.log('Available', nonNullTrackCount);
    // console.log('Not Available', nullTrackCount);
    // console.log('Album Count', albumCount);

    console.log(songs)
    
}