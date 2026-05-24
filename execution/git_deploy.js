const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function main() {
  const logPath = path.join(__dirname, "../tmp/git_output.txt");
  let logContent = "--- GIT DEPLOY START (NODE) ---\n\n";

  function runCmd(cmd) {
    logContent += `Running: ${cmd}\n`;
    try {
      const stdout = execSync(cmd, { encoding: "utf8" });
      logContent += `STDOUT:\n${stdout}\n`;
      return stdout;
    } catch (err) {
      logContent += `ERROR:\nStatus: ${err.status}\nStdout: ${err.stdout}\nStderr: ${err.stderr}\nMessage: ${err.message}\n\n`;
      return null;
    }
  }

  // 1. Status
  runCmd("git status");

  // 2. Remote check
  runCmd("git remote -v");

  // 3. Add
  runCmd("git add -A");

  // 4. Commit
  runCmd('git commit -m "feat: implement dark mode toggle, remove unused code, optimize SEO"');

  // 5. Check branch and push
  const branch = runCmd("git branch --show-current") || "main";
  const cleanBranch = branch.trim();
  if (cleanBranch) {
    runCmd(`git push origin ${cleanBranch}`);
  } else {
    runCmd("git push origin main");
  }

  logContent += "\n--- GIT DEPLOY END ---\n";
  fs.writeFileSync(logPath, logContent, "utf8");
}

main();
