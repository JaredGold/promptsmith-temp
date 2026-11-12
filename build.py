#!/usr/bin/env python3
"""Concatenate src/*.js into src/shell.html -> dist/index.html (one self-contained page)."""
import glob, os, sys
root = os.path.dirname(os.path.abspath(__file__))
shell = open(os.path.join(root, 'src', 'shell.html'), encoding='utf-8').read()
js = '\n'.join(open(f, encoding='utf-8').read() for f in sorted(glob.glob(os.path.join(root, 'src', '*.js'))))
if '</script' in js.lower():
    sys.exit('JS contains a closing script tag; split the string.')
os.makedirs(os.path.join(root, 'dist'), exist_ok=True)
out = os.path.join(root, 'dist', 'index.html')
open(out, 'w', encoding='utf-8').write(shell.replace('/*__JS__*/', js))
print(out, len(shell) + len(js), 'bytes')
