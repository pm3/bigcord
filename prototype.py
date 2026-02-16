import argparse
from functools import partial
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent / "prototype"
DEFAULT_PORT = 3000


class NoCacheHandler(SimpleHTTPRequestHandler):
    """SimpleHTTPRequestHandler with no-cache headers."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def main() -> None:
    httpd = HTTPServer(("0.0.0.0", DEFAULT_PORT), NoCacheHandler)
    print(f"Serving at http://localhost:{DEFAULT_PORT}")
    print(f"Serving from: {BASE_DIR}")
    print("To exit: Ctrl+C")
    httpd.serve_forever()


if __name__ == "__main__":
    main()
