#!/usr/bin/env python3
"""Converte PNGs de posts em JPEG (a API do Instagram só aceita JPEG em imagens).

Uso: preparar.py v21/03_pdf_01.png v21/03_pdf_02.png ...   → grava .jpg ao lado de cada arquivo.
"""
import sys
from PIL import Image

for caminho in sys.argv[1:]:
    saida = caminho.rsplit('.', 1)[0] + '.jpg'
    Image.open(caminho).convert('RGB').save(saida, 'JPEG', quality=92, optimize=True, progressive=True)
    print(saida)
