/* Deploy as a Web App, execute as owner, access Anyone. Keep the spreadsheet private. */
const PASSWORD_ITERATIONS = 600000;
const SESSION_SECONDS = 3600;
const USER_HEADERS = ['id', 'nome', 'email', 'verificador', 'criado_em', 'ultimo_acesso', 'acessos'];
const ACCESS_HEADERS = ['data', 'participante_id', 'tipo'];

function setup() {
  const properties = PropertiesService.getScriptProperties();
  if (!properties.getProperty('AUTH_SECRET')) {
    properties.setProperty('AUTH_SECRET', Utilities.getUuid() + Utilities.getUuid());
  }
  let id = properties.getProperty('SPREADSHEET_ID');
  if (!id) {
    id = SpreadsheetApp.create('Enigma Lovelace — participantes e acessos').getId();
    properties.setProperty('SPREADSHEET_ID', id);
  }
  const book = SpreadsheetApp.openById(id);
  [['Participantes', USER_HEADERS], ['Acessos', ACCESS_HEADERS]].forEach(([name, headers]) => {
    const sheet = book.getSheetByName(name) || book.insertSheet(name);
    if (!sheet.getLastRow()) { sheet.appendRow(headers); sheet.setFrozenRows(1); }
  });
  console.log('Planilha criada/configurada. Consulte SPREADSHEET_ID nas propriedades do script.');
}

function doPost(event) {
  let lock;
  try {
    if (!event || !event.postData || event.postData.contents.length > 4096) throw new Error('INVALID');
    const input = JSON.parse(event.postData.contents);
    if (!['challenge', 'register', 'login', 'session', 'logout'].includes(input.action)) throw new Error('INVALID');
    lock = LockService.getScriptLock();
    if (!lock.tryLock(15000)) throw new Error('BUSY');
    const result = handleAuth_(input);
    return json_({ ok: true, ...result });
  } catch (error) {
    const codes = ['INVALID', 'AUTH', 'EXISTS', 'LIMIT', 'EXPIRED', 'BUSY'];
    return json_({ ok: false, code: codes.includes(error.message) ? error.message : 'UNAVAILABLE' });
  } finally { if (lock && lock.hasLock()) lock.releaseLock(); }
}

function handleAuth_(input) {
  const cache = CacheService.getScriptCache();
  if (input.action === 'session' || input.action === 'logout') {
    if (typeof input.token !== 'string' || !/^[a-f0-9]{64}$/.test(input.token)) throw new Error('EXPIRED');
    const key = 'session:' + input.token;
    const saved = cache.get(key);
    if (!saved) throw new Error('EXPIRED');
    if (input.action === 'logout') { cache.remove(key); return {}; }
    const user = JSON.parse(saved);
    recordAccess_(user.id, 'retorno');
    return { user };
  }
  const email = normalizeEmail_(input.email);
  const salt = mac_('salt:' + email).slice(0, 32);
  if (input.action === 'challenge') return { salt, iterations: PASSWORD_ITERATIONS };
  const limitKey = 'attempts:' + mac_('rate:' + email);
  const attempts = Number(cache.get(limitKey) || 0);
  if (attempts >= 10) throw new Error('LIMIT');
  cache.put(limitKey, String(attempts + 1), 900);
  if (typeof input.proof !== 'string' || !/^[a-f0-9]{64}$/.test(input.proof)) throw new Error('INVALID');
  const sheet = book_().getSheetByName('Participantes');
  const rows = sheet.getLastRow() > 1 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 7).getValues() : [];
  const index = rows.findIndex(row => row[2] === email);
  const verifier = mac_('credential:' + email + ':' + input.proof);
  let user;
  if (input.action === 'register') {
    if (index >= 0) throw new Error('EXISTS');
    const name = typeof input.name === 'string' ? input.name.trim().replace(/\s+/g, ' ') : '';
    if (!name || name.length > 80 || /^[=+\-@]/.test(name) || /[\x00-\x1f]/.test(name)) throw new Error('INVALID');
    user = { id: Utilities.getUuid(), name, email };
    sheet.appendRow([user.id, name, email, verifier, new Date(), '', 0]);
  } else {
    if (index < 0 || !equal_(String(rows[index][3]), verifier)) throw new Error('AUTH');
    user = { id: String(rows[index][0]), name: String(rows[index][1]), email };
  }
  recordAccess_(user.id, input.action === 'register' ? 'cadastro' : 'login');
  cache.remove(limitKey);
  const token = mac_('session:' + Utilities.getUuid() + ':' + Utilities.getUuid());
  cache.put('session:' + token, JSON.stringify(user), SESSION_SECONDS);
  return { user, token, expiresAt: Date.now() + SESSION_SECONDS * 1000 };
}

function recordAccess_(id, type) {
  const book = book_();
  const sheet = book.getSheetByName('Participantes');
  const rows = sheet.getRange(2, 1, Math.max(1, sheet.getLastRow() - 1), 7).getValues();
  const index = rows.findIndex(row => row[0] === id);
  if (index < 0) throw new Error('EXPIRED');
  const now = new Date();
  sheet.getRange(index + 2, 6, 1, 2).setValues([[now, Number(rows[index][6]) + 1]]);
  book.getSheetByName('Acessos').appendRow([now, id, type]);
}
function normalizeEmail_(value) {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[a-z0-9][a-z0-9.!#$%&'*+/=?^_`{|}~-]*@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email)) throw new Error('INVALID');
  return email;
}
function book_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('UNAVAILABLE');
  return SpreadsheetApp.openById(id);
}
function mac_(value) {
  const secret = PropertiesService.getScriptProperties().getProperty('AUTH_SECRET');
  if (!secret) throw new Error('UNAVAILABLE');
  return Utilities.computeHmacSha256Signature(value, secret).map(byte => (byte & 255).toString(16).padStart(2, '0')).join('');
}
function equal_(left, right) {
  let diff = left.length ^ right.length;
  for (let i = 0; i < Math.max(left.length, right.length); i++) diff |= (left.charCodeAt(i) || 0) ^ (right.charCodeAt(i) || 0);
  return diff === 0;
}
function json_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
