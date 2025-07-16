//Initialize core DOM elements and app state
const main = document.querySelector('main');
const slidesContainer = document.querySelector('.slides');
const editorContainer = document.getElementById('editor-container');
const codeEditor = document.getElementById('code-editor');
const highlightLayer = document.getElementById('highlight-layer');
const fullscreenBtn = document.getElementById('fullscreen-toggle');
const playButton = document.getElementById('play-slideshow');
const persistenceInput = document.getElementById('persistence-input');
const fontsizeInput = document.getElementById('fontsize-input');
const langSelector = document.getElementById('language-selector');
const themeSelector = document.getElementById('theme-selector');
const themeLink = document.getElementById('theme-link');
const vfsOpenBtn = document.getElementById('file-menu');
const vfsDialog = document.getElementById('vfs-dialog');
const saveProjectBtn = document.getElementById('save-project');
const newProjectBtn = document.getElementById('new-project');
const importProjectInput = document.getElementById('import-project');
const vfsMenu = document.getElementById('projects-menu');
const projectContextmenu = document.getElementById('project-contextmenu');
const projectNameHeading = document.getElementById('project-name');
const openProjectBtn = document.getElementById('open-project');
const deleteProjectBtn = document.getElementById('delete-project');
const exportProjectBtn = document.getElementById('export-project');
const downloadVideoBtn = document.getElementById('download-video');
const openSplitter = document.getElementById('open-splitter');
const splitDropdown = document.getElementById('split-dropdown');

let activeSlide = slidesContainer.querySelector('.active-slide');
activeSlide.dataset.language = langSelector.value;
activeSlide.dataset.persistence = persistenceInput.value;
activeSlide.dataset.fontsize = fontsizeInput.value;
activeSlide.addEventListener('scroll', syncScrollWithEditor);

//---------------------------------------------------------------- Create-Open-Delete Slide ----------------------------------------------------------------//
/**
 * Creates a new slide element with attached buttons and data attributes.
 * @param {string} content - Code content of the slide.
 * @param {string} language - Programming language for syntax highlighting.
 * @param {number} persistence - Delay for slideshow in milliseconds.
 * @param {number} fontsize - size of the font in the slide in non-standard unit.
 * @returns {HTMLLIElement} A list item containing the slide and control buttons.
 */
function createSlide(content = '', language = langSelector.value, persistence = persistenceInput.value, fontsize = fontsizeInput.value) {
  const slideDiv = document.createElement('pre');
  slideDiv.className = 'slide';
  slideDiv.dataset.language = language;
  slideDiv.dataset.persistence = persistence;
  slideDiv.dataset.fontsize = fontsize;
  slideDiv.innerText = content;

  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.innerText = '✕';

  const li = document.createElement('li');
  li.append(addBtn, slideDiv, deleteBtn);
  return li;
}

/**
 * Opens a given slide in the editor pane, syncing its content and metadata.
 * @param {HTMLElement} slide - The slide element to activate.
 */
function openSlide(slide) {
  if (!slide) {
    main.classList.add('deactivated');
    codeEditor.readOnly = true;
    return;
  }

  main.classList.remove('deactivated');
  codeEditor.readOnly = false;

  if (activeSlide) {
    activeSlide.classList.remove('active-slide');
    activeSlide.removeEventListener('scroll', syncScrollWithEditor);
  }

  activeSlide = slide;
  activeSlide.classList.add('active-slide');
  activeSlide.addEventListener('scroll', syncScrollWithEditor);

  codeEditor.value = activeSlide.innerText;
  codeEditor.focus();

  updateSlideContent(activeSlide, codeEditor.value, activeSlide.dataset.language, activeSlide.dataset.fontsize).then(() => {
    activeSlide.dispatchEvent(new Event('scroll'));
    langSelector.value = activeSlide.dataset.language;
    persistenceInput.value = activeSlide.dataset.persistence;
    fontsizeInput.value = activeSlide.dataset.fontsize;
  });
}

/**
 * Handles click interactions within the slide container.
 * - Adds new slides
 * - Opens selected slides
 * - Deletes slides
 */
