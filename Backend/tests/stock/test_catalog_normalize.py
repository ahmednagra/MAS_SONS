# tests/stock/test_catalog_normalize.py
from app.Utils.catalog_normalize import normalize_body_type, normalize_make, normalize_unit_fields


def test_make_casing_and_brand_styles():
    assert normalize_make("CHEVROLET") == "Chevrolet"
    assert normalize_make("chevrolet") == "Chevrolet"
    assert normalize_make("MAZDA") == "Mazda"
    assert normalize_make("INFINITI") == "Infiniti"
    assert normalize_make("gmc") == "GMC"
    assert normalize_make("bmw") == "BMW"
    assert normalize_make("  land   rover ") == "Land Rover"
    assert normalize_make("Acura") == "Acura"


def test_body_type_casing_and_truncated_labels():
    assert normalize_body_type("Suv") == "SUV"
    assert normalize_body_type("SUV / Crossover") == "SUV"
    assert normalize_body_type("Vans") == "Van"
    assert normalize_body_type("Convert") == "Convertible"
    assert normalize_body_type("Hatch") == "Hatchback"
    assert normalize_body_type("pickup truck") == "Pickup Truck"
    assert normalize_body_type("Sedan") == "Sedan"


def test_normalize_is_idempotent_and_leaves_other_fields():
    row = {"make": "CHEVROLET", "body_type": "Suv", "model": "Silverado 3500HD CC"}
    once = normalize_unit_fields(row)
    assert once == {"make": "Chevrolet", "body_type": "SUV", "model": "Silverado 3500HD CC"}
    assert normalize_unit_fields(once) == once
    assert row["make"] == "CHEVROLET"  # input not mutated
