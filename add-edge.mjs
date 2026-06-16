import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, "src");

// Files to update
const targetPaths = [
  path.join(srcDir, "app", "sign-in", "[[...sign-in]]", "page.jsx"),
  path.join(srcDir, "app", "sign-up", "[[...sign-up]]", "page.jsx"),
];

// Helper to recursively find all route.js files
function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findRouteFiles(filePath, fileList);
    } else if (file === "route.js") {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const routeFiles = findRouteFiles(path.join(srcDir, "app", "api"));
const allTargets = [...targetPaths, ...routeFiles];

console.log(`Found ${allTargets.length} target files to update.`);

for (const filePath of allTargets) {
  if (!fs.existsSync(filePath)) {
    console.warn(`File does not exist: ${filePath}`);
    continue;
  }

  let content = fs.readFileSync(filePath, "utf-8");

  if (content.includes("export const runtime")) {
    console.log(`Skipping (already has runtime config): ${path.relative(__dirname, filePath)}`);
    continue;
  }

  // Insert at the top of the file
  const runtimeConfig = `export const runtime = "edge";\n\n`;
  content = runtimeConfig + content;

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`Updated: ${path.relative(__dirname, filePath)}`);
}

console.log("Done! All files updated.");
