# 🏡 Kira's Fairytale Cottage — Website

Site web bilingv (RO/EN) cu calendar de disponibilitate și sistem de cereri de rezervare.

---

## 📁 Structura fișierelor

```
kiras-cottage/
├── index.html        ← site-ul (nu modifica direct)
├── config.json       ← TOT conținutul editabil (texte, contact, poze, calendar)
├── assets/
│   ├── hero.jpg      ← poza de fundal (hero section)
│   ├── about.jpg     ← poza din secțiunea "Despre noi"
│   ├── gallery1.jpg  ← galerie foto (1–5)
│   ├── gallery2.jpg
│   ├── gallery3.jpg
│   ├── gallery4.jpg
│   └── gallery5.jpg
└── README.md         ← acest fișier
```

---

## ✏️ Cum faci modificări

### 1. Schimbi un text (telefon, email, descriere etc.)
Deschide `config.json` și modifică valoarea dorită.

**Exemplu — schimbi numărul de telefon:**
```json
"phone": "+40 722 123 456",
"phone_href": "+40722123456"
```

### 2. Schimbi o poză
Înlocuiește fișierul din `assets/` cu noua poză, **păstrând același nume**.

Exemplu: vrei o nouă poză hero → salvezi noua poză ca `assets/hero.jpg` (suprascrie vechea poză).

Sau, dacă vrei să adaugi un nume nou, modifici și `config.json`:
```json
"images": {
  "hero": "assets/noua-poza-hero.jpg",
  "about": "assets/about.jpg"
}
```

### 3. Adaugi/scoți poze din galerie
În `config.json`, secțiunea `gallery` este o listă. Adaugi sau ștergi intrări:
```json
"gallery": [
  { "src": "assets/gallery1.jpg", "alt_ro": "Descriere RO", "alt_en": "Description EN" },
  { "src": "assets/gallery6.jpg", "alt_ro": "Noua poza",    "alt_en": "New photo" }
]
```
> Prima poză din listă va fi afișată **mai mare** (span 2 coloane).

### 4. Blochezi zile în calendar
În `config.json`, secțiunea `calendar.manually_blocked`:
```json
"manually_blocked": [
  { "year": 2026, "month": 6, "days": [10, 11, 12, 20] },
  { "year": 2026, "month": 7, "days": [1, 2, 3, 4, 5] }
]
```
> ⚠️ `month` este 1–12 (Ianuarie=1, Decembrie=12).

### 5. Adaugi sincronizare iCal (Booking.com / Airbnb)
Copiezi link-ul iCal din platforma ta și îl pui în config:
```json
"calendar": {
  "ical_booking_url": "https://ical.booking.com/v1/export?t=...",
  "ical_airbnb_url":  "https://www.airbnb.com/calendar/ical/....ics"
}
```
> 📌 Notă: sincronizarea iCal automată necesită un mic server/script. Scrie-i lui Claude și te ajută să o configurezi.

---

## 📧 Configurare EmailJS (pentru cereri de rezervare)

Ca să primești emailuri cu cererile de rezervare de pe site:

1. Creează cont gratuit pe [emailjs.com](https://www.emailjs.com)
2. Adaugă un **Email Service** (Gmail, Outlook etc.)
3. Creează un **Email Template** cu variabilele:
   ```
   De la: {{guest_name}} <{{guest_email}}>
   Check-in: {{checkin_date}}
   Check-out: {{checkout_date}}
   Nopți: {{nights}}
   Persoane: {{guest_count}}
   Telefon: {{guest_phone}}
   Mesaj: {{message}}
   ```
4. Copiezi ID-urile în `config.json`:
   ```json
   "booking": {
     "emailjs_service_id":  "service_xxxxxxx",
     "emailjs_template_id": "template_xxxxxxx",
     "emailjs_public_key":  "xxxxxxxxxxxxxx",
     "owner_email":         "emailul-tau@gmail.com"
   }
   ```

---

## 🚀 Cum publici modificările (GitHub Pages)

```bash
git add .
git commit -m "Update: descriere modificare"
git push
```

Site-ul se actualizează automat în ~1 minut.

---

## 🆘 Vrei ajutor cu o modificare?

Scrie-i lui Claude ce vrei să schimbi — el modifică fișierele și tu dai doar push.

**Exemple de cereri:**
- *"Schimbă numărul de telefon la +40 722 111 222"*
- *"Adaugă o nouă poză în galerie"*
- *"Blochează perioada 10–20 iulie 2026"*
- *"Schimbă textul din secțiunea Despre noi"*
