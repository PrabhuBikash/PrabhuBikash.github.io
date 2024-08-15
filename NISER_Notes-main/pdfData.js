const pdfList = document.getElementById('pdf-list');
const pdfContainer = document.getElementById('pdf-container');
const headingSubject = document.getElementById('heading-subject');


const baseUrl = 'Notes'; // Base URL for PDF files

const pdfData = {
    'Discrete Mathematics': ['DM First Class (01-08-2024)'],
    'Real Analysis': ['RA First Class (01-08-2024)','Real Analysis 05-08-2024'],
    'Linear Algebra': ['Linear Algebra First Class'],
    'Mathematical methods I': [],
    'Theory of computation': ['TOC Assignment 0'],
    'Introduction to psychology': [],
    'Sociology of science and technology': []
};