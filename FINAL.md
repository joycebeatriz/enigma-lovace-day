# O último arquivo de Ada

Você reuniu quatro fragmentos. Agora eles se tornam instruções de verdade.

Baixe o arquivo [Ada_lovelace_com_texto.png](assets/images/Ada_lovelace_com_texto.png) deste repositório usando o botão de download do GitHub. Preserve o PNG original.

Seu objetivo é extrair uma mensagem dos pixels. Antes de executar qualquer ferramenta, escreva sua hipótese: qual posição dos bits você vai ler, em que ordem percorrerá os canais e como saberá que o texto terminou?

## Caminho de investigação

Você pode escrever seu próprio programa, usar IA para ajudar ou examinar [o extrator](tools/enigma.py). Compare a solução com os fragmentos que coletou.

Para executar o extrator em um computador com Python:

```bash
python3 -m pip install Pillow
python3 tools/enigma.py reveal assets/images/Ada_lovelace_com_texto.png
```

Baixe também o script ou clone o repositório para manter as pastas `tools` e `assets/images`.

## Sua prova de descoberta

Mostre à organização a mensagem extraída **e explique como os quatro fragmentos foram usados**. A organização informará os critérios e as regras de premiação do evento.

**Preparação pendente da organização:** o PNG atual ainda pertence à edição anterior. A organização precisa substituí-lo pela mensagem deste ano e publicar esta versão antes de divulgar o jogo.
