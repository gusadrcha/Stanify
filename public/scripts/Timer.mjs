// https://foolishdeveloper.com/create-a-simple-stopwatch-using-javascript-tutorial-code/
let [milliseconds,seconds] = [0,0];
let timerRef = document.getElementById("timer-display");
let int = null;

export function startTimer() {
    if(int!==null){
        clearInterval(int);
    }
    int = setInterval(displayTimer,10);
}

export function pauseTimer() {
    clearInterval(int);
    return [seconds, milliseconds];
}

export function resetTimer() {
    clearInterval(int);
    [milliseconds,seconds] = [0,0];
    timerRef.innerHTML = '00 : 00';
}

function displayTimer(){
    milliseconds+=1;
    if(milliseconds == 100){
        milliseconds = 0;
        seconds++;
    }
    let s = seconds < 10 ? "0" + seconds : seconds;
    let ms = milliseconds < 10 ? "0" + milliseconds : milliseconds;

    // Replay can 
    if(s % 30 == 0 && ms == 0){
        pauseTimer();
    }

    timerRef.innerHTML = `${s} : ${ms}`;
}