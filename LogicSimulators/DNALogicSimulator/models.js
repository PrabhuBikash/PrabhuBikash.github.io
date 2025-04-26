//--------------------------Models---------------------------------//
function binary_code(nucleotide){
  if (nucleotide == "A") return "00";
  else if (nucleotide == "C") return "01";
  else if (nucleotide == "G") return "10";
  else if (nucleotide == "T") return "11";
  else return "";
};

function symbol_code(binary_code){
  if (binary_code == "00") return "A";
  else if (binary_code == "01") return "C";
  else if (binary_code == "10") return "G";
  else if (binary_code == "11") return "T";
  else return 0;
};
const colorDict = {
  0: "#2c2c2e",
  "A": "#00bcd4",
  "C": "#e91e63",
  "G": "#4caf50",
  "T": "#ff9800"
}

let gateDefinitions = {
  INPUT:{
    numberOfInputs: 0,
    numberOfOutputs: 1,
    simulate: (_, g) => {
      g.classList.replace('logic-gate', 'node');
      g.classList.add('input-node');
      const grid = Object.assign(document.createElement('div'), {className: 'input-button-grid'});
      ['A','C','G','T'].forEach(nt => {
        const btn = Object.assign(document.createElement('button'), {className: 'input-button',textContent: nt});
        btn.setAttribute('data-value', nt);
        btn.onclick = () => {
          const output = g.querySelector('.output-port');
          output.signal = (output.signal === nt) ? 0 : nt;
          g.style.background = colorDict[output.signal] || '#555';
        };
        grid.appendChild(btn);
      });
      g.append(grid);
      return [0]
    }    
  },
  OUTPUT:{
    numberOfInputs: 1,
    numberOfOutputs: 0,
    simulate: ([a], g) => {
      if (!g.setupDone) {
        g.classList.replace('logic-gate', 'node');
        g.classList.add('output-node');
        g.appendChild(Object.assign(document.createElement('div'),{className:'output-label'}));
        g.setupDone = true;
      }
      const label = g.querySelector('.output-label');
      if (label) label.textContent = a;
      g.style.background = colorDict[a] || '#555';
    }    
  },
  OuterInverse:{
    numberOfInputs: 2,
    numberOfOutputs: 1,
    simulate: ([a, b]) => {
      const bin_str = binary_code(a)+binary_code(b);
      if (bin_str.length < 2) return [0];
      return [symbol_code(`${+!+bin_str[0]}${+!+bin_str[bin_str.length-1]}`)];
    }
  }
};
let gateRelations = {}
let Wires = []
let uniqueIDCounter = 0;

