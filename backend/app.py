"""Standard-library HTTP API adapter for the C ProcessManager implementation."""
from __future__ import annotations
import ctypes
import os
import subprocess
import threading
from pathlib import Path
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import unquote
import json
import mimetypes

ROOT = Path(__file__).resolve().parent.parent
BACKEND = Path(__file__).resolve().parent
LIBRARY = BACKEND / ("process_manager.dll" if os.name == "nt" else "libprocess_manager.so")

class PCB(ctypes.Structure):
    _fields_ = [
        ("pid", ctypes.c_int), ("name", ctypes.c_char * 50),
        ("state", ctypes.c_int), ("priority", ctypes.c_int),
        ("arrival_time", ctypes.c_int), ("burst_time", ctypes.c_int),
        ("remaining_time", ctypes.c_int), ("cpu_time", ctypes.c_int),
    ]

class ProcessManager(ctypes.Structure):
    _fields_ = [("processes", PCB * 100), ("process_count", ctypes.c_int), ("next_pid", ctypes.c_int)]

STATES = ["NEW", "READY", "RUNNING", "SUSPENDED", "TERMINATED"]
manager = ProcessManager()
lock = threading.RLock()


def load_library():
    if not LIBRARY.exists():
        compiler = os.environ.get("CC", "gcc")
        cmd = [compiler, "-shared", "-fPIC", "-Wall", "-Wextra", "-o", str(LIBRARY),
               str(BACKEND / "pcb.c"), str(BACKEND / "process_manager.c")]
        try:
            subprocess.run(cmd, check=True, capture_output=True, text=True)
        except (subprocess.CalledProcessError, FileNotFoundError) as exc:
            detail = getattr(exc, "stderr", "") or str(exc)
            raise RuntimeError(f"Could not compile the C backend. Install GCC. {detail}") from exc
    lib = ctypes.CDLL(str(LIBRARY))
    lib.initialize_process_manager.argtypes = [ctypes.POINTER(ProcessManager)]
    lib.create_process.argtypes = [ctypes.POINTER(ProcessManager), ctypes.c_char_p, ctypes.c_int, ctypes.c_int, ctypes.c_int]
    lib.create_process.restype = ctypes.c_int
    for name in ("execute_process", "suspend_process", "resume_process", "terminate_process"):
        fn = getattr(lib, name)
        fn.argtypes = [ctypes.POINTER(ProcessManager), ctypes.c_int]
        fn.restype = ctypes.c_int
    return lib

lib = load_library()
lib.initialize_process_manager(ctypes.byref(manager))


def as_dict(p):
    return {"pid": p.pid, "name": p.name.decode("utf-8", "replace"),
            "state": STATES[p.state] if 0 <= p.state < len(STATES) else "UNKNOWN",
            "priority": p.priority, "arrivalTime": p.arrival_time,
            "burstTime": p.burst_time, "remainingTime": p.remaining_time,
            "cpuTime": p.cpu_time}


def get_process(pid):
    for i in range(manager.process_count):
        if manager.processes[i].pid == pid:
            return manager.processes[i]
    return None


def json_response(handler, status, payload):
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Cache-Control", "no-store")
    handler.end_headers()
    handler.wfile.write(body)


class RequestHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print("[%s] %s" % (self.log_date_time_string(), fmt % args))

    def do_GET(self):
        path = unquote(self.path.split("?", 1)[0])
        if path == "/api/health":
            json_response(self, 200, {"status": "ok", "backend": "C ProcessManager", "count": manager.process_count})
            return
        if path == "/api/processes":
            with lock:
                json_response(self, 200, {"processes": [as_dict(manager.processes[i]) for i in range(manager.process_count)]})
            return
        if path == "/":
            file_path = ROOT / "frontend" / "index.html"
        elif path.startswith("/css/"):
            file_path = ROOT / "frontend" / "css" / path.removeprefix("/css/")
        elif path.startswith("/js/"):
            file_path = ROOT / "frontend" / "js" / path.removeprefix("/js/")
        else:
            json_response(self, 404, {"error": "Not found."})
            return
        try:
            file_path.resolve().relative_to((ROOT / "frontend").resolve())
            content = file_path.read_bytes()
        except (ValueError, OSError):
            json_response(self, 404, {"error": "File not found."})
            return
        mime = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
        if mime.startswith("text/") or mime in ("application/javascript",):
            mime += "; charset=utf-8"
        self.send_response(200)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def do_POST(self):
        path = unquote(self.path.split("?", 1)[0])
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length > 1024 * 1024:
                json_response(self, 413, {"error": "Request body is too large."})
                return
            data = json.loads(self.rfile.read(length) or b"{}")
            if not isinstance(data, dict):
                raise ValueError
        except (ValueError, json.JSONDecodeError):
            json_response(self, 400, {"error": "Request body must be a JSON object."})
            return
        if path == "/api/processes":
            self.create_process(data)
            return
        parts = path.strip("/").split("/")
        if len(parts) == 4 and parts[0:2] == ["api", "processes"]:
            try:
                pid = int(parts[2])
            except ValueError:
                json_response(self, 400, {"error": "PID must be an integer."})
                return
            self.process_action(pid, parts[3])
            return
        json_response(self, 404, {"error": "Not found."})

    def create_process(self, data):
        name = str(data.get("name", "")).strip()
        if not name:
            json_response(self, 400, {"error": "Process name is required."})
            return
        if len(name.encode("utf-8")) >= 50:
            json_response(self, 400, {"error": "Process name must be shorter than 50 UTF-8 bytes."})
            return
        try:
            priority = int(data.get("priority", 5))
            arrival = int(data.get("arrivalTime", data.get("arrival_time", 0)))
            burst = int(data.get("burstTime", data.get("burst_time", 10)))
        except (TypeError, ValueError):
            json_response(self, 400, {"error": "Priority, arrival time and burst time must be integers."})
            return
        if not 1 <= priority <= 10 or arrival < 0 or burst < 1:
            json_response(self, 400, {"error": "Priority must be 1–10, arrival time must be 0 or greater, and burst time must be at least 1."})
            return
        with lock:
            pid = lib.create_process(ctypes.byref(manager), name.encode("utf-8"), priority, arrival, burst)
            if pid < 0:
                json_response(self, 409, {"error": "The process table is full (maximum 100 processes)."})
                return
            json_response(self, 201, {"message": "Process created in READY state.", "process": as_dict(get_process(pid))})

    def process_action(self, pid, action):
        actions = {"execute": lib.execute_process, "suspend": lib.suspend_process,
                   "resume": lib.resume_process, "terminate": lib.terminate_process}
        if action not in actions:
            json_response(self, 404, {"error": "Unknown process action."})
            return
        with lock:
            p = get_process(pid)
            if p is None:
                json_response(self, 404, {"error": f"PID {pid} was not found."})
                return
            if action == "execute" and any(manager.processes[i].state == 2 for i in range(manager.process_count)):
                json_response(self, 409, {"error": "Another process is already RUNNING. Suspend or terminate it first."})
                return
            result = actions[action](ctypes.byref(manager), pid)
            if result == -1:
                json_response(self, 404, {"error": "Process not found."})
                return
            if result == -2:
                json_response(self, 409, {"error": f"Cannot {action} a process in {as_dict(p)['state']} state."})
                return
            json_response(self, 200, {"message": f"PID {pid}: {action} successful.", "process": as_dict(p)})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    server = ThreadingHTTPServer(("0.0.0.0", port), RequestHandler)
    print(f"Process Lifecycle Management: http://127.0.0.1:{port}")
    print("C backend loaded. Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        server.server_close()
