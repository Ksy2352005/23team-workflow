#!/bin/sh
# preview a few shots: sh preview_some.sh name1 name2 ...
cd "$(dirname "$0")"; OUT=../frames/preview; mkdir -p $OUT
for s in "$@"; do
  n=$(LIST=1 /root/blender-venv/bin/python film.py 2>/dev/null | awk -v s=$s '$1==s{print int($3/2)}')
  W=270 H=480 SPP=4 SHOT=$s FRAMES=$n /root/blender-venv/bin/python film.py 2>&1 | grep -E "Traceback|Error:|line [0-9]+|^[A-Za-z]*Error" | sed "s/^/$s: /"
  cp ../frames/$s/f_*.png $OUT/$s.png 2>/dev/null; rm -rf ../frames/$s
done
