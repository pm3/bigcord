#!/usr/bin/env python3
"""
Prejde photo_raw rekurzívne (aj podadresáre), každú fotku zmenší a uloží
do prototype/img so zachovaním rovnakej adresárovej štruktúry. Výstup je vždy WebP.
Existujúce .webp preskočí. Žiadne parametre: vždy photo_raw -> prototype/img.

Ak v adresári s obrázkami existuje size.txt: každý riadok vo formáte {width}x{height}
definuje jeden výstup. Prvý riadok -> {name}.webp, ďalšie -> {name}-{width}x{height}.webp.
"""
import re
import sys
from pathlib import Path

from PIL import Image
from PIL import ImageOps

SCRIPT_DIR = Path(__file__).resolve().parent
PHOTO_RAW_DIR = SCRIPT_DIR / "photo_raw"
PROTOTYPE_IMG_DIR = SCRIPT_DIR / "prototype" / "img"
MAX_LONGEST_SIDE = 1920
WEBP_QUALITY = 85
OUTPUT_EXT = ".webp"  # výstup vždy WebP
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".heic"}
SIZE_TXT = "size.txt"
SIZE_LINE_RE = re.compile(r"^\s*(\d+)\s*[x×]\s*(\d+)\s*$", re.IGNORECASE)


def parse_size_txt(dir_path: Path) -> list[tuple[int, int]] | None:
    """Ak v dir_path existuje size.txt, vráti zoznam (width, height) z platných riadkov. Inak None."""
    size_file = dir_path / SIZE_TXT
    if not size_file.is_file():
        return None
    sizes = []
    try:
        for line in size_file.read_text(encoding="utf-8").splitlines():
            m = SIZE_LINE_RE.match(line.strip())
            if m:
                sizes.append((int(m.group(1)), int(m.group(2))))
    except OSError:
        return None
    return sizes if sizes else None


def main() -> None:
    if not PHOTO_RAW_DIR.exists():
        print(f"Adresár neexistuje: {PHOTO_RAW_DIR}", file=sys.stderr)
        sys.exit(1)

    PROTOTYPE_IMG_DIR.mkdir(parents=True, exist_ok=True)

    files = [
        f for f in PHOTO_RAW_DIR.rglob("*")
        if f.is_file() and f.suffix.lower() in EXTS
    ]
    files.sort(key=lambda p: (str(p.relative_to(PHOTO_RAW_DIR)).lower(), p.name))

    if not files:
        print(f"Žiadne obrázky v {PHOTO_RAW_DIR}", file=sys.stderr)
        return

    ok = 0
    skip = 0
    err = 0

    for src in files:
        rel = src.relative_to(PHOTO_RAW_DIR)
        out_dir = PROTOTYPE_IMG_DIR / rel.parent
        stem = rel.stem
        sizes = parse_size_txt(src.parent)

        if sizes:
            # Viac výstupov podľa size.txt: prvý -> {name}.webp, ďalšie -> {name}-{w}x{h}.webp
            outputs = []
            for i, (sw, sh) in enumerate(sizes):
                if i == 0:
                    out_name = stem + OUTPUT_EXT
                else:
                    out_name = f"{stem}-{sw}x{sh}{OUTPUT_EXT}"
                outputs.append((out_name, (sw, sh)))
        else:
            # Bez size.txt: jeden výstup, max 1920 na dlhšej strane
            outputs = [(stem + OUTPUT_EXT, None)]

        try:
            img = Image.open(src)
            img = ImageOps.exif_transpose(img)
            if img.mode not in ("RGB", "L"):
                img = img.convert("RGB")
        except Exception as e:
            print(f"  [CHYBA] {rel}: {e}", file=sys.stderr)
            err += 1
            continue

        for out_name, size in outputs:
            out_path = out_dir / out_name
            if out_path.exists():
                print(f"{out_path.relative_to(PROTOTYPE_IMG_DIR)}: už existuje, preskakujem")
                skip += 1
                continue
            try:
                out_path.parent.mkdir(parents=True, exist_ok=True)
                if size is not None:
                    resized = ImageOps.fit(img, size, Image.Resampling.LANCZOS)
                else:
                    w, h = img.size
                    if w > MAX_LONGEST_SIDE or h > MAX_LONGEST_SIDE:
                        if w >= h:
                            new_w = MAX_LONGEST_SIDE
                            new_h = int(h * MAX_LONGEST_SIDE / w)
                        else:
                            new_h = MAX_LONGEST_SIDE
                            new_w = int(w * MAX_LONGEST_SIDE / h)
                        resized = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                    else:
                        resized = img
                resized.save(out_path, "WEBP", quality=WEBP_QUALITY, method=6)
                print(f"{rel} -> {out_path.relative_to(PROTOTYPE_IMG_DIR)}")
                ok += 1
            except Exception as e:
                print(f"  [CHYBA] {out_name}: {e}", file=sys.stderr)
                err += 1

    print(f"\nHotovo: {ok} OK, {skip} preskočených, {err} chýb.")


if __name__ == "__main__":
    main()
