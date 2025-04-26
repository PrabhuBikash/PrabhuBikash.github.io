// presets.js

// Define reusable logic gate collections here.
// Each preset is a named object with multiple gates inside.

const presetLibrary = {
  "Binary Basis Pack (warning: going to be messy)": {
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
    NOR: {
      numberOfInputs: 2,
      numberOfOutputs: 1,
      simulate: ([a, b]) => [+!(a || b)],
    },
  },
  "DNA Basis Pack (Accidentally deleted? no worries!)": {
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
  },
};

// Exported for use in other scripts
window.presetLibrary = presetLibrary;