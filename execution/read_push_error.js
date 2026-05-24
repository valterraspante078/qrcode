const fs = require("fs");
const path = require("path");

function main() {
  const src = path.join(__dirname, "../push_error.txt");
  const dest = path.join(__dirname, "../tmp/push_error_utf8.txt");
  
  if (fs.existsSync(src)) {
    const content = fs.readFileSync(src, "utf16le");
    fs.writeFileSync(dest, content, "utf8");
    console.log("Converted successfully!");
  } else {
    console.log("Source file not found!");
  }
}

main();
