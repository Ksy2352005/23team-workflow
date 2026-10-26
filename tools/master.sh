#!/bin/sh
# The highest-quality final export of a film, for upload.
#   sh tools/master.sh <film folder> <name>      e.g.  sh tools/master.sh restaurant-nobody-entered restaurant-nobody-entered
# It renders the picture losslessly (PNG frames, no JPEG step), takes the film's own mix (out/mix.wav, made by its build.sh), normalises
# the loudness to -14 LUFS in two passes, and encodes once: H.264 High, CRF 12, preset veryslow, tuned for animation, BT.709 colour
# (tagged, so phones show the right colours), the film's light grain, AAC 320 kb/s. 1080 x 1920 at 24 fps: Instagram's maximum for Reels.
set -e
LIB=${LIB:-/root/lemo-opuscar}; export LIB
ROOT=$(cd "$(dirname "$0")/.." && pwd); F="$ROOT/$1"; NAME=${2:-$1}
[ -f "$F/out/mix.wav" ] || { echo "run the film's build.sh first (it writes out/mix.wav)"; exit 1; }
node "$ROOT/tools/master-frames.mjs" "$F" --size 1080x1920 --fps 24 --workers 4 --out "$F/out/master_lossless.mkv"
J=$(ffmpeg -hide_banner -nostats -i "$F/out/mix.wav" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
g() { echo "$J" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
LN="loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true"
ffmpeg -y -loglevel error -i "$F/out/master_lossless.mkv" -i "$F/out/mix.wav" \
  -filter_complex "[0:v]fps=24,noise=c0s=1:allf=t,scale=in_range=pc:out_range=tv:out_color_matrix=bt709:flags=lanczos+accurate_rnd+full_chroma_int,format=yuv420p,setparams=range=tv:colorspace=bt709:color_primaries=bt709:color_trc=bt709[v];[1:a]$LN,aresample=48000[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset veryslow -crf 12 -tune animation -profile:v high -level 4.2 -r 24 \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest "$F/$NAME-MASTER.mp4"
rm -f "$F/out/master_lossless.mkv"
ffmpeg -hide_banner -nostats -i "$F/$NAME-MASTER.mp4" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:)" | tail -2
echo "$F/$NAME-MASTER.mp4"
