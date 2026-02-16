# BIG CORD – Web Shop Template

Responsive mobile-first web shop template for **bigcord.eu**.

## Structure

```
bigcord-tpl/
├── index.html              # Main page
├── css/
│   └── style.css           # All styles (mobile-first)
├── js/
│   └── main.js             # Hamburger menu, carousel, countdown
├── img/
│   ├── banners/            # Banner/carousel images (replace placeholders)
│   └── categories/         # Category icons (square SVG/PNG)
└── README.md
```

## Features

- **Mobile-first** responsive design (breakpoints: 768px, 1024px)
- Sticky header with hamburger menu (mobile) / horizontal nav (desktop)
- Rotating banner carousel with swipe support
- Product category grid (2 col mobile → 5 col desktop)
- Event panel with live countdown timer
- Instagram feed widget placeholder
- Footer with 3 blocks (stacked mobile → columns desktop)

## How to Use

1. Open `index.html` in a browser (no build step needed)
2. Replace placeholder images in `img/banners/` and `img/categories/`
3. Update banner slides in `index.html` with real images
4. Customize colors via CSS custom properties in `:root`

## External Dependencies

- **Google Fonts** – Inter
- **Font Awesome 6** – Icons (loaded via CDN)

## Customization

Edit CSS variables in `css/style.css` `:root` block:

```css
--color-primary: #6c3fa0;    /* Main brand color */
--color-accent: #e8a530;     /* Accent/highlight */
--color-footer-bg: #1e1e2f;  /* Footer background */
```
