//--------------------------Models---------------------------------//
let gateDefinitions = {
  NAND: {
    InputPorts: ['In0','In1'], //necessary to know number of input-ports
    OutputPorts: ['Out0'], //necessary to know number of output-ports
    simulate : ([a, b]) => [ +!(a && b) ], // Simulate is for inbuilt Gates i.e.,gates that are independently Defined
  },
/*  NOT: {
      InputPorts: [ "In0" ],
      OutputPorts: [ "Out0:0@0" ],
      Gates: [ "NAND0:[In0,In0]" ],
      locations: {
        inputLocations: [ 224 ],
        outputLocations: [ 188 ],
        gateLocations: [ {
          type: "NAND",
          x: 683,
          y: 217
        } ]
      }
  }*/
};
let gateRelations = {};
let uniqueIDCounter = 0;
const wires = [];

//--------------------------Logical Wires---------------------------------//
function connectPorts(fromPort, toPort) {
  toPort.connectedPort = fromPort;
  fromPort.addEventListener('signalchange', () => {toPort.signal = fromPort.signal;});
  toPort.signal = fromPort.signal
}
//--------------------------Wires---------------------------------//
function createWire(fromPort, toPort, wire) {
  const id = `wire-id_${uniqueIDCounter++}`;
  wires[id] = { wireElement: wire, fromPort: fromPort, toPort: toPort };
  toPort.connectedPort = fromPort;

  fromPort.addEventListener('signalchange', () => { wire.style.stroke = fromPort.signal ? '#4caf50' : '#f44336'; toPort.signal = fromPort.signal;});
  toPort.signal = fromPort.signal
  wire.style.stroke = fromPort.signal ? '#4caf50' : '#f44336'
  
  // Delete the wire if its ports are removed
  const observer = new MutationObserver(() => { if (!mainCanvaswrapper.contains(fromPort) || !mainCanvaswrapper.contains(toPort)) { DeleteWire(id); observer.disconnect(); }});
  observer.observe(mainCanvaswrapper, { childList: true, subtree: true });
  
  wire.style.pointerEvents = 'all'; // This ensures the wire responds to clicks
  wire.addEventListener('contextmenu', (e) => {e.stopPropagation(); e.preventDefault(); DeleteWire(id); observer.disconnect();});
  wire.addEventListener('click', (e) => {
    if (!deleteMode) return;
    e.stopPropagation();
    DeleteWire(id);
    observer.disconnect();
  });
}

//--------------------------Input---------------------------------//
function createInput(y) {
  const input = document.createElement('div');
  input.classList.add('input-node');
  input.textContent = '0';
  makeSignalProperty(input, Number(input.textContent))
  input.gate = input;

  // Visually, it has an output-port circle
  const portEl = document.createElement('div');
  portEl.classList.add('output-port');
  input.appendChild(portEl);

  input.style.position = 'absolute';
  input.style.left = '10px';
  input.style.top = `${y}px`;

  // Make it draggable
  makeElementDraggable(input, 'input');
  makeDeletable(input)
  let startY = 0;
  input.addEventListener('pointerdown', (e) => {startY = e.clientY; });
  input.addEventListener('pointerup', (e) => {
    if (Math.abs(e.clientY - startY) > 3) return;
    input.textContent = input.textContent === '0' ? '1' : '0';
    input.signal = Number(input.textContent);
  });
  mainCanvaswrapper.querySelector('.input-zone').appendChild(input);
  return input
}

//--------------------------output---------------------------------//
function createOutput(y) {
  const output = document.createElement('div');
  output.classList.add('output-node');
  output.textContent = '0';
  makeSignalProperty(output,Number(output.textContent))
  output.connectedPort = null;
  output.gate = output;

  const portEl = document.createElement('div');
  portEl.classList.add('input-port'); // it's receiving
  output.appendChild(portEl);

  output.style.position = 'absolute';
  output.style.left = `0px`;
  output.style.top = `${y}px`;

  makeElementDraggable(output, 'output');
  makeDeletable(output)
  output.addEventListener('signalchange', () => { output.textContent = output.signal});
  mainCanvaswrapper.querySelector(':scope > .output-zone').appendChild(output);
  return output
}


