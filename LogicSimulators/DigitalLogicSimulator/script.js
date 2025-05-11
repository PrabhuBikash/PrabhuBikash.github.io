const mainCanvaswrapper = document.querySelector('.canvas-wrapper')
const mainCanvas = document.getElementById('canvas'); // Get reference to the mainCanvas
const EDGE_MARGIN = 20; // Margin in pixels to consider as the "edge zone"
//------------------------- while reloding -------------------------//
window.onload = function () {
    if (localStorage.getItem("BinaryLogic_theme") === "dark") {
    body.classList.add("dark-theme");
    toggleButton.textContent = "☀️ Light Mode";
  }
  const storedGateDefinitions = localStorage.getItem('BinaryLogic_gateDefinitions');
  const storedGateRelations = localStorage.getItem('BinaryLogic_gateRelations');

  if (storedGateDefinitions) {
    gateDefinitions = makeUsableGateDefinitions(storedGateDefinitions)
    console.log('Gate definitions loaded:', gateDefinitions);
  } else {
    console.log('No gate definitions found in localStorage.');
  }
  if (storedGateRelations) {
    gateRelations = makeUsableGateDefinitions(storedGateRelations)
    console.log('Gate Relations loaded:', gateRelations);
  } else {
    console.log('No gate Relations found in localStorage.');
  }
  localStorage.setItem('BinaryLogic_gateDefinitions', makeStorableGateDefinitions(gateDefinitions));
  localStorage.setItem('BinaryLogic_gateRelations', makeStorableGateDefinitions(gateRelations));
  refreshSidebar();
};


window.addEventListener('resize', updateAllWires);

function updateAllWires() {
  Object.keys(wires).forEach(id => {
    const wire = wires[id]
    const from = getElementCenterRelativeToWrapper(wire.fromPort);
    const to = getElementCenterRelativeToWrapper(wire.toPort);
    wire.wireElement.setAttribute('x1', from.x);
    wire.wireElement.setAttribute('y1', from.y);
    wire.wireElement.setAttribute('x2', to.x);
    wire.wireElement.setAttribute('y2', to.y);
  });
};



//------------------------- Input-output logic -------------------------//

// Listen for clicks inside the mainCanvas
mainCanvas.addEventListener('click', (e) => {
  const rect = mainCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (x < EDGE_MARGIN) createInput(y);
  else if (x > rect.width - EDGE_MARGIN) createOutput(y);
  else console.log('Clicked somewhere else in the mainCanvas');
});

//------------------------- Wire Logic (Clean + Snappy) -------------------------//

let isDraggingWire = false;
let wireStartPort = null;
let tempWire = null;

// Start wire drag from output-port
document.addEventListener('pointerdown', (e) => {
  if (e.target.classList.contains('output-port') | e.target.classList.contains('input-node')) {
    isDraggingWire = true;
    wireStartPort = e.target;

    const svg = document.getElementById('wire-layer');
    tempWire = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    tempWire.setAttribute('stroke', '#ff5722');
    tempWire.setAttribute('stroke-width', '3');

    const { x, y } = getElementCenterRelativeToWrapper(wireStartPort);
    tempWire.setAttribute('x1', x);
    tempWire.setAttribute('y1', y);
    tempWire.setAttribute('x2', x);
    tempWire.setAttribute('y2', y);

    svg.appendChild(tempWire);
  }
});

// Update wire end while dragging
document.addEventListener('pointermove', (e) => {
  if (isDraggingWire && tempWire) {
    const wrapperRect = mainCanvaswrapper.getBoundingClientRect();
    tempWire.setAttribute('x2', e.clientX - wrapperRect.left);
    tempWire.setAttribute('y2', e.clientY - wrapperRect.top);
  }
});

// Finish wire connection on input-port
document.addEventListener('pointerup', (e) => {
  if (e.target.wire) return;
  if (isDraggingWire && tempWire) {
    if (e.target.classList.contains('input-port') | e.target.classList.contains('output-node')) {
      if (e.target.connectedPort !== null) {tempWire.remove();return};
      const { x, y } = getElementCenterRelativeToWrapper(e.target);
      tempWire.setAttribute('x2', x);
      tempWire.setAttribute('y2', y);
      createWire(wireStartPort, e.target, tempWire);

    } else tempWire.remove();

    isDraggingWire = false;
    wireStartPort = null;
    tempWire = null;
  }
});

// Update wire positions when gates move
document.addEventListener('pointermove', updateAllWires);



