"""Faux serveur LM Studio : imite l'API OpenAI-compatible, diffusion comprise.

Sert a verifier que la page « IA privée » parle le bon langage.
"""

import json
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

MODEL = "qwen2.5-7b-instruct"
REQUIS = []          # journal des requetes recues


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path.rstrip("/").endswith("/models"):
            REQUIS.append({"methode": "GET", "chemin": self.path,
                           "auth": self.headers.get("Authorization")})
            corps = json.dumps({"object": "list", "data": [
                {"id": MODEL, "object": "model"},
                {"id": "autre-modele", "object": "model"},
            ]}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._cors()
            self.send_header("Content-Length", str(len(corps)))
            self.end_headers()
            self.wfile.write(corps)
            return
        self.send_response(404)
        self._cors()
        self.end_headers()

    def do_POST(self):
        n = int(self.headers.get("Content-Length") or 0)
        brut = self.rfile.read(n)
        try:
            data = json.loads(brut or b"{}")
        except Exception:
            data = {}
        REQUIS.append({"methode": "POST", "chemin": self.path,
                       "auth": self.headers.get("Authorization"),
                       "corps": data})

        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self._cors()
        self.end_headers()

        if not data.get("stream"):
            # reponse en une seule fois
            reponse = {"choices": [{"message": {"role": "assistant",
                                                 "content": "reponse complete"}}]}
            self.wfile.write(("data: " + json.dumps(reponse) + "\n\n").encode())
            self.wfile.write(b"data: [DONE]\n\n")
            self.wfile.flush()
            return

        # diffusion, en morceaux, comme un vrai serveur
        for morceau in ["Bonjour", " depuis", " votre", " ASUS", "."]:
            bloc = {"choices": [{"delta": {"content": morceau}}]}
            self.wfile.write(("data: " + json.dumps(bloc) + "\n\n").encode())
            self.wfile.flush()
            time.sleep(0.01)
        self.wfile.write(b"data: [DONE]\n\n")
        self.wfile.flush()


def demarrer(port=1234):
    srv = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    t = threading.Thread(target=srv.serve_forever, daemon=True)
    t.start()
    return srv


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 1234
    demarrer(port)
    print("faux LM Studio sur http://127.0.0.1:%d" % port)
    while True:
        time.sleep(1)
