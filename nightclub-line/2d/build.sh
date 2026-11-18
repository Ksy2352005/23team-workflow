#!/bin/sh
# Renders the 2.5D film: sh build.sh hu (the final, drawn at 4K and scaled down) | sh build.sh fa (Persian captions, for checking, 1080p)
# Needs the plates (../3d/plate.py ALL) and the sound mix ../out/mix.wav (../mix.py).
set -e; cd "$(dirname "$0")"; L=${1:-hu}; mkdir -p out
SIZE=1080x1920; [ "$L" = hu ] && SIZE=${SIZE_HU:-2160x3840}
LIB=/root/lemo-opuscar node ../../tools/master-frames.mjs . --size $SIZE --fps 24 --workers 4 --q "lang=$L" --out out/$L.mkv
OUT=../nightclub-line-2d-$L.mp4; [ "$L" = hu ] && OUT=../nightclub-line-MASTER-HQ.mp4
ffmpeg -y -loglevel error -i out/$L.mkv -i ../out/mix.wav -filter_complex "[0:v]scale=1080:1920:flags=lanczos+accurate_rnd+full_chroma_int,format=yuv420p[v];[1:a]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf ${CRF:-10} -tune animation -c:a aac -b:a 320k -movflags +faststart -shortest $OUT
rm -f out/$L.mkv; ls -la $OUT
