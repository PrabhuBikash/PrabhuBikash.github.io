// -------------------------------- Symbols Handler -----------------------------------//
function updateBaseFromSymbols() {
  symbols = symbolInput.value.split(",").map(s => s.trim()).filter(Boolean);
  baseInput.value = symbols.length;
  updateColorPickers()
  preview()
}
// -------------------------------- HCL to HEX -----------------------------------//
function toHex(color) {
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.fillStyle = color;
  return ctx.fillStyle;
}

// -------------------------------- ColorPicker Handler -----------------------------------//
function updateColorPickers() {
  colorPreview.innerHTML = ''; // Clear old pickers
  
  // Extend or preserve existing colors array
  colors = colors.slice(0, symbols.length);
  while (colors.length < symbols.length) {
    const hue = Math.floor(360 * colors.length / symbols.length);
    colors.push(`hsl(${hue}, 100%, 50%)`);
  }

  symbols.forEach((sym, i) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'color-picker-wrapper';

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = toHex(colors[i]);
    colorInput.oninput = (e) => {
      colors[i] = e.target.value;
      preview.style.backgroundColor = colors[i];
    };

    const preview = document.createElement('span');
    preview.textContent = sym;
    preview.className = 'symbol-preview';
    preview.style.backgroundColor = colors[i];

    wrapper.append(colorInput,preview);
    colorPreview.appendChild(wrapper);
  });
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

// ---- Preview Core Functions ----

// 1. Preview Circuit
function preview() {
  previewCanvas.innerHTML = "";
  previewSvg.innerHTML = ""
  const { gates, wires } = previewCircuit;
  const logicGates = new Map();
  gates.forEach(({id, position}) => logicGates.set(id, createPreviewGate(id.split('-')[0], position)));
  
  wires.forEach(({from, to, bends}) => {
    const [fromgateId, fromportIndex] = from.split('@');
    const [togateId, toportIndex] = to.split('@');
    const fromPort = logicGates.get(fromgateId).querySelectorAll('.output-port')[fromportIndex];
    const toPort = logicGates.get(togateId).querySelectorAll('.input-port')[toportIndex];
    const AllPoints = [getPortCenter(fromPort), ...bends, getPortCenter(toPort)];
    createPreviewWire(fromPort, toPort, AllPoints);
  });
}

// 2. Create Gate
function createPreviewGate(type, {x, y}) {
  const { numberOfInputs, numberOfOutputs } = gateDefinitions[type];
  const gateHeight = Math.max(40, ((Math.max(numberOfInputs, numberOfOutputs) + 1) * 15) - 5);

  const label = document.createElement('div');
  label.className = 'gate-label';
  label.textContent = type;

  const gate = document.createElement('div');
  gate.classList.add('logic-gate');
  gate.dataset.type = type;
  gate.style.position = 'absolute';
  gate.style.left = `${x}px`;
  gate.style.top = `${y}px`;
  gate.style.height = `${gateHeight}px`;
  gate.appendChild(label);

  // Inputs
  const inputDivision = gateHeight / (numberOfInputs + 1);
  for (let i = 1; i <= numberOfInputs; i++) {
    const input = document.createElement('div');
    input.classList.add('port', 'input-port');
    input.style.top = `${inputDivision * i}px`;
    input.index = i - 1;
    input.connectedPort = null;
    makeSignalProperty(input);
    gate.appendChild(input);
  }

  // Outputs
  const outputDivision = gateHeight / (numberOfOutputs + 1);
  for (let i = 1; i <= numberOfOutputs; i++) {
    const output = document.createElement('div');
    output.classList.add('port', 'output-port');
    output.style.top = `${outputDivision * i}px`;
    output.index = i - 1;
    makeSignalProperty(output);
    gate.appendChild(output);
  }

  previewCanvas.appendChild(gate);
  addLogic(gate);
  makeElementDraggable(gate, previewWires);
  return gate;
}

// 3. Create Wire
function createPreviewWire(fromPort, toPort, AllPoints) {
  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  polyline.setAttribute('stroke', `${colors[fromPort.signal] || 'black'}`);
  polyline.setAttribute('fill', 'none');
  polyline.setAttribute('stroke-width', '3');
  polyline.setAttribute("points", AllPoints.map(p => `${p.x},${p.y}`).join(" "));

  const id = `wire-id_${uniqueIDCounter++}`;
  makeSignalProperty(polyline, fromPort.signal);
  fromPort.addEventListener('signalchange', () => polyline.signal = fromPort.signal);
  polyline.addEventListener('signalchange', () => toPort.signal = polyline.signal);
  toPort.signal = polyline.signal;
  toPort.connectedPort = fromPort;

  previewSvg.appendChild(polyline);
  previewWires[id] = {wireElement: polyline, fromPort: fromPort, toPort: toPort, bendPoints: AllPoints.slice(1, -1)};
}

// 4. Update Wire Positions when dragging
document.addEventListener('pointermove', () => {
  Object.keys(previewWires).forEach(id => {
    const { wireElement, fromPort, toPort, bendPoints } = previewWires[id];
    const fromRect = fromPort.getBoundingClientRect();
    const toRect = toPort.getBoundingClientRect();
    const svgRect = previewSvg.getBoundingClientRect();

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
});
