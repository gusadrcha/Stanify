// https://codepen.io/nfj525/pen/rVBaab

var context;
var src;
var analyser;
var canvas;
var ctx;
var bufferLength;
var dataArray;
var WIDTH;
var HEIGHT;
var barWidth ;
var barHeight;
var x ;

export function loadVisualizer (audio){
    context = new AudioContext();
    src = context.createMediaElementSource(audio);
    analyser = context.createAnalyser();

    canvas = document.getElementById("canvas");
    // canvas.width = window.innerWidth;
    // canvas.height = window.innerHeight;
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight/4;
    ctx = canvas.getContext("2d");

    src.connect(analyser);
    analyser.connect(context.destination);

    analyser.fftSize = 256;

    bufferLength = analyser.frequencyBinCount;

    dataArray = new Uint8Array(bufferLength);

    WIDTH = canvas.width;
    HEIGHT = canvas.height;

    barWidth = (WIDTH / bufferLength) * 2.5;
    barHeight;
    x = 0;
}

export function renderFrame() {
    requestAnimationFrame(renderFrame);

    x = 0;

    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    for (var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];
        
        // var r = barHeight + (25 * (i/bufferLength));
        // var g = 250 * (i/bufferLength);
        // var b = 1000;
        
        // var r = 29 + randomIntFromInterval(1, 50);
        // var g = 185 + randomIntFromInterval(1, 50);
        // var b = 84 - randomIntFromInterval(1, 50);
        
        // GREEN
        var r = 29;
        var g = 185;
        var b = 84;
        
        ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";

        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        x += barWidth + 1;
    }
}

// https://stackoverflow.com/a/7228322
function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}