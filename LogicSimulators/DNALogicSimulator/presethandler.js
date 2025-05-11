function handleGateFileUpload(file, onSuccess = () => {}, onError = () => {}) {
  if (!file.name.endsWith('.txt') && !file.name.endsWith('.json')) {
    return onError(new Error("Invalid file type. Please upload a .txt or .json file."));
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const raw = e.target.result;
      let parsed;

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
      const allKnownGates = new Set([...Object.keys(gateDefinitions),...Object.keys(incomingDefs)]);
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
      localStorage.setItem('DNA_gateDefinitions', makeStorableGateDefinitions(gateDefinitions));
      localStorage.setItem('DNA_gateRelations', makeStorableGateDefinitions(gateRelations));
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
  const presetListDiv = document.getElementById('preset-list');
  presetListDiv.innerHTML = '';
  
  Object.keys(presetLibrary).forEach(presetName => {
    const presetButton = Object.assign(document.createElement('button'),{textContent: `📚 ${presetName}`});
    const gateListDiv = document.createElement('div');gateListDiv.classList.add('preset-gates-list');
    presetButton.addEventListener('click', () => {
      document.querySelectorAll('.preset-gates-list').forEach(gateList => {if (gateList !== gateListDiv) gateList.style.display = 'none';});
      if (gateListDiv.style.display === "block") gateListDiv.style.display = "none";
      else gateListDiv.style.display = "block";
    });

    // Create the add button for the entire preset (Install all gates in this preset)
    const installAllBtn = Object.assign(document.createElement('button'),{textContent: '➕ Add All',title: `Add ${presetName}`,onclick:() => installAllGates(presetName)});
    installAllBtn.style.cssText = 'font-size: 1em; padding: 4px 8px; width: auto; height: auto; min-width: 32px; min-height: 32px; cursor: pointer;';
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
      gateItem.append(gateLabel,addBtn);
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
  localStorage.setItem('DNA_gateDefinitions', makeStorableGateDefinitions(gateDefinitions));
  refreshSidebar();
  alert(`"${gateName}" have been added!`);
}

function installAllGates(presetName) {
  gateDefinitions = { ...gateDefinitions, ...presetLibrary[presetName] };
  localStorage.setItem('DNA_gateDefinitions', makeStorableGateDefinitions(gateDefinitions));
  refreshSidebar()
  alert(`All gates from preset "${presetName}" have been added!`);
}

function showGateDetails(presetName, gateName) {
  // 1. Store the selected gate in localStorage under gateDefinitions
  gateDefinitions[gateName] = presetLibrary[presetName][gateName];
  localStorage.setItem('DNA_gateDefinitions', makeStorableGateDefinitions(gateDefinitions));

  // 2. Let the next page know which gate to show
  sessionStorage.setItem('DNA_selectedGate', JSON.stringify([gateName]));

  // 3. Open the internals viewer
  window.open('/gate-internals/gate-internals.html', '_blank');

  // 4. Remove it after a delay
  setTimeout(() => {
    delete gateDefinitions[gateName];
    localStorage.setItem('DNA_gateDefinitions', makeStorableGateDefinitions(gateDefinitions));
  }, 1000);
};


function back(){
  document.getElementById('import-modal').style.minHeight = 'auto';
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
      if (!relations[gateType]) relations[gateType] = [];
      relations[gateType].push(gateName);
    });
  }
  return relations;
}