//--------------------------Gates---------------------------------//
function createLogicalGate(type,parentEl) {
  const numberOfInputs = gateDefinitions[type].InputPorts.length;
  const numberOfOutputs = gateDefinitions[type].OutputPorts.length;
  
  const gate = document.createElement('div');
  gate.classList.add('logic-gate');
  gate.type = type;

  for (let i = 1; i <= numberOfInputs; i++) {
    const input = document.createElement('div');
    input.classList.add('port', 'input-port');
    input.index = i-1;
    input.connectedPort = null;
    input.gate = gate;
    makeSignalProperty(input)
    gate.appendChild(input);
  }
  for (let i = 1; i <= numberOfOutputs; i++) {
    const output = document.createElement('div');
    output.classList.add('port', 'output-port');
    output.index = i-1;
    output.gate = gate;
    makeSignalProperty(output)
    gate.appendChild(output);
  }
  parentEl.appendChild(gate);
  addLogic(gate,type);
  return gate
}


//--------------------------Circuit to Gate---------------------------------/
function circuitToGate() {
  const byY = (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top;
  let internalGates = [...mainCanvas.querySelectorAll(':scope > .logic-gate')].map((gate,i) => (gate.gateId = i,gate))
  // Capture input nodes and their positions
  const inputPorts = [...mainCanvaswrapper.querySelector('#input-zone').querySelectorAll(':scope > .input-node')].sort(byY).map((node, i) => {
    const { top, left } = node.getBoundingClientRect();
    node.id = `In${i}`;
    return { id: node.id, position: { x: left, y: top } };
  });
  // Capture output nodes and their positions
  const OutputPorts = [...mainCanvaswrapper.querySelector('#output-zone').querySelectorAll(':scope > .output-node')].sort(byY).map((node, i) => {
    const { top, left } = node.getBoundingClientRect();
    const conn = node.connectedPort;
    return { id: `Out${i}`, position: { x: left, y: top }, connection: conn?.gate ? (conn.gate === conn ? conn.id : `${conn.gate.gateId}@${conn.index}`) : null};
  });
  // Capture internal gates, their inputs, and positions
  internalGates = internalGates.map((node, i) => {
    const { top, left } = node.getBoundingClientRect();
    const inputs = [...node.querySelectorAll(':scope > .input-port')].map(portEl => {
      const conn = portEl.connectedPort;
      return conn?.gate ? (conn.gate === conn ? conn.id : `${conn.gate.gateId}@${conn.index}`) : null;
    });
    return { id:  [node.type, i], position: { x: left, y: top }, inputs: inputs
    };
  });
  // Return the circuit data with locations included
  return {
    InputPorts: inputPorts.map(input => input.id),
    OutputPorts: OutputPorts.map(output => `${output.id}:${output.connection}`),
    Gates: internalGates.map(gate => `${gate.id.join('')}:[${gate.inputs.join(',')}]`),
    locations: {
      inputLocations: inputPorts.map(input => input.position.y),
      outputLocations: OutputPorts.map(output => output.position.y),
      gateLocations: internalGates.map(gate => ({type: gate.id[0], x: gate.position.x, y: gate.position.y}))
    }
  };
}


//--------------------------Simulate Circuit!---------------------------------//
function createInstanceFromCircuit(inputNodes,outputNodes,gateEl) {
  const {InputPorts, OutputPorts, Gates, locations} = gateDefinitions[gateEl.type];
  wrapper = document.createElement('div')
  const logicGates = locations.gateLocations.map(({type, x, y}) => createLogicalGate(type,wrapper));

  // 3. Wire Internal Gates
  Gates.forEach((def, i) => {
    const gate = logicGates[i];
    const inputs = def.includes('[') ? def.match(/\[(.*)\]/)[1].split(',') : [];
    inputs.forEach((inputSrc, portIndex) => {
      let sourcePort;
      if (inputSrc.startsWith('In')) sourcePort = inputNodes[parseInt(inputSrc.replace('In', ''))];
      else if (inputSrc) {
        const [srcGateId, outIdx] = inputSrc.split('@');
        sourcePort = logicGates[parseInt(srcGateId.match(/\d+$/)[0])].querySelectorAll('.output-port')[outIdx];
      } else return;
      connectPorts(sourcePort,gate.querySelectorAll('.input-port')[portIndex]);
    });
  });

  // 4. Wire Outputs
  OutputPorts.forEach((outDef, i) => {
    const [_, src] = outDef.split(':');
    let sourcePort
    if (src.startsWith('In')) sourcePort = inputNodes[parseInt(src.replace('In', ''))];
    else if (src) {
      const [srcGateId, outIdx] = src.split('@');
      sourcePort = logicGates[parseInt(srcGateId.match(/\d+$/)[0])].querySelectorAll('.output-port')[outIdx];
    } else return;
    connectPorts(sourcePort,outputNodes[i]);
  });
  wrapper.style.pointerEvents = 'none';   // ← Prevent it from blocking clicks
  wrapper.style.display = 'none';
  gateEl.appendChild(wrapper);
  return { Circuit: wrapper,internalGates: logicGates};
}

//--------------------------The original gate creating function---------------------------------//
function createGhostGate(type, startX, startY) {
  const numberOfInputs = gateDefinitions[type].InputPorts.length;
  const numberOfOutputs = gateDefinitions[type].OutputPorts.length;
  const gateHeight = Math.max(40, ((Math.max(numberOfInputs, numberOfOutputs) + 1) * 15)-5);
  
  const label = document.createElement('div');
  label.className = 'gate-label';
  label.textContent = type;

  const gate = document.createElement('div');
  gate.classList.add('logic-gate', 'ghost-gate');
  gate.type = type;
  gate.style.position = 'absolute';
  gate.style.left = `${startX}px`;
  gate.style.top = `${startY}px`;
  gate.style.height = `${gateHeight}px`;
  gate.style.opacity = '0.5';
  gate.style.pointerEvents = 'none'; // so it doesn't interfere during dragging
  gate.appendChild(label);

  // Create input ports
  const inputDivision = gateHeight / (numberOfInputs + 1);
  for (let i = 1; i <= numberOfInputs; i++) {
    const input = document.createElement('div');
    input.classList.add('port', 'input-port', 'ghost-port');
    input.style.top = `${inputDivision * i}px`;
    input.index = i - 1;
    input.connectedPort = null;
    input.gate = gate;
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
    gate.appendChild(output);
  }
  document.body.appendChild(gate); // Now the gate is rendered
  addLogic(gate, type);

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
    canvas.appendChild(gate);
    gate.classList.remove('ghost-gate');
    gate.style.opacity = '1';
    gate.style.pointerEvents = 'auto';
    gate.querySelectorAll('.ghost-port').forEach(p => p.classList.remove('ghost-port'));
    makeElementDraggable(gate, 'gate');
    makeDeletable(gate);
    gate.style.left = `${gateRect.left - canvasRect.left}px`;
    gate.style.top = `${gateRect.top - canvasRect.top}px`;
    gate.addEventListener('dblclick', (e) => { e.preventDefault(); openGateInternals(gate); });
    gate.addEventListener('contextmenu', (e) => { e.preventDefault(); showGateMenu(e.pageX, e.pageY, gate); });
  }
}



