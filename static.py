#!/usr/bin/env python3
"""Serve static files from output/ on http://localhost:3000"""
import http.server
import socketserver

PORT = 3000
OUTPUT_DIR = "output"


def main():
    import os
    from pathlib import Path

    root = Path(__file__).resolve().parent / OUTPUT_DIR
    if not root.is_dir():
        print(f"Error: {root} not found. Run build.py first.")
        return

    os.chdir(root)

    Handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving {root} at http://localhost:{PORT}/")
        print("Press Ctrl+C to stop.")
        httpd.serve_forever()


if __name__ == "__main__":
    main()
