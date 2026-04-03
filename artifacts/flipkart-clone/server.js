const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Email configuration - Using Gmail SMTP
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'anandjhare4@gmail.com', // Your email
    pass: 'your-app-password' // Use app password for Gmail
  }
});

// Test email configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// API Routes

// Send registration email with contact details
app.post('/api/send-registration-email', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    const mailOptions = {
      from: 'anandjhare4@gmail.com',
      to: 'anandjhare4@gmail.com',
      subject: 'New User Registration - Flipkart Clone',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2874f0;">New User Registration Details</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Contact Information:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50;">
            <p style="margin: 0; color: #2e7d32;">✅ New user has successfully registered on your Flipkart Clone</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Registration email sent successfully' });
  } catch (error) {
    console.error('Error sending registration email:', error);
    res.status(500).json({ success: false, message: 'Failed to send registration email' });
  }
});

// Send payment details email
app.post('/api/send-payment-email', async (req, res) => {
  try {
    const { orderDetails, paymentMethod, amount, customerInfo } = req.body;
    
    const mailOptions = {
      from: 'anandjhare4@gmail.com',
      to: 'anandjhare4@gmail.com',
      subject: `Payment Received - Order #${orderDetails.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2874f0;">Payment Confirmation</h2>
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #4caf50; margin: 20px 0;">
            <p style="margin: 0; color: #2e7d32;">✅ Payment of ₹${amount} received successfully</p>
          </div>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Order Details:</h3>
            <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
            <p><strong>Amount:</strong> ₹${amount}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p><strong>Payment Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Customer Information:</h3>
            <p><strong>Name:</strong> ${customerInfo.name}</p>
            <p><strong>Phone:</strong> ${customerInfo.phone}</p>
            <p><strong>Email:</strong> ${customerInfo.email || 'N/A'}</p>
            <p><strong>Delivery Address:</strong> ${customerInfo.address}</p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;">📦 Order is now being processed for delivery</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Payment email sent successfully' });
  } catch (error) {
    console.error('Error sending payment email:', error);
    res.status(500).json({ success: false, message: 'Failed to send payment email' });
  }
});

// Send OTP email
app.post('/api/send-otp', async (req, res) => {
  try {
    const { phone, email, purpose } = req.body;
    
    // Generate OTP
    const otp = generateOTP();
    const otpKey = `${phone || email}-${purpose}`;
    
    // Store OTP with 5 minutes expiry
    otpStore.set(otpKey, {
      otp,
      expiry: Date.now() + 5 * 60 * 1000, // 5 minutes
      phone,
      email
    });
    
    const mailOptions = {
      from: 'anandjhare4@gmail.com',
      to: 'anandjhare4@gmail.com',
      subject: `OTP Generated - ${purpose}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2874f0;">OTP Verification</h2>
          
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #1976d2; margin: 0 0 10px 0;">Your OTP Code</h3>
            <div style="font-size: 32px; font-weight: bold; color: #2874f0; letter-spacing: 5px; background: white; padding: 15px; border-radius: 8px; display: inline-block;">
              ${otp}
            </div>
            <p style="margin: 15px 0 0 0; color: #666;">This OTP is valid for 5 minutes</p>
          </div>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Verification Details:</h3>
            <p><strong>Purpose:</strong> ${purpose}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <p><strong>Email:</strong> ${email || 'N/A'}</p>
            <p><strong>Generated Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Expires At:</strong> ${new Date(Date.now() + 5 * 60 * 1000).toLocaleString()}</p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;">⚠️ Please use this OTP to complete the ${purpose} process</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      otpForTesting: otp // Include OTP in response for testing
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// Verify OTP
app.post('/api/verify-otp', (req, res) => {
  try {
    const { phone, email, otp, purpose } = req.body;
    const otpKey = `${phone || email}-${purpose}`;
    
    const storedData = otpStore.get(otpKey);
    
    if (!storedData) {
      return res.json({ success: false, message: 'OTP not found or expired' });
    }
    
    if (Date.now() > storedData.expiry) {
      otpStore.delete(otpKey);
      return res.json({ success: false, message: 'OTP expired' });
    }
    
    if (storedData.otp !== otp) {
      return res.json({ success: false, message: 'Invalid OTP' });
    }
    
    // OTP is valid, remove it
    otpStore.delete(otpKey);
    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
});

// Serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Email service configured for anandjhare4@gmail.com`);
});
