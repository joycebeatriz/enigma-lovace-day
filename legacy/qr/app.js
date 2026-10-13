'use strict';
const $ = id => document.getElementById(id);
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
let stream = null, frame = null, cameraGeneration = 0;

function status(id, text, error = false) { $(id).textContent = text; $(id).classList.toggle('error', error); }
function stopCamera() {
  cameraGeneration++;
  if (frame !== null) cancelAnimationFrame(frame);
  frame = null;
  if (stream) stream.getTracks().forEach(track => track.stop());
  stream = null; $('video').srcObject = null; $('video').hidden = true;
  $('scan-frame').hidden = true; $('camera-placeholder').hidden = false;
  $('camera').hidden = false; $('camera').disabled = false; $('stop-camera').hidden = true;
}
function showQR(text) {
  if (window.readJourneyQR(text)) { $('qr-result').hidden = true; return; }
  $('qr-text').textContent = text; $('qr-result').hidden = false;
  $('qr-link').hidden = true; $('qr-link').removeAttribute('href');
  try { const url = new URL(text); if (['https:', 'http:'].includes(url.protocol)) { $('qr-link').href = url.href; $('qr-link').hidden = false; } } catch (_) {}
  status('qr-status', 'Este QR não pertence à etapa atual. O conteúdo está abaixo; ele não altera seu progresso.', true);
}
function decodeQR(source, width, height) {
  if (typeof jsQR !== 'function') throw new Error('O leitor de QR não carregou. Atualize a página ou use a entrada manual.');
  const scale = Math.min(1, 1600 / Math.max(width, height));
  canvas.width = Math.max(1, Math.round(width * scale)); canvas.height = Math.max(1, Math.round(height * scale));
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return jsQR(pixels.data, pixels.width, pixels.height, { inversionAttempts: 'attemptBoth' });
}
function scanFrame() {
  if (!stream) return;
  try {
    if ($('video').readyState >= 2) {
      const result = decodeQR($('video'), $('video').videoWidth, $('video').videoHeight);
      if (result) { stopCamera(); showQR(result.data); return; }
    }
    frame = requestAnimationFrame(scanFrame);
  } catch (error) { stopCamera(); status('qr-status', error.message, true); }
}
$('camera').addEventListener('click', async () => {
  if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
    status('qr-status', 'Para usar a câmera, abra por HTTPS ou localhost. Você também pode enviar uma foto do QR.', true); return;
  }
  stopCamera(); const generation = cameraGeneration;
  $('camera').disabled = true; $('stop-camera').hidden = false;
  status('qr-status', 'Aguardando sua permissão para acessar a câmera…');
  try {
    const acquired = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false });
    if (generation !== cameraGeneration) { acquired.getTracks().forEach(track => track.stop()); return; }
    stream = acquired; $('video').srcObject = stream;
    await $('video').play();
    if (generation !== cameraGeneration) return;
    $('video').hidden = false; $('scan-frame').hidden = false; $('camera-placeholder').hidden = true;
    $('camera').hidden = true; status('qr-status', 'Procurando QR… mantenha o código inteiro dentro da câmera.'); scanFrame();
  } catch (error) {
    if (generation !== cameraGeneration) return;
    stopCamera();
    const messages = { NotAllowedError: 'Acesso à câmera negado. Permita o acesso no navegador ou envie uma foto.', NotFoundError: 'Nenhuma câmera encontrada. Envie uma foto do QR.', NotReadableError: 'A câmera está ocupada. Feche outros aplicativos ou envie uma foto.' };
    status('qr-status', messages[error.name] || 'Não foi possível iniciar a câmera. Tente enviar uma foto.', true);
  }
});
$('stop-camera').addEventListener('click', () => { stopCamera(); status('qr-status', 'Câmera desligada.'); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { stopCamera(); status('qr-status', 'Câmera desligada. Ative novamente para continuar.'); } });
window.addEventListener('pagehide', stopCamera);
async function loadImage(src) {
  const img = new Image(); img.src = src; await img.decode();
  if (img.naturalWidth * img.naturalHeight > 24000000) throw new Error('A imagem é muito grande. Use um arquivo com até 24 megapixels.');
  return img;
}
$('qr-file').addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file) return;
  stopCamera(); $('qr-result').hidden = true;
  if (file.size > 20 * 1024 * 1024) { status('qr-status', 'Envie uma imagem de até 20 MB.', true); event.target.value = ''; return; }
  const url = URL.createObjectURL(file); status('qr-status', 'Lendo imagem…');
  try {
    const img = await loadImage(url); const result = decodeQR(img, img.naturalWidth, img.naturalHeight);
    if (!result) throw new Error('Não encontrei um QR nesta imagem. Tente uma foto nítida, sem cortar o código.');
    showQR(result.data);
  } catch (error) { status('qr-status', error.message || 'Não foi possível ler esta imagem.', true); }
  finally { URL.revokeObjectURL(url); event.target.value = ''; }
});
$('manual-submit').addEventListener('click', () => {
  const text = $('manual').value.trim(); if (!text) { status('qr-status', 'Cole o conteúdo da pista primeiro.', true); return; }
  stopCamera(); showQR(text);
});
