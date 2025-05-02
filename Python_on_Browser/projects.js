// projects.js
const projectListData = [
  {
    name: "✨ magic start (Default)",
    path: "Projects/default_magic.py",
    requirements: [],
    assets: []
  },
  {
    name: "🎲 Guess The Number",
    path: "Projects/GuessTheNumber.py",
    requirements: [],
    assets: []
  },
  {
    name: "🫂 Relation",
    path: "Projects/relation.py",
    requirements: [],
    assets: []
  },
  {
    name: "🔤 Subwords finder",
    path: "Projects/subword_finder.py",
    requirements: [],
    assets: ["projects/words_alpha.txt"]  // Example asset file
  },
  {
    name: "(-.<) text Animation",
    path: "Projects/animation.py",
    requirements: [],
    assets: []
  },
  {
    name: "🥸 small challenge",
    path: "Projects/small_challenge.py",
    requirements: [],
    assets: []
  },
  {
    name: "🧩 simple maze",
    path: "Projects/Maze.py",
    requirements: [],
    assets: []
  },
  {
    name: "❌⭕ Tic-Tac-Toe",
    path: "Projects/TIC-TAC-TOE v3.py",
    requirements: [],
    assets: []
  },
  {
    name: "🅆🄾🅁🄳🄻🄴 Wordle-lite",
    path: "Projects/WORDIE_by_PRABHUBIKASH.py",
    requirements: [],
    assets: []
  },
  {
    name: "🌀 meaningless-wordle",
    path: "Projects/WORDLE by me!.py",
    requirements: [],
    assets: []
  },
  {
    name: "🔢 matrix multiplication (3×3)",
    path: "Projects/3×3 Matrix Multiplication.py",
    requirements: [],
    assets: []
  },
  {
    name: "½ decimal to fraction",
    path: "Projects/decimal to fraction.py",
    requirements: [],
    assets: []
  },
  {
    name: "🧾 Field checker",
    path: "Projects/Field.py",
    requirements: [],
    assets: []
  },
  {
    name: "📐 Pₙ=Xⁿ+Yⁿ+Zⁿ calculator",
    path: "Projects/Pn=Xⁿ+Yⁿ+Zⁿ calculator.py",
    requirements: [],
    assets: []
  },
  {
    name: "📊 Sequence Generator",
    path: "Projects/Sequence.py",
    requirements: [],
    assets: []
  },
  {
    name: "{} Numbers are Sets",
    path: "Projects/WhatIsANumber.py",
    requirements: [],
    assets: []
  },
  {
    name: "📖 word meanings",
    path: "Projects/Technicalcommunication(wordmeanings).py",
    requirements: [],
    assets: []
  },
  {
    name: "🗣️ word and idioms",
    path: "Projects/Telecommunications II (words and idioms).py",
    requirements: [],
    assets: []
  },
  {
    name: "🤳 QR Code",
    path: "Projects/generate_qr_code.py",
    requirements: ["qrcode","pillow"],
    assets: []
  },
].map((project, index) => ({id: `project${index}`,...project}));


//----------------------------------- Setup project requirements -----------------------------------//
async function setupProjectEnvironment(project) {
  try {
    for (let req of project.requirements) {
      try {
        await pyodide.loadPackage(req); // Try Pyodide's native package first
      } catch (e) {
        console.log(`Package ${req} not found in Pyodide, trying micropip...`);
        await pyodide.loadPackage("micropip");
        const micropip = pyodide.pyimport("micropip");
        await micropip.install(req); // Fallback to PyPI
      }
    }

    // Load asset files if any
    for (let assetPath of project.assets) {
      const response = await fetch(assetPath);
      if (!response.ok) {
        throw new Error(`Failed to load asset: ${assetPath}`);
      }
      const fileContent = await response.text();
      pyodide.FS.writeFile(`${assetPath.split("/").pop()}`, fileContent);
    }
  } catch (error) {
    console.error("Error setting up project environment:", error);
    alert("Failed to set up project environment!\n" + error.message);
  }
}


//----------------------------------- Cool Default -----------------------------------//
function changeBackground(color) {document.body.style.backgroundColor = color;}

async function typeToOutput(text, delay = 50) {
  term.reset(); // Optional: clear before typing
  text.replace(/\n/g, '\r\n')
  for (let i = 0; i < text.length; i++) {
    term.write(text[i]);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

function pickRandomProject() {return projectListData[Math.floor(Math.random() * projectListData.length)];}

function highlightAndScrollToProject(project) {
  const item = document.querySelector(`[data-project-id="${project.id}"]`);
  if (item) {
    item.scrollIntoView({ behavior: "smooth", block: "center" });
    item.classList.add('highlight');
    setTimeout(() => {item.classList.remove('highlight');loadProject(project)}, 1500);
    
  }
}

//----------------------------------- Show and give link in terminal! -----------------------------------//
async function loadImageIntoimageModal(filename, filetype = 'image/png') {
  try {
    // Read the file from Pyodide's virtual filesystem
    const data = pyodide.FS.readFile(filename);
    const blob = new Blob([data], { type: filetype });
    const url = URL.createObjectURL(blob);
    document.getElementById("modal-image").src = url;

    // Set the download link
    const link = document.getElementById("download-link");
    link.href = url;
    link.download = filename;

    // Reveal the modal open button
    document.getElementById("open-image-modal-button").style.display = "flex";
  } catch (error) {
    console.error("Error loading image into modal:", error);
    alert("Failed to load image for preview.");
  }
}

