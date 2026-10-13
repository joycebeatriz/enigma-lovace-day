const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const vm = require("node:vm");

function createServer() {
  const properties = new Map([
    ["AUTH_SECRET", "test-only-private-secret"],
    ["SPREADSHEET_ID", "test-book"],
  ]);
  const cached = new Map();
  const sheets = new Map();
  function sheet() {
    const rows = [];
    return {
      rows,
      getLastRow: () => rows.length,
      appendRow: (row) => rows.push([...row]),
      setFrozenRows() {},
      getRange(start, col, count, width) {
        return {
          getValues: () =>
            Array.from({ length: count }, (_, i) =>
              Array.from(
                { length: width },
                (_, j) => rows[start - 1 + i]?.[col - 1 + j] ?? "",
              ),
            ),
          setValues(values) {
            values.forEach((row, i) =>
              row.forEach((cell, j) => {
                rows[start - 1 + i][col - 1 + j] = cell;
              }),
            );
          },
        };
      },
    };
  }
  const book = {
    getSheetByName: (name) => sheets.get(name),
    insertSheet: (name) => {
      const value = sheet();
      sheets.set(name, value);
      return value;
    },
  };
  const context = vm.createContext({
    console: { log() {} },
    Date,
    JSON,
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key) => properties.get(key),
        setProperty: (key, value) => properties.set(key, value),
      }),
    },
    SpreadsheetApp: { openById: () => book },
    Utilities: {
      getUuid: () => crypto.randomUUID(),
      computeHmacSha256Signature: (value, key) => [
        ...crypto.createHmac("sha256", key).update(value).digest(),
      ],
    },
    CacheService: {
      getScriptCache: () => ({
        get: (key) => cached.get(key),
        put: (key, value) => cached.set(key, value),
        remove: (key) => cached.delete(key),
      }),
    },
    LockService: {
      getScriptLock: () => ({
        tryLock: () => true,
        hasLock: () => true,
        releaseLock() {},
      }),
    },
    ContentService: {
      MimeType: { JSON: "json" },
      createTextOutput: (text) => ({
        text,
        setMimeType() {
          return this;
        },
      }),
    },
  });
  vm.runInContext(fs.readFileSync("apps-script/Code.gs", "utf8"), context);
  context.setup();
  const request = (input) =>
    JSON.parse(
      context.doPost({ postData: { contents: JSON.stringify(input) } }).text,
    );
  const proof = (email, password) => {
    const challenge = request({ action: "challenge", email });
    return crypto
      .pbkdf2Sync(
        password,
        Buffer.from(challenge.salt, "hex"),
        challenge.iterations,
        32,
        "sha256",
      )
      .toString("hex");
  };
  return { request, proof, sheets };
}
if (require.main === module) {
  const server = createServer();
  const email = "participant@example.com";
  const secret = "test-password-123";
  const proof = server.proof(email, secret);
  const user = server.request({
    action: "register",
    name: "Participante Teste",
    email: "  PARTICIPANT@example.com ",
    proof,
  });
  assert.equal(user.ok, true);
  assert.equal(
    server.request({ action: "register", name: "Outra pessoa", email, proof })
      .code,
    "EXISTS",
  );
  assert.equal(
    server.request({ action: "login", email, proof: "0".repeat(64) }).code,
    "AUTH",
  );
  assert.equal(server.request({ action: "login", email, proof }).ok, true);
  assert.equal(
    server.request({ action: "session", token: user.token }).user.id,
    user.user.id,
  );
  assert.equal(server.sheets.get("Participantes").rows.length, 2);
  assert.equal(server.sheets.get("Participantes").rows[1][6], 3);
  assert.equal(server.sheets.get("Acessos").rows.length, 4);
  const stored = JSON.stringify(server.sheets.get("Participantes").rows);
  assert.ok(!stored.includes(secret) && !stored.includes(proof));
  assert.equal(
    server.request({ action: "logout", token: user.token }).ok,
    true,
  );
  assert.equal(
    server.request({ action: "session", token: user.token }).code,
    "EXPIRED",
  );
  assert.equal(
    server.request({
      action: "register",
      name: "=IMPORTXML()",
      email: "other@example.com",
      proof,
    }).code,
    "INVALID",
  );
  for (let i = 0; i < 10; i++)
    assert.equal(
      server.request({ action: "login", email: "unknown@example.com", proof })
        .code,
      "AUTH",
    );
  assert.equal(
    server.request({ action: "login", email: "unknown@example.com", proof })
      .code,
    "LIMIT",
  );
  assert.equal(server.request({ action: "invalid" }).code, "INVALID");
  console.log(
    "Apps Script simulado: cadastro, duplicidade, senha, sessões, registros, hashes, entradas e limite de tentativas OK.",
  );
}
module.exports = { createServer };
