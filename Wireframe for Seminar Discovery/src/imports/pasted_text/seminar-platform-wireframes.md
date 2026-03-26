Design a low-fidelity wireframe for a web platform that allows users to discover and attend professional seminars hosted by companies, universities, or verified organizations.

The platform includes three roles:

1. General users (attendees)
2. Organization users (seminar creators)
3. Admin (platform operators)

Focus on clean grayscale wireframes with clear layout hierarchy. Do not focus on visual design—focus on structure and usability.

---

## 1. Landing Page

Include:

* Hero section with headline: "Discover Professional Seminars & Classes"
* Two main CTAs:

  * Primary: "Browse Seminars"
  * Secondary: "Host a Seminar" (label: for organizations)
* Featured seminars (card layout)
* Search bar and category filters

---

## 2. Seminar Browsing Page

Include:

* Search bar
* Filters (category, price: free/paid, date)
* Seminar cards:

  * Thumbnail
  * Title
  * Organizer (company/university)
  * Date/time
  * Price

Cards link to Seminar Detail page

---

## 3. Seminar Detail Page

Include:

* Title, thumbnail
* Organizer name + logo
* Date/time
* Location (online/offline)
* Price
* Remaining seats
* Description
* Session breakdown
* Organizer info

Sticky CTA section:

* Ticket selection
* Button:

  * "Register" (free)
  * "Purchase Ticket" (paid)

State variations:

* Sold out → "Join Waitlist"
* Already registered → "Go to My Page"
* Event ended → "View Summary / Community"

---

## 4. Payment / Registration Flow

Include:

* Ticket selection
* Quantity
* Payment method (simplified)
* Confirmation

Success page:

* "Registration Complete"
* CTA:

  * "Go to My Page"
  * "Join Community"

Error state:

* Payment failed → retry option

---

## 5. User My Page (Attendee)

Sections:

* My Seminars

  * Status:

    * Upcoming → "Join"
    * Ongoing → "Enter"
    * Completed → "Review"
* Waitlisted seminars
* Subscribed organizers (optional)

Each seminar card includes:

* Title
* Date
* Status
* CTA button

---

## 6. Community (Study Room)

Include:

* Post list
* Create post
* Comments
* Optional: live chat

---

## 7. Organization Dashboard (Seminar Creators)

Accessible only to organization users.

Main sections:

### Seminar Management

* List of created seminars
* Status: draft / published / ended
* Actions:

  * Create seminar
  * Edit seminar
  * Delete seminar

### Seminar Creation Flow (multi-step form)

1. Basic info (title, description, thumbnail, category)
2. Schedule & format (date, time, online/offline)
3. Sessions (add multiple sessions)
4. Ticket setup (price, quantity, sale period)
5. Optional: online meeting link (can be added later)
6. Save draft / Publish

### Participant Management

* List of attendees
* Status (paid, cancelled)

### Community Management

* Manage posts
* Pin announcements

---

## 8. Admin Dashboard (Platform Operator)

Accessible only to admin users.

Main sections:

### Platform Overview

* Total users
* Total seminars
* Activity summary

### Seminar Control

* View all seminars
* Remove or suspend seminars

### User Management

* View users
* Suspend accounts

### Report Management

* View reported content
* Take action (remove post, ban user)

---

## General Guidelines

* Use simple grayscale wireframes
* Clearly separate user roles (User / Organization / Admin)
* Do NOT mix dashboards between roles
* Show key UI states (before purchase, after purchase, sold out)
* Focus on clarity and usability, not decoration
* Maintain consistent spacing and layout hierarchy