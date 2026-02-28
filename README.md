# RideSerene - Premium Chauffeur Marketplace

**RideSerene.com** is a premium chauffeur marketplace connecting verified professional drivers with clients seeking high-end transportation services.

## Brand Identity

- **Brand Name:** RideSerene
- **Tone:** Premium, elegant, calm, and trustworthy
- **Color Palette:** Black + Gold + Silver (luxury and confidence)
- **Tagline:** "Luxury. Reliability. Serene." / "Driven to Impress."

## Project Overview

The platform allows chauffeurs to register, create profiles, receive real-time ride requests, and manage bookings. Customers can browse, book, and track chauffeurs, while the system auto-allocates leads to the nearest available chauffeur.

## Tech Stack

- **Frontend:** React 19 with Vite
- **Routing:** React Router DOM
- **Icons:** Lucide React
- **Styling:** CSS with CSS Variables (Black + Gold + Silver theme)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx      # Main navigation header
│   ├── Hero.jsx        # Hero section with booking form
│   ├── Services.jsx    # Services showcase section
│   ├── Features.jsx    # Feature highlights section
│   └── Footer.jsx      # Footer with links and social media
├── pages/              # Page components
│   └── HomePage.jsx    # Main landing page
├── layouts/            # Layout components
│   └── MainLayout.jsx  # Main layout with header/footer
├── styles/             # Additional stylesheets
├── App.jsx             # Main app component with routing
├── main.jsx            # App entry point
└── index.css           # Global styles and CSS variables
```

## Current Features

### ✅ Completed

1. **Homepage Design**
   - Premium hero section with booking form
   - Services showcase (City-to-City, Chauffeur Hailing, Airport Transfers, Hourly Hire)
   - Feature highlights (Safety, Private Travel, Sustainability)
   - Responsive navigation header
   - Professional footer

2. **Design System**
   - Black + Gold + Silver color palette
   - Premium typography
   - Consistent spacing and components
   - Responsive design

3. **Routing Structure**
   - Main layout with header/footer
   - Homepage route
   - Placeholder routes for Customer/Chauffeur/Admin dashboards

## User Roles

1. **Customer** - Individual or corporate user booking rides
2. **Chauffeur** - Service provider offering limousine/transport service
3. **Admin** - Platform owner managing all data, payments, and analytics
4. **Corporate Account Manager** (optional) - Manages bulk bookings, corporate billing & reporting

## Next Steps - Module Development

### Customer Module
- [ ] Registration & Login (Email/Phone, Social login)
- [ ] Search & Booking (Search chauffeurs, Instant/Scheduled booking)
- [ ] Ride Management (View chauffeur details, Real-time tracking, Cancel/Reschedule)
- [ ] Payments (Stripe integration, Auto fare estimation)
- [ ] Ratings & Reviews
- [ ] Ride History

### Chauffeur Module
- [ ] Registration & Verification (Document upload, Admin approval)
- [ ] Profile Management (Vehicle photos, Rates, Availability)
- [ ] Booking Management (Notifications, Accept/Reject, Status updates)
- [ ] Earnings Dashboard
- [ ] Availability Toggle
- [ ] Live Location Tracking

### Admin Module
- [ ] Dashboard (Analytics, Real-time map)
- [ ] User Management (Approve/Reject chauffeurs, Account management)
- [ ] Booking Control (View/manage rides, Manual assignment)
- [ ] Payment & Commission (Commission rates, Payout processing)
- [ ] Corporate Accounts
- [ ] Reports & Analytics
- [ ] CMS Management

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

## Design Inspiration

The homepage design is inspired by premium chauffeur services like Blacklane, featuring:
- Clean, modern, professional aesthetic
- Prominent booking form
- Service-focused sections
- Trust-building elements (safety, sustainability)
- Premium color scheme (Black + Gold + Silver)

## RideSerene — Backend (Express, Node, MongoDB)

Backend for RideSerene powers user & chauffeur registration/auth, ride search & booking, payments stub, admin controls, and realtime features (location / notifications).

Backend Identity

Service: RideSerene API

Tone: Secure, reliable, pragmatic

Tech stack: Node.js (Express), MongoDB (Mongoose)

What this backend does (summary)

User registration / login (email, password)

Chauffeur registration, document upload 

Authentication & role-based authorization (Customer, Chauffeur)

Search services from homepage (limousine, chauffeur hailing, airport transfer, hourly hire)

Booking lifecycle: create → accept/reject → start → complete → cancel/refund flow

Basic logging and error handling

Tech Stack (backend)

Node.js, Express

MongoDB + Mongoose

bcrypt for password hashing

Multer for file uploads (vehicle / document photos)

Install & Run (local dev)

from project root, if backend in 'backend' folder:
cd backend

npm install

development (with nodemon):

npm run dev



# RideSerene limousine marketplace platform:

# Admin Dashboard:**
- Overview: KPI cards, charts, live map
- Ride management: all rides, search/filter, detail view
- Chauffeur management: onboarding, docs approval, performance
- Customer management: profiles, history, invoices
- Pricing & configuration: fares, zones, promo codes
- Finance & payouts: transactions, commission reports
- Support & operations: tickets, chat, refunds

# Chauffeur Dashboard:**
- Today view: upcoming & current rides
- Ride detail: navigation, passenger info, status buttons
- Earnings & payouts: daily/weekly earnings
- Availability & schedule: online/offline toggle
- Vehicle & documents: profile, insurance, expiry warnings
- Ratings & feedback: reviews, performance metrics

# Customer Dashboard:**
- Home/Book: pickup/drop-off, vehicle class selector
- Upcoming rides: future bookings with edit/cancel
- Live tracking: driver location, ETA, contact
- Ride history & invoices: past rides, download PDF
- Payments & wallet: saved cards, promo codes
- Profile & preferences: personal data, favorite locations

Reference: Blacklane-style clean, minimal, business-class UI

# 1. Create admin user
cd backend

npm run seed:admin

# 2. Start backend
npm start

# 3. Start frontend (new terminal)

cd frontend

npm run dev

Login at: http://localhost:5173/admin/login

Email: admin@rideserene.com

Password: admin123456

# License
Private project - All rights reserved
