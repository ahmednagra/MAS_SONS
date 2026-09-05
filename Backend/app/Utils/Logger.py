# app/Utils/Logger.py

# Structured logging setup — mirrors echooo-backend's app/Utils/Logger.py: console +
# rotating file handler, UTF-8-safe on Windows console output.
import io
import logging
import os
import sys
import time
from logging.handlers import RotatingFileHandler

os.makedirs("logs", exist_ok=True)

logger = logging.getLogger("mas_sons_api")
logger.setLevel(logging.INFO)
logger.propagate = False

log_format = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")

if sys.platform == "win32" and hasattr(sys.stdout, "buffer"):
    console_stream = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
else:
    console_stream = sys.stdout

console_handler = logging.StreamHandler(console_stream)
console_handler.setFormatter(log_format)
logger.addHandler(console_handler)

file_handler = RotatingFileHandler(
    f"logs/app_{time.strftime('%Y-%m-%d')}.log",
    maxBytes=10 * 1024 * 1024,
    backupCount=10,
    encoding="utf-8",
)
file_handler.setFormatter(log_format)
logger.addHandler(file_handler)
