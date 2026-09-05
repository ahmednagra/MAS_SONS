# app/Utils/dictionaries/features.py

"""
Seed features — the master equipment/options checklist (databaseschema.md §2), extracted
from the real per-listing options lists in the two seed sources whose Options column is a
genuine feature list rather than a duplicate spec dump (CarGurus New Cars, CarGurus Used Cars
Details). Bundled trim/marketing package names (e.g. 'Premium Package') are excluded, since
those are not discrete equipment items.
"""

DEFAULT_FEATURES = [{'name': 'Adaptive Cruise Control', 'category': 'safety', 'applies_to': 'vehicle'},
 {'name': 'Adaptive Suspension', 'category': 'mechanical', 'applies_to': 'vehicle'},
 {'name': 'Alloy Wheels', 'category': 'exterior', 'applies_to': 'vehicle'},
 {'name': 'Android Auto', 'category': 'comfort', 'applies_to': 'vehicle'},
 {'name': 'Backup Camera', 'category': 'safety', 'applies_to': 'vehicle'},
 {'name': 'Blind Spot Monitoring', 'category': 'safety', 'applies_to': 'vehicle'},
 {'name': 'Bluetooth', 'category': 'comfort', 'applies_to': 'vehicle'},
 {'name': 'CarPlay', 'category': 'comfort', 'applies_to': 'vehicle'},
 {'name': 'DVD Entertainment System', 'category': 'comfort', 'applies_to': 'vehicle'},
 {'name': 'Heated Seats', 'category': 'comfort', 'applies_to': 'vehicle'},
 {'name': 'Leather Seats', 'category': 'comfort', 'applies_to': 'vehicle'},
 {'name': 'Multi Zone Climate Control', 'category': 'comfort', 'applies_to': 'vehicle'},
 {'name': 'Navigation System', 'category': 'comfort', 'applies_to': 'vehicle'},
 {'name': 'Parking Sensors', 'category': 'safety', 'applies_to': 'vehicle'},
 {'name': 'Premium Wheels', 'category': 'exterior', 'applies_to': 'vehicle'},
 {'name': 'Remote Start', 'category': 'comfort', 'applies_to': 'vehicle'},
 {'name': 'Sunroof/Moonroof', 'category': 'comfort', 'applies_to': 'vehicle'},
 {'name': 'Third Row Seating', 'category': 'comfort', 'applies_to': 'vehicle'}]
