# Login e registro de acessos

O jogo usa Google Apps Script com uma planilha privada. O cadastro pede nome, email e senha; o login pede email e senha. Após entrar, o participante vê o jogo e seu próprio progresso neste navegador.

## Preparar no Google

1. Crie um projeto em https://script.google.com/.
2. Copie `apps-script/Code.gs` para o editor. Em Configurações, habilite o manifesto e copie `apps-script/appsscript.json` para `appsscript.json`.
3. Execute `setup` no editor e autorize o acesso às planilhas. A função cria uma planilha e salva `SPREADSHEET_ID` e `AUTH_SECRET` nas propriedades do script. Se já existe uma planilha, defina `SPREADSHEET_ID` antes de executar `setup`.
4. Mantenha a planilha **privada**. Não publique seu conteúdo nem exporte os cadastros para o GitHub.
5. Em **Implantar → Nova implantação → Aplicativo da Web**, selecione **Executar como: eu** e **Quem tem acesso: qualquer pessoa**. Isso permite o acesso ao endpoint, não à planilha.
6. Copie o endereço terminado em `/exec` para `appsScriptUrl` em `web/js/config.js`. Esse endereço é público; nenhum segredo vai nesse arquivo.
7. Abra o jogo, crie uma conta de teste, saia, entre novamente e recarregue a página. Confira as duas abas da planilha. Faça isso antes de divulgar o jogo.

Ao atualizar `Code.gs`, publique uma nova versão na implantação existente. O endereço `/dev` é apenas para desenvolvimento e não deve ser usado no site.

## O que é contado

- **Participantes:** uma linha por email normalizado, com nome, data de cadastro, último acesso e número acumulado de acessos.
- **Acessos:** uma linha por cadastro, login ou retorno com sessão válida. Atualizar a página com sessão válida conta como retorno.
- Pessoas únicas que acessaram: linhas de Participantes com `acessos > 0` (sem o cabeçalho).
- Total de acessos: linhas de Acessos (sem o cabeçalho).

Não são contadas visitas anônimas. Um acesso não significa conclusão da atividade; os pontos e as fases continuam locais, separados por conta e navegador. Não há sincronização entre dispositivos.

## Senhas e sessões

O navegador deriva a senha com PBKDF2-SHA-256, salt por email e 600 mil iterações. O servidor guarda somente um HMAC desse resultado, com um segredo privado nas propriedades do script. Nem a senha nem o valor derivado são salvos na planilha. O valor derivado é uma credencial equivalente à senha: trafega apenas por HTTPS no corpo POST, nunca em uma URL ou log.

A sessão dura até uma hora e usa um token armazenado em `sessionStorage`, removido ao sair. O cache do Apps Script pode encerrar uma sessão antes: basta entrar novamente. Até dez tentativas consecutivas por email são aceitas em uma janela de 15 minutos. Alterar ou apagar `AUTH_SECRET` invalida as credenciais existentes.

Não há confirmação de email nem recuperação automática de senha. Os emails são declarados pelos participantes; essa contagem não verifica identidade. O login identifica acessos para a atividade e não protege os arquivos públicos nem transforma a validação local dos desafios em um controle contra fraude.

## Validação e limites

Os testes locais simulam o Apps Script e verificam cadastro, login, erro de senha, duplicidade, isolamento do progresso, registros e logout. A conexão real, permissões, redirecionamento do Content Service e acesso entre origens devem ser conferidos com a implantação publicada. Não use `fetch` com `mode: no-cors`: ele impede ler e validar a resposta.

Referências oficiais: [Web Apps](https://developers.google.com/apps-script/guides/web), [Content Service](https://developers.google.com/apps-script/guides/content), [Properties Service](https://developers.google.com/apps-script/reference/properties/properties-service).

## Atualização para reduzir a espera

A versão atual prepara o salt enquanto o participante preenche o formulário. O backend evita reler a planilha e atualizar duas vezes a mesma linha durante cadastro/login; as consultas de preparação não aguardam o bloqueio de escrita.

Para aplicar a otimização no servidor, substitua `Code.gs` e use **Implantar → Gerenciar implantações → Editar → Versão: nova versão → Implantar**. Preserve as propriedades do script e o mesmo endereço `/exec`; não execute uma nova configuração nem apague o segredo. A latência do serviço Google permanece variável.
