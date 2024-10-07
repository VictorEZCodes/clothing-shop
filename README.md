# Clothing Shop E-Commerce Platform

## Project Overview

This project is a full-stack e-commerce platform for a clothing shop. It features a React-based frontend and a Node.js/Express backend, with MongoDB as the database. The application allows users to browse products, add items to their cart, place orders, and includes an admin panel for managing products and orders.

## Key Features

- User authentication (signup, login, logout)
- Product browsing with category filtering and search functionality
- Shopping cart management
- Secure checkout process
- Order tracking for customers
- Admin panel for product and order management
- Contact form for customer inquiries

## Technology Stack

- Frontend: React.js, React Router, Framer Motion for animations
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose ORM
- Authentication: JSON Web Tokens (JWT)
- File Upload: Multer
- Email Service: Nodemailer with Gmail SMTP
- State Management: React Context API
- Styling: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/VictorEZCodes/clothing-shop.git
   cd clothing-shop
   ```

2. Install dependencies for both frontend and backend:

   ```
   npm install
   cd backend
   npm install
   ```

3. Create a `.env` file in the root directory and add the following variables:

   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   ADMIN_EMAIL=admin@example.com
   ```

4. Start the backend server:

   ```
   cd backend
   npm start
   ```

5. In a new terminal, start the frontend development server:

   ```
   cd ..
   npm start
   ```

6. Open your browser and navigate to `http://localhost:3000`

## Project Structure

- `/src`: React frontend code
- `/backend`: Node.js/Express backend code
- `/public`: Static assets

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
