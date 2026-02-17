# Jinja2 templates – statický web

Stránky sa skladajú z **page template** + **JSON s dátami**. Build skript vykreslí HTML do `output/`.

## Štruktúra

- **`base.html`** – layout (head, header, main, footer). Očakáva premenné `title`, `header_data`, `footer_data`.
- **`components/`** – komponenty. Každý dostáva jeden slovník **`data`** a z neho renderuje HTML.
- **`pages/`** – šablóny stránok. Každá rozširuje `base.html` a do `main` vkladá jeden alebo viac komponentov.

## Špeciálna stránka: index

**`pages/page_index.html`** nemá pevné komponenty. Dostáva zoznam:

```json
"components": [
  { "component_name": "banner", "params": { ... } },
  { "component_name": "categories", "params": { ... } }
]
```

V bloku `main` sa pre každý prvok zoznamu zavolá `include` príslušného komponentu s `data=params`. Názov súboru komponentu je `components/<component_name>.html`.

## Ostatné stránky

Každá má fixnú štruktúru: napr. `page_tutorials.html` v main vkladá `page_hero`, `tutorials_filter`, `tutorials_list`. Dáta pre ne prichádzajú v JSON stránky pod kľúčmi `page_hero_data`, `tutorials_filter_data`, `tutorials_list_data`.

## Komponenty a vstupné dáta

| Komponent | Súbor | Príklad dát |
|-----------|--------|-------------|
| header | `components/header.html` | `data/global/header_data.json` |
| footer | `components/footer.html` | `data/global/footer_data.json` |
| banner | `components/banner.html` | `data/examples/components/banner.json` |
| categories | `components/categories.html` | `data/examples/components/categories.json` |
| event | `components/event.html` | `data/examples/components/event.json` |
| instagram | `components/instagram.html` | `data/examples/components/instagram.json` |
| page_hero | `components/page_hero.html` | `data/examples/components/page_hero.json` |
| tutorials_filter | `components/tutorials_filter.html` | `data/examples/components/tutorials_filter.json` |
| tutorials_list | `components/tutorials_list.html` | `data/examples/components/tutorials_list.json` |
| breadcrumb | `components/breadcrumb.html` | `data/examples/components/breadcrumb.json` |
| product_detail | `components/product_detail.html` | `data/examples/components/product_detail.json` |
| cat_header | `components/cat_header.html` | `data/examples/components/cat_header.json` |
| product_grid | `components/product_grid.html` | `data/examples/components/product_grid.json` |
| checkout | `components/checkout.html` | `data/examples/components/checkout.json` |
| cart_page | `components/cart_page.html` | `data/examples/components/cart_page.json` |
| tutorial_detail | `components/tutorial_detail.html` | `data/examples/components/tutorial_detail.json` |

V každom súbore v `data/examples/components/` je príklad vstupných dát pre daný komponent.

## Build

S uv (odporúčané):

```bash
uv sync
uv run build.py
```

Alebo s pip:

```bash
pip install -r requirements.txt
python build.py
```

- Načíta všetky `data/examples/pages/*.json`.
- V každom JSON rekurzívne nahradí hodnoty typu `"_load:relpath/to/file.json"` obsahom daného súboru.
- Pre každú stránku vykreslí príslušnú page šablónu a uloží výsledok ako `output/<názov_stránky>.html`.
- Skopíruje `prototype/css`, `prototype/js`, `prototype/img` do `output/`.
