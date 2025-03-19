
document.addEventListener("DOMContentLoaded", function() {
    drawSamples();
})

let sampledPoints = { r_theta: [], theta_theta: [], x_y: [] }; // Store points for all methods

function drawCircle(ctx, radius) {
    ctx.beginPath();
    ctx.arc(110, 110, radius, 0, Math.PI * 2);
    ctx.stroke();
}

// Theta and R Sampling (No sqrt)
function sampleThetaR(ctx) {
    let theta = Math.random() * 2 * Math.PI;
    let r = Math.random() * 90; // Uniform radial sampling
    let x = r * Math.cos(theta);
    let y = r * Math.sin(theta);
    ctx.fillRect(110 + x, 110 + y, 2, 2);
    sampledPoints.r_theta.push({ x, y });
}

// Theta theta sampling
function sampleMidpoint(ctx) {
    // Choose two random points on the circumference
    let theta1 = Math.random() * 2 * Math.PI;
    let theta2 = Math.random() * 2 * Math.PI;

    let x1 = 90 * Math.cos(theta1);
    let y1 = 90 * Math.sin(theta1);
    let x2 = 90 * Math.cos(theta2);
    let y2 = 90 * Math.sin(theta2);

    // Midpoint of the two points
    let xMid = (x1 + x2) / 2;
    let yMid = (y1 + y2) / 2;

    ctx.fillRect(110 + xMid, 110 + yMid, 2, 2);
    sampledPoints.theta_theta.push({ x: xMid, y: yMid });
}

// X, Y Sampling with Circle Check
function sampleXY(ctx) {
    let x, y;
    do {
        x = Math.random() * 180 - 90;
        y = Math.random() * 180 - 90;
    } while (x * x + y * y > 8100);
    ctx.fillRect(110 + x, 110 + y, 2, 2);
    sampledPoints.x_y.push({ x, y });
}

function drawSamples() {
    let canvas1 = document.getElementById("canvas1");
    let canvas2 = document.getElementById("canvas2");
    let canvas3 = document.getElementById("canvas3");
    let ctx1 = canvas1.getContext("2d");
    let ctx2 = canvas2.getContext("2d");
    let ctx3 = canvas3.getContext("2d");
    let sampleSize = parseInt(document.getElementById("sampleSize").value);

    ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    ctx3.clearRect(0, 0, canvas3.width, canvas3.height);

    drawCircle(ctx1, 90);
    drawCircle(ctx1, 45); // Small circle
    drawCircle(ctx2, 90);
    drawCircle(ctx2, 45); // Small circle
    drawCircle(ctx3, 90);
    drawCircle(ctx3, 45); // Small circle

    for (let i = 0; i < sampleSize; i++) {
        sampleThetaR(ctx1);
        sampleMidpoint(ctx2)
        sampleXY(ctx3);
    }
    
    calculateRatios();
}

/**
 * Calculates the ratio of points inside the small circle.
 */
function calculateRatios() {
    let countInside1 = sampledPoints.r_theta.filter(p => (p.x) ** 2 + (p.y) ** 2 <= 2025).length;
    let countInside2 = sampledPoints.theta_theta.filter(p => (p.x) ** 2 + (p.y) ** 2 <= 2025).length;
    let countInside3 = sampledPoints.x_y.filter(p => (p.x) ** 2 + (p.y) ** 2 <= 2025).length;

    let ratio1 = (countInside1 / sampledPoints.r_theta.length).toFixed(3);
    let ratio2 = (countInside2 / sampledPoints.theta_theta.length).toFixed(3);
    let ratio3 = (countInside3 / sampledPoints.x_y.length).toFixed(3);

    document.getElementById("ratio1").innerText = ratio1;
    document.getElementById("ratio2").innerText = ratio2;
    document.getElementById("ratio3").innerText = ratio3;
}
