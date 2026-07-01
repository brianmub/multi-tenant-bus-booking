# User Acceptance Testing (UAT) Checklist

**Application:** Multi-tenant Bus Booking Platform
**Version:** 0.0.0
**Tenants:** ZUPCO Express · Swift Coaches · Horizon Transit
**Date:** _______________
**Tester:** _______________

> [!NOTE]
> Each test case must be executed **three times** — once per tenant — unless marked as tenant-agnostic. Switch tenants by changing `VITE_TENANT_ID` in the `.env` file and restarting the dev server.

---

## 1. Splash Screen

| # | Test Case | Steps | Expected Result | ZUPCO | Swift | Horizon |
|---|-----------|-------|-----------------|-------|-------|---------|
| 1.1 | App launches to splash | Navigate to `/` | Redirects to `/splash` automatically | ☐ | ☐ | ☐ |
| 1.2 | Tenant branding displayed | Observe splash screen | Shows correct **logo letter**, **operator name**, **tagline**, and **background gradient** for the active tenant | ☐ | ☐ | ☐ |
| 1.3 | Logo shape matches tenant config | Compare logo container | ZUPCO = square (18px radius), Swift = circle (50%), Horizon = diamond (rotated 45°) | ☐ | ☐ | ☐ |
| 1.4 | Loading animation plays | Observe dot indicators | Three dots animate with staggered pulse | ☐ | ☐ | ☐ |
| 1.5 | Auto-redirect to Home | Wait ~2 seconds | Automatically navigates to `/home` | ☐ | ☐ | ☐ |
| 1.6 | "Powered by eTechZim" visible | Check bottom of screen | Footer attribution text is displayed | ☐ | ☐ | ☐ |

---

## 2. Home Screen — Search

| # | Test Case | Steps | Expected Result | ZUPCO | Swift | Horizon |
|---|-----------|-------|-----------------|-------|-------|---------|
| 2.1 | Header shows tenant name & logo | Observe header | "Welcome to [Tenant Name]" with branded LogoBox | ☐ | ☐ | ☐ |
| 2.2 | City dropdowns populated | Open FROM and TO selects | Only cities from the active tenant's `cities` array are listed | ☐ | ☐ | ☐ |
| 2.3 | Date defaults to today | Observe date input | Pre-filled with current date | ☐ | ☐ | ☐ |
| 2.4 | Search requires FROM + TO | Click "Search Buses" with empty fields | Form does not submit; no navigation | ☐ | ☐ | ☐ |
| 2.5 | Valid search navigates to results | Select FROM, TO, Date → Click Search | Navigates to `/results?from=X&to=Y&date=Z` | ☐ | ☐ | ☐ |
| 2.6 | Popular routes displayed | Scroll below search card | Three popular route cards are visible with price | ☐ | ☐ | ☐ |
| 2.7 | Clicking popular route fills form | Tap a popular route card | FROM and TO dropdowns are populated with route cities | ☐ | ☐ | ☐ |

---

## 3. Home Screen — AI Search Assistant

| # | Test Case | Steps | Expected Result | ZUPCO | Swift | Horizon |
|---|-----------|-------|-----------------|-------|-------|---------|
| 3.1 | AI input accepts text | Type in AI search box | Text appears, placeholder reads "Try: 'Bus to Bulawayo on Friday'..." | ☐ | ☐ | ☐ |
| 3.2 | AI parses city names | Enter "Harare to Bulawayo" → click "Ask AI" | FROM is set to Harare, TO is set to Bulawayo | ☐ | ☐ | ☐ |
| 3.3 | AI sets date to today when absent | Enter "trip from Harare" → click "Ask AI" | FROM is set, date defaults to today | ☐ | ☐ | ☐ |
| 3.4 | Loading indicator shown | Submit AI query | Button text changes to "..." while processing | ☐ | ☐ | ☐ |
| 3.5 | Input clears after AI parse | Wait for AI response | AI input box is cleared after results populate the form | ☐ | ☐ | ☐ |

---

## 4. Results Screen

