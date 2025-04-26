// gate-internals/gate-internals.js
const canvas = document.getElementById('canvas');
const svg_ = document.getElementById('wire-layer');
let mainGate;
let Breadcrumb;
let Wires_ = [];

window.onload = () => {
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
  if (!mainGate.Circuit) {
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
    canvas.appendChild(formulaLabel);
  } else {reconstructGateFromDefinition(mainGate.Circuit);}
};

//--------------------------delay Input handler---------------------------------//
let userDelay = 0; // default value
document.getElementById("delay-input").addEventListener("input", e => userDelay = parseInt(e.target.value) || 0);

//--------------------------Main Reconstruction function---------------------------------//
function reconstructGateFromDefinition(Circuit) {
  console.log('Reconstructing', mainGate);
  const {gates, wires} = Circuit;
  const logicGates = new Map();
  gates.forEach(({id, position}) => logicGates.set(id,createShowGate(id.split('-')[0],position)));
    
  wires.forEach(({from,to,bends}) => {
    const [fromgateId,fromportIndex] = from.split('@')
    const [togateId,toportIndex] = to.split('@')
    const fromPort = logicGates.get(fromgateId).querySelectorAll('.output-port')[fromportIndex];
    const toPort = logicGates.get(togateId).querySelectorAll('.input-port')[toportIndex];
    const AllPoints = [getPortCenter(fromPort),...bends,getPortCenter(toPort)];
    createWire_(fromPort,toPort,AllPoints)
  });
}
//--------------------------Gates---------------------------------//
function createShowGate(type, {x, y}) { // We will treat Input and Output node as Gates as well
  const {numberOfInputs, numberOfOutputs} = gateDefinitions[type];
  const gateHeight = Math.max(40, ((Math.max(numberOfInputs, numberOfOutputs) + 1) * 15)-5);
  
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

  // Create input ports
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

  // Create output ports
  const outputDivision = gateHeight / (numberOfOutputs + 1);
  for (let i = 1; i <= numberOfOutputs; i++) {
    const output = document.createElement('div');
    output.classList.add('port', 'output-port');
    output.style.top = `${outputDivision * i}px`;
    output.index = i - 1;
    makeSignalProperty(output);
    gate.appendChild(output);
  }
  document.body.appendChild(gate); // Now the gate is rendered
  addLogic(gate);
  canvas.appendChild(gate);
  makeElementDraggable(gate,Wires_);
  if (type !== 'INPUT' && type !== 'OUTPUT') gate.addEventListener('dblclick', e => {e.preventDefault();openGateInternals_(gate);});
  gate.addEventListener('contextmenu', (e) => { e.preventDefault(); showGateMenu_(e.pageX, e.pageY, gate); });
  return gate
}


//--------------------------Wires---------------------------------//
function createWire_(fromPort,toPort,AllPoints) {
  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  polyline.setAttribute('stroke', `${colorDict[fromPort.signal]}`);
  polyline.setAttribute('fill', 'none');
  polyline.setAttribute('stroke-width', '3');
  polyline.setAttribute("points", AllPoints.map(p => `${p.x},${p.y}`).join(" "));
  const id = `wire-id_${uniqueIDCounter++}`;
  makeSignalProperty(polyline, fromPort.signal);
  fromPort.addEventListener('signalchange', () => polyline.signal = fromPort.signal);
  polyline.addEventListener('signalchange', () => toPort.signal = polyline.signal);
  toPort.signal = polyline.signal;
  toPort.connectedPort = fromPort;
  svg_.appendChild(polyline);
  Wires_[id] = {wireElement: polyline, fromPort: fromPort, toPort: toPort, bendPoints: AllPoints.slice(1,-1)};
}
document.addEventListener('pointermove', () => {
  Object.keys(Wires_).forEach(id => {
    const { wireElement, fromPort, toPort, bendPoints } = Wires_[id];
    const fromRect = fromPort.getBoundingClientRect();
    const toRect = toPort.getBoundingClientRect();
    const svgRect = svg_.getBoundingClientRect();

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

//--------------------------View gate logic---------------------------------//
function openGateInternals_(gateInstance) {
  Breadcrumb.push(gateInstance.dataset.type);
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
