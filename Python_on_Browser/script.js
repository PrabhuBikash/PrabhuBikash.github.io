const output = document.getElementById("output");
const codeEditor = document.getElementById("python-code")
let pyodideReadyPromise = loadPyodide();
let initialCode;
let menuOpen = false;
let isRunning = false;

//----------------------------------- Configure Code Editor -----------------------------------//
const editor = CodeMirror.fromTextArea(codeEditor, {
  value: initialCode,
  theme: "material-darker",
  indentUnit: 2,
  tabSize: 2,
  readOnly: true, // Initially, the editor will be read-only
});
editor.setSize('100%', '100%');

//----------------------------------- Configure Terminal -----------------------------------//
const term = new Terminal({
  cols: 80,  // Set the width of the terminal
  rows: 30,  // Set the height of the terminal
  cursorBlink: true,  // Enable cursor blink
  fontFamily: "monospace",  // Set terminal font to monospace
  theme: {
    background: '#333',
  }
});
term.open(output);

//----------------------------------- Hamburger Menu -----------------------------------//
function toggleMenu(state = null) {
  const menu = document.getElementById('side-menu');
  if (state === null) state = !menu.classList.contains('active');// If state is not provided (null), toggle based on the current state
  if (state) menu.classList.add('active'); // Open the menu
  else menu.classList.remove('active'); // Close the menu
  document.querySelector('.hamburger-menu').innerHTML = state ? '✖️' : '&#9776;';// Update the hamburger icon based on the state
}

//----------------------------------- Edit/Lock -----------------------------------//
function toggleEdit() {
  const editButton = document.querySelector('.edit-btn');
  if (editor.getOption("readOnly")) {
    editor.setOption("readOnly", false);
    editButton.textContent = "🔒 Editing...";
    editButton.style.backgroundColor = "#e74c3c";
  } else {
    editor.setOption("readOnly", true);
    editButton.textContent = "✏️ Edit";
    editButton.style.backgroundColor = "#3498db"; // back to blue
  }
}

//----------------------------------- Run Code -----------------------------------//
async function runPython() {
  const runButton = document.querySelector('.run-btn');
  if (isRunning) {alert("To stop execution, just refresh the page.");return;}

  isRunning = true;
  runButton.textContent = "☐ Running...";
  runButton.style.backgroundColor = "#95a5a6";
  document.getElementById("open-image-modal-button").style.display = "none";
  term.reset();

  let pyodide = await pyodideReadyPromise;
  pyodide.setStdout({ batched: s => term.write(s) });
  pyodide.setStderr({ batched: s => term.write(s) });

  try {await pyodide.runPythonAsync(parsePythonForPyodide(editor.getValue()));
  } catch (err) {term.writeln(`\r\nError:\r\n${err}`.replace(/\n/g, '\r\n'));}

  // Reset button
  isRunning = false;
  runButton.textContent = "▶ Run";
  runButton.style.backgroundColor = "#2ecc71";
}


//----------------------------------- Reset -----------------------------------//
function resetCode() {editor.setValue(initialCode);}
function toggleInfoModal() {
  const modal = document.getElementById("info-modal");
  modal.style.display = modal.style.display === "flex" ? "none" : "flex";
}

//----------------------------------- Project Loader -----------------------------------//
function loadProjects() {
  const projectList = document.getElementById('project-list');
  projectList.innerHTML = ""; // Clear old entries

  projectListData.forEach(project => {
    const li = document.createElement('li');
    li.textContent = project.name;
    li.setAttribute("data-project-id", project.id); // <- this important
    li.onclick = () => loadProject(project);
    projectList.appendChild(li);
  });
}

async function loadProject(project) {
  try {
    const response = await fetch(project.path);
    if (!response.ok) throw new Error(response.statusText);
    const code = await response.text();
    editor.setValue(code);
    await setupProjectEnvironment(project);
    initialCode = code;
    document.querySelector("header h1").textContent = project.name;
    toggleMenu(false);
    localStorage.setItem("currentProject",JSON.stringify(project))
  } catch (error) {
    console.error("Failed to load project:", error);
    alert("Failed to load project file!\n" + error.message);
  }
}




//----------------------------------- Initial Setup -----------------------------------//
window.onload = async function (){
  loadProjects();
  globalThis.pyodide = await pyodideReadyPromise
  currentProject = localStorage.getItem("currentProject");
  currentProject ? await loadProject(JSON.parse(currentProject)): await loadProject(projectListData[0]);
  codeFixes(pyodide)
}
