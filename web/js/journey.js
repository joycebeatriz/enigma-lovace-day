"use strict";
const STAGES = [
  {
    title: "01 · A máquina de tecer ideias",
    intro:
      "Tear está offline. Reconstrua o programa de Ada para recuperar o primeiro fragmento.",
    clue: "O programa de Ada foi embaralhado. A entrada é 4 e a saída precisa ser 9. Reconstrua a sequência: receber o número, multiplicar por dois, somar um. Clique nos três comandos na ordem de execução.",
    verifier: {
      salt: "271a2aeac2acdb4bf7ec8b4981fc2692",
      iterations: 120000,
      digest:
        "33a21be9efbf35e354342cb5cdf21e5ec6336e03c43bfebd20cd41f68750cabd",
    },
    hints: [
      "Primeiro, a máquina precisa receber o número.",
      "Multiplicar antes de somar dá 9. Somar antes de multiplicar dá 10.",
    ],
    fragment:
      "FRAGMENTO 1 — A evidência final é um arquivo PNG. Preserve o original; uma captura de tela pode apagar o segredo.",
  },
  {
    title: "02 · Dois estados, muitas possibilidades",
    intro: "Pulso aguarda energia. Use as lâmpadas para reconstruir o sinal.",
    clue: "Seis lâmpadas representam, da esquerda para a direita, os valores 32, 16, 8, 4, 2 e 1. A máquina deve registrar o número 45. Acenda as lâmpadas certas no painel abaixo para restaurar o sinal.",
    verifier: {
      salt: "5883c368a6ad01e5eb6c67d15a6c2414",
      iterations: 120000,
      digest:
        "18095a08d127d7a9875590330e81d636cc7f961a40093e29935ad4b5cb972121",
    },
    hints: [
      "Uma lâmpada acesa contribui com seu valor. A soma precisa ser 45.",
      "Comece com 32. Sobram 13. Escolha os outros valores para completar a soma.",
    ],
    fragment:
      "FRAGMENTO 2 — Cada letra da mensagem foi transformada em oito bits. Leia cada grupo do bit de maior valor para o de menor valor.",
  },
  {
    title: "03 · A ordem muda tudo",
    intro:
      "Prisma perdeu a conexão. Três canais guardam a sequência para restaurá-la.",
    clue: "Um registro diz: “O vermelho não vem primeiro. O verde está entre os outros dois. O azul vem antes do verde.” Em que ordem devemos ler os três canais? Selecione os canais na ordem correta no painel abaixo.",
    verifier: {
      salt: "1dc4d155bc372370c0206142160c857b",
      iterations: 120000,
      digest:
        "ce2049bf60f69cba817ed2cad4077ccd9b170d8c84c1b843afda6a366e602083",
    },
    hints: [
      "São três posições, e o verde ocupa a do meio.",
      "O azul está antes do verde; o vermelho ocupa a posição restante.",
    ],
    fragment:
      "FRAGMENTO 3 — Percorra a imagem por linhas, da esquerda para a direita. Em cada pixel, leia os canais na ordem BGR.",
  },
  {
    title: "04 · Uma mudança quase invisível",
    intro:
      "Eco guarda a última pista. Você está a uma descoberta do arquivo final.",
    clue: "Compare as cores 11001010 e 11001011. Só mudou a posição mais à direita: o bit que vale menos. A mensagem foi escondida nessa posição de cada canal. Selecione a posição alterada no painel. Ela revela onde o segredo está escondido.",
    verifier: {
      salt: "74c128c5f1e2eb86447391cebcf43ef5",
      iterations: 120000,
      digest:
        "a190f6309f98978c6678cee1b42106b5aa477ed7e4bef454448cba5ab93a90e8",
    },
    hints: [
      "Compare as duas sequências, posição por posição.",
      "A posição mais à direita vale 1: é o bit menos significativo.",
    ],
    fragment:
      "FRAGMENTO 4 — Extraia o último bit de cada canal. Agrupe de oito em oito e termine quando encontrar ###END###.",
  },
];
const POINTS_PER_STAGE = 100;
let STORAGE_KEY = "lovelace-2026-journey-v1";
const el = (id) => document.getElementById(id);
let journey = { completed: 0, hints: 0 };
function loadJourney() {
  journey = { completed: 0, hints: 0 };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (
      saved &&
      Number.isInteger(saved.completed) &&
      saved.completed >= 0 &&
      saved.completed <= STAGES.length
    ) {
      journey = {
        completed: saved.completed,
        hints: Math.min(2, Math.max(0, Number(saved.hints) || 0)),
      };
    }
  } catch (_) {}
}
loadJourney();
let solved = false;
function saveJourney() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(journey));
  } catch (_) {
    el("save-status").textContent =
      "O navegador bloqueou o salvamento. Mantenha esta aba aberta para preservar seu progresso.";
  }
}
function normalizeAnswer(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}
// A salted verifier avoids publishing a plain-text answer table.
// Static verification is an activity aid, not a security boundary.
async function verifyStageAnswer(index, answer) {
  const verifier = STAGES[index].verifier;
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(normalizeAnswer(answer)),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const digest = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      iterations: verifier.iterations,
      salt: Uint8Array.from(verifier.salt.match(/../g), (byte) =>
        parseInt(byte, 16),
      ),
    },
    material,
    256,
  );
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return hash === verifier.digest;
}
function renderJourney() {
  const finished = journey.completed === STAGES.length;
  const stage = STAGES[Math.min(journey.completed, STAGES.length - 1)];
  el("stage-counter").textContent =
    `${String(Math.min(journey.completed + 1, 4)).padStart(2, "0")} / 04`;
  el("stage-state").textContent = finished
    ? "ARQUIVO RECONSTRUÍDO"
    : "NÚCLEO DISPONÍVEL";
  el("stage-title").textContent = finished
    ? "Você reconstruiu o arquivo."
    : stage.title;
  el("stage-intro").textContent = finished
    ? "Os quatro núcleos foram restaurados. A mensagem secreta ainda precisa ser decifrada."
    : stage.intro;
  el("progress").replaceChildren();
  STAGES.forEach((item, index) => {
    const li = document.createElement("li");
    const marker = document.createElement("span");
    marker.className = "progress-marker";
    marker.textContent =
      index < journey.completed ? "✓" : String(index + 1).padStart(2, "0");
    marker.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.className = "progress-label";
    label.textContent = ["TEAR", "PULSO", "PRISMA", "ECO"][index];
    li.append(marker, label);
    li.className =
      index < journey.completed
        ? "done"
        : index === journey.completed
          ? "current"
          : "";
    li.setAttribute(
      "aria-label",
      `${item.title}: ${index < journey.completed ? "concluída" : index === journey.completed ? "atual" : "pendente"}`,
    );
    el("progress").append(li);
  });
  el("challenge").hidden = finished;
  el("fragment-result").hidden = true;
  el("github-finale").hidden = !finished;
  el("stage-clue").textContent = stage.clue;
  el("answer").value = "";
  el("answer-status").textContent = "";
  el("hint-text").textContent = stage.hints.slice(0, journey.hints).join(" ");
  el("hint-button").disabled = journey.hints >= stage.hints.length;
  if (!finished && window.mountPuzzle)
    window.mountPuzzle(el("puzzle-host"), journey.completed, (answer) => {
      el("answer").value = answer;
    });
  if (window.updateMissionMap) window.updateMissionMap(journey.completed);
  el("inventory").replaceChildren();
  if (!journey.completed) {
    const li = document.createElement("li");
    li.textContent =
      "Nenhum fragmento ainda. Resolva o primeiro núcleo para começar sua coleção.";
    el("inventory").append(li);
  }
  STAGES.slice(0, journey.completed).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.fragment;
    el("inventory").append(li);
  });
}
el("answer-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!window.lovelaceUser || solved || journey.completed >= STAGES.length)
    return;
  const current = journey.completed;
  const storageAtSubmit = STORAGE_KEY;
  el("check-answer").disabled = true;
  try {
    const correct = await verifyStageAnswer(current, el("answer").value);
    if (
      current !== journey.completed ||
      !window.lovelaceUser ||
      STORAGE_KEY !== storageAtSubmit
    )
      return;
    if (!correct) {
      el("answer-status").textContent =
        "Essa hipótese ainda não explica a pista. Revise os detalhes ou peça uma dica.";
      return;
    }
    solved = true;
    journey.completed++;
    journey.hints = 0;
    saveJourney();
    renderJourney();
    if (window.celebrateFragment) window.celebrateFragment();
    el("challenge").hidden = true;
    el("github-finale").hidden = true;
    el("stage-title").textContent = "Uma descoberta comprovada.";
    el("stage-state").textContent = "FRAGMENTO RECUPERADO";
    el("stage-intro").textContent =
      "Guarde esta instrução. Ela será necessária para decifrar a imagem final.";
    el("fragment-text").textContent = STAGES[current].fragment;
    el("fragment-result").hidden = false;
    el("next-stage").textContent =
      journey.completed === STAGES.length
        ? "Abrir a etapa final →"
        : "Reativar o próximo núcleo →";
  } catch (_) {
    el("answer-status").textContent =
      "Não foi possível verificar. Abra a página por HTTPS ou localhost e tente novamente.";
  } finally {
    el("check-answer").disabled = false;
  }
});
el("next-stage").addEventListener("click", () => {
  solved = false;
  renderJourney();
});
el("hint-button").addEventListener("click", () => {
  if (!window.lovelaceUser || solved || journey.completed >= STAGES.length)
    return;
  journey.hints = Math.min(journey.hints + 1, 2);
  saveJourney();
  el("hint-text").textContent = STAGES[journey.completed].hints
    .slice(0, journey.hints)
    .join(" ");
  el("hint-button").disabled = journey.hints >= 2;
});
el("reset-progress").addEventListener("click", () => {
  if (!confirm("Apagar seu progresso neste navegador e começar novamente?"))
    return;
  solved = false;
  journey = { completed: 0, hints: 0 };
  saveJourney();
  renderJourney();
});
renderJourney();

window.addEventListener("lovelace-auth", (event) => {
  solved = false;
  STORAGE_KEY = event.detail
    ? `lovelace-2026-journey-v1:${event.detail.id}`
    : "lovelace-2026-journey-v1";
  if (event.detail) loadJourney();
  else journey = { completed: 0, hints: 0 };
  renderJourney();
});
