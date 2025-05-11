// Define reusable logic gate collections here.
// Each preset is a named object with multiple gates inside.

const presetLibrary = {
  "(suggest a cool name!) (warning: going to be messy)": {
    IS_Active:{
      numberOfInputs: 1,
      numberOfOutputs: 1,
      simulate: ([a]) => [+!!a],
    },
    Clock: {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      simulate: (_, gateEl) => {
        const __port = gateEl.querySelector('.output-port');
        const interval = +prompt("Interval in ms:", "1000") || 1000;
        setTimeout(() => {setInterval(() => {__port.signal ^= 1; }, interval);}, interval - (Date.now() % interval));
        return [__port.signal];
      }
    },
    Next: {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      simulate: ([a]) => [(a+1)%symbols.length],
    },
    Prev: {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      simulate: ([a]) => [(a-1)%symbols.length],
    },
  },
  "Basis Pack (Accidentally deleted? no worries!)": {
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
  },
};

window.presetLibrary = presetLibrary;
