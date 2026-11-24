import json
import uuid
import datetime
from backend.database import get_db, init_db
from backend.scorer import CHECKLIST_ITEMS_DEF, generate_verification_hash, generate_qr_code_base64

LOCALITIES = {
    "Peenya": {"lat": 13.0285, "lon": 77.5197},
    "Rajajinagar": {"lat": 12.9982, "lon": 77.5530},
    "Jayanagar": {"lat": 12.9308, "lon": 77.5838},
    "Whitefield": {"lat": 12.9698, "lon": 77.7500},
    "HSR Layout": {"lat": 12.9121, "lon": 77.6446},
    "Electronic City": {"lat": 12.8452, "lon": 77.6602},
    "Yelahanka": {"lat": 13.1007, "lon": 77.5963},
    "Malleshwaram": {"lat": 13.0031, "lon": 77.5700},
    "Indiranagar": {"lat": 12.9784, "lon": 77.6408},
    "BTM Layout": {"lat": 12.9166, "lon": 77.6101},
    "Hebbal": {"lat": 13.0358, "lon": 77.5970},
    "Koramangala": {"lat": 12.9352, "lon": 77.6245}
}

TASKS = [
    {
        "id": "task-two-way",
        "slug": "wire-two-way-switch",
        "title_en": "Wire a two-way staircase switch",
        "title_kn": "ಎರಡು-ಮಾರ್ಗದ (ಟೂ-ವೇ) ಮೆಟ್ಟಿಲು ಸ್ವಿಚ್ ವೈರಿಂಗ್",
        "title_hi": "टू-वे सीढ़ी स्विच की वायरिंग",
        "description_en": "Connect a staircase light with two 2-way switches. Ensure phase isolation, proper strapper wire gauge, and neutral directly to lamp holder.",
        "description_kn": "ಎರಡು ಟೂ-ವೇ ಸ್ವಿಚ್‌ಗಳನ್ನು ಬಳಸಿ ಮೆಟ್ಟಿಲ ದೀಪವನ್ನು ಸಂಪರ್ಕಿಸಿ. ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಕಡಿತಗೊಳಿಸಿ ಹಾಗೂ ಸರಿಯಾದ ತಂತಿ ರೇಟಿಂಗ್ ಬಳಸಿ.",
        "description_hi": "दो 2-वे स्विच के साथ सीढ़ी की लाइट जोड़ें। सुरक्षित पावर आइसोलेशन और सही वायर गेज सुनिश्चित करें।",
        "guide_steps": [
            {"en": "1. Isolate the main switch and verify cold line with neon tester.", "kn": "೧. ಮುಖ್ಯ ಸ್ವಿಚ್ ಆಫ್ ಮಾಡಿ ನಿಯಾನ್ ಟೆಸ್ಟರ್ ಮೂಲಕ ವಿದ್ಯುತ್ ಇಲ್ಲದಿರುವುದನ್ನು ದೃಢೀಕರಿಸಿ.", "hi": "1. मेन स्विच बंद करें और नियॉन टेस्टर से पावर ऑफ होने की जांच करें।"},
            {"en": "2. Connect Phase input to the common (C) terminal of switch 1.", "kn": "೨. ಮೊದಲ ಸ್ವಿಚ್‌ನ ಕಾಮನ್ (C) ಟರ್ಮಿನಲ್‌ಗೆ ಫೇಸ್ ವೈರ್ ಜೋಡಿಸಿ.", "hi": "2. स्विच 1 के कॉमन (C) टर्मिनल से फेज तार जोड़ें।"},
            {"en": "3. Run twin strapper wires between L1-L1 and L2-L2 terminals.", "kn": "೩. L1-L1 ಮತ್ತು L2-L2 ನಡುವೆ ಎರಡು ಸ್ಟ್ರಾಪರ್ ವೈರ್‌ಗಳನ್ನು ಎಳೆಯಿರಿ.", "hi": "3. L1-L1 और L2-L2 टर्मिनलों के बीच ट्विन स्ट्रैपर तार लगाएं।"},
            {"en": "4. Route switch 2 common (C) terminal to lamp phase point.", "kn": "೪. ಎರಡನೇ ಸ್ವಿಚ್‌ನ ಕಾಮನ್ (C) ಅನ್ನು ಲ್ಯಾಂಪ್ ಫೇಸ್ ಪಾಯಿಂಟ್‌ಗೆ ಸಂಪರ್ಕಿಸಿ.", "hi": "4. स्विच 2 के कॉमन टर्मिनल को लैंप फेज पॉइंट से जोड़ें।"},
            {"en": "5. Terminate neutral directly to lamp holder; secure earthing.", "kn": "೫. ನ್ಯೂಟ್ರಲ್ ಅನ್ನು ನೇರವಾಗಿ ಬಲ್ಬ್ ಹೋಲ್ಡರ್‌ಗೆ ಮತ್ತು ಅರ್ಥಿಂಗ್ ಬಾಕ್ಸ್‌ಗೆ ಜೋಡಿಸಿ.", "hi": "5. न्यूट्रल को सीधे लैंप में जोड़ें और अर्थिंग सुरक्षित करें।"}
        ],
        "spoken_phrases": [
            {"en": "Testing phase isolation before connecting two-way switch", "kn": "ಟೂ-ವೇ ಸ್ವಿಚ್ ಜೋಡಿಸುವ ಮುನ್ನ ಫೇಸ್ ಐಸೊಲೇಶನ್ ಪರೀಕ್ಷಿಸುತ್ತಿದ್ದೇನೆ", "hi": "टू-वे स्विच जोड़ने से पहले फेज आइसोलेशन चेक कर रहा हूँ"},
            {"en": "Securing 1.5 sq mm copper wire into switch terminal", "kn": "೧.೫ ಚದರ ಮಿಮೀ ತಾಮ್ರದ ವೈರನ್ನು ಸ್ವಿಚ್ ಟರ್ಮಿನಲ್‌ಗೆ ಬಿಗಿಗೊಳಿಸುತ್ತಿದ್ದೇನೆ", "hi": "1.5 वर्ग मिमी कॉपर वायर को स्विच टर्मिनल में कस रहा हूँ"},
            {"en": "Verified earth continuity and neutral return path", "kn": "ಅರ್ಥಿಂಗ್ ನಿರಂತರತೆ ಮತ್ತು ನ್ಯೂಟ್ರಲ್ ಪಾತ್ ಪರಿಶೀಲಿಸಲಾಗಿದೆ", "hi": "अर्थिंग और न्यूट्रल रिटर्न पाथ की जांच पूरी की"}
        ]
    },
    {
        "id": "task-mcb-earthing",
        "slug": "install-mcb-earthing",
        "title_en": "Install an MCB and earthing busbar",
        "title_kn": "ಎಂಸಿಬಿ (MCB) ಮತ್ತು ಅರ್ಥಿಂಗ್ ಬಸ್‌ಬಾರ್ ಅಳವಡಿಕೆ",
        "title_hi": "एमसीबी (MCB) और अर्थिंग बसबार लगाना",
        "description_en": "Mount a 16A/25A C-curve MCB in an enclosure, connect busbar, torque incoming phase, and bolt protective earth wire to busbar.",
        "description_kn": "ಡಿಬಿ ಬಾಕ್ಸ್‌ನಲ್ಲಿ ೧೬ಎ/೨೫ಎ ಎಂಸಿಬಿ ಕೂರಿಸಿ, ಇನ್‌ಕಮಿಂಗ್ ಫೇಸ್ ಮತ್ತು ಪ್ರೊಟೆಕ್ಟಿವ್ ಅರ್ಥಿಂಗ್ ಬಸ್‌ಬಾರ್‌ಗೆ ಬಿಗಿಗೊಳಿಸಿ.",
        "description_hi": "वितरण बॉक्स में 16A/25A एमसीबी लगाएं, इनकमिंग फेज और अर्थिंग बसबार को सही तरीके से कसें।",
        "guide_steps": [
            {"en": "1. Lock out incoming supply at main distribution breaker.", "kn": "೧. ಮುಖ್ಯ ಬ್ರೇಕರ್ ಆಫ್ ಮಾಡಿ ಲಾಕ್ ಮಾಡಿ.", "hi": "1. मुख्य ब्रेकर पर इनकमिंग सप्लाई बंद करें।"},
            {"en": "2. Clip C-curve MCB firmly onto DIN rail until latch clicks.", "kn": "೨. ಡಿನ್ ರೈಲ್ ಮೇಲೆ ಎಂಸಿಬಿಯನ್ನು ಭದ್ರವಾಗಿ ಕ್ಲಿಪ್ ಮಾಡಿ.", "hi": "2. डीआईएन रेल पर एमसीबी को मजबूती से लगाएं।"},
            {"en": "3. Strip 10mm wire insulation without nicking copper strands.", "kn": "೩. ತಾಮ್ರದ ಎಳೆಗಳಿಗೆ ಹಾನಿಯಾಗದಂತೆ ೧೦ಮಿಮೀ ವೈರ್ ಇನ್ಸುಲೇಶನ್ ತೆಗೆಯಿರಿ.", "hi": "3. तांबे के तारों को नुकसान पहुंचाए बिना 10 मिमी वायर छीलें।"},
            {"en": "4. Torque line terminal screw to 2.5 N-m using insulated driver.", "kn": "೪. ಇನ್ಸುಲೇಟೆಡ್ ಸ್ಕ್ರೂಡ್ರೈವರ್ ಬಳಸಿ ಟರ್ಮಿನಲ್ ಸ್ಕ್ರೂ ಬಿಗಿಗೊಳಿಸಿ.", "hi": "4. इंसुलेटेड पेचकश से लाइन टर्मिनल स्क्रू को मजबूती से कसें।"},
            {"en": "5. Secure green-yellow earth conductor to chassis ground busbar.", "kn": "೫. ಹಸಿರು-ಹಳದಿ ಅರ್ಥಿಂಗ್ ತಂತಿಯನ್ನು ಗ್ರೌಂಡ್ ಬಸ್‌ಬಾರ್‌ಗೆ ಬಿಗಿಯಾಗಿ ಸ್ಕ್ರೂ ಮಾಡಿ.", "hi": "5. हरे-पीले अर्थ वायर को ग्राउंड बसबार से सुरक्षित जोड़ें।"}
        ],
        "spoken_phrases": [
            {"en": "Clamping 25 amp MCB to DIN rail with safety lock", "kn": "೨೫ ಆಂಪ್ ಎಂಸಿಬಿಯನ್ನು ಸುರಕ್ಷತಾ ಲಾಕ್‌ನೊಂದಿಗೆ ಡಿನ್ ರೈಲ್‌ಗೆ ಜೋಡಿಸುತ್ತಿದ್ದೇನೆ", "hi": "सुरक्षा लॉक के साथ 25 एम्पीयर एमसीबी को डीआईएन रेल पर लगा रहा हूँ"},
            {"en": "Tightening earth conductor terminal with lock washer", "kn": "ಲಾಕ್ ವಾಷರ್‌ನೊಂದಿಗೆ ಅರ್ಥಿಂಗ್ ಟರ್ಮಿನಲ್ ಸ್ಕ್ರೂ ಬಿಗಿಗೊಳಿಸುತ್ತಿದ್ದೇನೆ", "hi": "लॉक वॉशर के साथ अर्थ कंडक्टर टर्मिनल को कस रहा हूँ"}
        ]
    },
    {
        "id": "task-inverter-battery",
        "slug": "inverter-battery-setup",
        "title_en": "Inverter battery setup & changeover",
        "title_kn": "ಇನ್ವರ್ಟರ್ ಬ್ಯಾಟರಿ ಮತ್ತು ಚೇಂಜ್‌ಓವರ್ ವೈರಿಂಗ್",
        "title_hi": "इन्वर्टर बैटरी सेटअप और चेंजओवर वायरिंग",
        "description_en": "Install 150Ah tubular battery, apply petroleum jelly on terminals, torque brass nuts, connect inverter DC leads, and wire bypass switch.",
        "description_kn": "೧೫೦ಎಎಚ್ ಬ್ಯಾಟರಿ ಸ್ಥಾಪಿಸಿ, ಟರ್ಮಿನಲ್‌ಗಳಿಗೆ ಜೆಲ್ಲಿ ಹಚ್ಚಿ, ಇನ್ವರ್ಟರ್ ಡಿಸಿ ಲೀಡ್ಸ್ ಮತ್ತು ಬೈಪಾಸ್ ಸ್ವಿಚ್ ಜೋಡಿಸಿ.",
        "description_hi": "150Ah ट्यूबलर बैटरी लगाएं, टर्मिनलों पर पेट्रोलियम जेली लगाएं और इन्वर्टर कनेक्शन पूरा करें।",
        "guide_steps": [
            {"en": "1. Check electrolyte level and verify zero sparks near battery vent.", "kn": "೧. ಬ್ಯಾಟರಿ ಇಲೆಕ್ಟ್ರೋಲೈಟ್ ಮಟ್ಟ ಪರಿಶೀಲಿಸಿ, ಕಿಡಿ ಹಾರುವುದನ್ನು ತಡೆಯಿರಿ.", "hi": "1. इलेक्ट्रोलाइट स्तर जांचें और बैटरी के पास चिंगारी से बचें।"},
            {"en": "2. Connect Red lead to positive terminal (+) first, then Black to (-).", "kn": "೨. ಮೊದಲು ಕೆಂಪು ವೈರ್ ಧನ (+) ಮತ್ತು ನಂತರ ಕಪ್ಪು ವೈರ್ ಋಣ (-) ಟರ್ಮಿನಲ್‌ಗೆ ಜೋಡಿಸಿ.", "hi": "2. पहले लाल तार (+) से और फिर काला तार (-) टर्मिनल से जोड़ें।"},
            {"en": "3. Tighten with 10mm insulated spanner and coat with petroleum jelly.", "kn": "೩. ೧೦ಮಿಮೀ ಸ್ಪ್ಯಾನರ್‌ನಿಂದ ಬಿಗಿಗೊಳಿಸಿ ಪೆಟ್ರೋಲಿಯಂ ಜೆಲ್ಲಿ ಲೇಪಿಸಿ.", "hi": "3. 10 मिमी इंसुलेटेड स्पैनर से कसें और पेट्रोलियम जेली लगाएं।"},
            {"en": "4. Verify AC output polarity (Phase on Right of socket).", "kn": "೪. ಸಾಕೆಟ್‌ನಲ್ಲಿ ಫೇಸ್ ಬಲಭಾಗದಲ್ಲಿದೆಯೇ ಎಂದು ಎಸಿ ಔಟ್‌ಪುಟ್ ಪರೀಕ್ಷಿಸಿ.", "hi": "4. एसी आउटपुट पोलरिटी (दाएं पिन पर फेज) की जांच करें।"}
        ],
        "spoken_phrases": [
            {"en": "Connecting positive DC cable to battery terminal safely", "kn": "ಬ್ಯಾಟರಿ ಟರ್ಮಿನಲ್‌ಗೆ ಪಾಸಿಟಿವ್ ಡಿಸಿ ಕೇಬಲ್ ಸುರಕ್ಷಿತವಾಗಿ ಜೋಡಿಸುತ್ತಿದ್ದೇನೆ", "hi": "बैटरी टर्मिनल से पॉजिटिव डीसी केबल सुरक्षित रूप से जोड़ रहा हूँ"},
            {"en": "Testing inverter bypass output voltage and earthing", "kn": "ಇನ್ವರ್ಟರ್ ಬೈಪಾಸ್ ಔಟ್‌ಪುಟ್ ವೋಲ್ಟೇಜ್ ಮತ್ತು ಅರ್ಥಿಂಗ್ ಪರೀಕ್ಷಿಸುತ್ತಿದ್ದೇನೆ", "hi": "इन्वर्टर बाईपास आउटपुट वोल्टेज और अर्थिंग की जांच जारी है"}
        ]
    }
]

