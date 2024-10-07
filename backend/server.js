const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 5001;

// const corsOptions = {
//   origin: ['https://ecommclothingshop.netlify.app', 'http://localhost:3000'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,
//   optionsSuccessStatus: 200
// };

// app.use(cors(corsOptions));
// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'https://ecommclothingshop.netlify.app'],
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// User model
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema);

// Category model
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

const Category = mongoose.model('Category', CategorySchema);

// Product model
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String, required: true }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
});

const Product = mongoose.model('Product', ProductSchema);

// Order model
const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  shippingDetails: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true }
  },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', OrderSchema);

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads/'))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // console.log('Authorization header:', authHeader);
  // console.log('Extracted token:', token);

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Token verification error:', err);
      return res.status(403).json({ error: 'Failed to authenticate token' });
    }
    req.user = decoded;
    next();
  });
};

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error registering user' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    // console.log('Token created with secret:', process.env.JWT_SECRET); 
    res.json({ token, isAdmin: user.isAdmin });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});

app.post('/api/create-admin', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = new User({ email, password: hashedPassword, isAdmin: true });
    await adminUser.save();
    res.status(201).json({ message: 'Admin user created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error creating admin user' });
  }
});

// Product routes
app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // console.log('Query:', query);
    const products = await Product.find(query).populate('category');
    const productsWithFullImageUrls = products.map(product => {
      const fullImageUrls = product.images.map(image => {
        if (image.startsWith('http://localhost:5001')) {
          return image;
        } else {
          return `http://localhost:5001${image}`;
        }
      });
      // console.log('Product images:', fullImageUrls);
      return {
        ...product.toObject(),
        images: fullImageUrls
      };
    });
    res.json(productsWithFullImageUrls);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products', details: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching product' });
  }
});

app.post('/api/products', verifyToken, async (req, res) => {
  try {
    // console.log('Received product data:', req.body);
    const { name, description, price, images, category } = req.body;

    // Validate required fields
    if (!name || !description || !price || !images || images.length === 0 || !category) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate price is a number
    if (isNaN(price)) {
      return res.status(400).json({ error: 'Price must be a number' });
    }

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Error creating product', details: error.message });
  }
});

app.put('/api/products/:id', verifyToken, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error updating product' });
  }
});

app.delete('/api/products/:id', verifyToken, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting product' });
  }
});

// User profile route
app.get('/api/user/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Error fetching user profile' });
  }
});

app.get('/api/user/email', verifyToken, async (req, res) => {
  // console.log('Received request for user email');
  try {
    // console.log('User ID from token:', req.user.userId);
    const user = await User.findById(req.user.userId);
    if (!user) {
      // console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    // console.log('Sending email:', user.email);
    res.json({ email: user.email });
  } catch (error) {
    console.error('Error in /api/user/email:', error);
    res.status(500).json({ error: 'Error fetching user email' });
  }
});

app.get('/api/user/orders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Error fetching user orders' });
  }
});

// Update email route
app.put('/api/user/update-email', verifyToken, async (req, res) => {
  try {
    const { newEmail } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check if the new email is the same as the current email
    if (newEmail === user.email) {
      return res.status(400).json({ error: 'New email is the same as the current email' });
    }

    // Check if the new email is already in use by another user
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use' });
    }

    user.email = newEmail;
    await user.save();

    res.json({ message: 'Email updated successfully' });
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({ error: 'Error updating email' });
  }
});

// Update password route
app.put('/api/user/update-password', verifyToken, async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check if new password is same as old password
    const isMatch = await bcrypt.compare(newPassword, user.password);
    if (isMatch) {
      return res.status(400).json({ error: 'New password must be different from the current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Error updating password' });
  }
});

// transporter using SMTP
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  debug: true,
  logger: true
});

// Contact form route
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.CONTACT_EMAIL,
    subject: `New contact form submission from ${name}`,
    text: `
      Name: ${name}
      Email: ${email}
      Message: ${message}
    `
  };

  try {
    // console.log('Attempting to send email...');
    const info = await transporter.sendMail(mailOptions);
    // console.log('Message sent: %s', info.messageId);
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send message', details: error.message });
  }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

// Create a new category 
app.post('/api/categories', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Error creating category' });
  }
});

// route to handle image uploads
app.post('/api/upload', verifyToken, upload.single('image'), (req, res) => {
  // console.log('Received upload request');
  // console.log('Request file:', req.file);
  if (!req.file) {
    // console.log('No file received');
    return res.status(400).send('No file uploaded.');
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  // console.log('Image URL:', imageUrl);
  res.send({ imageUrl });
});

// Create order route
app.post('/api/orders', verifyToken, async (req, res) => {
  try {
    const { items, totalAmount, shippingDetails, paymentReference } = req.body;
    // console.log('Received order data:', { items, totalAmount, shippingDetails, paymentReference });

    const order = new Order({
      user: req.user.userId,
      items,
      totalAmount,
      shippingDetails,
      paymentReference
    });
    await order.save();

    // Send confirmation email to the customer
    const user = await User.findById(req.user.userId);
    const customerMailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Order Confirmation',
      text: `Your order #${order._id} has been received and is being processed. Total amount: $${totalAmount}. Payment Reference: ${paymentReference}`
    };

    transporter.sendMail(customerMailOptions, (error, info) => {
      if (error) {
        // console.log('Error sending customer email:', error);
      } else {
        // console.log('Customer email sent:', info.response);
      }
    });

    // Send notification email to the admin
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Order Received',
      text: `A new order #${order._id} has been received. Total amount: $${totalAmount}. Payment Reference: ${paymentReference}`
    };

    transporter.sendMail(adminMailOptions, (error, info) => {
      if (error) {
        // console.log('Error sending admin email:', error);
      } else {
        // console.log('Admin email sent:', info.response);
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Error creating order', details: error.message });
  }
});

// Get orders for admin
app.get('/api/orders', verifyToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const orders = await Order.find().populate('user', 'email').populate('items.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

app.patch('/api/orders/:id', verifyToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Error updating order status', details: error.message });
  }
});

// Get a specific order
app.get('/api/orders/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'email')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if the order belongs to the current user or if the user is an admin
    if (order.user._id.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Error fetching order' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});