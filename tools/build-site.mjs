import { cp, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "build", "site");
// Publica apenas os arquivos do jogo.
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const directory of ["web", "assets"]) {
  await cp(path.join(root, directory), path.join(output, directory), { recursive: true });
}
console.log("Site preparado em build/site. Entrada: /web/");
