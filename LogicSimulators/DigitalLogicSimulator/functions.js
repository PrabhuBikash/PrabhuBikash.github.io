//--------------------------Signal---------------------------------//
function makeSignalProperty(element, initialValue = 0) {
  Object.defineProperty(element, "signal", {
    get() {
      return this._signalValue ?? 0;
    },
    set(value) {
      if (value == this._signalValue) return;
      this._signalValue = value ?? 0;
      this.dispatchEvent(new CustomEvent("signalchange", {detail: { newValue: value }} ));
      element.style.background = value ? '#4caf50' : '#f44336';
    },
    configurable: true,
    enumerable: true,
  });

  element.signal = initialValue; // set the initial value
}

//--------------------------Enable Drag---------------------------------//
function makeElementDraggable(el, maintype) {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let StartX = 0;

  const canvas = document.getElementById('canvas');

  el.addEventListener('pointerdown', (e) => {
    if ('.port' && e.target.closest('.port')) return;
    StartX = e.clientX;
    e.preventDefault();
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    el.style.zIndex = '10';
  });

  document.addEventListener('pointermove', (e) => {
    if (!isDragging) return;

    const canvasRect = canvas.getBoundingClientRect();
    let newLeft = e.clientX - canvasRect.left - offsetX;
    let newTop = e.clientY - canvasRect.top - offsetY;

    // Apply bounds based on type
    if (maintype === 'input') {
      if (e.clientX - StartX > 20) return;
      el.style.left = `${10}px`;
      newTop = Math.max(0, Math.min(newTop, canvas.clientHeight - el.offsetHeight));
    } else if (maintype === 'output') {
      el.style.right = `${canvas.clientWidth - 10}px`;
      newTop = Math.max(0, Math.min(newTop, canvas.clientHeight - el.offsetHeight));
    } else {
      // Default: allow full movement within canvas
      el.style.left = `${Math.max(0, Math.min(newLeft, canvas.clientWidth - el.offsetWidth))}px`;
      newTop = Math.max(0, Math.min(newTop, canvas.clientHeight - el.offsetHeight));
    }
    el.style.top = `${newTop}px`;
  });

  document.addEventListener('pointerup', () => {
    if (!isDragging) return;
    isDragging = false;
    el.style.zIndex = '1';
  });
}


//--------------------------Enable Delete---------------------------------//
function makeDeletable(element) {
  element.addEventListener('click', (e) => {
    if (!deleteMode) return;
    e.stopPropagation();
    element.remove();
  });
}

function DeleteWire(wireId) {
  const { wireElement, fromPort, toPort } = wires[wireId];
  wireElement.remove();
  toPort.connectedPort = null;
  delete wires[wireId];
}

//--------------------------Add Logic to gate---------------------------------//
function addLogic(gate, type) {
  const def = gateDefinitions[type];
  const inputPortEls = [...gate.querySelectorAll('.input-port')].sort((a, b) => a.index - b.index);
  const outputPortEls = [...gate.querySelectorAll('.output-port')].sort((a, b) => a.index - b.index);

  if (def.simulate) {// Pure function logic (NAND, etc.)
    const handleUpdate = () => {
      const signals = def.simulate(inputPortEls.map(el => Number(el.signal ?? 0)),gate);
      outputPortEls.forEach((output_el, i) => output_el.signal = signals[i]);
    };
    inputPortEls.forEach(input => input.addEventListener('signalchange', handleUpdate));
    handleUpdate();
  } else { // Circuit logic
    const { Circuit, internalGates} = createInstanceFromCircuit(inputPortEls,outputPortEls,gate);
    Circuit.style.display = 'none';
    gate.appendChild(Circuit);
    [
      ...inputPortEls,
      ...internalGates.map(gate => [...(gate.querySelectorAll('.port') || [])]).flat(),
      ...outputPortEls,
    ].forEach(port => port.dispatchEvent(new CustomEvent("signalchange", { detail: { newValue: port.signal } })));
  } 
}

//--------------------------Wire sticking---------------------------------//
function getElementCenterRelativeToWrapper(el,parentEl = mainCanvaswrapper) {
  const elRect = el.getBoundingClientRect();
  const wrapperRect = parentEl.getBoundingClientRect();

  const y = elRect.top - wrapperRect.top + elRect.height / 2;
  let x;

  if (el.classList.contains('output-node')) { x = elRect.left - wrapperRect.left; // Port is on the LEFT side
  } else if (el.classList.contains('input-node')) { x = elRect.right - wrapperRect.left; // Port is on the RIGHT side
  } else { x = elRect.left - wrapperRect.left + elRect.width / 2; // Default: center
  }

  return { x, y };
}

