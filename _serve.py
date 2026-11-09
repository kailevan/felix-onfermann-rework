"""Felix Onfermann rework, its own server. Run:  python3 felix/_serve.py   → http://localhost:8030
Static only; no-store so the phone never shows a stale version."""
import http.server, os

PORT = 8030


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    http.server.ThreadingHTTPServer(('', PORT), Handler).serve_forever()
