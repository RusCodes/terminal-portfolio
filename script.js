const bootContent = document.getElementById("boot-content");
const input = document.getElementById("command-input");
const output = document.getElementById("terminal-output");
const ghostText = document.getElementById("ghost-text");

let commandHistory = [];
let historyIndex = -1;
let isTyping = false;

const commands = {
  "/about": showAbout,
  "/skills": showSkills,
  "/projects": showProjects,
  "/certifications": showCertifications,
  "/affiliations": showAffiliations,
  "/contact": showContact,
  "/help": showHelp,
  "/theme": showThemeHelp,
  "/clear": clearTerminal,
  "/secrets": showSecrets,
};


function scrollToBottom() {
  const container = document.querySelector(".terminal-body");
  container.scrollTo({
    top: container.scrollHeight,
    behavior: "smooth"
  });
}

function appendLine(text, className = "") {
  const div = document.createElement("div");
  div.className = "line " + className;
  div.innerHTML = text;
  output.appendChild(div);
  scrollToBottom();
}

function section(title) {
  appendLine(`<br><span class="cmd">${title}</span>`);
}
// ==========================================
//          EASTER EGG FUNCTIONS
// ==========================================

async function deployOpsPilot() {
  const steps = [
    "Initializing OpsPilot deployment pipeline...",
    "Authenticating with AWS IAM...",
    "<span class='boot-green'>[OK]</span> Identity verified.",
    "Pulling latest commit from main branch...",
    "Building Docker container...",
    "[██████░░░░░░░░░] 40%",
    "[████████████░░░] 85%",
    "[███████████████] 100%",
    "<span class='boot-green'>[OK]</span> Container built successfully.",
    "Running DevSecOps vulnerability scan...",
    "<span class='boot-green'>[OK]</span> 0 critical vulnerabilities found.",
    "Pushing to Elastic Container Registry...",
    "Deploying to production cluster...",
    "<br><span class='boot-orange'>OpsPilot v1.0.0 successfully deployed! System is live.</span><br>"
  ];

  appendLine("<br><span class='cmd'>PIPELINE STARTED</span>");
  
  for (let step of steps) {
    await delay(100 + Math.random() * 250); 
    appendLine(step, "dim");
  }
}

function runSudo() {
  runCommandWithEffects([
    "<br><span class='boot-orange'>You don't have root access. This incident will be reported.</span><br>"
  ]);
}

const hiddenCommands = {
  "/deployopspilot": deployOpsPilot,
  "/sudo": runSudo,
  "sudo": runSudo
};
// cmd handlers
function handleCommand(inputValue) {
  const fullCmd = inputValue.trim().toLowerCase();

  const safeCmd = fullCmd.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  appendLine(`&gt; ${safeCmd}`, "cmd");

  const [cmd, ...args] = fullCmd.split(" ");
  safeExecute(() => executeCommand(cmd, args));
}

function safeExecute(fn) {
  try {
    fn();
  } catch (err) {
    appendLine("System error. Please retry.");
    console.error(err);
  }
}

function executeCommand(cmd, args) {
  // SYSTEM COMMANDS FIRST
  if (cmd === "/theme") {
    return handleTheme(args);
  }

  if (cmd === "/project") {
    return handleProject(args);
  }

  // NORMAL COMMANDS
  if (commands[cmd]) {
    return commands[cmd](args);
  }

  // HIDDEN COMMANDS
  if (hiddenCommands[cmd]) {
    return hiddenCommands[cmd](args);
  }

  // FALLBACK → INTELLIGENT (we fix later)
  handleUnknownCommand(cmd);
}

function handleUnknownCommand(cmd) {
  const suggestion = getClosestCommand(cmd);

  appendLine(`Command not found: ${cmd}`);

  if (suggestion && suggestion.score > 0.3) {
    appendLine(`Did you mean: <span class="suggestion">${suggestion.cmd}</span>`);
  }
}

function handleTheme(args) {
  const theme = args[0];

  if (theme === "hacker") return enableHackerTheme();
  if (theme === "default") return disableHackerTheme();

  appendLine("Usage: /theme hacker or /theme default");
}

function handleProject(args) {
  const project = args[0];

  if (!project) {
    appendLine("Usage: /project [name]");
    return;
  }

  if (project === "opspilot") {
    appendLine("Opening OpsPilot...");
    deployOpsPilot();
    return;
  }

  appendLine(`Project "${project}" not found`);
}

