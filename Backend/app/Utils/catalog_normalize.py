# app/Utils/catalog_normalize.py

"""Canonical spelling for the two catalog columns buyers filter and group by."""

# Makes whose brand styling is not plain title case.
_MAKE_STYLE = {
    "bmw": "BMW",
    "gmc": "GMC",
    "ram": "RAM",
    "mg": "MG",
    "kia": "Kia",
    "infiniti": "Infiniti",
    "mazda": "Mazda",
    "mercedes-benz": "Mercedes-Benz",
    "rolls-royce": "Rolls-Royce",
    "mclaren": "McLaren",
    "alfa romeo": "Alfa Romeo",
    "land rover": "Land Rover",
    "aston martin": "Aston Martin",
}

# Body types: canonical label keyed by every spelling seen in source data.
_BODY_TYPE = {
    "suv": "SUV",
    "suv / crossover": "SUV",
    "crossover": "SUV",
    "sedan": "Sedan",
    "coupe": "Coupe",
    "convertible": "Convertible",
    "convert": "Convertible",
    "hatchback": "Hatchback",
    "hatch": "Hatchback",
    "wagon": "Wagon",
    "van": "Van",
    "vans": "Van",
    "minivan": "Minivan",
    "pickup truck": "Pickup Truck",
    "pickup": "Pickup Truck",
    "truck": "Pickup Truck",
}


def _title(s: str) -> str:
    return " ".join(w[:1].upper() + w[1:].lower() for w in s.split())


def normalize_make(value: str) -> str:
    key = " ".join(value.strip().split()).lower()
    return _MAKE_STYLE.get(key, _title(key))


def normalize_body_type(value: str) -> str:
    key = " ".join(value.strip().split()).lower()
    return _BODY_TYPE.get(key, _title(key))


def normalize_unit_fields(data: dict) -> dict:
    """Return a copy of a unit row dict with make/body_type canonicalised."""
    out = dict(data)
    if out.get("make"):
        out["make"] = normalize_make(out["make"])
    if out.get("body_type"):
        out["body_type"] = normalize_body_type(out["body_type"])
    return out
