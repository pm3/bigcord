#!/usr/bin/env python3
"""
Generate static site from Jinja2 templates and JSON page data.
- Each page = template + JSON context.
- index page uses "components": [{ "component_name", "params" }]; main zone iterates and includes each component.
- Values "_load:path/to/file.json" are replaced by loading that JSON file.
"""
from pathlib import Path
import json
import shutil

from jinja2 import Environment, FileSystemLoader, select_autoescape

PROJECT_ROOT = Path(__file__).resolve().parent
TEMPLATES_DIR = PROJECT_ROOT / "templates"
DATA_DIR = PROJECT_ROOT / "data"
OUTPUT_DIR = PROJECT_ROOT / "output"
PROTOTYPE_DIR = PROJECT_ROOT / "prototype"


def load_json(path: Path) -> dict | list:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def resolve_loads(obj, base_dir: Path):
    """Replace any '_load:relpath' string values with loaded JSON. In-place for dicts."""
    if isinstance(obj, dict):
        for key in list(obj.keys()):
            val = obj[key]
            if isinstance(val, str) and val.startswith("_load:"):
                rel = val.split(":", 1)[1].strip()
                full = (base_dir / rel).resolve()
                obj[key] = load_json(full)
            else:
                resolve_loads(val, base_dir)
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            if isinstance(item, str) and item.startswith("_load:"):
                rel = item.split(":", 1)[1].strip()
                full = (base_dir / rel).resolve()
                obj[i] = load_json(full)
            else:
                resolve_loads(item, base_dir)
    return obj


def build_context(page_data: dict, base_dir: Path) -> dict:
    """Resolve _load: refs and return flat context for Jinja2."""
    resolve_loads(page_data, base_dir)
    return page_data


def main():
    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=select_autoescape(("html", "htm", "xml")),
    )
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Copy static assets from prototype
    for name in ("css", "js", "img"):
        src = PROTOTYPE_DIR / name
        if src.is_dir():
            dst = OUTPUT_DIR / name
            if dst.exists():
                shutil.rmtree(dst)
            shutil.copytree(src, dst)
    # Single files in prototype root (if any)
    for f in PROTOTYPE_DIR.iterdir():
        if f.is_file() and f.suffix in (".html", ".xml"):
            continue
        if f.is_file():
            shutil.copy2(f, OUTPUT_DIR / f.name)

    # Default static prefix for links (e.g. "" or ".")
    static_prefix = ""

    # Discover page JSONs: data/examples/pages/*.json
    pages_dir = DATA_DIR / "examples" / "pages"
    if not pages_dir.is_dir():
        print("No data/examples/pages/ found. Create at least index.json.")
        return

    for page_file in sorted(pages_dir.glob("*.json")):
        name = page_file.stem
        try:
            page_data = load_json(page_file)
        except Exception as e:
            print(f"Skip {page_file}: {e}")
            continue

        template_name = page_data.get("template")
        if not template_name:
            print(f"Skip {page_file}: missing 'template'")
            continue

        context = build_context(page_data.copy(), PROJECT_ROOT)
        context["static_prefix"] = static_prefix

        try:
            template = env.get_template(template_name)
            html = template.render(**context)
        except Exception as e:
            print(f"Render error {page_file} -> {template_name}: {e}")
            raise

        # Output filename: index.json -> index.html, cart.json -> cart.html
        out_path = OUTPUT_DIR / f"{name}.html"
        out_path.write_text(html, encoding="utf-8")
        print(f"Generated {out_path}")

    print("Done. Open output/index.html in a browser.")


if __name__ == "__main__":
    main()