//--------------------------Populate Side Bar---------------------------------//
function refreshSidebar() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.innerHTML = '<h2>Components</h2>'; // Clear the sidebar and re-populate, Keep the header

  for (const name in gateDefinitions) {
    const comp = document.createElement('div');
    comp.className = 'component';
    comp.draggable = true;
    comp.type = name;
    comp.textContent = name;
    gateDefinition = gateDefinitions[name];
    comp.title = gateDefinition.simulate ? gateDefinition.simulate.toString() : JSON.stringify(gateDefinition, null, 2);
    comp.addEventListener('contextmenu', (e) => { e.preventDefault(); showGateMenu(e.pageX, e.pageY, comp, true); });
    comp.addEventListener('pointerdown', (e) => {e.preventDefault(); createGhostGate(name, e.clientX, e.clientY, e);});
    sidebar.appendChild(comp);
  }
}

//--------------------------View gate Menu---------------------------------//
function showGateMenu(x, y, gate, comp = false) {
  const gateName = gate.type
  document.querySelector('.gate-context-menu')?.remove(); // Remove existing menu if any

  const menu = document.createElement('div');
  menu.classList.add('gate-context-menu');
  menu.style.top = `${y}px`;
  menu.style.left = `${x}px`;

  const deleteOption = document.createElement('div');
  deleteOption.textContent = `🗑️ Delete ${comp ? gateName : 'Gate'}`;
  deleteOption.classList.add('menu-item');
  deleteOption.onclick = () => {
    if (comp){
      const gatesToDelete = getAllDependentGates(gateName);
      const confirmDelete = window.confirm(`Are you sure you want to delete ${gateName}?${gatesToDelete ? `\n these gates and gates depndent on them will also be deleted:\n${[...gatesToDelete].join(', ')}\nand if any on the canvas they may malfunction!` : ""}`);
      if (!confirmDelete) return;
      gatesToDelete.forEach(g => {delete gateDefinitions[g]; delete gateRelations[g];});
      localStorage.setItem('BinaryLogic_gateDefinitions', makeStorableGateDefinitions(gateDefinitions));
      localStorage.setItem('BinaryLogic_gateRelations', makeStorableGateDefinitions(gateRelations));
      menu.remove();
      refreshSidebar()
    } else { gate.remove(); menu.remove();}
  };

  const peekOption = document.createElement('div');
  peekOption.textContent = '🔍 Peek Inside';
  peekOption.classList.add('menu-item');
  peekOption.onclick = () => { openGateInternals(gate); menu.remove(); };

  menu.append(deleteOption, peekOption);
  document.body.appendChild(menu);

  // Auto remove on click outside
  document.addEventListener('click', function onClickOutside() { menu.remove(); document.removeEventListener('click', onClickOutside); }, { once: true });
}


// ------------------------ What more to delete? ---------------------------//
function getAllDependentGates(gateName, visited = new Set()) {
  if (visited.has(gateName)) return;
  visited.add(gateName);

  const directDependents = gateRelations[gateName] || [];
  directDependents.forEach(dep => getAllDependentGates(dep, visited));
  return visited;
}

//--------------------------View gate logic---------------------------------//

function openGateInternals(gateInstance) {
  sessionStorage.setItem('BinaryLogic_selectedGate', JSON.stringify([gateInstance.type]));

  // Open gate-internals.html page
  window.open('gateInternals/', '_blank');
}

//--------------------------Local Storage helper functions---------------------------------//
function makeUsableGateDefinitions(rawDefs) {
  return Object.fromEntries(
    Object.entries(JSON.parse(rawDefs)).map(([name, def]) => [
      name,
      def.simulate ? { ...def, simulate: new Function('return ' + def.simulate)() } : def,
    ])
  );
}

function makeStorableGateDefinitions(defs) {
  return JSON.stringify(Object.fromEntries(
    Object.entries(defs).map(([name, def]) => [
      name,
      def.simulate ? { ...def, simulate: def.simulate.toString() } : def,
    ])), null, 1
  );
}
