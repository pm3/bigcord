#!/usr/bin/env python3
"""
Vstup: CSV (SKU, Name, Images), výstupný adresár.
Prejde CSV, vytvorí JSON so stĺpcami sku, name, color.
Z každého riadku stiahne prvú obrázkovú URL a uloží do {output_dir}/photo_raw/products/
Použitie: python script_wp_csv.py <cesta.csv> <output_dir>
"""
import argparse
import csv
import json
import re
import sys
from pathlib import Path

import requests

USER_AGENT = "script_wp_csv (Python)"
REQUEST_TIMEOUT = 60


def first_image_url(images_field: str) -> str | None:
    """Z poľa Images (URL oddelené ', ') vráti prvú URL."""
    if not images_field or not images_field.strip():
        return None
    urls = [u.strip() for u in re.split(r",\s+", images_field.strip())]
    return urls[0] if urls else None


def color_from_name(name: str) -> str:
    """Vráti časť názvu od prvého '(' (color začína '(')."""
    if not name:
        return name
    i = name.find("(")
    if i >= 0:
        return name[i:].strip()
    return name


def download_image(url: str, out_path: Path) -> bool:
    """Stiahne odownload_imagebrázok z URL do out_path. Vráti True pri úspechu."""
    try:
        r = requests.get(url, timeout=REQUEST_TIMEOUT, headers={"User-Agent": USER_AGENT})
        r.raise_for_status()
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_bytes(r.content)
        return True
    except requests.RequestException as e:
        print(f"  [CHYBA] Stiahnutie {url[:60]}...: {e}", file=sys.stderr)
        return False


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Zo CSV vytvorí JSON (sku, name, color) a stiahne prvé obrázky do photo_raw/products/.",
    )
    parser.add_argument("csv", help="cesta k CSV súboru (stĺpce: SKU, Name, Images)")
    args = parser.parse_args()

    csv_path = Path(args.csv)
    if not csv_path.exists():
        print(f"CSV neexistuje: {csv_path}", file=sys.stderr)
        sys.exit(1)

    photo_dir =  Path(__file__).resolve().parent / "photo_raw" / "products"
    photo_dir.mkdir(parents=True, exist_ok=True)

    rows = []
    ok_img = 0
    err_img = 0

    with open(csv_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        if reader.fieldnames and "SKU" not in (reader.fieldnames or []):
            print("CSV musí mať stĺpec SKU.", file=sys.stderr)
            sys.exit(1)
        for row in reader:
            sku = (row.get("SKU") or "").strip()
            name = (row.get("Name") or "").strip()
            if not sku or not name:
                continue
            color = color_from_name(name)
            rows.append({"sku": sku, "name": name, "color": color})

            url = first_image_url(row.get("Images") or "")
            if not url:
                continue
            ext = Path(url.split("?")[0]).suffix or ".jpg"
            if ext.lower() not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
                ext = ".jpg"
            img_path = photo_dir / f"{sku}{ext}"
            if img_path.exists():
                print(f"{sku}: obrázok už existuje, preskakujem")
                ok_img += 1
                continue
            if download_image(url, img_path):
                print(f"{sku}: uložené {img_path.name}")
                ok_img += 1
            else:
                err_img += 1

    json_path = f"{csv_path.stem}.json"
    Path(json_path).write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nJSON: {len(rows)} záznamov -> {json_path}")
    print(f"Obrázky: {ok_img} OK, {err_img} chýb. Adresár: {photo_dir}")


if __name__ == "__main__":
    main()
