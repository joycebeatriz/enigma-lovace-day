"use strict";
const missionMap = document.createElement("nav");
missionMap.className = "mission-map";
missionMap.hidden = true;
missionMap.setAttribute("aria-label", "Mapa da missão");
const heading = document.createElement("div");
heading.className = "map-heading";
heading.innerHTML =
  '<span>SEU PROGRESSO</span><span id="map-count">0 / 4 NÚCLEOS</span>';
missionMap.append(heading);
const score = document.createElement("div");
score.className = "mission-score";
score.setAttribute("role", "status");
score.setAttribute("aria-live", "polite");
missionMap.append(score);
const route = document.createElement("div");
route.className = "mission-route";
missionMap.append(route);
const names = ["TEAR", "PULSO", "PRISMA", "ECO"];
const icons = ["01", "02", "03", "04"];
names.forEach((name, index) => {
  const node = document.createElement("button");
  node.type = "button";
  node.className = "mission-node";
  node.innerHTML = `<span class="node-icon">${icons[index]}</span><span class="node-name">${name}</span><span class="node-description">${["Ordene os comandos", "Acenda as luzes", "Combine as cores", "Encontre a diferença"][index]}</span><span class="node-points">+100 pts · iniciante</span><span class="node-state">OFFLINE</span>`;
  node.addEventListener("click", () => {
    const target = document.getElementById("journey-card");
    target?.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "center",
    });
  });
  route.append(node);
});
const core = document.createElement("a");
core.className = "mission-core";
core.href = "#laboratorio";
core.innerHTML =
  "<span>⬡</span><strong>ARQUIVO ADA</strong><small>A MENSAGEM ESCONDIDA</small>";
route.append(core);
document.querySelector(".hero").after(missionMap);
window.updateMissionMap = (count) => {
  document.getElementById("map-count").textContent = `${count} / 4 NÚCLEOS`;
  const restored = count;
  score.replaceChildren();
  const total = document.createElement("strong");
  total.textContent = `${restored * POINTS_PER_STAGE}`;
  const label = document.createElement("span");
  label.textContent = " / 400 PONTOS";
  const rank = document.createElement("small");
  rank.textContent = [
    "Mente curiosa",
    "Primeira descoberta",
    "Explorador de pistas",
    "Decifrador de códigos",
    "Guardião do arquivo",
  ][restored];
  score.append(total, label, rank);
  route.querySelectorAll(".mission-node").forEach((node, index) => {
    const recovered = index < count;
    node.disabled = index !== count;
    node.classList.toggle("recovered", recovered);
    node.classList.toggle("active-node", !recovered && index === count);
    node.querySelector(".node-state").textContent = recovered
      ? "Concluído ✓"
      : index === count
        ? "Jogar →"
        : "Em breve";
  });
};
window.celebrateFragment = () => {
  document.getElementById("journey-card").classList.remove("fragment-flash");
  requestAnimationFrame(() =>
    document.getElementById("journey-card").classList.add("fragment-flash"),
  );
};
window.updateMissionMap(journey.completed);
