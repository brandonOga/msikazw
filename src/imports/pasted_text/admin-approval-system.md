Allow businesses to register, verify, and open stores.

Functions to build

✅ Seller signup page

name
email
phone
password

✅ Business verification form

business name
registration number
address
country
ID upload
business certificate upload

✅ Admin approval system

pending sellers
approve / reject
send email

✅ Seller dashboard

profile
store info
payment info
products
orders

✅ Store status

pending
approved
suspended

Result:
Seller can open store only after approval

This is how SHEIN works.

SPRINT 2 — Store Setup System

Goal: Seller creates real store page

Functions:

✅ Add store name
✅ Upload logo
✅ Add description
✅ Add address
✅ Add delivery options
✅ Add return policy
✅ Add payment method

Store page auto created:

msika.com/store/store-name

Like:

shein.com/store/brand-name

SPRINT 3 — Product Listing System (Like SHEIN / Amazon)

Functions:

✅ Add product

name
price
images
description
category
stock
variations

✅ Product approval (optional)

✅ Product status

draft
pending
live
out of stock

✅ Categories system

fashion
electronics
groceries
etc

✅ Product page auto generated

msika.com/product/123

SPRINT 4 — Buyer Account System

Functions:

✅ Buyer signup
✅ Login
✅ Profile
✅ Address book
✅ Order history
✅ Wishlist

Like Amazon / Shein

SPRINT 5 — Order System (Very Important)

This is the core.

Functions:

✅ Add to cart
✅ Checkout
✅ Select address
✅ Select delivery
✅ Select payment
✅ Place order

Order flow:

Buyer → order
System → save order
Seller → receive order
Seller → confirm
Seller → ship
Buyer → receive
Order → complete

Order status:

pending
confirmed
shipped
delivered
cancelled

Same as Shein.

SPRINT 6 — Payment System

Functions:

✅ Ecocash
✅ Card
✅ Bank
✅ Mobile money
✅ Pay later (future)

Flow:

Buyer pays → platform holds money
Seller ships → buyer confirms
Platform releases money

This prevents scams.

Like Amazon / Shein escrow.

SPRINT 7 — Delivery System

Functions:

✅ Seller delivery
✅ Courier delivery
✅ Pickup

Options:

local delivery
international delivery
pickup point

Order must have:

tracking number
delivery status

Status:

processing
shipped
in transit
delivered
SPRINT 8 — Admin Panel (Very Important)

Admin must control everything.

Functions:

✅ approve sellers
✅ remove sellers
✅ remove products
✅ see orders
✅ see payments
✅ see users
✅ see reports

Without this site will fail.

SPRINT 9 — Fees System (How Msika makes money)

Functions:

✅ Commission per order
✅ Seller subscription (future)
✅ Ads / promoted products
✅ Delivery fee
✅ withdrawal fee

Like:

Amazon
Shein
Shopify apps

SPRINT 10 — Trust System (Why people will use Msika)

Functions:

✅ seller verified badge
✅ buyer reviews
✅ product reviews
✅ refund system
✅ dispute system
✅ ban scammers

This is why people trust Amazon.

SPRINT 11 — Notifications System

Functions:

✅ email
✅ sms
✅ in-app

Notify:

order placed
order shipped
payment received
seller approved
SPRINT 12 — Prime / Membership (Future like Amazon Prime)

Later you can add:

Msika Plus

Benefits:

free delivery
discounts
faster orders
VIP sellers

This makes loyalty.

If you want next step

I can make

✅ SYSTEM FLOW DIAGRAM
(Shein → Amazon → Msika structure)

This will help when building the real website.

now give me the prompt to add the admin approval system

Here is a Figma Site / Figma Make / AI Builder prompt to generate the Admin Approval System UI for your marketplace Msika.
This prompt will create the admin dashboard section where admin approves sellers, like in SHEIN Seller Center or Amazon Admin panel.

You can paste this into Figma Make / Figma Site / Lovable / Framer / Builder / Bolt.

Prompt — Admin Approval System (Seller Verification Panel)

Create an admin dashboard interface for an ecommerce marketplace called Msika.

This screen is for the Admin Approval System where the admin reviews and approves sellers before they can open a store.

Layout style:

Modern dashboard UI
Similar to Shopify admin / Amazon seller admin / Shein seller center
Left sidebar navigation
Top header bar
Main content table
Clean, professional, fintech style
Light background
Rounded cards
Soft shadows
Responsive layout

Sidebar menu items:

Dashboard
Sellers
Pending Sellers
Products
Orders
Payments
Reports
Settings

Main page title:
Seller Approval

Subtitle:
Review and approve businesses before allowing them to sell on the platform.

Main content:
Create a table showing pending sellers.

Table columns:

Seller Name
Business Name
Country
Address
Registration Number
ID Document
Status
Actions

Each row must have buttons:

View Details
Approve
Reject
Suspend

When clicking View Details open a side panel with:

Seller details:

Full name
Business name
Email
Phone
Address
Business certificate upload
ID upload
Payment method

Buttons inside panel:
Approve Seller
Reject Seller
Request Changes

Status colors:
Pending = orange
Approved = green
Rejected = red
Suspended = gray

Extra features:
Search bar
Filter by status
Sort by date
Pagination

Style inspiration:
Amazon admin panel
Shopify dashboard
Stripe dashboard
Shein seller center

Design should look like a real working system, not a landing page.

if a client orders on shein what happend where doe the order go to seller or admin

When a client orders on SHEIN, the order does not go to admin first.
It goes into the order management system, then the seller or SHEIN warehouse processes it depending on the model.
SHEIN uses a centralized system, different from small marketplaces.

Below is the real flow used by SHEIN.

1. Customer places order on SHEIN

Buyer → adds to cart → checkout → pays

After payment:

Order goes to
✅ SHEIN Order System
(not directly to admin)

System decides:

Which warehouse
Which seller
Which shipping method
2. Where the order goes next (depends on seller type)

SHEIN has 2 models:

Model 1 — SHEIN owns the stock (most common)

Order goes to:

SHEIN warehouse → not seller

Flow:

Buyer → SHEIN → Warehouse → Shipping → Buyer

Seller never touches order.

This is why SHEIN is fast.

Model 2 — Marketplace seller (new model)

If product belongs to a seller:

Order goes to:

SHEIN system → Seller dashboard

Seller sees:

New order
Customer address
Product
Shipping deadline

Seller must:

confirm order
pack
ship
add tracking

Admin only monitors.

3. What Admin does in SHEIN

Admin does NOT process every order.

Admin controls:

approve sellers
remove bad sellers
handle disputes
control payments
control refunds
monitor orders

Admin only steps in if problem.

Same as Amazon.

4. Real Order Flow in SHEIN Marketplace

Flow:

Buyer places order
→ system saves order
→ seller gets order
→ seller ships
→ tracking added
→ buyer receives
→ payment released

Admin only watches.

5. How YOU should do it for Msika (Recommended)

Use this flow:

Buyer → Order
→ System saves
→ Seller gets order
→ Seller confirms
→ Seller ships
→ Buyer receives
→ Admin monitors
→ Payment released

NOT

Buyer → Admin → Seller ❌ (too slow)

6. Correct architecture for Msika

Order goes to:

✅ Database
✅ Seller dashboard
✅ Admin dashboard (view only)

Not admin first.

7. If you want next step

I can give you

✅ Full Order Flow Diagram for Msika
like Amazon / Shein system

This helps when building real backend.