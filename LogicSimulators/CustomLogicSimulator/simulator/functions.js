//--------------------------Signal---------------------------------//
function makeSignalProperty(element, initialValue = 0) {
  Object.defineProperty(element, "signal", {
    get() {
      return this._signalValue ?? 0;
    },
    set(value) {
      if (value == this._signalValue) return;
      this._signalValue = value ?? 0;
      setTimeout(() => {
        this.dispatchEvent(new CustomEvent("signalchange", { detail: { newValue: value }}));
      }, userDelay);
      element.style.background = element.style.stroke = colors[value] || "white";
      element.dataset.symbol = symbols[value];
    },
    configurable: true,
    enumerable: true,
  });
  element.signal = initialValue; // set the initial value
}

//--------------------------Enable Drag---------------------------------//
function makeElementDraggable(el, WireList = Wires) {
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  const canvas = document.getElementById('canvas');
  el.addEventListener('pointerdown', (e) => {
    if (".port" && e.target.closest(".port")) return;
    e.preventDefault();
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    el.style.zIndex = '5';
  });

  document.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const canvasRect = canvas.getBoundingClientRect();
    el.style.left = `${Math.max(0, Math.min(e.clientX - canvasRect.left - offsetX, canvas.clientWidth - el.offsetWidth))}px`;
    el.style.top = `${Math.max(0, Math.min(e.clientY - canvasRect.top - offsetY, canvas.clientHeight - el.offsetHeight))}px`;
    updateAllWires(WireList); // 🔁 Update wires during drag
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

//--------------------------find port center---------------------------------//
function getPortCenter(portEl) {
  const rect = portEl.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
}

//--------------------------Add Logic to gate---------------------------------//
function addLogic(gate) {
  const def = gateDefinitions[gate.dataset.type];
  const inputPortEls = [...gate.querySelectorAll('.input-port')].sort((a, b) => a.index - b.index);
  const outputPortEls = [...gate.querySelectorAll('.output-port')].sort((a, b) => a.index - b.index);

  if (def.simulate) {// Pure function logic
    const handleUpdate = () => {
      const signals = def.simulate(inputPortEls.map(el => el.signal ?? 0),gate);
      outputPortEls.forEach((output_el, i) => output_el.signal = signals[i]);
    };
    inputPortEls.forEach(input => input.addEventListener('signalchange', handleUpdate));
    handleUpdate();
  } else createInstanceFromCircuit(inputPortEls,outputPortEls,gate); // Circuit logic
}

//--------------------------Populate Side Bar---------------------------------//
function refreshSidebar() {
  const sidebar = document.querySelector('.sidebar');
  sidebar.innerHTML = '<h2>Components</h2>'; // Clear the sidebar and re-populate, Keep the header

  for (const name in gateDefinitions) {
    const comp = document.createElement('div');
    comp.className = 'component';
    comp.dataset.type = name;
    comp.textContent = name;
    gateDefinition = gateDefinitions[name];
    comp.title = gateDefinition.simulate ? gateDefinition.simulate.toString() : JSON.stringify(gateDefinition, null, 2);
    comp.addEventListener('contextmenu', (e) => { e.preventDefault(); showGateMenu(e.pageX, e.pageY, comp, true); });
    comp.addEventListener('pointerdown', (e) => {e.preventDefault(); createGhostGate(name, e.clientX, e.clientY);});
    sidebar.appendChild(comp);
  }
}

//--------------------------View gate Menu---------------------------------//
function showGateMenu(x, y, gate, comp = false) {
  const gateName = gate.dataset.type;
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
      localStorage.setItem('gateDefinitions', makeStorableGateDefinitions(gateDefinitions));
      localStorage.setItem('gateRelations', makeStorableGateDefinitions(gateRelations));
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
  document.addEventListener('click', function onClickOutside() { menu.remove()}, { once: true });
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
  sessionStorage.setItem('selectedGate', JSON.stringify([gateInstance.dataset.type]));

  // Open gate-internals.html page
  window.open('Gate-internals/gate-internals.html', '_blank');
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
    ])), null, 2
  );
}

//--------------------------Update wires---------------------------------//
function updateAllWires(WireList = Wires) {
  Object.keys(WireList).forEach(id => {
    const { wireElement, fromPort, toPort, bendPoints } = WireList[id];
    const fromRect = fromPort.getBoundingClientRect();
    const toRect = toPort.getBoundingClientRect();
    const svgRect = document.getElementById('wire-layer').getBoundingClientRect();

    const newStart = {
      x: fromRect.left + fromRect.width / 2 - svgRect.left,
      y: fromRect.top + fromRect.height / 2 - svgRect.top
    };

    const newEnd = {
      x: toRect.left + toRect.width / 2 - svgRect.left,
      y: toRect.top + toRect.height / 2 - svgRect.top
    };
    
    wireElement.setAttribute("points", [newStart, ...bendPoints, newEnd].map(p => `${p.x},${p.y}`).join(" "));
  });
};
