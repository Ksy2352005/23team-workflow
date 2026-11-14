#!/bin/sh
# One command to rebuild the reel.  sh build.sh            → final 1080×1920
#                                    sh build.sh preview    → quick 540×960 preview
set -e
LIB=${LIB:-/root/lemo-opuscar}
HERE=$(cd "$(dirname "$0")" && pwd)
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the Lemo-Opuscar library folder"; exit 1; }
if [ "$1" = "preview" ]; then SIZE=540x960; NAME=restaurant-nobody-entered-preview; else SIZE=1080x1920; NAME=restaurant-nobody-entered; fi
cd "$LIB"
node core/render/events.mjs "$HERE"
node core/render/video.mjs "$HERE" --size $SIZE --fps 24 --workers 4 --out "$HERE/out/video_$SIZE.mp4"
"$LIB/.venv/bin/python" "$HERE/mix.py"
sh core/render/mux.sh "$HERE/out/video_$SIZE.mp4" "$HERE/out/mix.wav" "$HERE/$NAME.mp4" 24 1
