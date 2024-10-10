// This file contains the primary functions and move dictionaries

/*
    U
L   F   R   B   = 
    D
        |0  1  2 |
    ↱---|3  4  5 |---↴
    |   |6  7  8 |   |
36 37 38|9  10 11|18 19 20|27 28 29|
39 40 41|12 13 14|21 22 23|30 31 32| ----> E
42 43 44|15 16 17|24 25 26|33 34 35|
    ↑   |45 46 47|   |
    S---|48 49 50|---↵
        |51 52 53|
            |
            ↓
            M
*/

const faceEdgeMap = {// Mapping of affected face and edge pieces for each move
    'U': { face: [0, 1, 2, 3, 4, 5, 6, 7, 8], edges: [29, 28, 27, 20, 19, 18, 11, 10, 9, 38, 37, 36] },
    'F': { face: [9, 10, 11, 12, 13, 14, 15, 16, 17], edges: [6, 7, 8, 18, 21, 24, 47, 46, 45, 44, 41, 38] }, //
    'R': { face: [18, 19, 20, 21, 22, 23, 24, 25, 26], edges: [8, 5, 2, 27, 30, 33, 53, 50, 47, 17, 14, 11] },
    'B': { face: [27, 28, 29, 30, 31, 32, 33, 34, 35], edges: [2, 1, 0, 36, 39, 42, 51, 52, 53, 26, 23, 20] },
    'L': { face: [36, 37, 38, 39, 40, 41, 42, 43, 44], edges: [0, 3, 6, 9, 12, 15, 45, 48, 51, 35, 32, 29] },
    'D': { face: [45, 46, 47, 48, 49, 50, 51, 52, 53], edges: [15, 16, 17, 24, 25, 26, 33, 34, 35, 42, 43, 44] },
    'M': { edges: [1, 4, 7, 10, 13, 16, 46, 49, 52, 34, 31, 28] },   // Middle layer (like L move) ↓
    'E': { edges: [39, 40, 41, 12, 13, 14, 21, 22, 23, 30, 31, 32] },   // Equator slice (like D move)→
    'S': { edges: [3, 4, 5, 19, 22, 25, 50, 49, 48, 43, 40, 37] }  // Slice between F and B (like F move) ↻
};

const wideMoves = {// Dictionary for wide moves and rotations
    'Dw': ['D', 'E'], 'Uw': ['U', 'E', 'E', 'E'], /* Uw = U E' = u */ 'd': ['D', 'E'], 'u': ['U', 'E', 'E', 'E'],
    'Lw': ['L', 'M'], 'Rw': ['R', 'M', 'M', 'M'], /* Rw = R M' = r */ 'l': ['L', 'M'], 'r': ['R', 'M', 'M', 'M'],
    'Fw': ['F', 'S'], 'Bw': ['B', 'S', 'S', 'S'], /* Bw = B S' = b */ 'f': ['F', 'S'], 'b': ['B', 'S', 'S', 'S'],

    'x': ['R', 'M', 'M', 'M', 'L', 'L', 'L'], // x = R M' L'
    'y': ['U', 'E', 'E', 'E', 'D', 'D', 'D'], // y = U E' D'
    'z': ['F', 'S', 'B', 'B', 'B'] // z = F S B'
};

// Rotate cube 90 degrees colckwise
function moveCube(cube, moveType) {
    let { face, edges } = faceEdgeMap[moveType] || {};
    if (face) { [
            cube[face[0]], cube[face[1]], cube[face[2]],
            cube[face[3]], cube[face[4]], cube[face[5]],
            cube[face[6]], cube[face[7]], cube[face[8]]
        ] = [
            cube[face[6]], cube[face[3]], cube[face[0]],
            cube[face[7]], cube[face[4]], cube[face[1]],
            cube[face[8]], cube[face[5]], cube[face[2]] ]; }
    
    if (edges) { [
            cube[edges[0]], cube[edges[1]], cube[edges[2]],
            cube[edges[3]], cube[edges[4]], cube[edges[5]],
            cube[edges[6]], cube[edges[7]], cube[edges[8]],
            cube[edges[9]], cube[edges[10]], cube[edges[11]]
        ] = [
            cube[edges[9]], cube[edges[10]], cube[edges[11]],
            cube[edges[0]], cube[edges[1]], cube[edges[2]],
            cube[edges[3]], cube[edges[4]], cube[edges[5]],
            cube[edges[6]], cube[edges[7]], cube[edges[8]],]; }
    return cube
}

