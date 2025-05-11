// Define reusable logic gate collections here.
// Each preset is a named object with multiple gates inside.

const presetLibrary = {
  "Basic Pack": {
    AND: {
      InputPorts: ['In0', 'In1'],
      OutputPorts: ['Out0'],
      simulate: ([a, b]) => [+(a && b)],
    },
    OR: {
      InputPorts: ['In0', 'In1'],
      OutputPorts: ['Out0'],
      simulate: ([a, b]) => [+(a || b)],
    },
    NOT: {
      InputPorts: ['In0'],
      OutputPorts: ['Out0'],
      simulate: ([a]) => [+!a],
    },
  },

  "Classic Pack": {
    XOR: {
      InputPorts: ['In0', 'In1'],
      OutputPorts: ['Out0'],
      simulate: ([a, b]) => [+(a !== b)],
    },
    XNOR: {
      InputPorts: ['In0', 'In1'],
      OutputPorts: ['Out0'],
      simulate: ([a, b]) => [+(a === b)],
    },
    NOR: {
      InputPorts: ['In0', 'In1'],
      OutputPorts: ['Out0'],
      simulate: ([a, b]) => [+!(a || b)],
    },
    NAND: {
      InputPorts: ['In0', 'In1'],
      OutputPorts: ['Out0'],
      simulate: ([a, b]) => [+!(a && b)],
    },
  },
  "Clock": {
    Clock: {
      InputPorts: [],
      OutputPorts: ['Out0'],
      simulate: (_, gateEl) => {
        const __port = gateEl.querySelector('.output-port');
        const interval = +prompt("Interval in ms:", "1000") || 1000;
        setTimeout(() => {setInterval(() => {__port.signal ^= 1; }, interval);}, interval - (Date.now() % interval));
        return [__port.signal];
      }
          
    },
  },
};

window.presetLibrary = presetLibrary;