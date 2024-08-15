function listpdfs(subject) {
    pdfContainer.innerHTML = ''; // Clear the PDF display
    pdfList.innerHTML = ''; // Clear the PDF list
    headingSubject.innerHTML = `NISER<i>Notes</i>: ${subject}`; // Update header text

    if (pdfData[subject]) {
        pdfData[subject].forEach(filename => {
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = filename;
            link.onclick = function () {
                showPdf(`${baseUrl}\\${subject}\\${filename}.pdf`); // Show the selected PDF in the container
            }
            pdfList.appendChild(link);  //append the link to the pdflist
        });
    } else {
        pdfList.innerHTML = 'No PDFs available for this subject.';
    }
}

function showPdf(url) {
    pdfContainer.innerHTML = '<iframe src="' + url + '#view=FitH" width="100%" height="600px" frameborder="0"></iframe>';
}