// DOM interaction
document.getElementById('generateBtn').addEventListener('click', MAIN);
document.getElementById('sequenceInput').addEventListener('keypress', (event) => {if (event.key === 'Enter') MAIN()});
document.getElementById('predictCount').addEventListener('keypress', (event) => {if (event.key === 'Enter') MAIN()});



// Helper function to calculate binomial coefficient: n choose k
function binomialCoeff(n, k) {
    if (k > n) return 0; // If k is greater than n, the coefficient is 0
    k = Math.min(k, n - k); // Take advantage of symmetry
    let numerator = 1;
    let denominator = 1;
    for (let i = 1; i <= k; i++) { // k = n => k = 0 => skip loop
        numerator *= (n - i + 1);
        denominator *= i;
    }
    return numerator / denominator; // Return the binomial coefficient
}


// Generate the coefficients using finite differences
function generateCoefficients(sequence) {
    let differences = [sequence]; // Start with the original sequence

    while (new Set(sequence).size > 1) { // Continue until all values become constant
        sequence = sequence.slice(1).map((num, i) => num - sequence[i]);
        differences.push(sequence);
    }
    return differences.map(seq => seq[0]); // Return the first element of each difference sequence
}

// Construct the polynomial formula as a string using binomial coefficients and finite differences
function constructPolynomial(coefficients) {
    return {
        Formula: coefficients.reduce((formula, coeff, i) => {
            if (coeff === 0) return formula; // Skip zero coefficients
            const term = `${Math.abs(coeff)} <sup>n</sup>C<sub>${i}</sub>`; // Create the term string
            return formula ? `${formula} ${coeff < 0 ? '-' : '+'} ${term}` : `${coeff < 0 ? '-' : ''}${term}`; // Append with sign
        }, '') || '0',

        evaluate: n => coefficients.reduce((sum, coeff, i) => sum + coeff * binomialCoeff(n, i), 0) // Function to evaluate the polynomial for a given n
    };
}

// Function to generate the polynomial
function MAIN() {
    const inputSequence = document.getElementById('sequenceInput').value.split(',').map(num => parseInt(num.trim())).filter(num => !isNaN(num));
    const predictCount = parseInt(document.getElementById('predictCount').value);

    if (inputSequence.length === 0 || isNaN(predictCount) || predictCount < 1) {
        alert('Please enter a valid sequence and prediction count.');
        return;
    }

    const polynomial = constructPolynomial(generateCoefficients(inputSequence)); // Construct polynomial formula and evaluation function
    let predictedTerms = [];
    for (let i = 0; i < predictCount; i++) { predictedTerms.push(polynomial.evaluate(i)); }
    
    // Display the formula and predicted terms
    document.getElementById('result').innerHTML = `
        <p>Polynomial Function: f(n) = ${polynomial.Formula}</p>
        <p>First ${predictCount} Terms: ${predictedTerms.join(', ')}</p>
    `;
};
