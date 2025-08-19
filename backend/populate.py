import os
import random
from decimal import Decimal

import django

from tenders.models import Tender, TenderEntry
from users.models import User

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

admin_email = "admin@email.com"
admin_password = "admin"

if not User.objects.filter(email=admin_email).exists():
    User.objects.create_superuser(email=admin_email, password=admin_password)
    print(f"Utworzono użytkownika admin: {admin_email}")
else:
    print(f"Użytkownik {admin_email} już istnieje")

tender_names = [
    "Construction of the School",
    "Road Renovation",
    "IT System Upgrade",
    "Office Supplies Purchase",
    "Bridge Maintenance",
    "Hospital Equipment",
    "Park Development",
    "Library Expansion",
    "Water Treatment Plant",
    "Public Transport Modernization",
    "Energy Efficiency Project",
    "Software Development",
    "Community Center Renovation",
    "Road Safety Improvements",
    "Sports Complex Construction",
    "Urban Lighting Upgrade",
    "Waste Management Upgrade",
    "Fire Station Equipment",
    "Museum Renovation",
    "Airport Expansion",
]

positions = [
    "Project Manager",
    "Senior Engineer",
    "Technician",
    "Consultant",
    "Site Supervisor",
    "Designer",
    "Analyst",
    "Developer",
]

companies = [
    "AlphaCorp",
    "BetaSolutions",
    "GammaTech",
    "DeltaWorks",
    "Epsilon Ltd",
    "Zeta Industries",
    "Theta Services",
    "Lambda Co",
]

for tender_name in tender_names:
    tender, created = Tender.objects.get_or_create(name=tender_name)
    for _ in range(random.randint(2, 3)):
        position = random.choice(positions)
        company = random.choice(companies)
        dev_price = Decimal(random.randint(1000, 10000))
        margin = Decimal(random.randint(5, 20))
        TenderEntry.objects.create(
            tender=tender,
            position=position,
            company=company,
            developer_price=dev_price,
            margin=margin,
            total_price=dev_price * (1 + margin / 100),
        )
