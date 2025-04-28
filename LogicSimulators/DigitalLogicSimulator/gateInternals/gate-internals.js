// gate-internals/gate-internals.js
const wrapper = document.querySelector('.canvas-wrapper')
const canvas = document.getElementById('canvas');
const InputZone = document.getElementById('input-zone')
const OutputZone = document.getElementById('output-zone')
const svg = document.getElementById('wire-layer');
let mainGate;
let Breadcrumb;

window.onload = () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-theme");
  }
  const storedGateDefinitions = localStorage.getItem('gateDefinitions');
  Breadcrumb = JSON.parse(sessionStorage.getItem('selectedGate')) || [];
  const gateName = Breadcrumb[Breadcrumb.length-1]
  if (storedGateDefinitions) {
    gateDefinitions = makeUsableGateDefinitions(storedGateDefinitions)
  } else {
    console.log('No gate definitions found in localStorage.');
  }
  console.log('Selected gate from sessionStorage:', gateName);
  console.log('gateDefinitions:', gateDefinitions);

  if (!gateName || !gateDefinitions[gateName]) {
    alert(`No gate selected or definition not found for: ${gateName}`);
    return;
  }

  updateBreadcrumb();
  mainGate = gateDefinitions[gateName];
  if (!mainGate.locations) {
    const formulaLabel = document.createElement('div');
    formulaLabel.innerHTML = `<pre>Logic:\n${mainGate.simulate.toString()}</pre>`;
    Object.assign(formulaLabel.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      padding: '20px 30px',
      background: '#1e1e1e',
      color: '#00e676',
      fontFamily: 'monospace',
      fontSize: '20px',
      fontWeight: 'normal',
      borderRadius: '12px',
      maxWidth: '90%',
      maxHeight: '80%',
      overflowY: 'auto',
      whiteSpace: 'pre-wrap',
      textAlign: 'left',
      boxShadow: '0 0 15px rgba(0,0,0,0.5)',
      border: '1px solid #444',
      zIndex: 1000,
    });    
    wrapper.appendChild(formulaLabel);
  } else {reconstructGateFromDefinition();}
};

//--------------------------Main Reconstruction function---------------------------------//
function reconstructGateFromDefinition() {
  console.log('Reconstructing', mainGate);
  const {InputPorts, OutputPorts, Gates, locations} = mainGate;
  const {inputLocations, outputLocations, gateLocations} = locations;

  const inputNodes = inputLocations.map(y => createInput_(y));
  const logicGates = gateLocations.map(({type, x, y}) => createGate_(type, x, y));
  const outputNodes = outputLocations.map(y => createOutput_(y));
    
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
    createWire_(sourcePort,gate.querySelectorAll('.input-port')[portIndex]);
    });
  });
  
  OutputPorts.forEach((outDef, i) => {
    const [_, src] = outDef.split(':');
    let sourcePort
    if (src.startsWith('In')) sourcePort = inputNodes[parseInt(src.replace('In', ''))];
    else if (src) {
    const [srcGateId, outIdx] = src.split('@');
    sourcePort = logicGates[parseInt(srcGateId.match(/\d+$/)[0])].querySelectorAll('.output-port')[outIdx];
    } else return;
    createWire_(sourcePort,outputNodes[i]);
  });
}


//--------------------------Input---------------------------------//
function createInput_(y) {
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
  
  makeElementDraggable(input, 'input');
  let startY = 0;
  input.addEventListener('pointerdown', (e) => {startY = e.clientY; });
  input.addEventListener('pointerup', (e) => {
    if (Math.abs(e.clientY - startY) > 3) return;
    input.textContent = input.textContent === '0' ? '1' : '0';
    input.signal = Number(input.textContent);
  });
  InputZone.appendChild(input);
  return input
}

//--------------------------output---------------------------------//
function createOutput_(y) {
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
  output.addEventListener('signalchange', () => { output.textContent = output.signal});
  OutputZone.appendChild(output);
  return output
}


//--------------------------Gates---------------------------------//