| # | Test Case | Steps | Expected Result | ZUPCO | Swift | Horizon |
|---|-----------|-------|-----------------|-------|-------|---------|
| 4.1 | Route & date shown in header | Navigate to results | Header displays "FROM → TO" and formatted date | ☐ | ☐ | ☐ |
| 4.2 | Back button works | Click ← button | Returns to Home screen | ☐ | ☐ | ☐ |
| 4.3 | Bus cards rendered from fleet | Observe results list | Number of bus cards matches tenant's fleet size | ☐ | ☐ | ☐ |
| 4.4 | Bus card shows correct info | Inspect a bus card | Displays time, route, price, available seats, bus registration, and class | ☐ | ☐ | ☐ |
| 4.5 | Cutoff badge shows correct status | Verify badge per bus | Badge shows OPEN (green), CLOSING SOON (amber + pulse), or CLOSED (red) depending on time difference | ☐ | ☐ | ☐ |
| 4.6 | Currency bar visible | Check below header | Currency selector buttons (USD / ZAR / BWP) are displayed | ☐ | ☐ | ☐ |
| 4.7 | Switching currency updates prices | Tap a different currency | All prices on bus cards re-render in the selected currency | ☐ | ☐ | ☐ |
| 4.8 | Clicking bus card navigates to seat map | Tap a bus card | Navigates to `/seats/{busId}` | ☐ | ☐ | ☐ |

---

## 5. Seat Map Screen

| # | Test Case | Steps | Expected Result | ZUPCO | Swift | Horizon |
|---|-----------|-------|-----------------|-------|-------|---------|
| 5.1 | Seat layout renders (2+2 grid) | Observe seat map | 10 rows × 4 seats (A, B left / C, D right) displayed | ☐ | ☐ | ☐ |
| 5.2 | Legend is accurate | Check header legend | Shows Available (white), Selected (tenant color), Booked (grey) | ☐ | ☐ | ☐ |
| 5.3 | Selecting an available seat | Tap an available seat | Seat background changes to tenant primary color; count increments | ☐ | ☐ | ☐ |
| 5.4 | Deselecting a selected seat | Tap a selected seat again | Seat reverts to available style; count decrements | ☐ | ☐ | ☐ |
| 5.5 | Booked seats are disabled | Tap a booked (grey) seat | Nothing happens; cursor shows not-allowed | ☐ | ☐ | ☐ |
| 5.6 | AI recommended seats highlighted | Observe seats 1A, 1B, 2C | Star icon (⭐) badge and yellow background visible | ☐ | ☐ | ☐ |
| 5.7 | Quiet zone seats highlighted | Observe seats 10A, 10B | Moon icon (🌙) badge and blue background visible | ☐ | ☐ | ☐ |
| 5.8 | Bottom bar appears on selection | Select at least 1 seat | Fixed bottom bar shows seat count and total price in active currency | ☐ | ☐ | ☐ |
| 5.9 | Price converts correctly | Switch currency before entering seat map | Total displayed in correct currency with proper conversion | ☐ | ☐ | ☐ |
| 5.10 | Confirm navigates to passenger screen | Click "Confirm" in bottom bar | Navigates to `/passenger` with seat and price data in state | ☐ | ☐ | ☐ |

---

## 6. Passenger Details Screen

| # | Test Case | Steps | Expected Result | ZUPCO | Swift | Horizon |
|---|-----------|-------|-----------------|-------|-------|---------|
| 6.1 | Form fields per seat | Observe form | One card per selected seat with Full Name and ID/Passport fields | ☐ | ☐ | ☐ |
| 6.2 | Seat ID shown per passenger | Check card header | "PASSENGER N" and "SEAT XY" labels are correct | ☐ | ☐ | ☐ |
| 6.3 | Fields are required | Submit with empty fields | Browser validation prevents submission | ☐ | ☐ | ☐ |
| 6.4 | Bill breakdown visible | Scroll below passenger cards | Subtotal and seat count breakdown is displayed | ☐ | ☐ | ☐ |
| 6.5 | Proceed to Payment | Fill all fields → click "Proceed to Payment" | Navigates to `/payment` with passenger data in state | ☐ | ☐ | ☐ |

---

## 7. Payment Screen

