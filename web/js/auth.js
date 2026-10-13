"use strict";
(() => {
  const SESSION_KEY = "lovelace-auth-session-v1";
  const el = (id) => document.getElementById(id);
  let mode = "login";
  let session = null;
  const challenges = new Map();
  let pending = false;
  const messages = {
    AUTH: "Email ou senha incorretos. Confira e tente novamente.",
    EXISTS: "Este email já tem cadastro. Use a opção Entrar.",
    LIMIT: "Muitas tentativas. Aguarde 15 minutos e tente novamente.",
    EXPIRED: "Sua sessão terminou. Entre novamente.",
    INVALID: "Confira os dados informados.",
    BUSY: "O acesso está ocupado. Tente novamente em alguns segundos.",
    UNAVAILABLE: "Não foi possível conectar ao login. Tente novamente.",
  };
  function endpoint() {
    const url = window.LOVELACE_CONFIG?.appsScriptUrl;
    if (
      !url ||
      !/^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(
        url,
      )
    )
      throw new Error("O login ainda está sendo preparado pela organização.");
    return url;
  }
  async function request(input) {
    let response;
    try {
      response = await fetch(endpoint(), {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(input),
        redirect: "follow",
        credentials: "omit",
        signal: AbortSignal.timeout(30000),
      });
    } catch (error) {
      if (error.name === "TimeoutError" || error.name === "AbortError")
        throw new Error(
          "O Google demorou para responder. Tente novamente; se o cadastro já foi criado, use Entrar.",
        );
      throw error;
    }
    if (!response.ok) throw new Error(messages.UNAVAILABLE);
    const result = await response.json();
    if (!result.ok)
      throw new Error(messages[result.code] || messages.UNAVAILABLE);
    return result;
  }
  function getChallenge(email) {
    const cached = challenges.get(email);
    if (cached && Date.now() - cached.created < 300000) return cached.promise;
    const promise = request({ action: "challenge", email }).catch((error) => {
      challenges.delete(email);
      throw error;
    });
    challenges.set(email, { created: Date.now(), promise });
    return promise;
  }
  let preparationTimer;
  el("auth-email").addEventListener("input", () => {
    clearTimeout(preparationTimer);
    preparationTimer = setTimeout(() => {
      if (el("auth-email").checkValidity())
        getChallenge(el("auth-email").value.trim().toLowerCase()).catch(
          () => {},
        );
    }, 400);
  });
  el("auth-password").addEventListener("focus", () => {
    if (el("auth-email").checkValidity())
      getChallenge(el("auth-email").value.trim().toLowerCase()).catch(() => {});
  });
  el("auth-email").addEventListener("blur", () => {
    if (el("auth-email").checkValidity()) {
      getChallenge(el("auth-email").value.trim().toLowerCase()).catch(() => {});
    }
  });
  async function passwordProof(password, challenge) {
    if (
      !/^[a-f0-9]{32}$/.test(challenge.salt) ||
      challenge.iterations !== 600000
    )
      throw new Error(messages.UNAVAILABLE);
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"],
    );
    const bits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        hash: "SHA-256",
        iterations: challenge.iterations,
        salt: Uint8Array.from(challenge.salt.match(/../g), (byte) =>
          parseInt(byte, 16),
        ),
      },
      key,
      256,
    );
    return Array.from(new Uint8Array(bits), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
  }
  function showUser(user) {
    el("auth-status").textContent = "";
    el("auth-password").value = "";
    window.lovelaceUser = user || null;
    el("auth-section").hidden = !!user;
    el("participant-session").hidden = !user;
    el("laboratorio").hidden = !user;
    el("game-note").hidden = !user;
    document.querySelector(".mission-map").hidden = !user;
    el("participant-name").textContent = user ? `Olá, ${user.name}` : "";
    document.querySelector(".hero .button").href = user
      ? "#laboratorio"
      : "#auth-section";
    window.dispatchEvent(new CustomEvent("lovelace-auth", { detail: user }));
  }
  function setMode(next) {
    mode = next;
    const register = mode === "register";
    el("auth-name-field").hidden = !register;
    el("auth-name").required = register;
    el("auth-password").autocomplete = register
      ? "new-password"
      : "current-password";
    el("auth-password").minLength = register ? 8 : 1;
    el("auth-title").textContent = register
      ? "Sua primeira descoberta começa aqui."
      : "Entre para começar sua missão.";
    el("auth-submit").textContent = register
      ? "Criar conta e jogar →"
      : "Entrar e jogar →";
    el("auth-toggle").textContent = register
      ? "Já tenho conta. Entrar"
      : "Primeira vez? Criar conta";
    el("auth-status").textContent = "";
  }
  el("auth-toggle").addEventListener("click", () =>
    setMode(mode === "login" ? "register" : "login"),
  );
  el("auth-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (pending) return;
    pending = true;
    el("auth-form").setAttribute("aria-busy", "true");
    el("auth-submit").disabled = true;
    el("auth-toggle").disabled = true;
    el("auth-status").textContent = "Preparando seu acesso…";
    const slowNotice = setTimeout(() => {
      el("auth-status").textContent =
        "O Google está demorando um pouco. Aguarde; não precisa clicar novamente.";
    }, 8000);
    try {
      const email = el("auth-email").value.trim().toLowerCase();
      const password = el("auth-password").value;
      if (password.length > 128)
        throw new Error("Use uma senha com até 128 caracteres.");
      const challenge = await getChallenge(email);
      el("auth-status").textContent = "Protegendo sua senha…";
      const proof = await passwordProof(password, challenge);
      el("auth-status").textContent =
        mode === "register"
          ? "Criando sua conta e registrando o acesso…"
          : "Conferindo seus dados e registrando o acesso…";
      const result = await request({
        action: mode,
        email,
        proof,
        ...(mode === "register" ? { name: el("auth-name").value.trim() } : {}),
      });
      if (!result.user?.id || !result.token)
        throw new Error(messages.UNAVAILABLE);
      session = {
        token: result.token,
        user: result.user,
        expiresAt: result.expiresAt,
      };
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } catch (_) {}
      el("auth-password").value = "";
      showUser(result.user);
      el("laboratorio").scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      el("auth-status").textContent =
        error.message.includes("login ainda") ||
        Object.values(messages).includes(error.message) ||
        error.message.startsWith("Use uma senha") ||
        error.message.startsWith("O Google demorou")
          ? error.message
          : messages.UNAVAILABLE;
    } finally {
      clearTimeout(slowNotice);
      pending = false;
      el("auth-form").setAttribute("aria-busy", "false");
      el("auth-submit").disabled = false;
      el("auth-toggle").disabled = false;
    }
  });
  el("auth-logout").addEventListener("click", () => {
    const token = session?.token;
    session = null;
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (_) {}
    showUser(null);
    if (token) request({ action: "logout", token }).catch(() => {});
  });
  setMode("login");
  showUser(null);
  (async () => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY));
      if (!saved?.token || saved.expiresAt <= Date.now()) return;
      const result = await request({ action: "session", token: saved.token });
      session = saved;
      showUser(result.user);
    } catch (_) {
      try {
        sessionStorage.removeItem(SESSION_KEY);
      } catch (_) {}
    }
  })();
})();
