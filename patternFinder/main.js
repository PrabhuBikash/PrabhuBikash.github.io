const givenPattern = document.getElementById('partialPattern');
const patternGrid = document.getElementById('patternGrid');
const statusMessage = document.getElementById('loadingMessage');

const modal = document.getElementById("patternModal");
const modalCanvas = document.getElementById("modalCanvas");

const BATCH_SIZE = 100;

function loadAllPossiblePatterns() {
    const partialPattern = givenPattern.value.trim();
    patternGrid.innerHTML = "";
    statusMessage.innerText = "Loading patterns, please wait...";
    statusMessage.style.color = "red";
    const valid = is_Input_valid(partialPattern) // [true] or [false, errormessage]
    if (valid[0]) {
        const filepath = "database/subpatterns/length_" + partialPattern.length + ".json";

        loadJsonData(filepath).then(fileData => {
            const patterns = searchFile(partialPattern, fileData); // required patterns
            const totalPatterns = patterns.length;
            statusMessage.innerText = `0 of ${totalPatterns} patterns loaded`;
            statusMessage.style.color = "yellow";
            loadPatternsInBatches(patterns, totalPatterns, 0);

        }).catch(error => {
            statusMessage.innerText = 'Error loading patterns: ' + error.message;
        });
    } else {
        statusMessage.innerText = valid[1]; // error message
    }
}

function loadPatternsInBatches(patterns, totalPatterns, currentIndex) {
    const batchEndIndex = Math.min(currentIndex + BATCH_SIZE, totalPatterns);
    const batch = patterns.slice(currentIndex, batchEndIndex);
    displayWholebatch(batch)
    statusMessage.innerText = `${batchEndIndex} of ${totalPatterns} patterns loaded`;
    
    if (batchEndIndex < totalPatterns) {
        setTimeout(() => {loadPatternsInBatches(patterns, totalPatterns, batchEndIndex);}, 0);
    } else {
        statusMessage.innerText = `All ${totalPatterns} patterns loaded!`;
        statusMessage.style.color = "green";
    }
}

function displayWholebatch(batch){
    batch.forEach(pattern => {
        const canvas = createNumberedCanvas();
        drawPatternOnCanvas(canvas, pattern);
        canvas.addEventListener("click", () => {
            showModalWithPattern(canvas)
        });
        patternGrid.appendChild(canvas);
    });
}

function showModalWithPattern(canvas) {
    const destCtx = modalCanvas.getContext("2d");
    destCtx.clearRect(0, 0, modalCanvas.width, modalCanvas.height);
    destCtx.drawImage(canvas, 0, 0, modalCanvas.width, modalCanvas.height);
    modal.style.display = "grid";
    modal.style.placeItems = "center";
}
window.onclick = function (event) {
    const modal = document.getElementById("patternModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

window.onload = function() {
    givenPattern.value = "____";
    loadAllPossiblePatterns();
};
