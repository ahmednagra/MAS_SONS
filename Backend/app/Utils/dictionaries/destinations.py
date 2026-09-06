# app/Utils/dictionaries/destinations.py

"""
Seed destinations (databaseschema.md §9) — the shipping lanes the storefront's
destination band, port tiles and request forms offer. Country code, name and
primary port are reference facts. `estimated_transit_days` is an indicative
Yokohama/Nagoya sailing-time band midpoint, NOT a carrier-quoted figure — every
quote states the real schedule. `import_regulations_summary` is left NULL on
purpose: this project's convention is an empty field over an invented one.
"""

DEFAULT_DESTINATIONS = [
    {"country_code": "KE", "country_name": "Kenya", "primary_port": "Mombasa", "origin_port": "Yokohama", "estimated_transit_days": 28, "shipping_mode": "both"},
    {"country_code": "TZ", "country_name": "Tanzania", "primary_port": "Dar es Salaam", "origin_port": "Yokohama", "estimated_transit_days": 30, "shipping_mode": "both"},
    {"country_code": "ZA", "country_name": "South Africa", "primary_port": "Durban", "origin_port": "Nagoya", "estimated_transit_days": 32, "shipping_mode": "both"},
    {"country_code": "MZ", "country_name": "Mozambique", "primary_port": "Maputo", "origin_port": "Nagoya", "estimated_transit_days": 34, "shipping_mode": "roro"},
    {"country_code": "PK", "country_name": "Pakistan", "primary_port": "Karachi", "origin_port": "Yokohama", "estimated_transit_days": 22, "shipping_mode": "both"},
    {"country_code": "AE", "country_name": "United Arab Emirates", "primary_port": "Jebel Ali", "origin_port": "Yokohama", "estimated_transit_days": 21, "shipping_mode": "both"},
    {"country_code": "LK", "country_name": "Sri Lanka", "primary_port": "Colombo", "origin_port": "Nagoya", "estimated_transit_days": 18, "shipping_mode": "both"},
    {"country_code": "BD", "country_name": "Bangladesh", "primary_port": "Chittagong", "origin_port": "Yokohama", "estimated_transit_days": 24, "shipping_mode": "container"},
]
