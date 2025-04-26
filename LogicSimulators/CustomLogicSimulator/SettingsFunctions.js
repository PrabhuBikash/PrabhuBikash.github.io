// -------------------------------- Symbols Handler -----------------------------------//
function updateBaseFromSymbols() {
  symbols = symbolInput.value.split(",").map(s => s.trim()).filter(Boolean);
  baseInput.value = symbols.length;
  updateColorPickers()
  preview()
}
// -------------------------------- HCL to HEX -----------------------------------//
function toHex(color) {
  const ctx = document.createElement("canvas").getContext("2d");// we are creating a dom element for this! will not it bother the browser?
  ctx.fillStyle = color;
  return ctx.fillStyle;
}

// -------------------------------- ColorPicker Handler -----------------------------------//
function updateColorPickers() {
  colorPreview.innerHTML = ''; // Clear old pickers
  
  // Extend or preserve existing colors array
  colors = colors.slice(0, symbols.length); // trim if needed
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


/*
// -------------------------------- SetupCodeEditor -----------------------------------//
function loadUserGateLogic(code) {
  try {
    const fn = new Function('symbols', `"use strict"; ${code}; return { AND };`); // returns named gates
    const gates = fn(symbols);
    console.log('Loaded gates:', gates);
  } catch (err) {
    console.error('Error in gate logic:', err);
    // Show error to user in UI
  }
}

// -------------------------------- Code Parser -----------------------------------//
function extractGateFunctions(rawCode) {
  const functionDefs = [];
  const regex = /const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*\(([^)]*)\)\s*=>\s*{/g;

  let match;
  while ((match = regex.exec(rawCode)) !== null) {
    const name = match[1];      // Extract the gate name
    const args = match[2];      // Extract the function arguments (inputs)
    const bodyStart = match.index + match[0].length;
    
    // Find the closing brace for the function body
    let braceCount = 1;
    let i = bodyStart;
    while (i < rawCode.length && braceCount > 0) {
      if (rawCode[i] === '{') braceCount++;
      if (rawCode[i] === '}') braceCount--;
      i++;
    }

    const body = rawCode.slice(bodyStart, i - 1);
    functionDefs.push({ name, args, body });
  }

  return functionDefs;
}

// -------------------------------- syntax error? -----------------------------------//
function checkReturnConsistency(cases,simulate, gateName) {
  let numberOfOutputs = -1;
  let currentcase;
  try {
    cases.forEach((inputs, idx) => {// Validate the gate function by testing it on each input combination
      currentcase = inputs;
      const outputs = simulate(inputs);
      if (!Array.isArray(outputs)) throw new Error(`Gate '${gateName}' must return an array.`);
      if (numberOfOutputs == -1) numberOfOutputs = outputs.length;
      else if (numberOfOutputs != outputs.length) throw new Error(`Gate '${gateName}' returns ${numberOfOutputs} outputs for ${JSON.stringify(cases[0])} but ${outputs.length} outputs for ${JSON.stringify(inputs)}`);
      const percent = ((idx + 1) / cases.length) * 100;
      progress.style.width = `${percent}%`;
      progress.textContent = `${percent}%`
    });
  } catch (e) {
    throw new Error(`Gate '${gateName}' failed for input ${JSON.stringify(currentcase)}: ${e.message}`);
  }
  return numberOfOutputs
}


// -------------------------------- Add to gate Definitions -----------------------------------//
function compileGateFunctions(rawCode, symbols) {
  const extracted = extractGateFunctions(rawCode);  // Extract gate functions from the code
  let errorMessages = [];  // Array to store error messages

  extracted.forEach(({ name, args, body }) => {
    try {
      acorn.parse(`const temp = (${args}) {\n${body}\n}`, { ecmaVersion: 2020 })
      const simulate = new Function('symbols', `return (${args}) => {${body}};`)(symbols);
      const numberOfInputs = args.split(',').length;

      function generateInputs(depth = 0, current = []){
        if (depth === numberOfInputs) return [current];
        let all = [];// Recurse by adding the current symbol to the combination and increasing depth
        for (const s of symbols) all = all.concat(generateInputs(depth + 1, [...current, s]));
        return all;
      };

      const numberOfOutputs = checkReturnConsistency(generateInputs(),simulate, name);

      // Save the gate's metadata in the gateDefinitions object
      gateDefinitions[name] = {numberOfInputs,numberOfOutputs,simulate,};

    } catch (e) {
      // If an error occurs, collect the error message and add it to the errorMessages array
      errorMessages.push(`❌ Error in gate '${name}': ${e.message}`);
    }
  });

  return errorMessages;  // Return any error messages collected
}*/





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

  previewCanvas.appendChild(gate); // ✅ Append correctly into the preview canvas
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