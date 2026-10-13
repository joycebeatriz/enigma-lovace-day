/* OpenCV stores color channels in BGR order; preserve the original puzzle format. */
(function (root) {
  function extractLSB(rgba) {
    const bytes = [];
    const marker = [35, 35, 35, 69, 78, 68, 35, 35, 35];
    let value = 0, bits = 0;
    for (let pixel = 0; pixel < rgba.length; pixel += 4) {
      for (const channel of [2, 1, 0]) {
        value = (value << 1) | (rgba[pixel + channel] & 1);
        if (++bits !== 8) continue;
        bytes.push(value); value = 0; bits = 0;
        if (bytes.length >= marker.length && marker.every((b, i) => b === bytes[bytes.length - marker.length + i])) {
          return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes.slice(0, -marker.length)));
        }
        if (bytes.length > 65536) throw new Error('A mensagem excede o limite de análise de 64 KB.');
      }
    }
    throw new Error('Nenhuma mensagem compatível foi encontrada. Confira se este é o PNG original do enigma.');
  }
  root.extractLSB = extractLSB;
  if (typeof module !== 'undefined') module.exports = { extractLSB };
})(globalThis);
