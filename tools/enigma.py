#!/usr/bin/env python3
# Esteganografia LSB.
import argparse
from pathlib import Path
from PIL import Image

MARKER = b'###END###'

def reveal(image):
    raw = image.convert('RGB').tobytes()
    message = bytearray()
    value = bits = 0
    for pixel in range(0, len(raw), 3):
        for channel in (2, 1, 0):
            value = (value << 1) | (raw[pixel + channel] & 1)
            bits += 1
            if bits == 8:
                message.append(value)
                bits = value = 0
                if message.endswith(MARKER):
                    return message[:-len(MARKER)].decode('utf-8')
    raise ValueError('Mensagem não encontrada: use o PNG original, sem conversão ou captura de tela.')

def hide(image, text):
    if MARKER.decode() in text:
        raise ValueError('A mensagem não pode conter o delimitador ###END###.')
    image = image.convert('RGB')
    raw = bytearray(image.tobytes())
    message = text.encode('utf-8') + MARKER
    if len(message) * 8 > len(raw):
        raise ValueError('A mensagem não cabe nesta imagem.')
    for index in range(len(message) * 8):
        pixel, channel = divmod(index, 3)
        position = pixel * 3 + (2, 1, 0)[channel]
        raw[position] = (raw[position] & 254) | ((message[index // 8] >> (7 - index % 8)) & 1)
    return Image.frombytes('RGB', image.size, bytes(raw))

def main():
    parser = argparse.ArgumentParser(description="Enigma Lovelace: esconder e revelar mensagens.")
    sub = parser.add_subparsers(dest='command', required=True)
    read = sub.add_parser('reveal', help='Recuperar uma mensagem do PNG')
    read.add_argument('image', type=Path)
    write = sub.add_parser('hide', help='Criar um enigma com mensagem personalizada')
    write.add_argument('image', type=Path)
    write.add_argument('--message-file', required=True, type=Path)
    write.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    try:
        with Image.open(args.image) as image:
            if image.format != 'PNG':
                raise ValueError('Use uma imagem PNG.')
            if args.command == 'reveal':
                print(reveal(image))
            else:
                if args.output.resolve() == args.image.resolve() or args.output.exists():
                    raise ValueError('Escolha uma saída nova para preservar os arquivos existentes.')
                hide(image, args.message_file.read_text(encoding='utf-8')).save(args.output, format='PNG')
                print(f'Enigma criado: {args.output}')
    except (OSError, ValueError) as error:
        parser.exit(1, f'Erro: {error}\n')

if __name__ == '__main__':
    main()
