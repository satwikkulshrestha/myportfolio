require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Determine environment
const isKubernetes = process.env.KUBERNETES_SERVICE_HOST !== undefined;
console.log('Running in environment:', isKubernetes ? 'Kubernetes' : 'Local');

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'mysql',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '1234',
  database: process.env.MYSQL_DATABASE || 'portfolio',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create contacts table if it doesn't exist
async function initializeDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Connected to MySQL server');
    
    // Create database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS portfolio');
    await connection.query('USE portfolio');
    
    // Create table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255),
        contactNo VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        city VARCHAR(255),
        country VARCHAR(255),
        dateOfBirth DATE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database and table initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Initialize database on startup
initializeDatabase().catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});

// Contact form submission endpoint
app.post('/api/contact', async (req, res) => {
  let connection;
  try {
    console.log('=== New Contact Form Submission ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { firstName, lastName, contactNo, email, message, city, country, dateOfBirth } = req.body;
    
    // Format the date to YYYY-MM-DD if it exists
    const formattedDate = dateOfBirth ? dateOfBirth.split('T')[0] : null;
    
    console.log('Attempting to get database connection...');
    connection = await pool.getConnection();
    console.log('Database connection established');
    
    console.log('Executing INSERT query...');
    const [result] = await connection.query(
      'INSERT INTO contacts (firstName, lastName, contactNo, email, message, city, country, dateOfBirth) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [firstName, lastName, contactNo, email, message, city, country, formattedDate]
    );
    console.log('INSERT query executed successfully, result:', result);

    res.status(201).json({ 
      success: true, 
      message: 'Contact form submitted successfully',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error saving contact form:', error);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error sqlMessage:', error.sqlMessage);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving contact form data',
      error: error.message 
    });
  } finally {
    if (connection) {
      console.log('Releasing database connection...');
      connection.release();
    }
  }
});

// Get all contact form submissions
app.get('/api/submissions', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM contacts ORDER BY createdAt DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching submissions',
      error: error.message 
    });
  } finally {
    if (connection) connection.release();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 