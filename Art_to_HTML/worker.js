self.onmessage = (e) => {
  const { imageData, height, width, usingNamedColors, method } = e.data;
  if (method == 'rectangle') RectangleCoveringMethod(imageData, height, width, usingNamedColors);
  else if (method == 'strip') StripWiseMethod(imageData, height, width, usingNamedColors);
  else if (method == 'boxshadow') renderBoxShadowMode(imageData, height, width, usingNamedColors);
};


//------------------------------------------------- Generate Pixel Matrix -------------------------------------------------//
function getPixelMatrix(imageData, height, width, usingNamedColors) {
  const totalPixels = height * width;
  const pixels = [];
  const freq = {};
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const clr = closestNamedColor([imageData[idx], imageData[idx + 1], imageData[idx + 2], imageData[idx + 3]], usingNamedColors);
      freq[clr] = (freq[clr] || 0) + 1;
      row.push(clr)
      self.postMessage({ progress: `Extracting colors: ${idx/totalPixels * 25}%`, chunk: '' });
    }
    pixels.push(row);
  }

  return {matrix:pixels, colors: Object.entries(freq).sort((a, b) => b[1] - a[1])};
}

//------------------------------------------------- RGBA - Hex Colour -------------------------------------------------//
function rgbToHex(r, g, b, a = 255) {
  let hex = [r, g, b, a].map(v => v.toString(16).padStart(2, '0'));
  if (hex.every(h => h[0] === h[1])) {
    return hex[3] === 'ff'
      ? '#' + hex.slice(0, 3).map(h => h[0]).join('') // #rgb
      : '#' + hex.map(h => h[0]).join('');            // #rgba
  } else {
    return hex[3] === 'ff'
      ? '#' + hex.slice(0, 3).join('')                // #rrggbb
      : '#' + hex.join('');                           // #rrggbbaa
  }
}



//------------------------------------------------- Named Colour -------------------------------------------------//
function closestNamedColor(rgbArray, named = true) {
  [r,g,b,a] = rgbArray.map(v => parseInt(v))
  if (!named) return rgbToHex(r, g, b, a);

  let minDist = Infinity;
  let closest = null;
  for (const [name, [nr, ng, nb]] of Object.entries(cssNamedColors)) {
    const dist = Math.sqrt((r - nr)**2 + (g - ng)**2 + (b - nb)**2);
    if (dist < minDist) {
      minDist = dist;
      closest = name;
      if (dist == 0) break;
    }
  }
  return closest;
}

