const baseInput = document.getElementById("baseInput");
const symbolInput = document.getElementById("symbolInput");
const colorInput = document.getElementById('colorInput');
const colorPickersContainer = document.getElementById('colorPickersContainer');
const colorPreview = document.getElementById("colorPreview");
const shuffleColors = document.getElementById('shuffleColors')
const gateLogic = document.getElementById("gateLogic");
const nextBtn = document.getElementById('nextBtn');
const confirmModal = document.getElementById('confirmModal');
const confirmBtn = document.getElementById('confirmBtn');
const cancelBtn = document.getElementById('cancelBtn');
const previewCanvas = document.getElementById('canvas');
const previewSvg = document.getElementById('wire-layer');
const previewWires = {}
let uniqueIDCounter = 0;
const previewCircuit = {
  gates: [
    {id: "INPUT-0", position: {x: 50, y: 50}},
    {id: "INPUT-1", position: {x: 50, y: 150}},
    {id: "UniversalGate-0", position: {x: 250, y: 100}},
    {id: "OUTPUT-0", position: {x: 450, y: 100}},
  ],
  wires: [
    {from: "INPUT-0@0", to: "UniversalGate-0@0", bends: []},
    {from: "INPUT-1@0", to: "UniversalGate-0@1", bends: []},
    {from: "UniversalGate-0@0", to: "OUTPUT-0@0", bends: []},
  ]
};

let symbols = [0,1]
let colors = []
const gateDefinitions = {
  INPUT:{
    numberOfInputs: 0,
    numberOfOutputs: 1,
    simulate: (_, g) => {
      g.classList.replace('logic-gate', 'node');
      g.classList.add('input-node');
      const output = g.querySelector('.output-port');
      const grid = Object.assign(document.createElement('div'), {className: 'input-button-grid',style: `grid-template-columns: repeat(${Math.min(3, Math.ceil(Math.sqrt(symbols.length - 1)))}, 1fr)`});
      symbols.forEach((sym, i)=> {
        if (!i) return;
        const btn = Object.assign(document.createElement('button'), {className: 'input-button',textContent: sym,style: `background-color: ${colors[symbols.indexOf(sym)] || 'white'}`});
        btn.onclick = () => {
          output.signal = (output.signal === i) ? 0 : i;
          g.style.background = output.signal === 0 ? 'rgba(0,0,0,0.05)' : colors[output.signal] || 'white';
        };        
        grid.appendChild(btn);
      });
      const wrapper = Object.assign(document.createElement('div'), {className: 'input-scroll-wrapper'});
      wrapper.appendChild(grid);
      g.append(wrapper);
      return [0];
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
      if (label) label.textContent = symbols[a];
      g.style.background = colors[a] || 'white';
    }
  },
  UniversalGate:{
    numberOfInputs: 2,
    numberOfOutputs: 1,
    simulate: ([a, b]) => {
      const n = symbols.length;
      if (a === b) return [(a + 1) % n];
      if (a > b && a < n - 1) return [1];
      return [0];
    }
  },
};

baseInput.addEventListener("input", () => {
  symbolInput.value = [...Array(+baseInput.value).keys()].map(String).join(",");; // ['0','1','2',...]
  updateBaseFromSymbols()
});

symbolInput.addEventListener("input", updateBaseFromSymbols);

shuffleColors.onclick = () => {
  for (let i = 0; i < symbols.length; i++) colors[i]=`hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;
  updateColorPickers();
  preview()
};

const editor = CodeMirror.fromTextArea(gateLogic, {
  lineNumbers: true,
  mode: "javascript",
  theme: "material-darker",
  indentUnit: 2,
  tabSize: 2,
  readOnly: "true",     // disables editing *and* hides the cursor
});

nextBtn.onclick = () => confirmModal.style.display = 'flex';
cancelBtn.onclick = () => confirmModal.style.display = 'none';
confirmBtn.onclick = () => {
  try {
    const metadata = JSON.stringify(symbols);
    localStorage.setItem('symbols', metadata);
    localStorage.setItem(`${metadata}_colors`, JSON.stringify(colors));
    localStorage.setItem(`${metadata}_gateDefinitions`, makeStorableGateDefinitions(gateDefinitions));
    window.location.href = 'simulator';
  } catch (err) {
    console.error("Failed to save configuration:", err);
    alert("Oops! Something went wrong while saving your configuration.");
  }
};

//--------------------------delay Input handler---------------------------------//
let userDelay = 0; // default value
document.getElementById("delay-input").addEventListener("input", e => userDelay = parseInt(e.target.value) || 0);


updateColorPickers();
preview()