function getClosestCommand(input) {
  const keys = [...Object.keys(commands), "/project", "/theme", "/about", "/deployopspilot", "sudo"];

  return keys
    .map(cmd => ({
      cmd,
      score: similarity(input, cmd)
    }))
    .sort((a, b) => b.score - a.score)[0];
}

function similarity(a, b) {
  let score = 0;

  for (let i = 0; i < a.length; i++) {
    if (b.includes(a[i])) score++;
  }

  return score / b.length;
}

if (!input) throw new Error("Input not found");

input.addEventListener("keydown", function(e) {
  //enter key → submit command
  if (e.key === "Enter") {
    if (isTyping) return;
    const value = input.value.trim();

    if (value !== "") {
      commandHistory.push(value);
      historyIndex = commandHistory.length;
      handleCommand(value);
    }
   
    input.value = "";
    ghostText.textContent = "";
  }

  //tab key
    if (e.key === "Tab") {
      e.preventDefault(); 
      const currentValue = input.value.trim();
      if (currentValue === "") return;

      const completed = autocompleteCommand(currentValue);
      input.value = completed;
      ghostText.textContent = "";
  }

  //  PREVIOUS
  if (e.key === "ArrowUp") {
    if (historyIndex > 0) {
      historyIndex--;
      input.value = commandHistory[historyIndex];
      updateGhostText(input.value);
    }
  }

  // NEXT
  if (e.key === "ArrowDown") {
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      input.value = commandHistory[historyIndex];
    } else {
      historyIndex = commandHistory.length;
      input.value = "";
      updateGhostText("");
    }
  }
});

//COMMAND FUNCTIONS
function clearTerminal() {
  output.innerHTML = "";
}

function showHelp() {
  section("AVAILABLE COMMANDS");

  appendLine("/about");
  appendLine("/skills");
  appendLine("/projects");
  appendLine("/certifications");
  appendLine("/affiliations");
  appendLine("/contact");
  appendLine("/clear");
  appendLine("/theme");
  appendLine("/help");
  appendLine("<span class='dim'>/secrets</span>");
}

function showSecrets() {
  runCommandWithEffects([
    "<br><span class='cmd'>CLASSIFIED DIRECTORY</span>",
    "You found the backdoor. There are undocumented commands hidden in this system.",
    "",
    "<span class='dim'>Hint 1: Type command that deploys my flagship project /deployopspilot</span>",
    "<span class='dim'>Hint 2: What do you type in Linux to get root privileges?</span>",
    "<br>"
  ]);
}

function showThemeHelp() {
  runCommandWithEffects([
    "<br><span class='cmd'>THEME PROTOCOLS</span>",
    "Usage: /theme [hacker | default]",
    "- <span class='cmd'>/theme hacker</span>  : Engage Matrix mode",
    "- <span class='cmd'>/theme default</span> : Return to standard UI",
    "<br>"
  ]);
}

