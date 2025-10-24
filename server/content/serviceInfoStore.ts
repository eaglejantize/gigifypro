import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "server", "content", "serviceInfo.json");

export function readServiceInfo() {
  const raw = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(raw || "{}");
  return data.services || [];
}

export function writeServiceInfo(services: any[]) {
  const out = JSON.stringify({ services }, null, 2);
  fs.writeFileSync(filePath, out, "utf8");
  return true;
}
