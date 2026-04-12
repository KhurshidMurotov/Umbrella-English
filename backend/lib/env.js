import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");

function parseEnvFile(content) {
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .reduce((accumulator, line) => {
      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) {
        return accumulator;
      }

      const key = line.slice(0, separatorIndex).trim();
      const rawValue = line.slice(separatorIndex + 1).trim();
      const value = rawValue.replace(/^['"]|['"]$/g, "");

      if (key && process.env[key] === undefined) {
        accumulator[key] = value;
      }

      return accumulator;
    }, {});
}

export function loadLocalEnv() {
  const candidatePaths = [
    path.join(rootDir, ".env"),
    path.join(rootDir, "backend", ".env")
  ];

  for (const filePath of candidatePaths) {
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const parsed = parseEnvFile(fs.readFileSync(filePath, "utf8"));
    Object.entries(parsed).forEach(([key, value]) => {
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    });
  }
}