slidesContainer.onclick = (e) => {
  const el = e.target;

  if (el.classList.contains('add-btn')) {
    const newLi = createSlide();
    slidesContainer.insertBefore(newLi, el.closest('li'));
    openSlide(newLi.querySelector('.slide'));
    updateFontSizes();
  } else if (el.classList.contains('slide')) {
    openSlide(el);
  } else if (el.classList.contains('delete-btn')) {
    const li = el.closest('li');
    openSlide(li.querySelector('.slide'))
    if (li.contains(activeSlide)) {
      activeSlide = null;
      main.classList.add('deactivated');
      codeEditor.readOnly = true;
    }
    li.remove();
  }
};









//---------------------------------------------------------------- Adjust scroll-font ----------------------------------------------------------------//
/**
 * Sync scrolling from the code editor to the highlight layer and active slide.
 */
codeEditor.addEventListener('scroll', () => {
  highlightLayer.scrollTop = codeEditor.scrollTop;
  highlightLayer.scrollLeft = codeEditor.scrollLeft;
  // this v is necessary! else there is a problem because pre and text area doesn't scroll the same way! and if you do in same line (codeEditor.scrollTop = highlightLayer.scrollTop = codeEditor.scrollTop;) it doesn't work probably because same value is assigned to both i.e., a = b = c => a = c; but not necessarily a = b like in this case!
  codeEditor.scrollTop = highlightLayer.scrollTop;
  codeEditor.scrollLeft = highlightLayer.scrollLeft;

  const scrollTopRatio = (activeSlide.scrollHeight - activeSlide.clientHeight) /
                         (codeEditor.scrollHeight - codeEditor.clientHeight);
  const scrollLeftRatio = (activeSlide.scrollWidth - activeSlide.clientWidth) /
                          (codeEditor.scrollWidth - codeEditor.clientWidth);

  activeSlide.scrollTop = scrollTopRatio * codeEditor.scrollTop;
  activeSlide.scrollLeft = scrollLeftRatio * codeEditor.scrollLeft;
});

/**
 * Sync scrolling from the active slide to the code editor and highlight layer.
 * @param {Event} e - Scroll event from the slide.
 */
function syncScrollWithEditor(e) {
  const slide = e.target;
  const scrollTopRatio = (codeEditor.scrollHeight - codeEditor.clientHeight) /
                         (slide.scrollHeight - slide.clientHeight);
  const scrollLeftRatio = (codeEditor.scrollWidth - codeEditor.clientWidth) /
                          (slide.scrollWidth - slide.clientWidth);

  highlightLayer.scrollTop = codeEditor.scrollTop = scrollTopRatio * slide.scrollTop;
  highlightLayer.scrollLeft = codeEditor.scrollLeft = scrollLeftRatio * slide.scrollLeft;
}

/**
 * Dynamically updates font sizes based on container width.
 * @param {number} charactersPerWidth - the non standard unit used here!
 */
function updateFontSizes(charactersPerWidth = fontsizeInput.value) {
  const slides = slidesContainer.querySelectorAll('.slide');
  if (slides.length === 0) return;

  slides.forEach(slide => slide.style.fontSize = `${slide.getBoundingClientRect().width * charactersPerWidth/1000}px`);

  if (activeSlide) {
    highlightLayer.style.fontSize = codeEditor.style.fontSize = `${highlightLayer.getBoundingClientRect().width * charactersPerWidth/1000}px`;
  }
}

// Attach to window resize and fullscreen change events
window.onresize = document.onfullscreenchange = updateFontSizes;
fontsizeInput.onchange = () => {
  activeSlide.dataset.fontsize = fontsizeInput.value;
  updateFontSizes(fontsizeInput.value);
}
/**
 * Toggle fullscreen mode for the editor container.
 */