| # | Test Case | Steps | Expected Result | ZUPCO | Swift | Horizon |
|---|-----------|-------|-----------------|-------|-------|---------|
| 7.1 | Payable amount displayed | Observe summary card | Shows total (subtotal + 15% tax + $2 service fee) in active currency | ☐ | ☐ | ☐ |
| 7.2 | Only tenant-allowed methods shown | Check payment options | ZUPCO: Ozow, Card, Paystack. Swift: SnapScan, Ozow, Card. Horizon: Paystack, Card, Ozow | ☐ | ☐ | ☐ |
| 7.3 | Selecting a method highlights it | Tap a payment option | Radio indicator fills with tenant color; border highlights | ☐ | ☐ | ☐ |
| 7.4 | Ozow info panel appears | Select Ozow | Blue info panel with "SECURE INSTANT EFT" text is shown | ☐ | ☐ | ☐ |
| 7.5 | SnapScan QR panel appears | Select SnapScan (Swift only) | Orange info panel with phone icon is shown | ☐ | ☐ | ☐ |
| 7.6 | Pay button disabled without method | Don't select any method | "Pay" button is visually disabled and does nothing | ☐ | ☐ | ☐ |
| 7.7 | Payment processing state | Click Pay | Button changes to "Processing...", greyed out, cursor not-allowed | ☐ | ☐ | ☐ |
| 7.8 | Booking saved to localStorage | Complete payment | A new entry exists in `ETZ_BUS_BOOKINGS` with correct tenant, bus, seats, amount | ☐ | ☐ | ☐ |
| 7.9 | Redirect to confirmation | Wait for processing | Navigates to `/confirmation` with saved booking data | ☐ | ☐ | ☐ |

---

## 8. Confirmation / E-Ticket Screen

| # | Test Case | Steps | Expected Result | ZUPCO | Swift | Horizon |
|---|-----------|-------|-----------------|-------|-------|---------|
| 8.1 | Success animation plays | Observe ✅ icon | Green circle with bounce animation | ☐ | ☐ | ☐ |
| 8.2 | Booking reference shown | Check ticket header | `#ETZ-XXXXXX` reference ID displayed | ☐ | ☐ | ☐ |
| 8.3 | Operator branding on ticket | Check ticket card | Tenant logo letter and primary colour applied | ☐ | ☐ | ☐ |
| 8.4 | Route displayed | Check ticket body | "FROM → TO" route text is shown | ☐ | ☐ | ☐ |
| 8.5 | Passenger list with seats | Check dashed section | Each passenger name paired with their seat ID | ☐ | ☐ | ☐ |
| 8.6 | QR code generated | Observe QR section | QR code rendered from booking ID | ☐ | ☐ | ☐ |
| 8.7 | AI Journey Insights panel | Check blue gradient panel | Predicted ETA (~4h 15m), confidence (94%), and traffic message displayed | ☐ | ☐ | ☐ |
| 8.8 | Download PDF button | Click "📥 Download PDF Ticket" | Browser print dialog opens with ticket-only layout | ☐ | ☐ | ☐ |
| 8.9 | Return Home button | Click "Return Home" | Navigates back to `/home` | ☐ | ☐ | ☐ |

---

## 9. My Tickets / Bookings Screen

| # | Test Case | Steps | Expected Result | ZUPCO | Swift | Horizon |
|---|-----------|-------|-----------------|-------|-------|---------|
| 9.1 | Empty state shown when no bookings | Clear localStorage → navigate to `/bookings` | "No active bookings" message with 🎟️ icon and "Book a Bus" button | ☐ | ☐ | ☐ |
| 9.2 | Bookings listed after purchase | Complete a booking → navigate to `/bookings` | Booking card(s) visible with reference, route, date, seats, and CONFIRMED badge | ☐ | ☐ | ☐ |
| 9.3 | Only current tenant bookings shown | Create bookings for ZUPCO and Swift → switch to Swift | Only Swift bookings are displayed | ☐ | ☐ | ☐ |
| 9.4 | Bookings sorted newest first | Create multiple bookings | Most recent booking appears at the top | ☐ | ☐ | ☐ |
| 9.5 | "View Ticket & QR" button | Click on a booking card's button | Navigates to `/confirmation` with that booking's data, showing full ticket | ☐ | ☐ | ☐ |

---

## 10. Profile Screen

