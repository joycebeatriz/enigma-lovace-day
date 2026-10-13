#!/usr/bin/env python3
"""Gera os quatro QRs imprimíveis. Instale: python3 -m pip install qrcode"""
import argparse
from pathlib import Path
from urllib.parse import quote, urlparse
import qrcode
import qrcode.image.svg

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--base-url', required=True, help='Endereço HTTPS publicado da interface, terminando em /web/')
parser.add_argument('--output', type=Path, default=Path('/tmp/lovelace-qrs'))
args = parser.parse_args()
url = urlparse(args.base_url)
if url.scheme not in ('https', 'http') or not url.netloc or url.fragment:
    parser.error('Use um endereço HTTP/HTTPS sem fragmento.')
args.output.mkdir(parents=True, exist_ok=True)
stations = [('TEAR', 'K4P9', '◇'), ('PULSO', 'M7X2', '∿'), ('PRISMA', 'R8N5', '△'), ('ECO', 'V3H6', '◎')]
for name, code, symbol in stations:
    token = f'LOVELACE:2026:{name}-{code}'
    link = args.base_url + '#qr=' + quote(token, safe='')
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=4)
    qr.add_data(link)
    qr.make(fit=True)
    qr.make_image(image_factory=qrcode.image.svg.SvgPathImage).save(args.output / f'{name.lower()}.svg')
    (args.output / f'{name.lower()}.txt').write_text(f'{symbol} {name}\n{token}\n{link}\n', encoding='utf-8')
print(f'QRs e códigos de contingência gerados em {args.output}')
