#!/bin/sh
# One small preview frame from the middle of every shot, then a contact sheet: sh preview.sh
cd "$(dirname "$0")"
OUT=../frames/preview; rm -rf $OUT; mkdir -p $OUT
for s in $(LIST=1 /root/blender-venv/bin/python film.py 2>/dev/null | awk '{print $1}'); do
  n=$(LIST=1 /root/blender-venv/bin/python film.py 2>/dev/null | awk -v s=$s '$1==s{print int($3/2)}')
  W=270 H=480 SPP=4 SHOT=$s FRAMES=$n /root/blender-venv/bin/python film.py 2>&1 | grep -E "Traceback|Error:|line [0-9]+|^[A-Za-z]*Error" | sed "s/^/$s: /"
  cp ../frames/$s/f_*.png $OUT/$s.png 2>/dev/null; rm -rf ../frames/$s
done
echo PREVIEW DONE
