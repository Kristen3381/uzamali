# UzaMali Frontend

This is the React-based frontend for UzaMali, an agricultural surplus e-commerce platform.

## Tech Stack
- React.js (Vite)
- React Router (Navigation)
- Tailwind CSS (Styling)
- Lucide React (Icons)
- Recharts (Analytics)
- Framer Motion (Animations)

## Getting Started

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## User Roles for Testing
You can test different user roles by using specific email hints in the login page:
- **Farmer**: Use an email containing "farmer" (e.g., `farmer@uzamali.com`)
- **Courier**: Use an email containing "courier" (e.g., `courier@uzamali.com`)
- **Admin**: Use an email containing "admin" (e.g., `admin@uzamali.com`)
- **Buyer**: Any other email (e.g., `buyer@uzamali.com`)

## Features Implemented
- **Farmer**: Dashboard with stats, "Add New Product" form with image upload placeholder.
- **Buyer**: "Produce Market" with category filters and search, "Cart" with M-Pesa checkout placeholder, "Order History".
- **Courier**: Dashboard with "Available" and "Active" delivery jobs, responsive mobile view with bottom navigation.
- **Admin**: Analytics dashboard with sales and category charts.
- **Shared**: "Market Pricing Tool" to estimate crop prices based on trends.