const cssNamedColors = {
  AliceBlue: [240,248,255],
  AntiqueWhite: [250,235,215],
  Aqua: [0,255,255],
  Aquamarine: [127,255,212],
  Azure: [240,255,255],
  Beige: [245,245,220],
  Bisque: [255,228,196],
  Black: [0,0,0],
  BlanchedAlmond: [255,235,205],
  Blue: [0,0,255],
  BlueViolet: [138,43,226],
  Brown: [165,42,42],
  BurlyWood: [222,184,135],
  CadetBlue: [95,158,160],
  Chartreuse: [127,255,0],
  Chocolate: [210,105,30],
  Coral: [255,127,80],
  CornflowerBlue: [100,149,237],
  Cornsilk: [255,248,220],
  Crimson: [220,20,60],
  Cyan: [0,255,255],
  DarkBlue: [0,0,139],
  DarkCyan: [0,139,139],
  DarkGoldenRod: [184,134,11],
  DarkGray: [169,169,169],
  DarkGrey: [169,169,169],
  DarkGreen: [0,100,0],
  DarkKhaki: [189,183,107],
  DarkMagenta: [139,0,139],
  DarkOliveGreen: [85,107,47],
  DarkOrange: [255,140,0],
  DarkOrchid: [153,50,204],
  DarkRed: [139,0,0],
  DarkSalmon: [233,150,122],
  DarkSeaGreen: [143,188,143],
  DarkSlateBlue: [72,61,139],
  DarkSlateGray: [47,79,79],
  DarkSlateGrey: [47,79,79],
  DarkTurquoise: [0,206,209],
  DarkViolet: [148,0,211],
  DeepPink: [255,20,147],
  DeepSkyBlue: [0,191,255],
  DimGray: [105,105,105],
  DimGrey: [105,105,105],
  DodgerBlue: [30,144,255],
  FireBrick: [178,34,34],
  FloralWhite: [255,250,240],
  ForestGreen: [34,139,34],
  Fuchsia: [255,0,255],
  Gainsboro: [220,220,220],
  GhostWhite: [248,248,255],
  Gold: [255,215,0],
  GoldenRod: [218,165,32],
  Gray: [128,128,128],
  Grey: [128,128,128],
  Green: [0,128,0],
  GreenYellow: [173,255,47],
  HoneyDew: [240,255,240],
  HotPink: [255,105,180],
  IndianRed: [205,92,92],
  Indigo: [75,0,130],
  Ivory: [255,255,240],
  Khaki: [240,230,140],
  Lavender: [230,230,250],
  LavenderBlush: [255,240,245],
  LawnGreen: [124,252,0],
  LemonChiffon: [255,250,205],
  LightBlue: [173,216,230],
  LightCoral: [240,128,128],
  LightCyan: [224,255,255],
  LightGoldenRodYellow: [250,250,210],
  LightGray: [211,211,211],
  LightGrey: [211,211,211],
  LightGreen: [144,238,144],
  LightPink: [255,182,193],
  LightSalmon: [255,160,122],
  LightSeaGreen: [32,178,170],
  LightSkyBlue: [135,206,250],
  LightSlateGray: [119,136,153],
  LightSlateGrey: [119,136,153],
  LightSteelBlue: [176,196,222],
  LightYellow: [255,255,224],
  Lime: [0,255,0],
  LimeGreen: [50,205,50],
  Linen: [250,240,230],
  Magenta: [255,0,255],
  Maroon: [128,0,0],
  MediumAquaMarine: [102,205,170],
  MediumBlue: [0,0,205],
  MediumOrchid: [186,85,211],
  MediumPurple: [147,112,219],
  MediumSeaGreen: [60,179,113],
  MediumSlateBlue: [123,104,238],
  MediumSpringGreen: [0,250,154],
  MediumTurquoise: [72,209,204],
  MediumVioletRed: [199,21,133],
  MidnightBlue: [25,25,112],
  MintCream: [245,255,250],
  MistyRose: [255,228,225],
  Moccasin: [255,228,181],
  NavajoWhite: [255,222,173],
  Navy: [0,0,128],
  OldLace: [253,245,230],
  Olive: [128,128,0],
  OliveDrab: [107,142,35],
  Orange: [255,165,0],
  OrangeRed: [255,69,0],
  Orchid: [218,112,214],
  PaleGoldenRod: [238,232,170],
  PaleGreen: [152,251,152],
  PaleTurquoise: [175,238,238],
  PaleVioletRed: [219,112,147],
  PapayaWhip: [255,239,213],
  PeachPuff: [255,218,185],
  Peru: [205,133,63],
  Pink: [255,192,203],
  Plum: [221,160,221],
  PowderBlue: [176,224,230],
  Purple: [128,0,128],
  RebeccaPurple: [102,51,153],
  Red: [255,0,0],
  RosyBrown: [188,143,143],
  RoyalBlue: [65,105,225],
  SaddleBrown: [139,69,19],
  Salmon: [250,128,114],
  SandyBrown: [244,164,96],
  SeaGreen: [46,139,87],
  SeaShell: [255,245,238],
  Sienna: [160,82,45],
  Silver: [192,192,192],
  SkyBlue: [135,206,235],
  SlateBlue: [106,90,205],
  SlateGray: [112,128,144],
  SlateGrey: [112,128,144],
  Snow: [255,250,250],
  SpringGreen: [0,255,127],
  SteelBlue: [70,130,180],
  Tan: [210,180,140],
  Teal: [0,128,128],
  Thistle: [216,191,216],
  Tomato: [255,99,71],
  Turquoise: [64,224,208],
  Violet: [238,130,238],
  Wheat: [245,222,179],
  White: [255,255,255],
  WhiteSmoke: [245,245,245],
  Yellow: [255,255,0],
  YellowGreen: [154,205,50],
};


