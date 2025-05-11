function handleGateFileUpload(file, onSuccess = () => {}, onError = () => {}) {
    // ✅ Step 1: File type check
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.json')) {
      const err = new Error("Invalid file type. Please upload a .txt or .json file.");
      onError(err);
      return;
    }
  
    const reader = new FileReader();
  
    reader.onload = function (e) {
      try {
        const raw = e.target.result;
        let parsed;
  
        // ✅ Step 2: Try parsing JSON
        try {
          parsed = JSON.parse(raw);
        } catch (jsonErr) {
          throw new Error("File content is not valid JSON.");
        }
  
        // ✅ Step 3: Structural validation
        if (typeof parsed !== 'object' || Array.isArray(parsed)) {
          throw new Error("Invalid gate file format: should be an object.");
        }
  
        for (const [key, val] of Object.entries(parsed)) {
          if (typeof val !== 'object') {
            throw new Error(`Invalid gate definition for "${key}".`);
          }
        }
  
        // 🧠 Extract gate dependencies from incoming gates
        const incomingDefs = makeUsableGateDefinitions(raw);
        const allKnownGates = new Set([...Object.keys(gateDefinitions), ...Object.keys(incomingDefs)]);
        const incomingDeps = extractGateRelations(incomingDefs);

        const missingDeps = [];
        for (const [baseGate, dependentGates] of Object.entries(incomingDeps)) {
          if (!allKnownGates.has(baseGate)) {
            for (const dependent of dependentGates) {
              missingDeps.push(`"${baseGate}" (required by "${dependent}")`);
            }
          }
        }
        
        if (missingDeps.length > 0) {
          throw new Error(
            "Import failed due to missing gate dependencies:\n\n" +
            missingDeps.join("\n")
          );
        }

        // ✅ All good — save to localStorage
        gateDefinitions = { ...gateDefinitions, ...incomingDefs };
        gateRelations = { ...gateRelations, ...incomingDeps };
        localStorage.setItem('BinaryLogic_gateDefinitions', makeStorableGateDefinitions(gateDefinitions));
        localStorage.setItem('BinaryLogic_gateRelations', makeStorableGateDefinitions(gateRelations));
        onSuccess();
  
      } catch (err) {
        console.error("Error during upload:", err);
        onError(err);
      }
    };
    reader.readAsText(file);
  }
  



function showPresetDropdown() {
  // Hide initial buttons
  document.getElementById('upload-file-btn').style.display = 'none';
  document.getElementById('load-preset-btn').style.display = 'none';
  document.getElementById('back-btn').style.display = 'inline-block';

  // Show the preset section
  const presetSelector = document.getElementById('preset-selector');presetSelector.style.display = 'block';
  const presetListDiv = document.getElementById('preset-list');presetListDiv.innerHTML = '';
  
  Object.keys(presetLibrary).forEach(presetName => {
    const presetButton = document.createElement('button');
    presetButton.textContent = `📚 ${presetName}`;

    // Create a dropdown for gates under this preset
    const gateListDiv = document.createElement('div');
    presetButton.addEventListener('click', () => {
      if (gateListDiv.style.display === "none") gateListDiv.style.display = "block";
      else gateListDiv.style.display = "none";
    });
    gateListDiv.classList.add('preset-gates-list');

    // Create the add button for the entire preset (Install all gates in this preset)
    const installAllBtn = document.createElement('button');
    installAllBtn.textContent = '➕ Add All';
    installAllBtn.title = `Add ${presetName}`;
    installAllBtn.style.cssText = 'font-size: 1em; padding: 4px 8px; width: auto; height: auto; min-width: 32px; min-height: 32px; cursor: pointer; flex-shrink: 0; white-space: nowrap;';
    installAllBtn.addEventListener('click', () => installAllGates(presetName));

    // Append the Install All button to the preset list
    gateListDiv.appendChild(installAllBtn);
    
    Object.keys(presetLibrary[presetName]).forEach(gateName => {
        const gateItem = document.createElement('div');
        gateItem.style.display = 'flex';
        gateItem.style.alignItems = 'center';
        gateItem.style.justifyContent = 'space-between';
        gateItem.style.marginBottom = '4px';
        gateItem.style.padding = '6px';
        gateItem.style.border = '1px solid #ddd';
        gateItem.style.borderRadius = '5px';
        const gateDefinition = presetLibrary[presetName][gateName];
        gateItem.title = gateDefinition.simulate ? gateDefinition.simulate.toString() : JSON.stringify(gateDefinition, null, 2);
        gateItem.addEventListener('click', (e) => {if (e.target !== addBtn) {e.stopPropagation();showGateDetails(presetName, gateName);};});
        
        // Add a class for gate name styling (optional to use external CSS)
        const gateLabel = document.createElement('span');
        gateLabel.textContent = gateName;
        gateLabel.style.fontSize = '1em';
        gateLabel.style.color = 'white';
      
        // Create the add button
        const addBtn = document.createElement('button');
        addBtn.textContent = '➕';
        addBtn.title = `Add ${gateName}`;
        addBtn.style.cssText = 'font-size: 1em; padding: 4px 8px; width: auto; height: auto; min-width: 32px; min-height: 32px; cursor: pointer; flex-shrink: 0; white-space: nowrap;';
        addBtn.addEventListener('click', (e) => {e.stopPropagation();handleGateSelect(presetName, gateName);});
      
        // Append the label and add button to gate item
        gateItem.appendChild(gateLabel);
        gateItem.appendChild(addBtn);
        gateListDiv.appendChild(gateItem);
    });
    presetButton.appendChild(gateListDiv);
    presetListDiv.appendChild(presetButton);
  });
  document.getElementById('import-modal').style.minHeight = '350px';
}


