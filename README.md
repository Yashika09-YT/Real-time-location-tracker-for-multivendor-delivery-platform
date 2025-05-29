# Real-Time Location Tracker for Multivendor Delivery Platform

This project implements a real-time location tracking system similar to Rapido or Dunzo for a multivendor marketplace. Vendors can assign delivery partners to orders, and users (customers) can track the rider's live location.

## Tech Stack

*   **Frontend:** Next.js, TypeScript, React, Leaflet.js, Socket.IO Client
*   **Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose), Socket.IO
*   **Authentication:** JWT (JSON Web Tokens)
*   **Database:** MongoDB

## Features

### Vendor
*   Signup and Login.
*   View a list of their orders.
*   Assign an available delivery partner to an order.
*   (Implicitly) See delivery status/location updates via Socket.IO (can be extended).

### Delivery Partner
*   Signup and Login.
*   View their assigned order.
*   "Start Delivery" button to begin real-time location tracking.
*   Simulate live location updates (using browser geolocation if permitted, or a timer-based simulation).

### Customer
*   Track an assigned delivery partner in real-time on a map (Leaflet.js).
*   Map auto-updates every 2-3 seconds with the new location.

### General
*   **Real-time Updates:** WebSockets (Socket.IO) for pushing location updates.
*   **Authentication:** JWT for vendors and delivery partners.
*   **Multitenancy:** Each vendor only sees their orders.

## Architecture

### Backend
*   **Framework:** Express.js with TypeScript.
*   **Database:** MongoDB with Mongoose ODM for data modeling (Users, Orders).
*   **Authentication:** JWTs are issued upon login and validated for protected routes using middleware.
*   **API Routes:**
    *   `/api/auth`: User signup and login (vendors, delivery partners).
    *   `/api/orders`: Create orders (vendor), list orders (vendor-specific, delivery partner-specific), assign delivery partner to order (vendor).
    *   `/api/location`: Update delivery partner location.
*   **Real-time Communication:** Socket.IO server handles:
    *   Connection from clients (delivery partners, customers).
    *   Delivery partners emit `updateLocation` events.
    *   Server broadcasts `locationUpdated` events to relevant clients (customers tracking a specific order, potentially vendors).
    *   Orders are used as "rooms" for targeted updates.

### Frontend
*   **Framework:** Next.js (App Router) with TypeScript.
*   **State Management:** React Context API for authentication state.
*   **UI Components:**
    *   Vendor Dashboard: Lists orders, allows assignment.
    *   Delivery Partner Dashboard: Shows assigned order, button to start delivery & send location updates.
    *   Customer Tracking Page: Displays Leaflet map with real-time marker.
*   **API Interaction:** Uses `fetch` or a library like `axios` to communicate with the backend REST APIs.
*   **Real-time Communication:** Socket.IO client connects to the backend server.
    *   Delivery partners emit location updates.
    *   Customer tracking page listens for location updates for a specific order and updates the map.

### Data Flow for Location Tracking
1.  **Delivery Partner (DP) starts delivery:**
    *   DP clicks "Start Delivery" on their dashboard.
    *   Frontend sends an API request to mark the order as "in_transit".
    *   Frontend starts watching geolocation (or simulates) and periodically sends `updateLocation` (lat, lng, orderId) events via Socket.IO to the backend.
2.  **Backend processes location update:**
    *   Socket.IO server receives `updateLocation`.
    *   Backend updates the DP's current location in the `User` model and/or the `Order` model's `currentLocation` field.
    *   Backend emits a `locationUpdated` event (with lat, lng) to the Socket.IO room corresponding to `orderId`.
3.  **Customer/Vendor sees updated location:**
    *   Customer's tracking page (and potentially vendor's dashboard) is subscribed to the `order_ORDER_ID` Socket.IO room.
    *   Upon receiving `locationUpdated`, the frontend updates the marker on the map.

### Prerequisites
*   Node.js (v18.x or later recommended)
*   npm or yarn or pnpm
*   MongoDB server running (e.g., locally or a cloud instance like MongoDB Atlas)

### Backend Setup
1.  Navigate to the `backend` directory: `cd backend`
2.  Install dependencies: `npm install` (or `yarn install` / `pnpm install`)
3.  Create a `.env` file by copying `.env.example`: `cp .env.example .env`
4.  Update the `.env` file with your configuration:
    *   `PORT`: Port for the backend server (e.g., 5001)
    *   `MONGO_URI`: Your MongoDB connection string
    *   `JWT_SECRET`: A secret string for JWT signing
    *   `CORS_ORIGIN`: Frontend URL (e.g., http://localhost:3000)
5.  Compile TypeScript (if not using a watcher like `ts-node-dev`): `npm run build`
6.  Start the server: `npm run dev` (for development with `ts-node-dev`) or `npm start` (for production after build).

### Frontend Setup
1.  Navigate to the `frontend` directory: `cd frontend`
2.  Install dependencies: `npm install` (or `yarn install` / `pnpm install`)
3.  Create a `.env.local` file by copying `.env.local.example`: `cp .env.local.example .env.local`
4.  Update the `.env.local` file with your configuration:
    *   `NEXT_PUBLIC_API_URL`: Backend API URL (e.g., http://localhost:5001/api)
    *   `NEXT_PUBLIC_SOCKET_URL`: Backend Socket.IO URL (e.g., http://localhost:5001)
5.  Start the development server: `npm run dev`
6.  Open your browser and go to `http://localhost:3000`.

## API Endpoints (Backend - prefixed with `/api`)

*   `POST /auth/vendor/signup`
*   `POST /auth/vendor/login`
*   `POST /auth/delivery/signup`
*   `POST /auth/delivery/login`
*   `GET /auth/me` (get current user info)
*   `POST /orders` (Vendor: create order)
*   `GET /orders/vendor` (Vendor: get their orders)
*   `GET /orders/delivery` (Delivery Partner: get assigned order)
*   `PUT /orders/:orderId/assign` (Vendor: assign delivery partner)
*   `PUT /orders/:orderId/start` (Delivery Partner: start delivery)
*   `GET /orders/:orderId/track` (Customer: get order details for tracking)
*   `POST /location/update` (Delivery Partner: update current location, associated with their active order implicitly or explicitly) - *This is handled by Socket.IO primarily for real-time, but an API endpoint can also exist.*

## Socket.IO Events

### Client Emits
*   `joinOrderRoom` (payload: `{ orderId: string }`): Client (customer, vendor) joins a room to receive updates for a specific order.
*   `updateLocation` (payload: `{ orderId: string, lat: number, lng: number }`): Delivery partner sends their new location.
*   `startDelivery` (payload: `{ orderId: string }`): Delivery partner signals start of delivery.

### Server Emits
*   `locationUpdated` (payload: `{ orderId: string, lat: number, lng: number }`): Broadcasts to the order-specific room when a delivery partner's location is updated.
*   `orderStatusChanged` (payload: `{ orderId: string, status: string }`): Broadcasts to the order-specific room when order status changes (e.g., "in_transit").
*   `error` (payload: `{ message: string }`): Emits error messages.