// Find permutation cycles from scrambled cube
function findPermutationCycles(scrambled) {
    const length = scrambled.length
    const notVisited = Array(length).fill(true);
    const cycles = [];
    for (let i = 0; i < length; i++) {
         if (notVisited[i]) { 
            const cycle = [i];
            let nextelement = scrambled[i];
            while (nextelement !== i) {
                cycle.push(nextelement);
                notVisited[nextelement] = false;
                nextelement = scrambled[nextelement];
            }
            cycles.push(cycle);
        }
    }
    return cycles;
}

// Calculate Least Common Multiple (LCM)
function lcmOfArray(numbers) {
    if (numbers.length === 0) return 1; // Return 1 if no numbers to avoid error
    numbers = [...new Set(numbers)];
    return numbers.reduce((lcm, num) => lcm * num / gcd(lcm, num), 1);
}
// Helper to calculate the Greatest Common Divisor (GCD)
function gcd(a, b) {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return a;
}

function parseMoves(movesString) {
    const moveRegex = /([UDLRFBMESudlrfbmesxyz]w?)(\'?)([0-9]*)/g;
    let normalizedMoves = [];
    let match;
    
    while ((match = moveRegex.exec(movesString)) !== null) {
        const baseMove = match[1]; //of the form (U F L D B R M S E) or (u f l d b r) or (Uw Fw Lw Dw Bw rw) or (x y z)
        const isInverse = match[2] === "'";
        let count = parseInt(match[3] || '1') % 4;

        if (count === 0) continue; // Skip moves that result in 0 rotations
        if (isInverse) {count = 4 - count;} // inverse is complementary: inverse + move = 4

        // Check if baseMove is valid
        if (wideMoves[baseMove] === undefined === faceEdgeMap[baseMove]) {throw new Error(`Invalid move: ${baseMove}`);}

        for (let i = 0; i < count; i++) {normalizedMoves.push(...(wideMoves[baseMove] || [baseMove]));} // Append only RUFLDB moves to the array
    }
    return normalizedMoves
}

// Sleep function that supports aborting
function sleep(ms, signal) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {resolve();}, ms);
        if (signal) {// If the abort signal is triggered, reject the promise
            signal.addEventListener('abort', () => {
                clearTimeout(timeoutId); // Clear the timeout
                reject(); // Reject the promise
            });
        }
    });
}


const colorMap = {U: 'white', F: 'green', R: 'red', B: 'blue', L: 'orange', D: 'yellow'};

function updateCubeVisual(cube) {
    for (let i = 0; i < 54; i++) {
        const squareposition = document.getElementById(i);
        const squareRealId = cube[i];
        let faceColor;
        if (squareRealId >= 0 && squareRealId <= 8) faceColor = colorMap.U;
        else if (squareRealId >= 9 && squareRealId <= 17) faceColor = colorMap.F;
        else if (squareRealId >= 18 && squareRealId <= 26) faceColor = colorMap.R;
        else if (squareRealId >= 27 && squareRealId <= 35) faceColor = colorMap.B;
        else if (squareRealId >= 36 && squareRealId <= 44) faceColor = colorMap.L;
        else if (squareRealId >= 45 && squareRealId <= 53) faceColor = colorMap.D;
        squareposition.style.backgroundColor = faceColor;
    }
}

async function slowscramble(cube, movesequence, signal, moveText){
    for (const [i, move] of movesequence.entries()) {//movesequence.entries() to get both index and move
        await sleep(500, signal); // This will pause before applying each move
        moveText.innerHTML = movesequence.slice(0, i).join(' ') + ' <b>' + move + '</b> ' + movesequence.slice(i + 1).join(' '); // Bold current move, others are normal
        parseMoves(move).forEach(move => {cube = moveCube(cube, move);});
        updateCubeVisual(cube);
    }
    moveText.innerHTML = movesequence.join(' ');
    return cube
}

function rotatedirection(direction) {
    const cube = document.getElementById('cube');
    let currentTransform = window.getComputedStyle(cube).getPropertyValue('transform');
    if (currentTransform === 'none') {currentTransform = '';}
    cube.style.transform = direction==="reset" ? `rotateX(-20deg) rotateY(-30deg)` : currentTransform + `rotate${direction}(90deg)`;
}

// Function to cancel any ongoing task
function cancelOngoingTask() {
    if (abortController) {
        abortController.abort(); // Cancel the previous operation
    }
    abortController = new AbortController(); // Create a new abort controller
}