//------------------------------------------------- Find Best Rectangle -------------------------------------------------//
function findMaxRectangleFrom(x0, y0, visited, height, width) {
  function checkRow(x, y, w) {
    for (let i = 0; i < w; i++) {
      if (visited[y][x + i]) return false;
    }
    return true;
  }

  function checkCol(x, y, h) {
    for (let i = 0; i < h; i++) {
      if (visited[y + i][x]) return false;
    }
    return true;
  }

  let maxArea = 0;
  let bestRect = { x: x0, y: y0, w: 1, h: 1 };
  let h = 1, w = 1;

  while (y0 + h <= height && checkRow(x0, y0 + h - 1, w)) {
    let tempW = w;
    while (x0 + tempW < width && checkCol(x0 + tempW, y0, h)) tempW++;
    if (h * tempW > maxArea) {
      maxArea = h * tempW;
      bestRect = { x: x0, y: y0, w: tempW, h: h };
    }
    h++;
  }

  return bestRect;
}

function coverMatrixWithRectangles(matrix, height, width, bgClr) {
  const totalPixels = height * width;
  const visited = Array.from({ length: height }, (_, y) =>  Array.from({ length: width }, (_, x) => matrix[y][x] === bgClr));
  const rectangles = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (visited[y][x]) continue;

      const color = matrix[y][x];
      const rect = findMaxRectangleFrom(x, y, visited, height, width);
      for (let dy = 0; dy < rect.h; dy++) {
        for (let dx = 0; dx < rect.w; dx++) {
          visited[rect.y + dy][rect.x + dx] = matrix[rect.y + dy][rect.x + dx] == color;
        }
      }

      rectangles.push({ ...rect, color });
      self.postMessage({ progress: `Extracting rectangles: ${(y * width + x)/totalPixels * 100}%`, chunk: '' });
    }
  }

  return rectangles;
}


