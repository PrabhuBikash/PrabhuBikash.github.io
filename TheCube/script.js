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

//Viewswitch 2D <-> 3D
const cube = document.getElementById('cube');
const switchViewButton = document.getElementById('switchViewButton');
const axisbuttons = document.getElementById('axisbuttons');
let isFlat = false;

function switchView() {
    if (isFlat) {
        // Switch back to 3D cube view
        cube.style.width = "30vh";
        cube.style.height = "30vh";
        axisbuttons.style.display = "block";
        cube.style.transform = `rotateX(-20deg) rotateY(-30deg)`;
        cube.classList.remove('flat');
        switchViewButton.textContent = 'Switch to 2D Net View';
    } else {
        // Flatten the cube into 2D net view
        cube.style.width = "10vh";
        cube.style.height = "10vh";
        axisbuttons.style.display = "none";
        cube.style.transform = `rotateX(0deg) rotateY(0deg)`;
        cube.classList.add('flat');
        switchViewButton.textContent = 'Switch to 3D Cube View';
    }
    isFlat = !isFlat;
}

// rotate with mouse
let isDragging = false;
let startX, startY;
let rotationX = 0, rotationY = 0;

function handleDragStart(e) {
    isDragging = true;
    startX = e.clientX || e.touches[0].clientX;
    startY = e.clientY || e.touches[0].clientY;
}

function handleDragMove(e) {
    if (isDragging && !isFlat) {
        const currentX = e.clientX || e.touches[0].clientX;
        const currentY = e.clientY || e.touches[0].clientY;

        const deltaX = currentX - startX;
        const deltaY = currentY - startY;

        rotationY += deltaX * 0.5;
        rotationX -= deltaY * 0.5;

        cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
        startX = currentX;
        startY = currentY;
    }
}

function handleDragEnd() {
    isDragging = false;
    rotatedirection('reset');
}

// Event listeners for pc
document.addEventListener('mousedown', handleDragStart);
document.addEventListener('mousemove', handleDragMove);
document.addEventListener('mouseup', handleDragEnd);
// Event listeners for Android
document.addEventListener('touchstart', handleDragStart);
document.addEventListener('touchmove', handleDragMove);
document.addEventListener('touchend', handleDragEnd);



// windows on start/refresh
window.onload = () => {
    updateCubeVisual(Array.from(Array(54).keys()));
    rotatedirection('reset');
    document.getElementById('submitButton').addEventListener('click', handleSubmit);
    document.getElementById('iterate').addEventListener('click', handleIteration);
    document.getElementById('generateRandomMoveButton').addEventListener('click', generateRandomMoveSequence);
}