fullscreenBtn.onclick = () => {
  if (!document.fullscreenElement) {
    editorContainer.requestFullscreen().catch(err => {
      alert(`Error attempting to enable full-screen mode: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
};




//---------------------------------------------------------------- Highlight Lang-theme ----------------------------------------------------------------//
/**
 * Applies syntax highlighting to a slide and updates the highlight layer.
 * @param {HTMLElement} slideDiv - The slide <pre> element to update.
 * @param {string} code - The code content to highlight.
 * @param {string} language - The language to use for Prism highlighting.
 * @returns {Promise<void>}
 */
async function updateSlideContent(slideDiv, code, language) {
  if (!slideDiv) return;

  try {
    if (language === "text") {
      highlightLayer.innerText = slideDiv.innerText = `<code class="language-${language}">${code}</code>`;
      return;
    }
    await loadPrismLanguage(language);
    highlightLayer.innerHTML = slideDiv.innerHTML =
    `<code class="language-${language}">${Prism.highlight(code, Prism.languages[language], language)}</code>`;
  } catch (err) {
    console.error(`Highlighting failed for language "${language}":`, err);
  }
}

/**
 * Dynamically loads a Prism language script if not already available.
 * @param {string} language - Language to load (e.g., 'python', 'js')
 * @returns {Promise<void>}
 */
function loadPrismLanguage(language) {
  if (Prism.languages[language]) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://cdn.jsdelivr.net/npm/prismjs@1/components/prism-${language}.min.js`;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load Prism language: ${language}`));
    document.body.appendChild(script);
  });
}

// Update highlight as user types or changes language
codeEditor.oninput = () => updateSlideContent(activeSlide, codeEditor.value, langSelector.value);
langSelector.onchange = () => {
  updateSlideContent(activeSlide, codeEditor.value, langSelector.value);
  activeSlide.dataset.language = langSelector.value;
};



/**
 * Theme color mapping for background and text color.
 */
const themeColors = {
  'prism':                { bg: '#f5f2f0', text: '#000000' },
  'prism-dark':           { bg: '#2d2d2d', text: '#cccccc' },
  'prism-okaidia':        { bg: '#272822', text: '#f8f8f2' },
  'prism-tomorrow':       { bg: '#2d2d2d', text: '#cccccc' },
  'prism-coy':            { bg: '#fdfdfd', text: '#000000' },
  'prism-funky':          { bg: '#2d2d2d', text: '#ffffff' },
  'prism-twilight':       { bg: '#141414', text: '#f8f8f8' },
  'prism-solarizedlight': { bg: '#fdf6e3', text: '#586e75' },
  'default':              { bg: '#0d0f17', text: 'white'   }
};

/**
 * Sets the Prism theme and adjusts the editor background/text colors.
 * @param {string} [themeName] - The theme name
 */
function setTheme(themeName) {
  themeLink.href = themeName.startsWith('prism')
    ? `https://cdn.jsdelivr.net/npm/prismjs/themes/${themeName}.css`
    : 'custom-theme.css';

  const theme = themeColors[themeName] || { bg: '#0d0f17', text: 'white' };
  document.documentElement.style.setProperty('--bgClr', theme.bg);
  document.documentElement.style.setProperty('--textClr', theme.text);
}

themeSelector.onchange = () => setTheme(themeSelector.value);

/**
 * Update active slide's persistence delay from input.
 */
persistenceInput.oninput = () => activeSlide.dataset.persistence = +persistenceInput.value;

/**
 * Plays the slides in fullscreen, each for their delay (`persistence`) time.
 */
playButton.onclick = async () => {
  editorContainer.requestFullscreen();
  let slide = activeSlide;

  while (slide) {
    openSlide(slide);
    await new Promise(resolve => setTimeout(resolve, slide.dataset.persistence));
    slide = slide.closest('li')?.nextElementSibling?.querySelector('.slide');
  }

  document.exitFullscreen();
};


//---------------------------------------------------------------- VFS core ----------------------------------------------------------------//
/**
 * @typedef {Object} SlideData
 * @property {string} content - The inner text content of the slide.
 * @property {string} language - The programming language for syntax highlighting.
 * @property {number} persistence - Time in milliseconds before transitioning to the next slide.
 * @property {number} fontsize - fontSize in non standart unit
 */

/**
 * fills up VFS menu with `<li>`s with vfs keys as names
*/
function fillupVFSMenu(){
  vfsMenu.innerHTML = Object.keys(vfsMap).reverse().map(name => `<li>${name}</li>`).join('\n');
}
/**
 * Opens the VFS modal dialog and shows available saved projects.
 */
vfsOpenBtn.onclick = () => {
  vfsDialog.showModal();
  fillupVFSMenu();
};

/** @type {Record<string, {theme: string, slides: SlideData[]}>} */
let vfsMap = JSON.parse(localStorage.getItem("CodeStockAnimation_vfs")) || {};

/**
 * Converts current slides in DOM into VFS-friendly data structure.
 * @param {NodeListOf<Element>} slides
 * @param {string} theme
 * @returns {{theme: string, slides: SlideData[]}}
 */
function convertToVFSInput(slides, theme = themeSelector.value || 'default') {
  return {
    theme,
    slides: Array.from(slides, slide => ({
      content: slide.innerText,
      language: slide.dataset.language,
      persistence: slide.dataset.persistence,
      fontsize: slide.dataset.fontsize
    }))
  };
}


//---------------------------------------------------------------- VFS header buttons ----------------------------------------------------------------//
let currentProjectName = null;

/**
 * Confirm dialog to warn about unsaved changes.
 * @param {string} message
 * @returns {boolean}
 */
function isSavedOrConfirmed(message = 'Are you sure? Unsaved changes will be lost.') {
  const saved = currentProjectName &&
    JSON.stringify(vfsMap[currentProjectName]) === JSON.stringify(convertToVFSInput(slidesContainer.querySelectorAll('.slide')));
  return saved || confirm(message);
}

/**
 * Saves current project to localStorage, prompting for a name if needed.
 */
saveProjectBtn.onclick = () => {
  let ask = true
  while (ask) {
    userinput = prompt("Name this project:",currentProjectName ?? "");
    if (!userinput) return;
    currentProjectName = userinput;
    ask = vfsMap[currentProjectName] && !confirm(`Project "${currentProjectName}" already exists. Overwrite?`);
  }

  vfsMap[currentProjectName] = convertToVFSInput(slidesContainer.querySelectorAll('.slide'));
  localStorage.setItem("CodeStockAnimation_vfs", JSON.stringify(vfsMap));
  fillupVFSMenu();
  alert(`${new Date().toLocaleTimeString()} : "${currentProjectName}" saved!`);
};

/**
 * Creates a new blank project and resets current project name.
 */
newProjectBtn.onclick = () => {
  if (!isSavedOrConfirmed()) return;
  currentProjectName = null;
  slidesContainer.innerHTML = `
    <li>
      <button class="add-btn"></button>
      <pre
        class = "slide"
        data-language = "${langSelector.value}"
        data-persistence = "${persistenceInput.value}"
        data-fontsize = "${fontsizeInput.value}"
      ></pre>
      <button class="delete-btn">✕</button>
    </li>
    <li>
      <button class="add-btn"></button>
    </li>
  `;
  openSlide(slidesContainer.querySelector('.slide'));
  vfsDialog.close();
  updateFontSizes();
};

importProjectInput.onchange = async () => {
  const file = importProjectInput.files[0];
  if (!file) return;
  
  const project = JSON.parse(await file.text());
  let filename = file.name.replace(/\.[^/.]+$/, "");

  if (vfsMap[filename] && !confirm(`Project "${filename}" already exists. Overwrite?`)) filename = prompt("Enter a new project name:", filename);
  if (!filename) return;
  vfsMap[filename] = project;
  localStorage.setItem("CodeStockAnimation_vfs", JSON.stringify(vfsMap));
  openProject(project, 0, currentProjectName && currentProjectName !== filename, filename);
  fillupVFSMenu();
};


//---------------------------------------------------------------- VFS Menu ----------------------------------------------------------------//
/**
 * Loads a project from VFS and initializes the UI with its slides and theme.
 * @param {{theme: string, slides: SlideData[]}} project
 * @param {number} activeSlideIndex
 * @param {boolean} checkIfSaved
 */
function openProject(project, activeSlideIndex = 0, checkIfSaved = true, projectName = null) {
  if (checkIfSaved && !isSavedOrConfirmed()) return;

  themeSelector.value = project.theme;
  setTheme(project.theme);

  slidesContainer.innerHTML = '';
  project.slides.forEach(({ content, language, persistence, fontsize }) => slidesContainer.appendChild(createSlide(content, language, persistence, fontsize)));
  slidesContainer.innerHTML += '<li><button class="add-btn"></button></li>';
  currentProjectName = projectName;
  slides = slidesContainer.querySelectorAll('.slide');
  slides.forEach(slide => openSlide(slide));
  openSlide(slides[activeSlideIndex]);
  updateFontSizes();
  vfsDialog.close();
}

/**
 * Handles double-click on VFS project list to load a project.
 */
vfsMenu.ondblclick = e => {
  if (e.target.tagName === 'LI') {
    const projectName = e.target.innerText;
    openProject(vfsMap[projectName], 0, true, projectName);
  }
};

/**
 * Shows right-click project context menu with options to open or delete.
 */
vfsMenu.oncontextmenu = e => {
  if (e.target.tagName === 'LI') {
    e.preventDefault();

    //CONTEXTMENU-HEADING
    const selectedProjectName = e.target.innerText;
    projectNameHeading.innerText = selectedProjectName;

    //CONTEXTMENU-POSITION
    projectContextmenu.style.display = 'block';
    projectContextmenu.style.top = `${e.clientY}px`;
    projectContextmenu.style.left = `${e.clientX}px`;

    //OPEN-PROJECT
    openProjectBtn.onclick = () => openProject(vfsMap[selectedProjectName], 0, true, selectedProjectName);

    //DELETE-PROJECT
    deleteProjectBtn.onclick = () => {
      if (!confirm(`Are you sure you want to "delete" ${selectedProjectName}?`)) return;
      delete vfsMap[selectedProjectName];
      localStorage.setItem("CodeStockAnimation_vfs", JSON.stringify(vfsMap));
      fillupVFSMenu();
    };

    //EXPORT-PROJECT
    exportProjectBtn.onclick = () => {
      const url = URL.createObjectURL(new Blob([JSON.stringify(vfsMap[selectedProjectName])], { type: 'application/json' }))
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedProjectName || 'untitled'}.csa`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    //DOWNLOAD-VIDEO
    downloadVideoBtn.onclick = async () => {
      saveProgress();
      const project = vfsMap[selectedProjectName];
      openProject(project, 0, false, selectedProjectName);

      await waitForSlidesToHaveSize(slidesContainer, project.slides.length);
      await new Promise(resolve => requestAnimationFrame(resolve));
      sessionStorage.setItem("CodeStockAnimation_VideoToDownload", JSON.stringify({
        theme: {...themeColors[project.theme], link: themeLink.outerHTML},
        slides: Array.from(slidesContainer.querySelectorAll('.slide'), slide => slide.outerHTML),
        name: selectedProjectName
      }));
      window.open('export.html','_blank')
      loadProgress();
      vfsDialog.showModal();
    };
    const closeContextMenu = e => {
      if (projectContextmenu.contains(e.target)) return;
      projectContextmenu.style.display = 'none';
      document.removeEventListener('click', closeContextMenu)
    }
    document.addEventListener('click', closeContextMenu);
  }
};

//---------------------------------------------------------------- Saving Progress sessionStorage ----------------------------------------------------------------//
/**
 * Stores current session state in sessionStorage.
 */
function saveProgress() {
  try {
    const slides = slidesContainer.querySelectorAll('.slide');
    sessionStorage.setItem("CodeStockAnimation_currentProject", JSON.stringify({
      project: convertToVFSInput(slides),
      activeSlideIndex: Array.from(slides).indexOf(activeSlide),
      projectName: currentProjectName
    }));
  } catch (e) {
    alert(`Failed to store session data: ${e.message}`);
  }
};
window.onbeforeunload = saveProgress;

/**
 * Loads the most recent project from sessionStorage.
 */
function loadProgress(){
  try {
    const ongoingProject = JSON.parse(sessionStorage.getItem("CodeStockAnimation_currentProject"));
    if (ongoingProject?.project) {
      openProject(ongoingProject.project, ongoingProject.activeSlideIndex, false, ongoingProject.projectName);
      updateFontSizes();
    }
  } catch (e) {
    alert(`Failed to load session data: ${e.message}`);
  }
};
window.onload = loadProgress;

//---------------------------------------------------------------- wait for DOM to be ready ----------------------------------------------------------------//
/**
 * Waits for all slides within a container to be fully rendered and have non-zero size.
 * Useful when rendering needs to occur only after DOM insertion and layout stabilization.
 * 
 * @param {HTMLElement} container - The parent element containing slides.
 * @param {number} expectedCount - How many slides you expect to appear and size properly.
 * @returns {Promise} Resolves once all slides have non-zero width and height.
 */
function waitForSlidesToHaveSize(container, expectedCount) {
  return new Promise(resolve => {
    const slidesReady = new Set();

    const resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => { if (entry.contentRect.width > 0 && entry.contentRect.height > 0) slidesReady.add(entry.target); });
      if (slidesReady.size === expectedCount) {
        resizeObserver.disconnect();
        resolve();
      }
    });

    const mutationObserver = new MutationObserver(() => {
      const slides = container.querySelectorAll('.slide');
      if (slides.length === expectedCount){
        slides.forEach(slide => resizeObserver.observe(slide));
        mutationObserver.disconnect();
      }
    });

    mutationObserver.observe(container, { childList: true, subtree: true });
  });
}

//---------------------------------------------------------------- split into slides ----------------------------------------------------------------//

/**
 * Splits the active slide's text content into multiple slides based on a delimiter.
 * Keeps the first part in the current slide and inserts the rest *before* the next sibling slide.
 * Each new slide accumulates content up to that point.
 * 
 * @param {string|RegExp} splitter - Delimiter to split by. Can be a string or RegExp.
 * @param {string|null} joiner - Optional. What to rejoin split parts with when accumulating. 
 *                               Defaults to `splitter` if it's a string, or empty string if RegExp.
 */
function splitActiveSlide(splitter, joiner = null) {
  const parts = activeSlide.innerText.split(splitter);
  if (parts.length <= 1) return;
  
  const style = getComputedStyle(highlightLayer.querySelector('code'));
  const maxLines = Math.floor((parseFloat(highlightLayer.clientHeight) - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)) / getActualLineHeight(highlightLayer.querySelector('code')));

  const Li = activeSlide.closest('li').nextSibling;
  let text = activeSlide.innerText = parts[0];
  openSlide(activeSlide);

  joiner ??= typeof splitter === 'string' ? splitter : '';
  for (let i = 1; i < parts.length; i++) {
    text = (text + joiner + parts[i]).split('\n').slice(-maxLines).join('\n')
    const newLi = createSlide(text);
    slidesContainer.insertBefore(newLi, Li);
    const slide = newLi.querySelector('.slide');
    openSlide(slide);
  }

  updateFontSizes();
}

/**
 * Opens the dropdown for choosing how to split the slide.
 * Automatically closes on outside click.
 */
openSplitter.onclick = () => {
  if (splitDropdown.style.display === 'flex') return;
  splitDropdown.style.display = 'flex';
  requestAnimationFrame(() => document.addEventListener('click', () => splitDropdown.style.display = 'none', { once: true }));
}
function getActualLineHeight(element) {
  const clone = document.createElement('span');
  clone.innerText = 'A';
  clone.style.visibility = 'hidden';
  clone.style.whiteSpace = 'pre';
  clone.style.display = 'inline-block';

  element.appendChild(clone);
  const height = clone.getBoundingClientRect().height;
  element.removeChild(clone);
  return height;
}

//---------------------------------------------------------------- keyboard shortcuts ----------------------------------------------------------------//
document.addEventListener('keydown', function(e) {
  if (!e.altKey) return; e.preventDefault();
  if (e.key.toLowerCase() === 's') saveProjectBtn.click();
  if (e.key.toLowerCase() === 'n') newProjectBtn.click();
  if (e.key.toLowerCase() === 'a') (activeSlide?.closest('li').nextElementSibling ?? slidesContainer.lastChild).querySelector('.add-btn').click();
  if (e.key === 'ArrowDown') openSlide((activeSlide?.closest('li').nextElementSibling.nextElementSibling?.previousElementSibling ?? slidesContainer.firstChild)?.querySelector('.slide'));
  if (e.key === 'ArrowUp') openSlide((activeSlide?.closest('li')?.previousElementSibling ?? slidesContainer.lastChild.previousElementSibling)?.querySelector('.slide'));
});
