# O Enigma Lovelace

Jogo individual inspirado em Ada Lovelace: quatro desafios interativos de dificuldade baixa, dicas, fragmentos e 100 pontos por descoberta. A missão termina com uma mensagem escondida em um PNG. O progresso fica salvo no navegador, separado por conta. O login usa Google Apps Script e registra participantes e acessos em uma planilha privada.

## Jogar localmente

Requer Python 3. Na raiz do repositório:

```bash
make serve
```

- Participante: http://localhost:8000/web/

Não é necessário usar câmera ou QR. O jogo tem somente o fluxo dos participantes. Para liberar o login, configure a implantação conforme [o guia de login](docs/LOGIN.md).

## Estrutura

```text
assets/images/       Retrato de Ada e PNG com a mensagem
web/
  index.html         Página do jogo
  css/style.css      Identidade visual e layout responsivo
  js/
    minigames.js     Controles dos quatro desafios
    journey.js       Jornada, validação, dicas e persistência
    game-ui.js       Mapa de fases, placar e reação de conquista
    auth.js          Cadastro, login, sessão e logout
    config.js        Endereço público da implantação Apps Script
tools/
  enigma.py          Criação e extração de mensagens LSB
  requirements.txt   Dependência Python do extrator
docs/
  ORGANIZATION.md    Preparação do evento e publicação
apps-script/         Backend do login para implantar no Google
tests/               Testes do backend com serviços simulados
legacy/              Código anterior, fora do jogo atual
FINAL.md             Etapa final para participantes
Makefile             Comandos de desenvolvimento
```

`build/` guarda arquivos compilados locais e não entra no Git.

## Mensagem final

As instruções dos participantes estão em [FINAL.md](FINAL.md). Para instalar a dependência e extrair a mensagem:

```bash
python3 -m pip install -r tools/requirements.txt
make reveal
```

**Preparação pendente:** o PNG com texto ainda é da edição anterior. A organização deve gerar e conferir a mensagem desta edição antes de divulgar o jogo. Veja [o guia da organização](docs/ORGANIZATION.md).

## Desenvolvimento e publicação

Não há etapa de build nem dependências JavaScript. Para conferir a sintaxe, com Node.js instalado:

```bash
make check-js
make test
```

Ao publicar, mantenha `web/` e `assets/` na mesma estrutura. O acesso ao jogo termina em `/web/`. Confira o endereço do repositório e a branch no link de `FINAL.md` em `web/index.html`.

O repositório público e a hospedagem do jogo são etapas distintas: enviar os arquivos ao GitHub não ativa automaticamente o GitHub Pages.

## Código anterior

[legacy/README.md](legacy/README.md) explica os arquivos históricos de QR, C++ e extração JavaScript. Eles não são carregados pelo jogo atual.

## Validação da atividade

O site permanece estático. As respostas são conferidas com verificadores PBKDF2-SHA-256, salt individual e 120 mil iterações. Não há uma lista explícita de soluções. Hashes não são criptografia reversível.

Isso dificulta a leitura casual do gabarito. Como os desafios são fáceis e todo o código é público, é possível testar combinações, deduzir respostas pelas pistas ou contornar o progresso no navegador. Esta versão é destinada a uma atividade educativa, sem garantia contra fraude. Os fragmentos e o extrator final também são públicos.
