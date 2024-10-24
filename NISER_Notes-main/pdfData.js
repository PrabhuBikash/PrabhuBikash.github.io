const cardContainer = document.querySelector(".card-container");
const school = document.querySelector(".school");
const courses = document.getElementById("courses");
const pdfContainer = document.getElementById("pdf-container");
const pdfList = document.getElementById("pdf-list");
const headingSubject = document.getElementById("heading-subject");
const footnote = document.getElementById("foot-note");


const baseUrl = 'Notes'; // Base URL for PDF files

const pdfData = {
    //Physics : {
    //    'Mathematical methods I': [],
    //},
    //Chemistry : {

    //},
    Mathematics : {
        'Discrete Mathematics': ['DM First Class (01-08-2024)','DM Notes upto 1st quiz (~Himanshu and Karan)'],
        'Real Analysis': ['RA First Class (01-08-2024)','Real Analysis 05-08-2024'],
        'Linear Algebra': ['Linear Algebra First Class','LA Exercises (upto 1st quiz)','LA Notes upto 1st quiz (~Rudra)','LA Notes from quiz upto midsem (~Rudra)'],
    },
    //Biology : {
        
    //},
    Humanities : {
        'Introduction to psychology': ['Introduction to psychology (Upto midsem)'],
        'Sociology of science and technology': ['Sociology of science and technology (upto midsem)']
    },
    Computer : {
        'Theory of computation': ['TOC Assignment 0'],
    },
    //Istyear : {

    //},
    //About : {

    //},
};