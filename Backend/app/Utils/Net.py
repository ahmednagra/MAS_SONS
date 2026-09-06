# app/Utils/Net.py
# safe_ip() — one implementation shared by every INET column writer (AuthService, Audit, WebSocketController) instead of three near-identical guards…
import ipaddress
from typing import Optional


def safe_ip(value: Optional[str]) -> Optional[str]:
    """Every INET column rejects anything that isn't a real address outright, and request.client.host is untrusted (it's "testclient" under TestClient, and…"""
    if not value:
        return None
    try:
        ipaddress.ip_address(value)
        return value
    except ValueError:
        return None