WORKERS = [
    {
        "phone": "+919845012341",
        "name": "Manjunath K.",
        "language": "kn",
        "locality": "Peenya",
        "experience": 8,
        "daily_rate": 1000,
        "bio": "Expert in industrial panel boards, star-delta starters, and factory conduit routing.",
        "verified": True,
        "score": 6
    },
    {
        "phone": "+919845012342",
        "name": "Suresh Gowda",
        "language": "kn",
        "locality": "Rajajinagar",
        "experience": 12,
        "daily_rate": 1200,
        "bio": "Commercial building wiring, distribution board overhaul, and 3-phase earthing.",
        "verified": True,
        "score": 6
    },
    {
        "phone": "+919845012343",
        "name": "Ramesh Kumar",
        "language": "hi",
        "locality": "Jayanagar",
        "experience": 6,
        "daily_rate": 950,
        "bio": "Apartment concealed wiring, MCB troubleshooting, and LED profile illumination.",
        "verified": True,
        "score": 5
    },
    {
        "phone": "+919845012344",
        "name": "Syed Shabbir",
        "language": "kn",
        "locality": "Malleshwaram",
        "experience": 10,
        "daily_rate": 1100,
        "bio": "Heritage house electrical renovation, inverter backup setups, and neutral fault fixes.",
        "verified": True,
        "score": 6
    },
    {
        "phone": "+919845012345",
        "name": "Anand Rao",
        "language": "en",
        "locality": "Indiranagar",
        "experience": 9,
        "daily_rate": 1150,
        "bio": "Smart home automation, touch switches, sensor lighting, and high-load appliance lines.",
        "verified": True,
        "score": 6
    },
    {
        "phone": "+919845012346",
        "name": "Venkatesh M.",
        "language": "kn",
        "locality": "HSR Layout",
        "experience": 5,
        "daily_rate": 900,
        "bio": "Residential rewiring, switchboard replacement, and geyser/AC point installations.",
        "verified": True,
        "score": 5
    },
    {
        "phone": "+919845012347",
        "name": "Rajeshwari N.",
        "language": "kn",
        "locality": "Hebbal",
        "experience": 4,
        "daily_rate": 900,
        "bio": "Certified ITI Wireman. Specialized in domestic circuit balancing and DB dressing.",
        "verified": True,
        "score": 6
    },
    {
        "phone": "+919845012348",
        "name": "Pradeep V.",
        "language": "kn",
        "locality": "BTM Layout",
        "experience": 7,
        "daily_rate": 1050,
        "bio": "PG/Hostel electrical maintenance, submeter installation, and leakage current detection.",
        "verified": True,
        "score": 6
    },
    {
        "phone": "+919845012349",
        "name": "Chetan Murthy",
        "language": "en",
        "locality": "Koramangala",
        "experience": 11,
        "daily_rate": 1300,
        "bio": "Restaurant & kitchen heavy load wiring, exhaust system controls, and generator changeovers.",
        "verified": True,
        "score": 6
    },
    {
        "phone": "+919845012350",
        "name": "Abdul Gaffar",
        "language": "hi",
        "locality": "Yelahanka",
        "experience": 8,
        "daily_rate": 1000,
        "bio": "Agricultural pump starters, borehole control panels, and earthing chemical pits.",
        "verified": True,
        "score": 5
    },
    {
        "phone": "+919845012351",
        "name": "Jagadish Reddy",
        "language": "kn",
        "locality": "Whitefield",
        "experience": 14,
        "daily_rate": 1400,
        "bio": "Gated community master electrician. High-tension step-down, solar inverter integration.",
        "verified": True,
        "score": 6
    },
    {
        "phone": "+919845012352",
        "name": "Sunil Basappa",
        "language": "kn",
        "locality": "Electronic City",
        "experience": 3,
        "daily_rate": 850,
        "bio": "Apprentice-level wireman. Quick switch repairs, ceiling fan installations, and socket tests.",
        "verified": False,
        "score": 4
    }
]