function handleGateSelect(presetName, gateName) {
  const selectedGate = presetLibrary[presetName][gateName];
  gateDefinitions[gateName] = selectedGate;
  localStorage.setItem('BinaryLogic_gateDefinitions', makeStorableGateDefinitions(gateDefinitions));
  refreshSidebar();
}

function installAllGates(presetName) {
        gateDefinitions = { ...gateDefinitions, ...presetLibrary[presetName] };
  localStorage.setItem('BinaryLogic_gateDefinitions', makeStorableGateDefinitions(gateDefinitions));
  refreshSidebar()

  // Optionally, update UI to reflect the added gates
  alert(`All gates from preset "${presetName}" have been added!`);
}

function showGateDetails(presetName, gateName) {
  // 1. Store the selected gate in localStorage under gateDefinitions
  gateDefinitions[gateName] = presetLibrary[presetName][gateName];
  localStorage.setItem('BinaryLogic_gateDefinitions', makeStorableGateDefinitions(gateDefinitions));

  // 2. Let the next page know which gate to show
  sessionStorage.setItem('BinaryLogic_selectedGate', JSON.stringify([gateName]));

  // 3. Open the internals viewer
  window.open('/gate-internals/gate-internals.html', '_blank');

  // 4. Remove it after a delay
  setTimeout(() => {
    delete gateDefinitions[gateName];
    localStorage.setItem('BinaryLogic_gateDefinitions', makeStorableGateDefinitions(gateDefinitions));
  }, 1000);
};


function back(){
  document.getElementById('import-modal').style.minHeight = 'auto';  // Revert to original height
  document.getElementById('upload-file-btn').style.display = 'inline-block';
  document.getElementById('load-preset-btn').style.display = 'inline-block';
  document.getElementById('preset-selector').style.display = 'none';
  document.getElementById('preset-list').innerHTML = '';
}

//--------------------------Regenerate gateRelations---------------------------------//
function extractGateRelations(gateDefs) {
  const relations = {};

  for (const [gateName, def] of Object.entries(gateDefs)) {
    if (!def.Circuit || !Array.isArray(def.Circuit.wires)) continue;

    def.Circuit.gates.forEach(gate => {
      const gateType = gate.id.split('-')[0];
      if (gateType == "INPUT" || gateType == "OUTPUT") return;
      if (!relations[gateType]) relations[gateType] = new Set();
      relations[gateType].add(gateName);
    });
  }
  return relations;
}

