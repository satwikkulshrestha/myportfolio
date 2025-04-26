const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// // Root endpoint
// app.get('/', (req, res) => {
//   res.json({ message: 'Welcome to the Contact Form API' });
// });

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Store submissions in memory
const submissions = [];

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { firstName, lastName, email, contactNo, message, city, country, dateOfBirth } = req.body;

    // Validate required fields
    if (!firstName || !email || !contactNo || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create a submission object with timestamp
    const newSubmission = {
      id: Date.now(), // unique ID based on timestamp
      firstName,
      lastName,
      email,
      contactNo,
      message,
      city,
      country,
      dateOfBirth,
      submittedAt: new Date()
    };

    // Store the submission
    submissions.push(newSubmission);

    res.status(200).json({ 
      message: 'Form submitted successfully',
      submission: newSubmission 
    });
  } catch (error) {
    console.error('Error processing form submission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new GET endpoint to view all submissions
app.get('/api/submissions', (req, res) => {
  res.json(submissions);
});

// Add a GET endpoint to view a specific submission
app.get('/api/submissions/:id', (req, res) => {
  const submission = submissions.find(s => s.id === parseInt(req.params.id));
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }
  res.json(submission);
});

// Add this new endpoint to clear all submissions
app.delete('/api/submissions/clear', (req, res) => {
  const count = submissions.length;  // Store count before clearing
  submissions.length = 0;  // Clear the array
  res.json({ 
    message: `Successfully cleared ${count} submissions`,
    clearedCount: count
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 