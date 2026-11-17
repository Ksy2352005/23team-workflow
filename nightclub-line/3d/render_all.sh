#!/bin/sh
# Renders every shot of the film (skips frames already rendered), then mixes and assembles the master: sh render_all.sh
cd "$(dirname "$0")"
W=540 H=960 SPP=6 /root/blender-venv/bin/python film.py 2>&1 | grep --line-buffered -E "^frame|Traceback|Error:|line [0-9]+" 
cd .. && /root/lemo-opuscar/.venv/bin/python mix.py && /root/lemo-opuscar/.venv/bin/python assemble.py
echo ALL DONE
