# Setup Instructions for Local Development

## Environment Configuration

### 1. Firebase Configuration

The Firebase configuration file is not included in the repository for security reasons.

**To set up Firebase locally:**

1. Copy the example file:

   ```bash
   cp config/firebase.config.example.js config/firebase.js
   ```

2. Get your Firebase credentials from [Firebase Console](https://console.firebase.google.com/)

3. Edit `config/firebase.js` and replace the placeholder values with your actual Firebase configuration:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
     measurementId: "YOUR_MEASUREMENT_ID",
   };
   ```

### 2. Environment Variables

The `.env` file is not included in the repository for security reasons.

**To set up environment variables locally:**

1. Copy the example file:

   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` as needed for your development environment:
   ```
   REACT_APP_API_URL=http://localhost:8080
   ```

## Installation & Running

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Important Notes

- **Never commit `config/firebase.js` or `.env` files** - they contain sensitive credentials
- These files are automatically ignored by Git (.gitignore)
- Always use the `.example` files as templates for configuration
- If you accidentally commit sensitive files, immediately rotate your credentials in Firebase Console
