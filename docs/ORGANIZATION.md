# Jornada individual · Enigma Lovelace 2026

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Abra http://localhost:8000/web/. A interface conduz quatro etapas: resolver o enigma no app, recuperar um fragmento, ganhar 100 pontos e liberar o próximo núcleo. A conclusão encaminha ao GitHub; a página inicial não extrai a mensagem.

## Para a organização

Os quatro núcleos — **Tear, Pulso, Prisma e Eco** — são jogados dentro do app, em sequência. O primeiro já está disponível; cada solução libera o próximo. Não é necessário usar câmera, QR ou cartazes. A navegação é individual, com cadastro e login; não existem equipes. Configure o Apps Script seguindo [LOGIN.md](LOGIN.md).

Cada núcleo restaurado vale **100 pontos**, até **400 pontos**. Tentativas e dicas não descontam pontos. O placar é calculado pelos núcleos concluídos, inclusive para quem já tinha progresso salvo. Recomeçar zera a missão e os pontos.

Publique as pastas `web/` e `assets/`, mantendo a estrutura, por HTTPS. Publique também `FINAL.md`, `tools/enigma.py` e o novo PNG no GitHub; confirme o nome da branch no link final em `web/index.html` (atualmente `main`). O servidor local serve à demonstração no seu computador.

Os desafios usam painéis interativos: selecionar comandos na ordem de execução, acender lâmpadas, ordenar os canais e selecionar o bit alterado. Use o botão de execução para validar. Cada etapa tem duas dicas. O progresso é salvo no navegador e volta após atualização; não acompanha a pessoa entre dispositivos.

## Mensagem desta edição

O PNG existente ainda contém a mensagem da edição anterior. Não distribua a edição antiga como prova de premiação. Crie a mensagem em um arquivo privado fora do repositório e gere uma nova imagem:

```bash
python3 -m pip install Pillow
python3 tools/enigma.py hide assets/images/Ada_lovelace.png --message-file /CAMINHO/PRIVADO/mensagem.txt --output /tmp/Ada_lovelace_com_texto.png
```

Confira a extração antes de substituir o PNG do repositório. O gerador preserva o original e recusa sobrescrever uma saída existente. Não inclua `###END###` na mensagem: o gerador adiciona o delimitador.

## Uso por 100 pessoas

A interface é estática: cada dispositivo verifica respostas localmente, sem uma requisição por tentativa. Isso reduz a carga, mas a capacidade e a disponibilidade dependem da hospedagem e da rede do evento; não foi realizado teste de 100 celulares simultâneos. Fontes externas são opcionais.

Não existe ranking nem controle de vencedores. O login registra participantes e acessos, sem verificar a titularidade do email. As etapas no navegador organizam a experiência, mas podem ser inspecionadas ou burladas; os verificadores PBKDF2 não constituem segurança contra fraude. Para prêmios, a organização deve verificar a mensagem e a explicação individual, ou usar um backend de validação caso seja necessário registrar ordem de chegada.

Teste os painéis em Android e iPhone antes do evento.

## Publicar no Vercel

Importe o repositório com **Root Directory na raiz do projeto** (campo vazio), e Framework Preset **Other**. O arquivo `vercel.json` define o build e a saída. Não configure a raiz como `web`: o build precisa das pastas `tools` e `assets`.

O build executa `node tools/build-site.mjs` e copia somente `web/` e `assets/` para `build/site/`. A raiz do domínio redireciona para `/web/`, preservando os caminhos do CSS, JavaScript e retrato. Código do Apps Script, testes e arquivos locais não são enviados à hospedagem.

Depois de enviar a configuração ao GitHub, faça uma nova implantação no Vercel. Uma implantação anterior não recebe arquivos novos automaticamente sem novo build.

Referências: [configuração do Vercel](https://vercel.com/docs/project-configuration/vercel-json) e [configuração do build](https://vercel.com/docs/builds/configure-a-build).