// about section infos
function showAbout() {
  runCommandWithEffects([
  "<br><span class='cmd'>ABOUT</span>",

  "Aspiring DevOps engineer focused on building reliable, efficient, and secure systems.",
  "Currently strengthening foundations in infrastructure, automation, and cloud.",
 "Also exploring cybersecurity to understand how systems are protected in real-world environments.",
  
  "<br><span class='cmd'>WHAT I DO</span>",

  "- DevOps fundamentals (CI/CD, containers, cloud)",
  "- Backend systems & data flow",
  "- Linux & version control",
  "- System design & problem-solving",
  "",
  "<br><span class='cmd'>CAREER PATH</span>",

  "Current: Building DevOps & backend foundations",
  "Next: AWS Cloud Practitioner + hands-on cloud",
  "Goal: DevOps Engineer + Cybersecurity expertise",
  "<br>"
  ]);
}
// skills info cmd 
function showSkills() {
  runCommandWithEffects([
  "<br><span class='cmd'>SKILLS</span>",

  "Programming & Backend:",
  "- Java, C#, Python",

  "Web:",
  "- HTML, CSS, JavaScript",

  "Database:",
  "- Microsoft SQL Server, MongoDB, PostgreSQL",

  "Tools & Systems:",
  "- Git, GitHub, Linux (Ubuntu)",
  "",
  "<br><span class='cmd'>CURRENTLY LEARNING</span>",

  "- Docker & Docker Compose:",
  "- Containerization basics",
  "- Local development environments",
  "- GitHub Actions (CI/CD)",
  "- AWS (EC2, S3, IAM)",
  "<br>"
  ]);
}
//project info cmd
function showProjects() {
  runCommandWithEffects([
  "<br><span class='cmd'>PROJECTS</span>",

  "<br>Loan Management System (Java)",
  "- CRUD borrower management",
  "- Loan tracking & balances",
  "- Structured data handling",

  "<br>Gym Automation System (C# + SQL Server)",
  "- QR attendance system",
  "- Payment tracking & expiry monitoring",
  "- Centralized database",

  "<br>SoleGardenKicks.com (E-commerce)",
  "- Product browsing & sizing",
  "- Order & inventory logic",
  "- User-friendly UI",

  "<br>OpsPilot (Ongoing)",
  "- Docker & containerization",
  "- CI/CD with GitHub Actions",
  "- Deployment workflows",
  "<br>"
  ]);
}
// certifications info cmd
function showCertifications() {
  runCommandWithEffects([

  "<br><span class='cmd'>CERTIFICATIONS</span>",
  "- CS50 – Introduction to Computer Science",
  "- SAP – Systems, Applications, and Products in Data Processing",
  "- STI – Bridging Knowledge: Exploring Digital Divide, Cybersecurity, and OS Trends, and Programming",
  "",
  "<br><span class='cmd'>IN PROGRESS</span>",
  "- AWS Certified Cloud Practitioner (2026)",
  "<br>"
  ]);
}
// affiliations info cmd
function showAffiliations() {
  runCommandWithEffects([
  "<br><span class='cmd'>COLLEGE</span>",
  "- STI College Malolos (Target: 2027)",
  "<br>"
  ]);
}
// contact info cmd
function showContact() {
  runCommandWithEffects([
  "<br><span class='cmd'>CONTACT</span>",
  "- Email: <a href='mailto:brettrusseltorres@gmail.com'>brettrusseltorres@gmail.com</a>",
  "- GitHub: <a href='https://github.com/RusCodes' target='_blank'>github.com/RusCodes</a>",
  "- LinkedIn: <a href='https://www.linkedin.com/in/brett-russel-torres-2aab403b6' target='_blank'>linkedin.com/in/brett-russel-torres-2aab403b6</a>",
  "<br>"
  ]);
}

function addLine(text, className = "") {
  const div = document.createElement("div");
  div.innerHTML = text;
  if (className) div.classList.add(className);
  bootContent.appendChild(div);
}

// Simulate delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// MAIN BOOT SEQUENCE
async function bootSequence() {
  addLine("Initializing portfolio system...");
  await delay(500);

  addLine("Loading design tokens...");
  await delay(500);

  addLine("Mounting component library...");
  await delay(500);

  // Progress bar
  const progressContainer = document.createElement("div");
  const bar = document.createElement("div");
  const fill = document.createElement("div");

  bar.className = "progress-bar";
  fill.className = "progress-fill";

  bar.appendChild(fill);
  progressContainer.appendChild(bar);

  const doneText = document.createElement("span");
  doneText.className = "boot-green";
  doneText.innerText = "done";

  progressContainer.appendChild(doneText);
  bootContent.appendChild(progressContainer);

  // Animate progress
  for (let i = 0; i <= 100; i += 20) {
    fill.style.width = i + "%";
    await delay(30);
  }

  await delay(100);

  addLine("Resolving 12 case studies...");
  await delay(100);

  addLine("Connecting to Product Rocket core...");
  await delay(100);

  addLine("<span class='boot-green'>ok</span>");
  await delay(200);

  addLine("");
  addLine("Design systems: operational", "dim");
  addLine("UX research modules: loaded", "dim");
  addLine("Don't search for /secrets here...", "dim");
  addLine("Strategic thinking: engaged", "dim");

  await delay(200);

  addLine("");
  addLine("<span class='boot-orange'>brett. v1.0.0</span> — ready.");
  addLine("Tap or Press Enter to continue...");
}

// START
bootSequence();

// ENTER KEY → NEXT PAGE
document.addEventListener("keydown", function(e) {
  if (e.key === "Enter" && document.getElementById("boot-screen").style.display !== "none") {
    document.getElementById("boot-screen").style.display = "none";
    document.getElementById("main-app").classList.remove("d-none");
    document.body.classList.add("loaded");

    input.focus();
  }
});

