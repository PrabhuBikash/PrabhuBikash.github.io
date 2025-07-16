/*!
 * PrismToCanvas.js — Render <pre><code> blocks to <canvas>.
 * 
 * Example:
 * const largeCanvas = renderPrismToCanvas(document.querySelector('pre'), smallCanvas , 2);
 * document.body.appendChild(largeCanvas);
 * 
 * MIT License — free to use, just credit 🫣
 */

/**
 * Takes a Prism-highlighted `<pre>` element and returns a rendered `<canvas>`
 * @param {HTMLPreElement} preElement - A `<pre><code>...</code></pre>` with Prism highlighting
 * @param {number} scalingFactor - the factor by which canvas is needed to be scaled depending on preElement
 * @param {HTMLCanvasElement} canvas - The canvas on shich you have to write
 * @param {number} qualityFactor - scale higher initially to get better quality then scaled down to scalingFactor
 * @returns {HTMLCanvasElement} A canvas rendering of the same code block
 */
function renderPrismToCanvas(preElement, scalingFactor = window.devicePixelRatio || 1, canvas = document.createElement('canvas'), qualityFactor = 1) {
  const initialscale = scalingFactor * qualityFactor;
  const preRect = preElement.getBoundingClientRect();
  const codeEl = preElement.querySelector('code');
  const preStyle = getComputedStyle(preElement);
  const codeStyle = getComputedStyle(codeEl);
  
  canvas.width = preRect.width * initialscale;
  canvas.height = preRect.height * initialscale;
  canvas.style.width = `${canvas.width / initialscale}px`;
  canvas.style.height = `${canvas.height / initialscale}px`;
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.scale(initialscale, initialscale);

  const lines = getLinesWithStyles(codeEl);
  const lineHeight = parseFloat(codeStyle.lineHeight);

  const paddingLeft = (parseFloat(preStyle.paddingLeft) + parseFloat(codeStyle.paddingLeft)) - preElement.scrollLeft;
  const paddingTop = ((parseFloat(preStyle.paddingTop) + parseFloat(codeStyle.paddingTop)) - preElement.scrollTop);

  
  ctx.fillStyle = preStyle.backgroundColor;
  ctx.fillRect(0, 0, canvas.width / initialscale, canvas.height / initialscale);
  ctx.fillStyle = codeStyle.backgroundColor;
  ctx.fillRect(0, 0, canvas.width / initialscale, canvas.height / initialscale);

  for (let i = 0; i < lines.length; i++) {
    const y = paddingTop + i * lineHeight;
    if (y + lineHeight < 0 || y > canvas.height / initialscale) continue;
    const line = lines[i];
    for (let j = 0, x = paddingLeft; j < line.length; j++) {
      x += renderTokenToCanvas(ctx, line[j], x, y);
    }
  }
  
  ctx.scale(1/qualityFactor, 1/qualityFactor);
  return canvas;
}

/**
 * Extracts lines of styled tokens from a Prism-highlighted <code> element
 * Returns an array of lines, where each line is an array of {text, style} objects
 * @param {HTMLElement} codeEl
 * @returns {Array<Array<{ text: string, style: CSSStyleDeclaration }>>}
 */
function getLinesWithStyles(codeEl) {
  const lines = [];
  let currentLine = [];
  
  function walk(parentNode) {
    const inheritedStyle = getComputedStyle(parentNode)
    parentNode.childNodes.forEach( node => {
      if (node.nodeType === Node.TEXT_NODE) {
        (node.textContent || '').split('\n').forEach((part, i) => {
          if (i > 0) { lines.push(currentLine); currentLine = []; }
          if (part) currentLine.push({ text: part, style: inheritedStyle });
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) walk(node);
    })
  }

  walk(codeEl);
  lines.push(currentLine);
  return lines;
}


/**
 * Renders a single syntax-highlighted token onto the canvas.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {{ text: string, style: CSSStyleDeclaration }} token - The token with text and style.
 * @param {number} x - The starting x-coordinate.
 * @param {number} y - The baseline y-coordinate.
 * @returns {number} The width of the rendered text.
 */
function renderTokenToCanvas(ctx, token, x, y) {
  const { text, style:{ color, backgroundColor, fontStyle, fontWeight, fontFamily, fontSize, lineHeight, textShadow, opacity } } = token;
  
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
  const width = ctx.measureText(text).width;
  
  ctx.globalAlpha = parseFloat(opacity);

  if (textShadow && textShadow !== 'none') {
    const shadowParts = textShadow.match(/(-?\d+)px\s+(-?\d+)px\s+(\d+)px\s+(.*)/);
    ctx.shadowOffsetX = +shadowParts[1];
    ctx.shadowOffsetY = +shadowParts[2];
    ctx.shadowBlur    = +shadowParts[3];
    ctx.shadowColor   = shadowParts[4];
  } else {
    ctx.shadowOffsetX = ctx.shadowOffsetY = ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
  }

  if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(x, y - parseFloat(fontSize), width, parseFloat(lineHeight));
  }
  
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  
  return width;
}