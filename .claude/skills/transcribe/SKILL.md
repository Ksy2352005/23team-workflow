---
name: transcribe
description: Transcribe videos or audio (reels, voiceovers, interviews, competitor videos) into text, subtitles and word timings with Whisper large-v3-turbo. Use whenever the user uploads a video or audio file and asks what is said in it, for its script, transcript, subtitles or captions, or says "transcribe".
---
# Transcribe

1. Run, with the library's Python (it has faster-whisper):
   `/root/lemo-opuscar/.venv/bin/python tools/transcribe.py <file(s) or folder> --lang <hu|en|ar|auto> --out transcripts`
   - Use the language the user names; otherwise `auto`. Several files or a folder work in one call.
   - First run downloads the model (~1.6 GB) once; then about half a minute per minute of speech on CPU.
2. Outputs per file in `transcripts/`: `<name>.txt` (one sentence per line), `<name>.srt` (subtitles), `<name>-words.json` (word timings, the format `align.py` reads for captions).
3. Read the `.txt` back and fix obvious mishearings (split or joined words, brand names) before handing it over; say what was corrected. If the user supplied a script, compare against it and list differences.
4. Give the user the text in the reply. For several files or when asked, also send a PDF (one transcript per page, file name as title), built the same way as `scripts-pdf/`.
5. Commit and push new files the user wants kept (transcripts/ is meant to be kept; don't commit large media).
