const mainCanvas = document.getElementById('canvas');
const svg = document.getElementById('wire-layer');
//------------------------- while reloding -------------------------//
window.onload = function () {
  const storedSymbols = localStorage.getItem(`symbols`);

  // Initialize symbols and colors if found
  if (storedSymbols) {
    symbols = JSON.parse(storedSymbols);
    metadata = JSON.stringify(symbols);
    console.log('Symbols loaded:', symbols);
  } else {
    console.log('No symbols found in localStorage.');
  }

  const storedGateDefinitions = localStorage.getItem(`${metadata}_gateDefinitions`);
  const storedGateRelations = localStorage.getItem(`${metadata}_gateRelations`);
  const storedColors = localStorage.getItem(`${metadata}_colors`);
  
  // Initialize gate definitions if found
  if (storedGateDefinitions) {
    gateDefinitions = makeUsableGateDefinitions(storedGateDefinitions);
    console.log('Gate definitions loaded:', gateDefinitions);
  } else {
    console.log('No gate definitions found in localStorage.');
  }

  // Initialize gate relations if found
  if (storedGateRelations) {
    gateRelations = makeUsableGateDefinitions(storedGateRelations);
    console.log('Gate Relations loaded:', gateRelations);
  } else {
    console.log('No gate Relations found in localStorage.');
  }

  if (storedColors) {
    colors = JSON.parse(storedColors);
    console.log('Colors loaded:', colors);
  } else {
    console.log('No colors found in localStorage.');
  }

  // Ensure gate definitions and relations are saved in localStorage
  localStorage.setItem(`${metadata}_gateDefinitions`, makeStorableGateDefinitions(gateDefinitions));
  localStorage.setItem(`${metadata}_gateRelations`, makeStorableGateDefinitions(gateRelations));
  localStorage.setItem(`symbols`, JSON.stringify(symbols));
  localStorage.setItem(`${metadata}_colors`, JSON.stringify(colors));
  
  document.getElementById('title').textContent = `Base ${symbols.length} Logic`;
  refreshSidebar();
};


//--------------------------delay Input handler---------------------------------//
let userDelay = 0;
document.getElementById("delay-input").addEventListener("input", e => userDelay = parseInt(e.target.value) || 0);

//------------------------- Save gate button -------------------------//
document.getElementById('save-gate-btn').addEventListener('click', () => {
  const name = prompt("Enter a name for this gate:");
  if (!name) return;
  if (gateDefinitions[name]) { alert("Gate with same name already exists"); return };
  if (!/^[a-zA-Z0-9_]+$/.test(name)) { alert("Gate name must contain only letters, numbers, and underscores."); return; }

  try {
    gateDefinitions[name] = circuitToGate();
    const simulate_function = generateFunctionDefinition();
    if (simulate_function) gateDefinitions[name].simulate = simulate_function;
    [...mainCanvas.querySelectorAll('.logic-gate')].forEach(gate => {
      if (!gateRelations[gate.dataset.type]) gateRelations[gate.dataset.type] = [];
      gateRelations[gate.dataset.type].push(name)
    });
    refreshSidebar();
    localStorage.setItem(`${metadata}_gateDefinitions`, makeStorableGateDefinitions(gateDefinitions));
    localStorage.setItem(`${metadata}_gateRelations`, makeStorableGateDefinitions(gateRelations));
    console.log(name, ':' ,gateDefinitions[name]);
    alert(`Gate "${name}" saved successfully!`);
  } catch (e) {
    alert("Error in generated gate function. Check the console.");
    console.error(e);
  }
});

//--------------------------delete mode handler---------------------------------//
let deleteMode = false;
document.getElementById('delete-mode-toggle').addEventListener('click', () => {
  deleteMode = !deleteMode;
  document.body.classList.toggle('delete-mode', deleteMode);
});

//--------------------------Reset All---------------------------------//
document.getElementById('reset-btn').addEventListener('click', () => document.getElementById('reset-modal').style.display = 'flex');
document.getElementById('cancel-reset-btn').addEventListener('click', () => document.getElementById('reset-modal').style.display = 'none');
document.getElementById('soft-reset-btn').addEventListener('click', () => {
  if (confirm('Are you sure you want to reset the world? Your custom gates and settings will be lost, but the preset world will remain intact.')) {
    localStorage.setItem(`${metadata}_gateDefinitions`, makeStorableGateDefinitions(presetLibrary["Basis Pack (Accidentally deleted? no worries!)"]));
    localStorage.setItem(`${metadata}_gateRelations`, makeStorableGateDefinitions({}));
    location.reload();
  }
});

// Handle the hard reset (clear everything)
document.getElementById('hard-reset-btn').addEventListener('click', () => {
  if (confirm('Are you sure you want to reset everything? This cannot be undone!')) {
    Object.keys(localStorage).forEach(key => {if (key.startsWith(`${metadata}_`)) localStorage.removeItem(key);});
    window.location.href = "../";
  }
});



//-------------------------Download Logic.txt-------------------------//
document.getElementById('download-config-btn').addEventListener('click', () => {
  const configString = `metadata: ${metadata}\n\n` + makeStorableGateDefinitions(gateDefinitions);
  document.getElementById('download-file-content').textContent = configString.replaceAll('\\r\\n','\n');
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
    a.download = filename;
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


document.addEventListener('contextmenu', (e) => {
  e.stopPropagation();
  console.log('Context menu triggered on:', e.target);
  console.log('Element stack under cursor:', document.elementsFromPoint(e.clientX, e.clientY));
});
