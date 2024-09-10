// On page load, check if there's a saved subject, course, and PDF in localStorage
document.addEventListener("DOMContentLoaded", function () {
    const savedSubject = localStorage.getItem("currentSubject");
    const savedCourse = localStorage.getItem("currentCourse");
    const savedPdfUrl = localStorage.getItem("currentPdf");
  
    if (savedSubject) {
      loadPage(savedSubject); // Load the subject if saved
      if (savedCourse) {
        listpdfs(savedSubject, savedCourse); // Load the course if saved
        if (savedPdfUrl) {
          showPdf(savedPdfUrl); // Load the last opened PDF if saved
        }
      }
    }
  });
  
  // Function to load the page for a specific subject
  function loadPage(subject) {
    if (pdfData[subject]) {
      cardContainer.innerHTML = "";
      courses.innerHTML = "";
      school.style.display = "block";
      footnote.style.display = "block";
      pdfList.innerHTML = "<h2><i>Prabhu</i><b>Bikash</b></h2>";
      pdfContainer.innerHTML = "<p>yeah, I developed this site!</p>";
      headingSubject.innerHTML = `<button id="home" onclick="goHome()">🏠</button>NISER<i>Notes</i>: ${subject}`;
  
      // Save the current subject in localStorage
      localStorage.clear()
      localStorage.setItem("currentSubject", subject);
  
      Object.keys(pdfData[subject]).forEach((course) => {
        const button = document.createElement("button"); // Create a button element
        button.textContent = course;
        button.onclick = function () {
          listpdfs(subject, course);
        };
        courses.appendChild(button);
      });
    } else {
      alert("Nothing here for now!");
    }
  }
  
  // Function to list the PDFs for a specific course within a subject
  function listpdfs(subject, course) {
    if (pdfData[subject][course]) {
      pdfContainer.innerHTML = ""; // Clear the PDF display
      pdfList.innerHTML = ""; // Clear the PDF list
      headingSubject.innerHTML = `<button id="home" onclick="goHome()">🏠</button>NISER<i>Notes</i>: ${course}`; // Update header text
  
      // Save the current course in localStorage
      localStorage.clear()
      localStorage.setItem("currentSubject", subject);
      localStorage.setItem("currentCourse", course);
  
      pdfData[subject][course].forEach((filename) => {
        const link = document.createElement("a");
        link.href = "#";
        link.textContent = filename;
        link.onclick = function () {
          showPdf(`${baseUrl}\\${subject}\\${course}\\${filename}.pdf`); // Show the selected PDF in the container
        };
        pdfList.appendChild(link); // Append the link to the pdflist
      });
    } else {
      alert("No PDFs available for this course.");
    }
  }
  
  // Function to show the selected PDF in an iframe
  function showPdf(url) {
    pdfContainer.innerHTML =
      '<iframe src="' +
      url +
      '#view=FitH" width="100%" height="600px" frameborder="0"></iframe>';
  
    // Save the currently opened PDF URL in localStorage
    localStorage.setItem("currentPdf", url);
  }
  
  function goHome() {
    localStorage.clear(); // Clear localStorage
    location.reload(); // Reload the page
  }
  