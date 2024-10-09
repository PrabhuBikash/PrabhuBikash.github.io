// This is the main script that interacts with the HTML elements

document.getElementById('submitButton').addEventListener('click', () => {
    const input = document.getElementById('moveInput').value;
    const resultText = document.getElementById('resultText');

    try {
        const normalizedMoves = parseMoves(input); // parseMoves handles spaces

        let cube = Array.from(Array(54).keys()); // Initialize cube in solved state
        updateCubeVisual(cube);
        normalizedMoves.forEach(move => {
            cube = moveCube(cube, move);
            updateCubeVisual(cube);
        }); // Apply each move to the cube

        const cycleLengthList = findPermutationCycles(cube).map(cycle => cycle.length);//.filter(length => length > 1);
        resultText.textContent = `Number of iterations to return to original state: LCM of ${cycleLengthList} = ${lcmOfArray(cycleLengthList)}`;
    } catch (error) {
        resultText.textContent = `Error: ${error.message}`;
    }
});


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

function rotatedirection(direction) {
    const cube = document.getElementById('cube');
    let currentTransform = window.getComputedStyle(cube).getPropertyValue('transform');
    if (currentTransform === 'none') {currentTransform = '';}
    cube.style.transform = currentTransform + `rotate${direction}(90deg)`;
}

window.onload = updateCubeVisual(Array.from(Array(54).keys()));