function createGate_(type, x, y) {
  const numberOfInputs = gateDefinitions[type].InputPorts.length;
  const numberOfOutputs = gateDefinitions[type].OutputPorts.length;
  const gateHeight = Math.max(40, ((Math.max(numberOfInputs, numberOfOutputs) + 1) * 15)-5);
  const label = document.createElement('div');
  label.className = 'gate-label';
  label.textContent = type;

  const gate = document.createElement('div');
  gate.classList.add('logic-gate');
  gate.type = type;

  gate.style.position = 'absolute';
  gate.style.left = `${x}px`;
  gate.style.top = `${y}px`;
  gate.style.height = `${gateHeight}px`;
  gate.appendChild(label);
  // Create input ports
  const inputDivision = gateHeight / (numberOfInputs + 1);
  for (let i = 1; i <= numberOfInputs; i++) {
    const input = document.createElement('div');
    input.classList.add('port', 'input-port');
    input.style.top = `${inputDivision * i}px`;
    input.index = i-1;
    input.connectedPort = null;
    input.gate = gate;
    makeSignalProperty(input)
    gate.appendChild(input);
  }

  // Create output ports
  const outputDivision = gateHeight / (numberOfOutputs + 1);
  for (let i = 1; i <= numberOfOutputs; i++) {
    const output = document.createElement('div');
    output.classList.add('port', 'output-port');
    output.style.top = `${outputDivision * i}px`;
    output.index = i-1;
    output.gate = gate;
    makeSignalProperty(output)
    gate.appendChild(output);
  }
  makeElementDraggable(gate, { minX: 0, maxX: canvas.clientWidth - gate.offsetWidth, minY: 0, maxY: canvas.clientHeight - gate.offsetHeight }, '.port');
  gate.addEventListener('dblclick', (e) => { e.preventDefault();openGateInternals_(gate);});
  gate.addEventListener('contextmenu', (e) => { e.preventDefault(); showGateMenu_(e.pageX, e.pageY, gate); });
  canvas.appendChild(gate);
  addLogic(gate,type);
  return gate
}


//--------------------------Wires---------------------------------//
function createWire_(fromPort, toPort) {
  const Wire = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  Wire.setAttribute('style','stroke: #ff5722; stroke-width: 3');
  const { x: x1, y: y1 } = getElementCenterRelativeToWrapper_(fromPort);
  const { x: x2, y: y2 } = getElementCenterRelativeToWrapper_(toPort);  
  Wire.setAttribute('x1', x1);
  Wire.setAttribute('y1', y1);
  Wire.setAttribute('x2', x2);
  Wire.setAttribute('y2', y2);
  svg.appendChild(Wire);

    // Update wire positions when gates move
  document.addEventListener('pointermove', () => {
      const from = getElementCenterRelativeToWrapper_(fromPort);
      const to = getElementCenterRelativeToWrapper_(toPort);
      Wire.setAttribute('x1', from.x);
      Wire.setAttribute('y1', from.y);
      Wire.setAttribute('x2', to.x);
      Wire.setAttribute('y2', to.y);
  });

  fromPort.addEventListener('signalchange', () => { Wire.style.stroke = fromPort.signal ? '#4caf50' : '#f44336'; toPort.signal = fromPort.signal;});
  toPort.signal = fromPort.signal
  Wire.style.stroke = fromPort.signal ? '#4caf50' : '#f44336'
}


//--------------------------Menu---------------------------------//
function showGateMenu_(x, y, gate) {
  document.querySelector('.gate-context-menu')?.remove(); // Remove existing menu if any

  const menu = document.createElement('div');
  menu.classList.add('gate-context-menu');
  menu.style.top = `${y}px`;
  menu.style.left = `${x}px`;

  const peekOption = document.createElement('div');
  peekOption.textContent = '🔍 Peek Inside';
  peekOption.classList.add('menu-item');
  peekOption.onclick = () => { openGateInternals_(gate); menu.remove(); };

  menu.append(peekOption);
  document.body.appendChild(menu);

  // Auto remove on click outside
  document.addEventListener('click', function onClickOutside() { menu.remove(); document.removeEventListener('click', onClickOutside); }, { once: true });
}


//--------------------------getElementCenterRelativeToWrapper for this page!---------------------------------//
function getElementCenterRelativeToWrapper_(el) {
  const elRect = el.getBoundingClientRect();
  const wrapperRect = wrapper.getBoundingClientRect();

  const y = elRect.top - wrapperRect.top + elRect.height / 2;
  let x;

  if (el.classList.contains('output-node')) { x = elRect.left - wrapperRect.left; // Port is on the LEFT side
  } else if (el.classList.contains('input-node')) { x = elRect.right - wrapperRect.left; // Port is on the RIGHT side
  } else { x = elRect.left - wrapperRect.left + elRect.width / 2; // Default: center
  }

  return { x, y };
}

//--------------------------View gate logic---------------------------------//
function openGateInternals_(gateInstance) {
  Breadcrumb.push(gateInstance.type);
  sessionStorage.setItem('selectedGate', JSON.stringify(Breadcrumb));
  location.replace(location.href);  // Replace the current page with the updated state
}


//--------------------------Breadcrumb---------------------------------//
function updateBreadcrumb() {
  const breadcrumbContainer = document.getElementById('breadcrumb');
  breadcrumbContainer.innerHTML = '';

  Breadcrumb.forEach((gateName, index) => {
    const link = document.createElement('a');
    link.textContent = gateName;
    link.style.cursor = 'pointer';

    link.addEventListener('click', () => {
      Breadcrumb = Breadcrumb.slice(0, index + 1);  // Trim the breadcrumb
      sessionStorage.setItem('selectedGate', JSON.stringify(Breadcrumb));
      location.reload();  // Go back to that gate level
    });

    breadcrumbContainer.appendChild(link);

    if (index < Breadcrumb.length - 1) {
      const separator = document.createElement('span');
      separator.textContent = ' > ';
      breadcrumbContainer.appendChild(separator);
    }
  });
}
