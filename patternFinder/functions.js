//-------------------InputProcessor---------------------

function is_Input_valid(inputPattern) {
    if (inputPattern.length > 9) {
        return [
            false,
            errormessage = "Invalid input! Your pattern can't be more than 9 points. Don't use any digit twice. Try 245678913 instead of 2456789123."
        ];
    }

    for (let i = 0; i < inputPattern.length; i++) {
        const currentChar = inputPattern[i];
        
        if (!/[1-9]/.test(currentChar) && currentChar !== "_") {
            return [
                false,
                errormessage = "Invalid input! Please use digits (1-9) and underscores (_) only."
            ];
        }
    }
    return [true];
}

async function loadJsonData(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching JSON:', error);
        return null;
    }
}

function searchFile(partialPattern, possiblePatterns) {
    for (let index = 0; index < partialPattern.length; index++) {
        const digit = partialPattern[index];
        if (/[1-9]/.test(digit)) {
            possiblePatterns = possiblePatterns.filter(pattern => pattern[index] === digit);
        }
    }
    return possiblePatterns;
}

//--------------------OutputProcessor-------------------

const dotPositions = {
    1: { x: 50, y: 50 }, 2: { x: 150, y: 50 }, 3: { x: 250, y: 50 },
    4: { x: 50, y: 150 }, 5: { x: 150, y: 150 }, 6: { x: 250, y: 150 },
    7: { x: 50, y: 250 }, 8: { x: 150, y: 250 }, 9: { x: 250, y: 250 }
};

function createNumberedCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");

    // Draw numbered dots on the canvas
    ctx.font = "20px Arial";
    ctx.fillStyle = "#0000ff";
    ctx.strokeStyle = "#000";  // Black color for the circle outlines
    ctx.lineWidth = 2;

    for (let i in dotPositions) {
        const dot = dotPositions[i];
        // Draw circle for the dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 15, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.fillText(i, dot.x - 5, dot.y + 5);  // Draw the number at the center of the circle
    }

    return canvas;
}

// Function to draw a pattern on the canvas
function drawPatternOnCanvas(canvas, pattern) {
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#ff0000";  // Red color for the pattern line
    ctx.lineWidth = 4;
    
    if (pattern.length < 2) return;
    
    ctx.beginPath(); // Start drawing the pattern
    ctx.moveTo(dotPositions[pattern[0]].x, dotPositions[pattern[0]].y);
    for (let i = 1; i < pattern.length; i++) {
        const dot = dotPositions[pattern[i]];
        ctx.lineTo(dot.x, dot.y);
    }
    ctx.stroke();  // Finish the drawing

    // Draw the pattern string at the bottom of the canvas
    ctx.font = "16px Arial";
    ctx.fillStyle = "#000"; // Black text color
    ctx.textAlign = "center";
    
    // Join pattern array with arrows
    const patternString = pattern.split('').join(" → ");
    ctx.fillText(patternString, canvas.width / 2, canvas.height - 10); // Text below the pattern
}