"""Static file server for the LSP Academy single-file app."""
import functools
import http.server
import os
import socketserver

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(os.environ.get("PORT", "4173"))


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        # No index.html in this folder — send "/" straight to the app
        # instead of falling back to a directory listing.
        if self.path == "/":
            self.path = "/lsp-unified-app.html"
        super().do_GET()

    def log_message(self, fmt, *args):
        print("%s - %s" % (self.address_string(), fmt % args), flush=True)


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", PORT), functools.partial(Handler, directory=ROOT)) as httpd:
    print("Serving %s at http://127.0.0.1:%d/" % (ROOT, PORT), flush=True)
    httpd.serve_forever()