JOBS = [
    {
        "title": "Apartment 3BHK Complete Rewiring & DB Setup",
        "description": "Old building rewiring with 2.5 sq mm fire-retardant copper wires. Need complete MCB box dressing, 2-way switches in 3 bedrooms, and separate AC lines.",
        "locality": "Jayanagar",
        "day_rate_min": 1100,
        "day_rate_max": 1300,
        "duration_days": 4,
        "radius_km": 8.0
    },
    {
        "title": "Industrial CNC Machine DB Panel Upgrade",
        "description": "63A 4-pole isolator and individual 32A motor circuit breakers replacement. Copper busbar bending and chemical earth pit resistance test required.",
        "locality": "Peenya",
        "day_rate_min": 1300,
        "day_rate_max": 1600,
        "duration_days": 2,
        "radius_km": 12.0
    },
    {
        "title": "Villa Inverter Battery Setup & Surge Protector",
        "description": "Install 2x 200Ah tubular batteries with 2.5kVA pure sine wave inverter. Connect SPD (surge protection device) to main consumer unit.",
        "locality": "Whitefield",
        "day_rate_min": 1100,
        "day_rate_max": 1400,
        "duration_days": 2,
        "radius_km": 10.0
    },
    {
        "title": "Frequent MCB Tripping Diagnostics & Neutral Balancing",
        "description": "G+2 independent house facing neutral leakage and random 40A RCCB tripping during evening peak loads. Need insulation resistance megger testing.",
        "locality": "HSR Layout",
        "day_rate_min": 950,
        "day_rate_max": 1250,
        "duration_days": 1,
        "radius_km": 7.0
    },
    {
        "title": "Commercial Cafe Track Lights & Kitchen Hood Wiring",
        "description": "Surface metal conduit wiring for 28 LED track spotlights. 3-phase connection for 5kW commercial espresso machine and industrial exhaust hood.",
        "locality": "Indiranagar",
        "day_rate_min": 1200,
        "day_rate_max": 1500,
        "duration_days": 3,
        "radius_km": 6.0
    },
    {
        "title": "New Penthouse Earthing & Concealed Switchboards",
        "description": "Chipping, PVC pipe conduit laying, metal box mounting, and wire pulling for 5 bedrooms. Must have prior experience with Legrand/Anchor modular switches.",
        "locality": "Yelahanka",
        "day_rate_min": 900,
        "day_rate_max": 1150,
        "duration_days": 6,
        "radius_km": 15.0
    },
    {
        "title": "Boutique Garment Factory Load Distribution",
        "description": "Installation of 12 single-phase sewing machine plug points with individual miniature circuit breakers and emergency cut-off stop pushbuttons.",
        "locality": "Rajajinagar",
        "day_rate_min": 1200,
        "day_rate_max": 1400,
        "duration_days": 3,
        "radius_km": 9.0
    },
    {
        "title": "Tech Park Office UPS Changeover & Server Earthing",
        "description": "Dual source automatic changeover switch (EB / Generator / 10kVA Online UPS). Dedicated server rack clean earth below 1.5 Ohms verification.",
        "locality": "Electronic City",
        "day_rate_min": 1300,
        "day_rate_max": 1600,
        "duration_days": 2,
        "radius_km": 10.0
    }
]