function RectangleCoveringMethod(imageData, height, width, usingNamedColors) {
  const {matrix:pixelMatrix, colors:Clrs } = getPixelMatrix(imageData, height, width, usingNamedColors);
  self.postMessage({ progress: 'pixel Matrix generated', chunk: '' });
  const maxClr = Clrs?.[0]?.[0] ?? 'transparent';
  const sndMaxClr = Clrs?.[1]?.[0] ?? null;
  const rectangles = coverMatrixWithRectangles(pixelMatrix,height,width,maxClr);
  
  const header = `<div id="art">
\t<style>
\t\t#art {margin:0;padding:0;height:${height}px;width:${width}px;display:block;background:${maxClr};position:relative}${!sndMaxClr ? '' : `
\t\t#art i{display:inline-block;background:var(--0,${sndMaxClr});width:calc(var(--1,1)*1px);height:calc(var(--2,1)*1px);position:absolute;top:calc(var(--3,0)*1px);left:calc(var(--4,0)*1px);}`}
\t</style>\n`;
  self.postMessage({ progress: 'Writting Code: 0%', chunk: header });

  // Stream the strips one by one
  for (let i = 0; i < rectangles.length; i++) {
    const {color, x, y, w, h} = rectangles[i];
    const styles = [];
    if (color !== sndMaxClr) styles.push(`--0:${color}`);
    if (w !== 1) styles.push(`--1:${w}`);
    if (h !== 1) styles.push(`--2:${h}`);
    if (y !== 0) styles.push(`--3:${y}`);
    if (x !== 0) styles.push(`--4:${x}`);
    const rectHTML = `\t<i${styles.length ? ` style="${styles.join(';')}"` : ''}></i>\n`;

    self.postMessage({progress: `Writting Code: ${((i + 1) / rectangles.length) * 100}%`, chunk: rectHTML });
  }
  self.postMessage({ progress: 'Done!', chunk: `</div>` });
}

function StripWiseMethod(imageData, height, width, usingNamedColors){
  const {matrix:pixelMatrix, colors:Clrs } = getPixelMatrix(imageData, height, width, usingNamedColors);
  self.postMessage({ progress: 'pixel Matrix generated', chunk: '' });
  const maxClr = Clrs?.[0]?.[0] ?? 'transparent';
  const strips = splitToStrips(pixelMatrix);
  
  const header = `<div id="art">
\t<style>
\t\t#art {margin:0;padding:0;height:${height}px;width:${width}px;display:block;background:${maxClr}}
\t\t#art p{margin:0;padding:0;height:calc(var(--2,1)*1px);width:inherit;font-size:0;}
\t\t#art i{display:inline-block;height:inherit;width:calc(var(--1,1)*1px);font-size:0;background:var(--0,${maxClr});}
\t</style>\n`;
  self.postMessage({ progress: 'Writting Code: 0%', chunk: header });
  
  for (let i = 0; i < strips.length; i++) {
    const [strip, ht] = strips[i];
    
    const stripHtml = `\t<p${ht > 1 ? ` style="--2:${ht}"` : ''}>` +
      strip.map(([cs, rl]) => {
        if (cs == maxClr && rl == 1) return '<i></i>';
        return `<i style="${cs === maxClr ? '' : `--0:${cs};`}${rl > 1 ? `--1:${rl};` : ''}"></i>`;
      }).join('') + `</p>\n`;

    self.postMessage({progress: `Writting Code: ${((i + 1) / strips.length) * 100}%`, chunk: stripHtml });
  }
  self.postMessage({ progress: 'Done!', chunk: `</div>` });
}


//------------------------------------------------- My Naive Approach (Seems to be best till now!) -------------------------------------------------//
function splitToStrips(pixelMatrix) {
  function areStripsEqual(strip1, strip2) {
    if (!strip1 || !strip2 || strip1.length !== strip2.length) return false;
    return strip1.every((pair, i) => {
      const other = strip2[i];
      return pair[0] === other[0] && pair[1] === other[1];
    });
  }
  
  const strips = [];
  let currStrip = null;
  let stripHeight = 0;

  for (const row of pixelMatrix) {
    const strip = [];
    let currClr = row[0];
    let runLength = 0;

    for (let i = 1; i < row.length; i++) {
      const clr = row[i];
      if (clr !== currClr) {
        strip.push([currClr, runLength]);
        currClr = clr;
        runLength = 1;
      } else runLength++;
    } strip.push([currClr, runLength]);

    if (!areStripsEqual(strip, currStrip)) {
      if (currStrip !== null) strips.push([currStrip, stripHeight]);
      currStrip = strip;
      stripHeight = 0;
    } stripHeight++;
  } if (currStrip !== null) strips.push([currStrip, stripHeight]);

  return strips
}


//------------------------------------------------- Box Shadow Approach -------------------------------------------------//
function renderBoxShadowMode(imageData, height, width, usingNamedColors) {
  const totalPixels = height * width;
  let boxShadows = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      row.push(`${x}px ${y}px ${closestNamedColor([imageData[idx], imageData[idx + 1], imageData[idx + 2], imageData[idx + 3]], usingNamedColors)}`);
      self.postMessage({ progress: `Extracting colors: ${idx/totalPixels * 25}%`, chunk: '' });
    }
    boxShadows.push(row)
  }

  self.postMessage({progress: `Writting Code...`, chunk: '' });
  const shadowCSS = `<div id="art">
  <style>
    #art {margin:0;padding:0;height:${height}px;width:${width}px;display:block;background:black}
    #art i {
      width: 1px; height: 1px;
      display:inline-block;
      /*filter: blur(1px);  change it as needed! */
      box-shadow:\n${boxShadows.map(r => r.join(', ')).join(',\n')};
    }
  </style>
  <i></i>
</div>`;
  self.postMessage({ progress: 'Done!', chunk: shadowCSS });
  console.log(shadowCSS)
}