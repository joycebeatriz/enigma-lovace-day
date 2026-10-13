# Código anterior

Esta pasta preserva versões anteriores para consulta. Nenhum arquivo daqui é carregado por `web/index.html`.

- `qr/app.js`: câmera e leitura de QR da versão com estações físicas.
- `qr/vendor/`: leitor jsQR e licença original.
- `qr/gerar_qrs.py`: gerador dos códigos da versão anterior; os links não liberam fases no jogo atual.
- `stego/extract-lsb.js`: extrator JavaScript usado na implementação anterior.
- `cpp/`: programas originais e seu Makefile, com dependência de OpenCV.

O fluxo atual usa `tools/enigma.py`. O C++ é apenas referência: o gerador contém uma mensagem antiga fixa e não deve ser usado para preparar esta edição.

Para compilar os programas históricos, use `make -C legacy/cpp` com OpenCV e `pkg-config` instalados. Os executáveis ficam nessa pasta e são ignorados pelo Git. A execução deve ocorrer a partir de `legacy/cpp/`; as imagens de saída e entrada do extrator histórico ficam em `build/` na raiz. Crie essa pasta antes de usar o gerador. Os executáveis existentes foram preservados em `build/`, fora do commit.