document.getElementById("boot-screen").addEventListener("click", function() {
  document.getElementById("boot-screen").style.display = "none";
  document.getElementById("main-app").classList.remove("d-none");
  document.body.classList.add("loaded");
  
  document.getElementById('command-input');
  input.focus();
});

function fakeLoading(callback) {
  appendLine("<span class='dim'>Fetching data...</span>");

  setTimeout(() => {
    callback();
  }, 200 + Math.random() * 200); 
}

function typeLine(text, speed = 5) {
  const div = document.createElement("div");
  div.className = "line";
  output.appendChild(div);

  if (text.includes("<")) {
    div.innerHTML = text;
    scrollToBottom();
    return Promise.resolve();
  }
  return new Promise(resolve => {
    let i = 0;

    function type() {
      if (i < text.length) {
        div.innerHTML += text.charAt(i);
        scrollToBottom();
        i++;
        setTimeout(type, speed);
      } else {
        resolve();
      }
    }
    type();
  });
}

async function runCommandWithEffects(lines) {
  isTyping = true;
  fakeLoading(async () => {
    for (let line of lines) {
      await typeLine(line);
    }
    scrollToBottom();
    isTyping = false;
  });
}

function autocompleteCommand(value) {
  const keys = Object.keys(commands);

  // find matches
  const matches = keys.filter(cmd => cmd.includes(value));

  if (matches.length === 1) {
    // single match → auto fill
    return matches[0];
  }

  if (matches.length > 1) {
    // multiple matches → show suggestions
    appendLine("");
    appendLine("Suggestions:");

    matches.forEach(cmd => {
      appendLine(`<span class="suggestion">${cmd}</span>`);
    });
  }
  return value;
}

function updateGhostText(value) {
  const keys = Object.keys(commands);
  const match = keys.find(cmd => cmd.startsWith(value));

  if (!value || !match) {
    ghostText.textContent = "";
    return;
  }

  ghostText.textContent = value + match.slice(value.length);
}

input.addEventListener("input", () => {
  updateGhostText(input.value.trim());
});


document.querySelector('.terminal-window').addEventListener('click', () => {
  document.getElementById('command-input').focus();
});


document.addEventListener('keydown', function(e) {

  if (e.ctrlKey || e.altKey || e.metaKey) return;

  if (e.key.length === 1 || e.key === 'Backspace') {
    
    if (document.activeElement !== input) {
      input.focus();
    }
  }
});
// ==========================================
//          MATRIX THEME LOGIC
// ==========================================
let matrixInterval = null;

function enableHackerTheme() {
  document.body.classList.add("theme-hacker");
  runCommandWithEffects([
    "<br><span class='cmd'>[SYSTEM OVERRIDE]</span>",
    "Initializing Matrix protocols...",
    "Visuals updated. Follow the white rabbit.",
    "<br>"
  ]);
  startMatrix();
}

function disableHackerTheme() {
  document.body.classList.remove("theme-hacker");
  stopMatrix();
  runCommandWithEffects([
    "<br>Reverting to standard display protocols...<br>"
  ]);
}

function startMatrix() {
  const canvas = document.getElementById("matrix-bg");
  canvas.style.display = "block";
  const ctx = canvas.getContext("2d");

  // Force canvas to fit the screen
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // The characters to display
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";
  const matrix = letters.split("");
  
  const fontSize = 16;
  const columns = canvas.width / fontSize;

  // Array to track the Y coordinate of each column
  const drops = [];
  for (let x = 0; x < columns; x++) drops[x] = 1;

  if (matrixInterval) clearInterval(matrixInterval);

  // Drawing loop
  matrixInterval = setInterval(() => {
    // Draw a semi-transparent black rectangle over the canvas to create the fade effect
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0f0"; // Neon green text
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
      const text = matrix[Math.floor(Math.random() * matrix.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      // Randomly reset the drop to the top to create the staggered rain effect
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }, 35); // Speed of the rain (lower is faster)
}

function stopMatrix() {
  const canvas = document.getElementById("matrix-bg");
  canvas.style.display = "none";
  if (matrixInterval) clearInterval(matrixInterval);
}

// Ensure the canvas resizes if the user resizes their browser window
window.addEventListener('resize', () => {
  if (document.body.classList.contains("theme-hacker")) {
    const canvas = document.getElementById("matrix-bg");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
});
