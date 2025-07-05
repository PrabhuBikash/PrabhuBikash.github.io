const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('originalCanvas');
const ctx = canvas.getContext('2d');
const renderPreview = document.getElementById('renderPreview');
const codeArea = document.getElementById('codeArea');
const codeBox = document.getElementById('codeBox');
const sideBar = document.getElementById('sidebar');
const previewImage = document.getElementById('previewImage');
const codeSize = document.getElementById('codeSize');
const originalityToggle = document.getElementById('originalityToggle');
const editButton = document.getElementById('editButton');
const copyButton = document.getElementById('copyButton');
const progressBar = document.getElementById('progressBar');
const methodToggle = document.getElementById('methodToggle');
const reryButton = document.getElementById('reryButton');
const moreBtn = document.getElementById('moreBtn');
const dpDownContent = document.getElementById('dropdown-content');
const downloadHtmlBtn = document.getElementById('downloadHtmlBtn');
const currentMode = document.getElementById('currentMode');

//------------------------------------------------- Worker Message Handler-------------------------------------------------//
let buffer = '';
const worker = new Worker('worker.js');
worker.onmessage = (e) => {
  const data = e.data;
  buffer += data.chunk;
  progressBar.textContent = data.progress;
  if (data.progress === 'Done!') {
    console.log('if any problem you can copy code from the console too:')
    console.log(buffer);
    codeBox.textContent = buffer;
    codeBox.dispatchEvent(new Event('input', { bubbles: true }));
  }
};


//------------------------------------------------- More button Handler -------------------------------------------------//
moreBtn.onclick = () => {
  dpDownContent.style.display = 'block';
  const outsideClickListener = (e) => {
    if (!dpDownContent.contains(e.target) && !moreBtn.contains(e.target)) {
      dpDownContent.style.display = 'none';
      document.removeEventListener('click', outsideClickListener);
    }
  };
  document.addEventListener('click', outsideClickListener);
};


//------------------------------------------------- Method Toggle -------------------------------------------------//
let method = 'strip';
methodToggle.onclick = () => {
  if (method === 'strip') {
    method = 'rectangle';
    currentMode.innerText = `Rectangle • ${usingNamedColors ? 'Named' : 'Exact'}`;
    methodToggle.textContent = '⚙️ Box-Shadow';
    methodToggle.title = 'Switch to boxshadow CSS Method';
  } else if (method === 'rectangle'){
    method = 'boxshadow';
    currentMode.innerText = `Box-Shadow • ${usingNamedColors ? 'Named' : 'Exact'}`;
    methodToggle.textContent = '⚙️ Strip';
    methodToggle.title = 'Switch to Strip Covering Mode';
  } else if (method === 'boxshadow'){
    method = 'strip';
    currentMode.innerText = `Strip • ${usingNamedColors ? 'Named' : 'Exact'}`;
    methodToggle.textContent = '⚙️ Rectangle';
    methodToggle.title = 'Switch to Rectangle Covering Method';
  }
}

//------------------------------------------------- Use Named colors or exact ? -------------------------------------------------//
let usingNamedColors = false;
originalityToggle.onclick = () => {
  usingNamedColors = !usingNamedColors;
  if (usingNamedColors) {
    currentMode.innerText = `${method === 'strip' ? 'Strip' : method === 'rectangle' ? 'Rectangle' : 'Box-Shadow'} • Named`;
    originalityToggle.textContent = '🎨 Exact';
    originalityToggle.title = 'Switch to full color mode (exact in HEX)';
  } else {
    currentMode.innerText = `${method === 'strip' ? 'Strip' : method === 'rectangle' ? 'Rectangle' : 'Box-Shadow'} • Exact`;
    originalityToggle.textContent = '🎨 Named';
    originalityToggle.title = 'Switch to named colors only (lossy but HTMl-theme)';
  }
}

//------------------------------------------------- Edit? -------------------------------------------------//
editButton.onclick = () => {
  codeBox.readOnly = !codeBox.readOnly;
  if (codeBox.readOnly) {
    editButton.textContent = '✏️ Edit';
    editButton.title = 'Switch to Edit Mode';
  } else {
    editButton.textContent = '📖 Read';
    editButton.title = 'Switch to Read only';
  }
}

//------------------------------------------------- Copy -------------------------------------------------//
copyButton.onclick = async () => {
  try {
    await navigator.clipboard.writeText(codeBox.textContent);
    copyButton.textContent = 'Copied!';
  } catch (err) {
    copyButton.textContent = 'Failed to copy';
  }
  setTimeout(() => copyButton.textContent = '⧉ Copy', 500);
};

//------------------------------------------------- Preview Image -------------------------------------------------//
previewImage.onclick = () => {
  window.open(URL.createObjectURL(new Blob([`
<style>
  body {
    background: black
  }
  #display {
    box-shadow: 0 0 0 1px #fff, 0 0 0 3px rgba(0, 0, 0, 0.6);
    margin:10px;
    height:fit-content;
    width:fit-content;
  }
</style>
<div id="display">
` + codeBox.textContent
+ `</div>
<button id="downloadHtmlBtn"> Download the HTML</button>
<script>
  document.getElementById('downloadHtmlBtn').onclick = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([document.getElementById('display').innerHTML], { type: 'text/html' }));
    a.download = '${fileName ?? 'page'}.html';
    a.click();
    URL.revokeObjectURL(a.href);
  }
</script>`], { type: 'text/html' })), '_blank');
}

//------------------------------------------------- Retry -------------------------------------------------//
reryButton.onclick = () => {
  imageInput.dispatchEvent(new Event('change', { bubbles: true }));
  dpDownContent.style.display = 'none';
}

//------------------------------------------------- Download as HTML -------------------------------------------------//
downloadHtmlBtn.onclick = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([codeBox.textContent], { type: 'text/html' }));
  a.download = (fileName ?? 'page') + '.html';
  a.click();
  URL.revokeObjectURL(a.href);
};
//------------------------------------------------- get Code Size -------------------------------------------------//
codeBox.oninput = () => {
  renderPreview.innerHTML = codeBox.textContent;
  const bytes = new Blob([codeBox.textContent]).size;
  codeSize.innerHTML = bytes >= 1e9 ? (bytes / 1e9).toFixed(2) + ' GB' :
    (bytes >= 1e6) ? (bytes / 1e6).toFixed(2) + ' MB' :
    (bytes >= 1e3) ? (bytes / 1e3).toFixed(2) + ' KB' :
    bytes + ' B';
}

//------------------------------------------------- Image Input Handler -------------------------------------------------//
let fileName = null;
imageInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  console.log('The File you just uploaded:', file);

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const width = renderPreview.width = canvas.width = img.width;
      const height = renderPreview.height = canvas.height = img.height;
      renderPreview.style.aspectRatio = canvas.style.aspectRatio = `${width} / ${height}`;
      sideBar.style.minWidth = 'fit-content';
      sideBar.style.minHeight = 'fit-content';
      const sidebarRect = sideBar.getBoundingClientRect();
      codeArea.style.minWidth = sidebarRect.width + 'px';
      codeArea.style.minHeight = sidebarRect.height + 'px';
      ctx.drawImage(img, 0, 0);
      codeBox.textContent = '';
      renderPreview.innerHTML = '';
      buffer = '';
      fileName = file.name.replace(/\.[^/.]+$/, "");
      worker.postMessage({ imageData:ctx.getImageData(0, 0, width, height).data, height, width, usingNamedColors, method });
    };
    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
}
