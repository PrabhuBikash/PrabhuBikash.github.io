
//----------------------------------- Patched print/input/sleep -----------------------------------//
async function codeFixes(pyodide){
  await pyodide.runPythonAsync(`import js, asyncio`);
}

function print(...args) {
  let kwargs = {};
  if (args.length && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
    const lastArg = args[args.length - 1];
    if ('sep' in lastArg || 'end' in lastArg) kwargs = args.pop();
  }
  const text = args.map(arg => pyodide.globals.get("str")(arg)).join(kwargs.sep ?? " ") + (kwargs.end ?? "\n");
  term.write(text.replace(/\n/g, '\r\n'));  // Convert \n to \r\n for xterm compatibility
}

async function input(promptText = "") {
  return new Promise(resolve => {
    let buffer = "";
    term.write(promptText.replace(/\n/g, '\r\n'));

    const listener = term.onData(char => {
      if (char === "\r") { // Enter key
        term.write("\r\n");
        listener.dispose(); // Stop listening
        resolve(buffer);
      } else if (char === "\u007f") { // Backspace
        if (buffer.length > 0) {
          buffer = buffer.slice(0, -1);
          term.write("\b \b");
        }
      } else {
        buffer += char;
        term.write(char);
      }
    });
  });
}


//----------------------------------- append await -----------------------------------//
function parsePythonForPyodide(code) {
  const alternatives = {
    'print': 'js.print',
    'input': 'await js.input',
    'time.sleep': 'await asyncio.sleep'
  };
  const builtinsToAwait = new Set(Object.keys(alternatives));
  const lines = code.split('\n');
  const parsedlines = [];
  const mainregEx = () => new RegExp(`(${[...builtinsToAwait].map(s => s.replace(/\./g, '\\.')).join('|')})\\b\\(`);
  let re = mainregEx(); // match function call

  let inString = false;
  let inFString = false;
  let stringChar;
  let allowFurther = 0;

  for (let line of lines) {
    let i = 0;
    let newLine = '';

    while (i < line.length) { // handles a single line
      const ch = line[i];

      if (!inString && (ch === '"' || ch === "'")) { // Handle entering/exiting strings
        inString = true;
        inFString = i > 0 && (line[i - 1] === 'f' || line[i - 1] === 'F');
        stringChar = ch;
        newLine += ch;
        i++;
        continue;
      }

      if (inString) {
        if (ch === stringChar) { // there is no way to detect if it's escaped because "\'" and "'" are stored as "'"
          inString = false;
          inFString = false;
          allowFurther = 0;
        } else if (inFString){
          if (ch === "{" && !allowFurther) allowFurther++;
          else if (ch === "}" && allowFurther) allowFurther--;
        }
        if (!allowFurther) {newLine += ch;i++;continue;}
      }

      if (ch === '#') { // Handle comments — skip the rest of the line
        newLine += line.slice(i);
        break;
      }

      // Match function definitions (and add async if needed)
      const remaining = line.slice(i);
      const reDef = /^\s*def\s+([a-zA-Z_][a-zA-Z0-9_]*)\b/;
      const defMatch = remaining.match(reDef);

      if (defMatch) {
        const funcName = defMatch[1];
        if (/^\w+_$/.test(funcName)) {// Skip dunder (magic) methods like __init__, __str__, etc. and also allows to force a sync function without not much change
          newLine += line; // Leave the line unchanged
          break;
        }
        const leadingSpaceMatch = line.match(/^(\s*)def/);
        if (leadingSpaceMatch) {
          newLine = line.replace(/^(\s*)def/, '$1async def'); // Add async
          alternatives[funcName] = `await ${funcName}`;
          builtinsToAwait.add(funcName);
          re = mainregEx(); // Update the main regex
          break; // Fully handled this line
        }
      }

      // Handle other cases like assignment or class definition
      for (const builtin of builtinsToAwait) {
        const reAssign = new RegExp(`^\\s*${builtin}\\s*=`);
        const reClass = new RegExp(`^\\s*class\\s+${builtin}\\b`);
        if (reAssign.test(line) || reClass.test(line)) {
          builtinsToAwait.delete(builtin);
          re = mainregEx(); // match function call
        }
      }

      if (i > 0 && /\w|\./.test(line[i - 1])) { // Skip if there isn't a word boundary before
        newLine += ch;
        i++;
        continue;
      }

      // Try to match function calls
      const match = remaining.match(re);
      if (match && remaining.indexOf(match[1]) === 0) {
        newLine += alternatives[match[1]]; // Replace with async equivalent
        i += match[1].length;
        continue;
      }

      newLine += ch; // Default: add current char
      i++;
    }

    parsedlines.push(newLine);
  }

  parsedCode = parsedlines.join('\n')
  console.log('Here is the parsed code:\n',parsedCode)
  return parsedCode;
}
