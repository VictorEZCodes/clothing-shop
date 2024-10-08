# E-Commerce Clothing Shop Backend

This is the backend server for an e-commerce clothing shop application. It provides API endpoints for user authentication, product management, order processing, and more.

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT) for authentication
- bcryptjs for password hashing
- Multer for file uploads
- Nodemailer for sending emails

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file in the parent directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   CONTACT_EMAIL=email_to_receive_contact_form_submissions
   ```
4. Start the server: `node server.js`

## API Endpoints

### Authentication

- POST `/api/register`: Register a new user
- POST `/api/login`: Login a user
- POST `/api/create-admin`: Create an admin user

### User Management

- GET `/api/user/email`: Get the email of the logged-in user
- PUT `/api/user/update-email`: Update user's email
- PUT `/api/user/update-password`: Update user's password

### Products

- GET `/api/products`: Get all products (with optional category and search filters)
- GET `/api/products/:id`: Get a specific product
- POST `/api/products`: Create a new product (admin only)
- PUT `/api/products/:id`: Update a product (admin only)
- DELETE `/api/products/:id`: Delete a product (admin only)

### Categories

- GET `/api/categories`: Get all categories
- POST `/api/categories`: Create a new category (admin only)

### Orders

- POST `/api/orders`: Create a new order
- GET `/api/user/orders`: Get orders for the logged-in user
- GET `/api/orders`: Get all orders (admin only)
- GET `/api/orders/:id`: Get a specific order
- PATCH `/api/orders/:id`: Update order status (admin only)

### File Upload

- POST `/api/upload`: Upload an image

### Contact Form

- POST `/api/contact`: Submit a contact form

## Authentication

Most endpoints require a valid JWT token in the Authorization header: Authorization: Bearer <your_token_here>

## File Structure

- `server.js`: Main server file
- `uploads/`: Directory for uploaded files

## Error Handling

The server includes error handling for various scenarios, including invalid credentials, unauthorized access, and server errors. Detailed error messages are logged to the console for debugging purposes.

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.