//------------------------- Save gate button -------------------------//
document.getElementById('save-gate-btn').addEventListener('click', () => {
  const name = prompt("Enter a name for this gate:");
  if (!name) return;
  if (gateDefinitions[name]) { alert("Gate with same name already exists"); return };
  if (!/^[a-zA-Z0-9_]+$/.test(name)) { alert("Gate name must contain only letters, numbers, and underscores."); return; }

  try {
    gateDefinitions[name] = circuitToGate();
    const simulate_function = generateFunctionDefinition()
    if (simulate_function) gateDefinitions[name].simulate = simulate_function;
    [...mainCanvas.querySelectorAll('.logic-gate')].forEach(gate => {
      if (!gateRelations[gate.type]) gateRelations[gate.type] = new Set();
      gateRelations[gate.type].add(name)
    });
    refreshSidebar();
    localStorage.setItem('BinaryLogic_gateDefinitions', makeStorableGateDefinitions(gateDefinitions));
    localStorage.setItem('BinaryLogic_gateRelations', makeStorableGateDefinitions(gateRelations));
    // Optional: log generated function code
    console.log(name, ':' ,gateDefinitions[name]);
    alert(`Gate "${name}" saved successfully!`);
  } catch (e) {
    alert("Error in generated gate function. Check the console.");
    console.error(e);
  }
});


//-------------------------Delete Mode Logic-------------------------//
let deleteMode = false;

document.getElementById('delete-mode-toggle').addEventListener('click', () => {
  // Toggle the delete mode on the body by adding/removing the 'delete-mode' class
  deleteMode = !deleteMode;
  document.body.classList.toggle('delete-mode', deleteMode);

  // Optionally change the text on the button
  const button = document.getElementById('delete-mode-toggle');
  if (deleteMode) {
    button.innerText = 'Exit Delete Mode 🛑';  // Change text when delete mode is active
    button.classList.add('active');  // Add 'active' class to button
  } else {
    button.innerText = '🗑️ Delete Mode';  // Reset text when delete mode is inactive
    button.classList.remove('active');  // Remove 'active' class from button
  }
});


//-------------------------Download Logic.txt-------------------------//
document.getElementById('download-config-btn').addEventListener('click', () => {
  const configString = makeStorableGateDefinitions(gateDefinitions);
  document.getElementById('download-file-content').textContent = configString;
  document.getElementById('download-modal').style.display = 'block';

  // Default filename suggestion
  const defaultFilename = 'circuit-config.txt';
  document.getElementById('filename-input').value = defaultFilename;

  // Confirm download
  document.getElementById('confirm-download').onclick = () => {
    const filename = document.getElementById('filename-input').value.trim() || defaultFilename;
    const url = URL.createObjectURL(new Blob([configString], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename; // Use the filename specified by the user
    a.click();
    URL.revokeObjectURL(url);
    document.getElementById('download-modal').style.display = 'none';
  };
  document.getElementById('cancel-download').onclick = () => document.getElementById('download-modal').style.display = 'none';
});



//-------------------------Import Logic.txt-------------------------//
const modal = document.getElementById('import-modal');
document.getElementById('import-btn').addEventListener('click', () => modal.style.display = 'block');  // Display the modal
document.getElementById('import-modal-close').addEventListener('click', () => {
  document.getElementById('import-modal').style.display = 'none';
  back()
});
document.getElementById('back-btn').addEventListener('click', () => {
  back()
  document.getElementById('back-btn').style.display = 'none';
});

document.getElementById('upload-file-btn').addEventListener('click', () => document.getElementById('import-file-input').click());
document.getElementById('import-file-input').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  handleGateFileUpload(file,
    () => {alert("Gates imported successfully!");refreshSidebar();},
    (err) => {alert("Failed to import: " + err.message);}
  );
});
document.getElementById('load-preset-btn').addEventListener('click', showPresetDropdown);




//-------------------------Hard Reset-------------------------//
document.getElementById('hard-reset-btn').addEventListener('click', () => {
  if (confirm('Are you sure you want to reset everything? This cannot be undone.')) {
    Object.keys(localStorage).forEach(key => {if (key.startsWith("BinaryLogic_")) localStorage.removeItem(key);});
    location.reload();
  }
});

//-------------------------Mode Change-------------------------//
const toggleButton = document.getElementById("theme-toggle");
const body = document.body;
toggleButton.addEventListener("click", () => {
  body.classList.toggle("dark-theme");

  if (body.classList.contains("dark-theme")) {
    localStorage.setItem("theme", "dark");
    toggleButton.textContent = "☀️ Light Mode";
  } else {
    localStorage.setItem("theme", "light");
    toggleButton.textContent = "🌙 Dark Mode";
  }
});