//--------------------------The original gate creating function---------------------------------//
function createGhostGate(type, startX, startY) { // We will treat Input and Output node as Gates as well
  const {numberOfInputs, numberOfOutputs} = gateDefinitions[type];
  const gateHeight = Math.max(40, ((Math.max(numberOfInputs, numberOfOutputs) + 1) * 15)-5);
  
  const label = document.createElement('div');
  label.className = 'gate-label';
  label.textContent = type;

  const gate = document.createElement('div');
  gate.classList.add('logic-gate', 'ghost-gate');
  gate.dataset.type = type;
  gate.style.position = 'absolute';
  gate.style.left = `${startX}px`;
  gate.style.top = `${startY}px`;
  gate.style.height = `${gateHeight}px`;
  gate.style.pointerEvents = 'none'; // so it doesn't interfere during dragging
  gate.appendChild(label);

  // Create input ports
  const inputDivision = gateHeight / (numberOfInputs + 1);
  for (let i = 1; i <= numberOfInputs; i++) {
    const input = document.createElement('div');
    input.classList.add('port', 'input-port', 'ghost-port');
    input.style.top = `${inputDivision * i}px`;
    input.index = i - 1;
    input.gate = gate;
    input.connectedPort = null;
    makeSignalProperty(input);
    gate.appendChild(input);
  }

  // Create output ports
  const outputDivision = gateHeight / (numberOfOutputs + 1);
  for (let i = 1; i <= numberOfOutputs; i++) {
    const output = document.createElement('div');
    output.classList.add('port', 'output-port', 'ghost-port');
    output.style.top = `${outputDivision * i}px`;
    output.index = i - 1;
    output.gate = gate;
    makeSignalProperty(output);
    output.addEventListener("pointerdown", () => createWire(output));
    gate.appendChild(output);
  }
  document.body.appendChild(gate); // Now the gate is rendered
  addLogic(gate);

  // Handle dragging with pointer events
  let offsetX = startX - gate.offsetLeft;
  let offsetY = startY - gate.offsetTop;
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);

  function onPointerMove(e) {
    gate.style.left = `${e.clientX - offsetX}px`;
    gate.style.top = `${e.clientY - offsetY}px`;
  }

  function onPointerUp(e) {
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);

    const canvasRect = mainCanvas.getBoundingClientRect();
    const gateRect = gate.getBoundingClientRect();
    const isInsideCanvas =
      gateRect.left >= canvasRect.left &&
      gateRect.right <= canvasRect.right &&
      gateRect.top >= canvasRect.top &&
      gateRect.bottom <= canvasRect.bottom;

    if (!isInsideCanvas) {gate.remove(); return};
    mainCanvas.appendChild(gate);
    gate.classList.remove('ghost-gate');
    gate.style.pointerEvents = 'all';
    gate.querySelectorAll('.ghost-port').forEach(p => p.classList.remove('ghost-port'));
    makeElementDraggable(gate);
    makeDeletable(gate);
    gate.style.left = `${gateRect.left - canvasRect.left}px`;
    gate.style.top = `${gateRect.top - canvasRect.top}px`;
    if (type !== 'INPUT' && type !== 'OUTPUT') {
      gate.addEventListener('dblclick', e => {e.preventDefault();openGateInternals(gate);});
    }
    gate.addEventListener('contextmenu', (e) => { e.preventDefault(); showGateMenu(e.pageX, e.pageY, gate); });
    gate.style.left = `${Math.max(0, Math.min(e.clientX - canvasRect.left - offsetX, canvas.clientWidth - gate.offsetWidth))}px`;
    gate.style.top = `${Math.max(0, Math.min(e.clientY - canvasRect.top - offsetY, canvas.clientHeight - gate.offsetHeight))}px`;
    updateAllWires(); // 🔁 Update wires during drag
  }
}
//--------------------------------Wire Creation-----------------------------//
function createWire(fromPort) {
  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  polyline.setAttribute('stroke', `${colorDict[fromPort.signal]}`);
  polyline.setAttribute('fill', 'none');
  polyline.setAttribute('stroke-width', '3');
  const bends = [];

  function cleanup() {
    document.removeEventListener('contextmenu', onContextMenu);
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerdown', onPointerDown);
  }
  function onContextMenu(e) { e.preventDefault(); cleanup(); polyline.remove();}
  function onPointerMove(e) {polyline.setAttribute("points", [...bends, { x: e.clientX, y: e.clientY }].map(p => `${p.x},${p.y}`).join(" "));}
  function onPointerDown(e) {
    const clickedEl = document.elementFromPoint(e.clientX, e.clientY);
    const rect = mainCanvas.getBoundingClientRect();

    if (clickedEl.classList.contains('input-port')) {cleanup();
      if (clickedEl.connectedPort) { polyline.remove(); return; }

      polyline.setAttribute("points", [...bends, getPortCenter(clickedEl)].map(p => `${p.x},${p.y}`).join(" "));
      const id = `wire-id_${uniqueIDCounter++}`;
      makeSignalProperty(polyline, fromPort.signal);
      function changeWireSignal() {polyline.signal = fromPort.signal};
      function changePortSignal() {clickedEl.signal = polyline.signal};
      fromPort.addEventListener('signalchange', changeWireSignal);
      polyline.addEventListener('signalchange', changePortSignal);
      clickedEl.signal = polyline.signal;
      clickedEl.connectedPort = fromPort;
      function deleteWire() {
        polyline.removeEventListener('contextmenu', deleteWire);
        polyline.removeEventListener('click', onClickForDelete);
        fromPort.removeEventListener('signalchange', changeWireSignal);
        polyline.removeEventListener('signalchange', changePortSignal);
        observer.disconnect();
        if (clickedEl) {clickedEl.connectedPort = null;clickedEl.signal=0};
        polyline.remove();
        delete Wires[wireId];
      }

      const observer = new MutationObserver(() => {if (!mainCanvas.contains(fromPort) || !mainCanvas.contains(clickedEl)) deleteWire();});
      observer.observe(mainCanvas, { childList: true, subtree: true });
      svg.appendChild(polyline);
      const onClickForDelete = (e) => { if (deleteMode) deleteWire(); };
      polyline.addEventListener('click', onClickForDelete);
      polyline.addEventListener('contextmenu', deleteWire);
      Wires[id] = {wireElement: polyline, fromPort: fromPort, toPort: clickedEl, bendPoints: bends.slice(1)};
    } else if (
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top && e.clientY <= rect.bottom
    ) {bends.push({ x: e.clientX, y: e.clientY });}
  }

  svg.appendChild(polyline);
  document.addEventListener('contextmenu', onContextMenu);
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerdown', onPointerDown);
}

//--------------------------Circuit to Gate---------------------------------/
function circuitToGate() {
  const byYX = (a, b) => {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();
    const dy = aRect.top - bRect.top;
    if (Math.abs(dy) > 5) return dy;
    return aRect.left - bRect.left;
  };
  
  const gateCounters = {}; // Assign IDs to gates (based on their type)
  const gates = [...mainCanvas.querySelectorAll(':scope > .input-node, :scope > .logic-gate, :scope > .output-node')].sort(byYX).map((node) => {
    const type = node.dataset.type;
    gateCounters[type] = (gateCounters[type] || 0);
    node.id = `${type}-${gateCounters[type]++}`;
    const { top, left } = node.getBoundingClientRect();
    return { id: node.id, position: { x: left, y: top }};
  });

  // Gather wires
  const wires = Object.values(Wires).map(({ fromPort, toPort, bendPoints }) => {
    return {
      from: `${fromPort.closest('.logic-gate, .input-node').id}@${fromPort.index}`,
      to: `${toPort.closest('.logic-gate, .output-node').id}@${toPort.index}`,
      bends: bendPoints
    };
  });
  return {numberOfInputs:(gateCounters['INPUT'] || 0), numberOfOutputs:(gateCounters['OUTPUT'] || 0), Circuit:{ gates, wires }};
}

