# Rihan-Collection E-Commerce & Delivery Platform

![Rihan-Collection Logo](https://via.placeholder.com/150x50?text=RamlaWeb)

## 1 Project Overview

**Rihan-Collection** is a modern e-commerce platform designed specifically for **women’s products**, combining a beautiful shopping experience with **full logistics and delivery management**.  
It includes **product management, user authentication, admin analytics, rider assignment, SLA enforcement, and audit trail**.

The system is built using:

- **Frontend:** React, TailwindCSS, Recharts, React Icons  
- **Backend:** Node.js, Express.js, MongoDB, Mongoose  
- **Authentication & Authorization:** JWT, role-based access control  
- **Deployment-ready:** Environment variables, Cloudinary integration, and Vercel/Heroku-ready  

---

## 2  Features

###  Shop & Products
- Browse products with gallery and variant selection
- Stock tracking and SKU management
- Add to cart, view cart totals
- Checkout with delivery selection (home/pickup)
- Automatic order creation

###  Authentication & Users
- Login/Register with JWT
- Role-based access (Admin / Rider / User)
- Password hashing and secure authentication

###  Orders & Delivery
- Full order lifecycle: pending → paid → out_for_delivery → delivered / cancelled / refunded
- Auto-assign riders with **fair load balancing**
- SLA enforcement: riders have **2 minutes** to accept orders
- Auto-reassign if SLA is missed
- Rider dashboard for accept/reject/delivered actions
- Rider notifications and SLA countdown

###  Admin Dashboard
- KPIs: revenue, order count, conversion, rider load, delivery time
- Charts: weekly revenue, orders by status, rider assignments
- Audit trail: order actions, refunds, notifications
- Manage products, orders, users
- Status update and refund handling

###  Notifications
- SMS/WhatsApp notifications per order/delivery
- Audit logs for compliance and traceability

---

## 3 Architecture



React Frontend -> Tailwind + Recharts + Axios
|
v
Express API -> REST endpoints (products, orders, users, admin, rider)
|
v
MongoDB + Mongoose -> Order, Product, User, Rider models
|
v
Cloudinary -> Product image storage


### Core Backend Concepts
- **Middleware:** `protect`, `adminOnly`, role-based guards
- **Utilities:** `assignRider`, `orderStatusFlow`
- **Jobs:** `riderAutoTimeout` (SLA enforcement)
- **Controllers:** Orders, Users, Products, Auth, Admin
- **Environment Variables:**
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_url
JWT_SECRET=supersecretkey
CLOUDINARY_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
CLIENT_URL=http://localhost:5173

4 Setup & Installation
Prerequisites

Node.js >= 18

MongoDB Atlas or local MongoDB instance

Cloudinary account for image uploads

Backend Setup
cd server
npm install
cp .env.example .env
# edit .env with your credentials
npm run dev

Frontend Setup
cd client
npm install
npm run dev


Frontend runs on http://localhost:5173
Backend runs on http://localhost:5000

5 API Overview
Endpoint	Method	Description	Auth
/api/auth/register	POST	Register new user	No
/api/auth/login	POST	Login	No
/api/products	GET	Fetch all products	Public
/api/orders	POST	Create order	User
/api/orders/:id/pay	PUT	Mark order paid	User
/api/orders/:id/status	PUT	Update order status	Admin
/api/rider/orders	GET	Rider assigned orders	Rider
/api/rider/orders/:id/accept	PUT	Accept order	Rider
/api/rider/orders/:id/reject	PUT	Reject order	Rider
/api/rider/orders/:id/delivered	PUT	Mark delivered	Rider
/api/admin	GET	Admin dashboard metrics	Admin
6 Project Roadmap
Short-Term Goals

Live updates with WebSockets

Push notifications for riders

Improved UI/UX for shop & checkout

Automated audit logging for all actions

Medium-Term Goals

Multi-vendor support

Commission system for sellers

Dynamic pricing & promotions

Rider GPS tracking

Long-Term Goals

AI-based rider assignment and SLA prediction

Heatmap analytics for demand forecasting

Scalable enterprise-ready architecture

SaaS-ready deployment for multiple clients

7 Coding Standards & Best Practices

ES Modules (import/export)

Role-based authorization

Separation of concerns: controllers, routes, utils, models, jobs

Full audit trail and logging

Environment-configured, production-ready

8 Contributors

Lead Developer: Jaykali / Senior Engineer

Frontend: React + Tailwind integration

Backend: Node.js + Express + MongoDB

Design: Ladies-first UI approach (colors, animation, usability)

9 Notes for Deployment

Use NODE_ENV=production in .env

Configure CORS CLIENT_URL to your frontend domain

Ensure MongoDB Atlas cluster allows connection from backend

Use Cloudinary for image uploads in production

🔥 License

This project is proprietary. Redistribution is not allowed without permission.

Enjoy building a modern e-commerce & delivery platform for women’s products! 🌸🚚💻