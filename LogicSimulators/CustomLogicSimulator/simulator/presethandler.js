function handleGateFileUpload(file, onSuccess = () => {}, onError = () => {}) {
  if (!file.name.endsWith('.txt') && !file.name.endsWith('.json')) {
    return onError(new Error("Invalid file type. Please upload a .txt or .json file."));
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const raw = e.target.result;
      let parsed;
      
      // 🔍 Step 1: Extract metadata
      const metadataMatch = raw.match(/^metadata:\s*(.*)$/m);
      if (!metadataMatch) {
        if (!confirm("No metadata found in the file. Are you sure you want to import it anyway?")) {
          return onError(new Error("Import cancelled by user due to missing metadata."));
        }
      } else {
        if (!metadataMatch[1] || metadata !== metadataMatch[1]) {
          if (!confirm("The symbols in this file differ from your current configuration. Do you still want to import?")) {
            return onError(new Error("Import cancelled due to symbol mismatch."));
          }
        }
      }

      // ✂️ Step 2: Remove metadata line before parsing JSON
      const cleanedRaw = raw.replace(/^metadata:.*$/m, '').trim();

      try {parsed = JSON.parse(raw);}
      catch {throw new Error("File content is not valid JSON.");}

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
      const allKnownGates = new Set([
        ...Object.keys(gateDefinitions), // existing
        ...Object.keys(incomingDefs)     // incoming
      ]);

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
      localStorage.setItem(`${metadata}_gateDefinitions`, makeStorableGateDefinitions(gateDefinitions));
      localStorage.setItem(`${metadata}_gateRelations`, makeStorableGateDefinitions(gateRelations));
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
  document.getElementById('preset-selector').style.display = 'block';
  const presetListDiv = document.getElementById('preset-list');// Show the preset section
  presetListDiv.innerHTML = ''; // Clear any previous list
  
  Object.keys(presetLibrary).forEach(presetName => {
    const presetButton = Object.assign(document.createElement('button'),{textContent: `📚 ${presetName}`});
    const gateListDiv = document.createElement('div');gateListDiv.classList.add('preset-gates-list');// Create a dropdown for gates under this preset
    presetButton.addEventListener('click', () => {// Close all other presets & Toggle the current gate list
      document.querySelectorAll('.preset-gates-list').forEach(gateList => {if (gateList !== gateListDiv) gateList.style.display = 'none';}); // Close all other dropdowns
      if (gateListDiv.style.display === "block") gateListDiv.style.display = "none";   // Hide the element
      else gateListDiv.style.display = "block"; // Show the element
    });

    // Create the add button for the entire preset (Install all gates in this preset)
    const installAllBtn = Object.assign(document.createElement('button'),{textContent: '➕ Add All',title: `Add ${presetName}`,onclick:() => installAllGates(presetName)});
    installAllBtn.style.cssText = 'font-size: 1em; padding: 4px 8px; width: auto; height: auto; min-width: 32px; min-height: 32px; cursor: pointer;';
    gateListDiv.appendChild(installAllBtn);// Append the Install All button to the preset list

    Object.keys(presetLibrary[presetName]).forEach(gateName => {
      const gateItem = document.createElement('div');
      gateItem.style.display = 'flex';
      gateItem.style.alignItems = 'center'; // Align items vertically centered
      gateItem.style.justifyContent = 'space-between'; // Space between the gate name and add button
      gateItem.style.marginBottom = '4px';
      gateItem.style.padding = '6px';
      gateItem.style.border = '1px solid #ddd'; // Optional: Add a border between each gate item
      gateItem.style.borderRadius = '5px';
      const gateDefinition = presetLibrary[presetName][gateName];
      gateItem.title = gateDefinition.simulate ? gateDefinition.simulate.toString() : JSON.stringify(gateDefinition, null, 2);

      // Gate name styling
      const gateLabel = document.createElement('span');
      gateLabel.textContent = gateName;
      gateLabel.style.fontSize = '1em'; 
      gateLabel.style.color = 'white'; 

      // Create the add button
      const addBtn = document.createElement('button');
      addBtn.textContent = '➕';
      addBtn.title = `Add ${gateName}`;
      addBtn.style.cssText = 'font-size: 1em; padding: 4px 8px; width: auto; height: auto; min-width: 32px; min-height: 32px; cursor: pointer;';
      addBtn.addEventListener('click', (e) => { e.stopPropagation(); handleGateSelect(presetName, gateName); });
        // Append gate label and add button
      gateItem.append(gateLabel,addBtn);
      gateListDiv.appendChild(gateItem);
    });
    // Append the gate list to the preset button
    presetButton.appendChild(gateListDiv);
    presetListDiv.appendChild(presetButton);
  });
  document.getElementById('import-modal').style.minHeight = '350px';// Adjust the modal size dynamically
}




function handleGateSelect(presetName, gateName) {
  const selectedGate = presetLibrary[presetName][gateName];
  gateDefinitions[gateName] = selectedGate;
  localStorage.setItem(`${metadata}_gateDefinitions`, makeStorableGateDefinitions(gateDefinitions));
  refreshSidebar();
  alert(`"${gateName}" have been added!`);// Optionally, update UI to reflect the added gates
}

function installAllGates(presetName) {
  gateDefinitions = { ...gateDefinitions, ...presetLibrary[presetName] };
  localStorage.setItem(`${metadata}_gateDefinitions`, makeStorableGateDefinitions(gateDefinitions));
  refreshSidebar()
  alert(`All gates from preset "${presetName}" have been added!`);// Optionally, update UI to reflect the added gates
}

function showGateDetails(presetName, gateName) {
  // 1. Store the selected gate in localStorage under gateDefinitions
  gateDefinitions[gateName] = presetLibrary[presetName][gateName];
  localStorage.setItem(`${metadata}_gateDefinitions`, makeStorableGateDefinitions(gateDefinitions));

  // 2. Let the next page know which gate to show
  sessionStorage.setItem(`${metadata}_selectedGate`, JSON.stringify([gateName]));

  // 3. Open the internals viewer
  window.open('/gate-internals/gate-internals.html', '_blank');

  // 4. Remove it after a delay (if needed)
  setTimeout(() => {
    delete gateDefinitions[gateName];
    localStorage.setItem(`${metadata}_gateDefinitions`, makeStorableGateDefinitions(gateDefinitions));
  }, 1000); // Give it 1 second before cleanup
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
      if (gateType == "INPUT" || gateType == "OUTPUT") return;// Skip INPUT/OUTPUT pseudo-gates entirely
      if (!relations[gateType]) relations[gateType] = [];// Initialize relation map if needed
      relations[gateType].push(gateName);// Add dependent if not already present
    });
  }
  return relations;
}


