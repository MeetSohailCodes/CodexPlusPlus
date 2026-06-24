const { execSync } = require("child_process");
const path = require("path");

const cargoBin = path.join(process.env.USERPROFILE || process.env.HOME, ".cargo", "bin");
const managerDir = path.join(__dirname, "..", "apps", "codex-plus-manager");

// Prepend .cargo/bin to PATH so tauri CLI can find cargo
process.env.PATH = cargoBin + path.delimiter + process.env.PATH;

process.chdir(managerDir);
execSync("npx tauri dev", { stdio: "inherit", env: process.env });