| # | Test Case | Steps | Expected Result | ZUPCO | Swift | Horizon |
|---|-----------|-------|-----------------|-------|-------|---------|
| 10.1 | Profile header shows user info | Navigate to `/profile` | Avatar initial, name, email, and "GOLD MEMBER" badge displayed | ☐ | ☐ | ☐ |
| 10.2 | Personal details pre-filled | Observe form fields | Name, email, phone, passport fields contain default or saved values | ☐ | ☐ | ☐ |
| 10.3 | Edit and save profile | Change name → click "Save Profile Details" | Toast notification "✅ Profile updated successfully!" appears for ~3 seconds | ☐ | ☐ | ☐ |
| 10.4 | Profile persists across refresh | Save profile → refresh page | Edited values are preserved from localStorage | ☐ | ☐ | ☐ |
| 10.5 | Currency dropdown shows tenant currencies | Open preferred currency select | Only currencies from `tenant.acceptedCurrencies` are listed | ☐ | ☐ | ☐ |
| 10.6 | Saved passengers listed | Observe "Saved Passengers" section | Default passengers (Anesu, Chenai) are shown | ☐ | ☐ | ☐ |
| 10.7 | Add new passenger | Click "+ Add New" → fill form → submit | New passenger card appears in the list | ☐ | ☐ | ☐ |
| 10.8 | Delete a saved passenger | Click 🗑️ on a passenger | Passenger is removed from the list | ☐ | ☐ | ☐ |
| 10.9 | AI Smart Search toggle | Toggle the checkbox | Checkbox reflects new state; persists on refresh | ☐ | ☐ | ☐ |
| 10.10 | Push Notifications toggle | Toggle the checkbox | Checkbox reflects new state; persists on refresh | ☐ | ☐ | ☐ |
| 10.11 | Support contact info is tenant-specific | Check "Need Support?" section | Phone, email, and website match the active tenant's registry values | ☐ | ☐ | ☐ |
| 10.12 | Profile data is tenant-isolated | Save profile as ZUPCO → switch to Swift | Swift has its own independent profile data | ☐ | ☐ | ☐ |

---

## 11. Bottom Navigation Bar

| # | Test Case | Steps | Expected Result | Pass/Fail |
|---|-----------|-------|-----------------|-----------|
| 11.1 | Three tabs visible | Observe bottom bar | Search (🔍), Tickets (🎟️), Profile (👤) tabs present | ☐ |
| 11.2 | Active tab highlighted | Navigate between tabs | Active tab uses tenant primary colour; inactive tabs are grey/dim | ☐ |
| 11.3 | Navigation works | Tap each tab | Navigates to `/home`, `/bookings`, `/profile` respectively | ☐ |
| 11.4 | Nav bar is fixed at bottom | Scroll page content | Bar stays pinned to the bottom of the viewport | ☐ |
| 11.5 | Nav hidden during seat selection | Select seats on Seat Map | Nav bar is replaced by the selection bottom bar | ☐ |

---

## 12. Multi-Tenancy & Branding Verification

| # | Test Case | Steps | Expected Result | Pass/Fail |
|---|-----------|-------|-----------------|-----------|
| 12.1 | ZUPCO branding | Set `VITE_TENANT_ID=zupco` → restart | Green gradient, "ZUPCO Express", "Z" logo, square shape | ☐ |
| 12.2 | Swift branding | Set `VITE_TENANT_ID=swift` → restart | Blue gradient, "Swift Coaches", "S" logo, circle shape | ☐ |
| 12.3 | Horizon branding | Set `VITE_TENANT_ID=horizon` → restart | Purple gradient, "Horizon Transit", "H" logo, diamond shape | ☐ |
| 12.4 | Invalid tenant falls back to ZUPCO | Set `VITE_TENANT_ID=unknown` → restart | App loads with ZUPCO defaults | ☐ |
| 12.5 | Missing env var falls back to ZUPCO | Remove `VITE_TENANT_ID` entirely → restart | App loads with ZUPCO defaults | ☐ |
| 12.6 | All buttons use tenant colour | Navigate through all screens | Every primary-coloured button matches `tenant.primaryColor` | ☐ |
| 12.7 | All headers use tenant gradient | Navigate through all screens | Every header uses `tenant.bgGradient` | ☐ |

---

## 13. Multi-Currency System

| # | Test Case | Steps | Expected Result | Pass/Fail |
|---|-----------|-------|-----------------|-----------|
| 13.1 | Default currency is USD | Load app fresh | Prices display with `$` symbol | ☐ |
| 13.2 | Switch to ZAR | Click ZAR on currency bar | Prices update with `R` symbol, multiplied by ~18.50 | ☐ |
| 13.3 | Switch to BWP | Click BWP on currency bar | Prices update with `P` symbol, multiplied by ~13.60 | ☐ |
| 13.4 | Currency persists across screens | Set ZAR on results → navigate to seat map | Seat map prices display in ZAR | ☐ |
| 13.5 | Payment total in active currency | Select currency → proceed to payment | Payable amount rendered in the selected currency | ☐ |

---

## 14. Admin Panel (VITE_APP_MODE=admin)