//--------------------------Circuit to Function---------------------------------//
function generateFunctionDefinition() {
  const inputVarMap = new Map();
  const alphabet = (i) => `${'abcdefghijklmnopqrstuvwxyz'.split('')[i%26]}${i<26 ? '' : Math.floor(i / 26) -1}`;  // Pre-generate a list of characters
  const byY = (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top;
  [...document.querySelectorAll('.input-node')].sort(byY).forEach((inputNode, i) => inputVarMap.set(inputNode, alphabet(i)));
  const memo = new Map();         // Memoizes expressions for ports
  const visited = new Map();

  function expressionFor(inputPort) {
    const sourcePort = inputPort.connectedPort;
    if (!sourcePort) return '0';
  
    if (visited.get(inputPort)) return null;
    visited.set(inputPort, true);
  
    if (sourcePort.classList.contains('input-node')) return inputVarMap.get(sourcePort);
  
    const sourceGate = sourcePort.gate;
    if (memo.has(sourceGate)) return `${memo.get(sourceGate)}[${sourcePort.index}]`;
  
    const inputPorts = [...sourceGate.querySelectorAll('.input-port')].sort(byY);
    const expressions = inputPorts.map(expressionFor);
  
    // 🔁 Propagate null if any sub-expression failed (i.e., due to cycle)
    if (expressions.includes(null)) return null;
    if (!gateDefinitions[sourceGate.type].simulate) return null;
    const gateExpr = `gateDefinitions['${sourceGate.type}'].simulate([${expressions.join(', ')}])`;
    memo.set(sourceGate, gateExpr);
    return `${gateExpr}[${sourcePort.index}]`;
  }
  
  const final_expressions = [...document.querySelectorAll('.output-node')].sort(byY).map(expressionFor);
  if (final_expressions.includes(null)) return null;
  return new Function(`return ([${[...inputVarMap.values()].join(', ')}]) => [${final_expressions.join(', ')}]`)();
}