//--------------------------Simulate Circuit!---------------------------------//
function createInstanceFromCircuit(inputNodes,outputNodes,gateEl) {
  const { gates, wires} = gateDefinitions[gateEl.dataset.type].Circuit;
  const internalGates = new Map();
  const innerCanvas = document.createElement('canvas');
  function createLogicalGate(id) {
    const [type,i] = id.split('-');
    if (type == 'INPUT') return inputNodes[i];
    if (type == 'OUTPUT') return outputNodes[i];
    const numberOfInputs = gateDefinitions[type].numberOfInputs;
    const numberOfOutputs = gateDefinitions[type].numberOfOutputs;
    
    const gate = document.createElement('div');
    gate.classList.add('logic-gate');
    gate.dataset.type = type;
  
    for (let i = 1; i <= numberOfInputs; i++) {
      const input = document.createElement('div');
      input.classList.add('port', 'input-port');
      input.index = i-1;
      makeSignalProperty(input)
      gate.appendChild(input);
    }
    for (let i = 1; i <= numberOfOutputs; i++) {
      const output = document.createElement('div');
      output.classList.add('port', 'output-port');
      output.index = i-1;
      makeSignalProperty(output)
      gate.appendChild(output);
    }
    innerCanvas.appendChild(gate);
    addLogic(gate);
    return innerCanvas
  }

  gates.forEach(({id, position}) => internalGates.set(id,createLogicalGate(id)));
  wires.forEach(({from,to,bends}) => { // 3. Wire Internal Gates
    const [fromGateId, fromPortindex] = from.split('@');
    const [toGateId, toPortindex] = to.split('@');
    const fromPort = fromGateId.split('-')[0] == 'INPUT' ? internalGates.get(fromGateId) : internalGates.get(fromGateId).querySelectorAll('.output-port')[fromPortindex];
    const toPort = toGateId.split('-')[0] == 'OUTPUT' ? internalGates.get(toGateId) : internalGates.get(toGateId).querySelectorAll('.input-port')[toPortindex];
    fromPort.addEventListener('signalchange', () => toPort.signal = fromPort.signal);
    toPort.signal = fromPort.signal
  });
  innerCanvas.style.pointerEvents = 'none';   // ← Prevent it from blocking clicks
  innerCanvas.style.display = 'none';
  gateEl.appendChild(innerCanvas);
}

//--------------------------Circuit to Function---------------------------------//
function generateFunctionDefinition() {
  const inputVarMap = new Map();
  const alphabet = (i) => `${'abcdefghijklmnopqrstuvwxyz'.split('')[i%26]}${i<26 ? '' : Math.floor(i / 26) -1}`;  // Pre-generate a list of characters
  const byYX = (a, b) => {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();
    const dy = aRect.top - bRect.top;
    if (Math.abs(dy) > 5) return dy;
    return aRect.left - bRect.left;
  };
  [...document.querySelectorAll('.input-node')].sort(byYX).forEach((inputNode, i) => {inputVarMap.set(inputNode.querySelector('.output-port'), alphabet(i));});
  const memo = new Map();         // Memoizes expressions for ports
  const visited = new Map();

  function expressionFor(inputPort) {
    const sourcePort = inputPort.connectedPort;
    if (!sourcePort) return '0';
  
    if (visited.get(inputPort)) return null;
    visited.set(inputPort, true);
    if (inputVarMap.has(sourcePort)) return inputVarMap.get(sourcePort);
  
    const sourceGate = sourcePort.gate;
    if (memo.has(sourceGate)) return `${memo.get(sourceGate)}[${sourcePort.index}]`;
  
    const inputPorts = [...sourceGate.querySelectorAll('.input-port')].sort(byYX);
    const expressions = inputPorts.map(expressionFor);
  
    // 🔁 Propagate null if any sub-expression failed (i.e., due to cycle)
    if (expressions.includes(null)) return null;
    if (!gateDefinitions[sourceGate.dataset.type].simulate) return null;
    const gateExpr = `gateDefinitions['${sourceGate.dataset.type}'].simulate([${expressions.join(', ')}])`;
    memo.set(sourceGate, gateExpr);
    return `${gateExpr}[${sourcePort.index}]`;
  }
  
  const final_expressions = [...document.querySelectorAll('.output-node')].sort(byYX).map(node => expressionFor(node.querySelector('.input-port')));
  if (final_expressions.includes(null)) return null;
  return new Function(`return ([${[...inputVarMap.values()].join(', ')}]) => [${final_expressions.join(', ')}]`)();
}