| # | Test Case | Steps | Expected Result | Pass/Fail |
|---|-----------|-------|-----------------|-----------|
| 14.1 | Admin mode activates | Set `VITE_APP_MODE=admin` → restart | App loads with admin sidebar layout instead of customer screens | ☐ |
| 14.2 | Dashboard stats displayed | Navigate to `/admin` | Stats cards show Today's Bookings, Active Buses, Total Revenue, Avg. Occupancy | ☐ |
| 14.3 | Recent Departures table | Observe dashboard | Three departure rows with route, time, status badge, and passenger count | ☐ |
| 14.4 | Cutoff control panel | Locate "Control Center" | Sliders/inputs for booking cutoff and closing-soon thresholds are interactive | ☐ |
| 14.5 | AI Revenue Optimizer | Locate dark card | AI suggestion text and "Apply Optimization" button visible | ☐ |
| 14.6 | Bookings Log page | Navigate to `/admin/bookings` | Lists all bookings from localStorage with details | ☐ |
| 14.7 | Fleet Status page | Navigate to `/admin/fleet` | Lists all buses for tenant with status (active/maintenance) | ☐ |
| 14.8 | Fleet Map page | Navigate to `/admin/map` | Map or tracking visualization renders | ☐ |
| 14.9 | Admin sidebar navigation | Click each nav item | Navigates to correct admin sub-page | ☐ |
| 14.10 | Wildcard redirect | Navigate to `/admin/nonexistent` | Redirects to `/admin` | ☐ |

---

## 15. Data Persistence & Storage

| # | Test Case | Steps | Expected Result | Pass/Fail |
|---|-----------|-------|-----------------|-----------|
| 15.1 | Bookings survive refresh | Complete a booking → refresh browser | Booking still appears in My Tickets | ☐ |
| 15.2 | Profile survives refresh | Edit profile → refresh browser | Edited values are preserved | ☐ |
| 15.3 | Saved passengers survive refresh | Add a passenger → refresh browser | New passenger still listed | ☐ |
| 15.4 | Invalid JSON handled gracefully | Manually corrupt `ETZ_BUS_BOOKINGS` in DevTools | App does not crash; returns empty bookings | ☐ |
| 15.5 | Clear bookings resets data | Call `clearBookings()` in console | `ETZ_BUS_BOOKINGS` key removed from localStorage | ☐ |
| 15.6 | Occupancy reflects bookings | Book seats for a bus → return to results | Available seats count decreases by number booked | ☐ |

---

## 16. Responsiveness & Mobile UX

| # | Test Case | Steps | Expected Result | Pass/Fail |
|---|-----------|-------|-----------------|-----------|
| 16.1 | Max width constraint | View on desktop browser | App content does not exceed 420px width | ☐ |
| 16.2 | Mobile viewport rendering | Use Chrome DevTools mobile view (375px) | All content fits without horizontal scroll | ☐ |
| 16.3 | Fixed elements don't overlap | Scroll long content pages | Bottom nav and selection bars don't overlap content | ☐ |
| 16.4 | Touch targets adequate | Test on mobile/touch simulator | All buttons and interactive elements are comfortably tappable (≥40px) | ☐ |
| 16.5 | Safe area insets respected | Test on iPhone notch simulator | Bottom nav accounts for `env(safe-area-inset-bottom)` | ☐ |

---

## 17. End-to-End Booking Flow

| # | Test Case | Steps | Expected Result | ZUPCO | Swift | Horizon |
|---|-----------|-------|-----------------|-------|-------|---------|
| 17.1 | Full happy path | Splash → Home → Search → Results → Select Seats → Passenger → Payment → Confirmation → My Tickets | Complete flow without errors; booking saved and retrievable | ☐ | ☐ | ☐ |
| 17.2 | Back navigation mid-flow | Go to Passenger screen → click back → click back | Returns through Seat Map → Results correctly | ☐ | ☐ | ☐ |
| 17.3 | Multiple bookings | Complete 3 separate bookings | All 3 appear in My Tickets, sorted newest first | ☐ | ☐ | ☐ |
| 17.4 | View past ticket QR | Open My Tickets → "View Ticket & QR" | Full e-ticket with QR code renders correctly | ☐ | ☐ | ☐ |

---

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Tester | | | |
| Product Owner | | | |
| Developer | | | |

> [!IMPORTANT]
> All tests in sections 1–10 and 17 must pass for **all three tenants** before the application can be considered accepted. Sections 11–16 are tenant-agnostic and need only a single pass.
