// This is the main script that interacts with the HTML elements
let abortController; // Variable to hold the current abort controller

// Function to handle the submit button click
async function handleSubmit() {
    const input = document.getElementById('moveInput').value;
    const slowmo = document.getElementById('slowmo').checked;
    const resultText = document.getElementById('resultText');
    const counter = document.getElementById('counter');
    const moveText = document.getElementById('moveText');
    cancelOngoingTask();// Cancel any ongoing task
    resultText.textContent = `Result will be shown after the scramble`;
    counter.textContent = `1st iteration`;
    moveText.innerHTML = input;

    try {
        let cube = Array.from(Array(54).keys()); // Initialize cube in solved state
        updateCubeVisual(cube);
        parseMoves(input).forEach(move => {cube = moveCube(cube, move);});
        const cycleLengthList = findPermutationCycles(cube).map(cycle => cycle.length);//.filter(length => length > 1);
        resultText.textContent = `Number of iterations to return to original state: LCM of ${cycleLengthList} = ${lcmOfArray(cycleLengthList)}`;

        if (slowmo){await slowscramble(Array.from(Array(54).keys()), input.split(" "), abortController.signal, moveText)}
        else{updateCubeVisual(cube)}
    } catch (error) {
        resultText.textContent = `Error: ${error.message || 'An unknown error occurred'}`;
    }
};

// Function to handle the iteration button click
async function handleIteration() {
    const input = document.getElementById('moveInput').value;
    const showsteps = document.getElementById('showsteps').checked;
    const slowmo = document.getElementById('slowmo').checked;
    const count = parseInt(document.getElementById('numberofiteration').value) || 1;
    const counter = document.getElementById('counter');
    const moveText = document.getElementById('moveText');
    moveText.innerHTML = input;
    let cube = Array.from(Array(54).keys());
    cancelOngoingTask();// Cancel any ongoing task
    counter.textContent = `1st iteration`;

    try {
        if (showsteps && slowmo) {
            const movesequence = input.split(" ")
            for (let i = 0; i < count; i++) {
                counter.textContent = i === 0 ? `1st iteration` : i === 1 ? `2nd iteration` : i === 2 ? `3rd iteration` : `${i + 1}th iteration`;
                cube = await slowscramble(cube, movesequence, abortController.signal, moveText);
            }
        } else {
            const movesequence = parseMoves(input)
            for (let i = 0; i < count; i++) {
                if (showsteps) {await sleep(500, abortController.signal);}
                counter.textContent = i === 0 ? `1st iteration` : i === 1 ? `2nd iteration` : i === 2 ? `3rd iteration` : `${i + 1}th iteration`;
                movesequence.forEach(move => {cube = moveCube(cube, move);})
                updateCubeVisual(cube);
            }
        }
    } catch (error) {
        resultText.textContent = `Error: ${error.message || 'An unknown error occurred'}`;
    }
};

function generateRandomMoveSequence() {
    const moves = ['R', 'L', 'U', 'D', 'F', 'B','r', 'l', 'u', 'd', 'f', 'b', 'M', 'E', 'S'];
    const directions = ['', "'", '2']; // Normal, prime (inverted), and double moves
    const numberOfMoves = Math.floor(Math.random() * 20) + 1; // The length of the sequence
    let randomMoves = [];

    for (let i = 0; i < numberOfMoves; i++) {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        randomMoves.push(randomMove + randomDirection);
    }
    document.getElementById('moveInput').value = randomMoves.join(' ');
}

window.onload = () => {
    updateCubeVisual(Array.from(Array(54).keys()));
    document.getElementById('submitButton').addEventListener('click', handleSubmit);
    document.getElementById('iterate').addEventListener('click', handleIteration);
    document.getElementById('generateRandomMoveButton').addEventListener('click', generateRandomMoveSequence);
} 