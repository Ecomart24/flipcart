# Email Service Setup for Flipkart Clone

This setup enables receiving contact details, payment details, and OTP codes at your email address `anandjhare4@gmail.com` for testing purposes.

## Features Implemented

✅ **Registration Emails** - Receive contact details when users sign up  
✅ **Payment Confirmation Emails** - Receive payment details and order information  
✅ **OTP Emails** - Receive OTP codes for payment verification  

## Setup Instructions

### 1. Gmail App Password

Since Gmail requires app-specific passwords for third-party apps:

1. Go to [Google Account settings](https://myaccount.google.com/)
2. Enable 2-factor authentication if not already enabled
3. Go to Security → App passwords
4. Generate a new app password for "Mail" on "Windows Computer"
5. Copy the 16-character password

### 2. Configure Email Service

Edit `server.js` and replace the placeholder:

```javascript
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'anandjhare4@gmail.com', // Your email
    pass: 'your-app-password' // Replace with your Gmail app password
  }
});
```

### 3. Install Dependencies

```bash
cd artifacts/flipkart-clone
npm install
```

### 4. Start the Email Server

```bash
npm run server
```

The email server will run on port 3001.

### 5. Start the Frontend (in separate terminal)

```bash
npm run dev
```

## Testing the Email Functionality

### Registration Test
1. Go to the login page
2. Click "New User? Sign Up"
3. Fill in email and phone number
4. Click "Create Account"
5. Check `anandjhare4@gmail.com` for registration email

### Payment Test
1. Add items to cart and proceed to checkout
2. Fill in delivery address
3. Select payment method (Card, UPI, etc.)
4. Complete payment process
5. Check `anandjhare4@gmail.com` for payment confirmation

### OTP Test
1. During payment, you'll reach the OTP verification screen
2. The OTP is automatically sent to `anandjhare4@gmail.com`
3. Check console for the OTP code (for testing convenience)
4. Enter the OTP to complete payment

## Email Contents

### Registration Email Includes:
- User name, email, phone number
- Registration timestamp
- Success confirmation

### Payment Email Includes:
- Order ID and amount
- Payment method used
- Customer details and delivery address
- Payment confirmation

### OTP Email Includes:
- 6-digit OTP code
- Purpose of verification
- Expiry time (5 minutes)
- Customer phone/email

## API Endpoints

- `POST /api/send-registration-email` - Send registration details
- `POST /api/send-payment-email` - Send payment confirmation
- `POST /api/send-otp` - Generate and send OTP
- `POST /api/verify-otp` - Verify OTP code

## Security Notes

- OTP codes expire after 5 minutes
- All emails are sent to `anandjhare4@gmail.com` for testing
- In production, emails would go to actual customer addresses
- Gmail app password should be kept secure

## Troubleshooting

If emails don't send:
1. Check Gmail app password is correct
2. Ensure Gmail 2FA is enabled
3. Verify server is running on port 3001
4. Check console for error messages

## Development Notes

- Email server runs independently from the frontend
- Frontend makes HTTP requests to localhost:3001
- OTP codes are also logged to console for easier testing
- All email templates use responsive HTML formatting
