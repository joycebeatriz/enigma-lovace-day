"use strict";
/* Interactive controls for the participant journey. */
window.mountPuzzle = function (host, index, onAnswer) {
  host.replaceChildren();
  host.className = "puzzle-console";
  const instruction = document.createElement("p");
  instruction.className = "console-label";
  host.append(instruction);
  const board = document.createElement("div");
  board.className = "puzzle-board";
  host.append(board);
  const readout = document.createElement("output");
  readout.className = "puzzle-readout";
  readout.setAttribute("aria-live", "polite");
  host.append(readout);
  const button = (text, action, label) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "puzzle-switch";
    b.textContent = text;
    if (label) b.setAttribute("aria-label", label);
    b.addEventListener("click", action);
    board.append(b);
    return b;
  };
  if (index === 0) {
    instruction.textContent =
      "Toque nos comandos na ordem: receber → multiplicar → somar.";
    const selected = [];
    const operations = [
      { name: "Multiplicar × 2", id: "double" },
      { name: "Receber 4", id: "input" },
      { name: "Somar + 1", id: "add" },
    ];
    operations.forEach((operation) => {
      let b;
      b = button(operation.name, () => {
        if (selected.length === 3) return;
        selected.push(operation);
        b.disabled = true;
        let value = null;
        selected.forEach((item) => {
          if (item.id === "input") value = 4;
          else if (value !== null)
            value = item.id === "double" ? value * 2 : value + 1;
        });
        readout.textContent = `${selected.map((item) => item.name).join(" → ")} · Resultado: ${value === null ? "receba o número primeiro" : value}${selected.length === 3 ? " / alvo: 9" : ""}`;
        if (selected.length === 3)
          onAnswer(selected.map((item) => item.id).join(" "));
      });
    });
    const reset = button(
      "↺ Refazer",
      () => {
        selected.length = 0;
        board.querySelectorAll("button").forEach((b) => (b.disabled = false));
        readout.textContent = "Entrada 4 → ? → ? → saída 9";
        onAnswer("");
      },
      "Reiniciar sequência",
    );
    reset.classList.add("puzzle-reset");
    readout.textContent = "Entrada 4 → ? → ? → saída 9";
  } else if (index === 1) {
    instruction.textContent =
      "Toque nas luzes. Os valores acesos precisam somar 45.";
    board.classList.add("lamp-board");
    const values = [32, 16, 8, 4, 2, 1];
    const enabled = values.map(() => false);
    const update = () => {
      const total = values.reduce(
        (sum, value, i) => sum + (enabled[i] ? value : 0),
        0,
      );
      readout.textContent = `SINAL ${String(total).padStart(2, "0")} / ALVO 45`;
      onAnswer(enabled.map((value) => (value ? "1" : "0")).join(""));
    };
    values.forEach((value, i) => {
      let b;
      b = button(
        String(value),
        () => {
          enabled[i] = !enabled[i];
          b.classList.toggle("lit", enabled[i]);
          b.setAttribute("aria-pressed", String(enabled[i]));
          update();
        },
        `Lâmpada de valor ${value}`,
      );
      b.setAttribute("aria-pressed", "false");
    });
    update();
  } else if (index === 2) {
    instruction.textContent =
      "Toque nas cores para montar a sequência. Use Refazer para tentar outra ordem.";
    const selected = [];
    const colors = ["vermelho", "azul", "verde"];
    colors.forEach((color) => {
      let b;
      b = button(color.toUpperCase(), () => {
        if (selected.length === 3) return;
        selected.push(color);
        b.disabled = true;
        readout.textContent = selected
          .map((item) => item.toUpperCase())
          .join(" → ");
        if (selected.length === 3) onAnswer(selected.join(" "));
      });
      b.classList.add("color-" + color);
    });
    button(
      "↺ Refazer",
      () => {
        selected.length = 0;
        board.querySelectorAll("button").forEach((b) => (b.disabled = false));
        readout.textContent = "CANAL 1 → CANAL 2 → CANAL 3";
        onAnswer("");
      },
      "Reiniciar ordem",
    );
    readout.textContent = "CANAL 1 → CANAL 2 → CANAL 3";
  } else {
    instruction.textContent =
      "Encontre o par diferente. Toque na coluna em que os números mudaram.";
    board.classList.add("bit-board");
    "11001010".split("").forEach((bit, i) => {
      let b;
      b = button(
        bit + "\n" + "11001011"[i],
        () => {
          board
            .querySelectorAll("button")
            .forEach(
              (item) => (
                item.classList.remove("selected"),
                item.setAttribute("aria-pressed", "false")
              ),
            );
          b.classList.add("selected");
          b.setAttribute("aria-pressed", "true");
          readout.textContent = `Você selecionou a coluna ${i + 1}. Confira sua resposta abaixo.`;
          onAnswer("bit-" + i);
        },
        `Posição ${i + 1}: ${bit} no primeiro byte e ${"11001011"[i]} no segundo`,
      );
    });
    readout.textContent = "11001010 → 11001011";
  }
};