def seed_database():
    init_db()
    with get_db() as conn:
        cursor = conn.cursor()

        # Check if tasks are already seeded
        cursor.execute("SELECT count(*) as count FROM tasks")
        row = cursor.fetchone()
        if row["count"] > 0:
            print("Database already seeded with tasks.")
            return

        print("Seeding tasks...")
        for t in TASKS:
            cursor.execute("""
            INSERT INTO tasks (id, slug, title_en, title_kn, title_hi, description_en, description_kn, description_hi, guide_steps_json, spoken_phrases_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                t["id"],
                t["slug"],
                t["title_en"],
                t["title_kn"],
                t["title_hi"],
                t["description_en"],
                t["description_kn"],
                t["description_hi"],
                json.dumps(t["guide_steps"]),
                json.dumps(t["spoken_phrases"])
            ))

        print("Seeding contractor user...")
        contractor_id = "user-contractor-demo"
        cursor.execute("INSERT OR IGNORE INTO users (id, phone, role, created_at) VALUES (?, ?, 'contractor', ?)",
                       (contractor_id, "+919900112233", "2026-11-20T10:00:00Z"))
        cursor.execute("""
        INSERT OR REPLACE INTO contractor_profiles (user_id, company_name, contact_person, phone, locality, latitude, longitude)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            contractor_id,
            "Nandi Electrical Projects & Infra",
            "Srinivas Rao (Lead Contractor)",
            "+919900112233",
            "Jayanagar",
            LOCALITIES["Jayanagar"]["lat"],
            LOCALITIES["Jayanagar"]["lon"]
        ))

        # Seed realistic jobs
        print("Seeding contractor jobs...")
        for idx, j in enumerate(JOBS):
            loc_data = LOCALITIES[j["locality"]]
            job_id = f"job-{idx+1:02d}"
            cursor.execute("""
            INSERT INTO jobs (id, contractor_id, title, description, trade, locality, latitude, longitude, radius_km, day_rate_min, day_rate_max, duration_days, status, created_at)
            VALUES (?, ?, ?, ?, 'Electrician', ?, ?, ?, ?, ?, ?, ?, 'open', ?)
            """, (
                job_id,
                contractor_id,
                j["title"],
                j["description"],
                j["locality"],
                loc_data["lat"],
                loc_data["lon"],
                j["radius_km"],
                j["day_rate_min"],
                j["day_rate_max"],
                j["duration_days"],
                f"2026-11-2{idx % 4 + 1}T08:30:00Z"
            ))

        # Seed workers
        print("Seeding 12 workers & verified skill passports...")
        for idx, w in enumerate(WORKERS):
            worker_id = f"worker-{idx+1:02d}"
            loc_data = LOCALITIES[w["locality"]]
            cursor.execute("INSERT INTO users (id, phone, role, created_at) VALUES (?, ?, 'worker', ?)",
                           (worker_id, w["phone"], f"2026-11-1{idx % 8 + 1}T09:00:00Z"))
            cursor.execute("""
            INSERT INTO worker_profiles (user_id, name, language, trade, locality, latitude, longitude, experience_years, bio, daily_rate, available)
            VALUES (?, ?, ?, 'Electrician', ?, ?, ?, ?, ?, ?, 1)
            """, (
                worker_id,
                w["name"],
                w["language"],
                w["locality"],
                loc_data["lat"],
                loc_data["lon"],
                w["experience"],
                w["bio"],
                w["daily_rate"]
            ))

            # If worker is verified, generate video, assessment, verification, and passport!
            if w["verified"]:
                video_id = f"vid-{worker_id}"
                task = TASKS[idx % len(TASKS)]
                now_str = f"2026-11-20T14:{idx:02d}:00Z"

                cursor.execute("""
                INSERT INTO videos (id, worker_id, task_id, file_path, duration_sec, anti_fraud_phrase, consent_given_at, created_at)
                VALUES (?, ?, ?, ?, 60, ?, ?, ?)
                """, (
                    video_id,
                    worker_id,
                    task["id"],
                    f"/uploads/demo_{worker_id}.webm",
                    task["spoken_phrases"][0]["en"],
                    now_str,
                    now_str
                ))

                # Build checklist items
                checklist = []
                for item_idx, c_item in enumerate(CHECKLIST_ITEMS_DEF):
                    is_pass = True
                    if w["score"] == 5 and item_idx == 4:
                        is_pass = False
                        obs = c_item["observation_fail"]
                    else:
                        obs = c_item["observation_pass"]
                    checklist.append({
                        "id": c_item["id"],
                        "title_en": c_item["title_en"],
                        "title_kn": c_item["title_kn"],
                        "title_hi": c_item["title_hi"],
                        "passed": is_pass,
                        "observation": obs,
                        "confidence": 0.94,
                        "timestamp_sec": c_item["timestamp_sec"]
                    })

                assessment_id = f"asmt-{worker_id}"
                cursor.execute("""
                INSERT INTO assessments (id, video_id, worker_id, task_id, checklist_json, score, max_score, confidence, status, ai_model, created_at)
                VALUES (?, ?, ?, ?, ?, ?, 6, 0.94, 'verified', 'gemini-multimodal-assistant', ?)
                """, (
                    assessment_id,
                    video_id,
                    worker_id,
                    task["id"],
                    json.dumps(checklist),
                    w["score"],
                    now_str
                ))

                verif_id = f"verif-{worker_id}"
                token = f"tok-{worker_id}"
                cursor.execute("""
                INSERT INTO verifications (id, assessment_id, token, verifier_name, verifier_phone, decision, note, verified_at, created_at)
                VALUES (?, ?, ?, 'Murthy Electrical Works (Licensed Class 1 Contractor)', '+919845099887', 'confirmed', 'Work adheres to BESCOM safety code and IS 732 earthing standards.', ?, ?)
                """, (
                    verif_id,
                    assessment_id,
                    token,
                    now_str,
                    now_str
                ))

                passport_id = f"PW-BLR-{1000 + idx}"
                verification_hash = generate_verification_hash(worker_id, assessment_id, w["score"], token, now_str)
                qr_code = generate_qr_code_base64(f"http://localhost:5173/p/{passport_id}")

                cursor.execute("""
                INSERT INTO passports (id, worker_id, assessment_id, verification_id, verification_hash, qr_code_data, issued_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    passport_id,
                    worker_id,
                    assessment_id,
                    verif_id,
                    verification_hash,
                    qr_code,
                    now_str
                ))

        conn.commit()
        print("Database initialized and successfully seeded with 12 workers and 8 jobs!")

if __name__ == "__main__":
    seed_database()
