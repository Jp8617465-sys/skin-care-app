# SkinCare Tracker

A React Native mobile app for managing your skincare routine, tracking products, and monitoring skin progress over time.

## Features

- **User Authentication** - Secure login/signup with Firebase
- **Product Catalog** - Track skincare products, ingredients, and usage patterns
- **Routine Builder** - Create and manage AM/PM skincare routines
- **Progress Tracker** - Log skin condition with photos and notes
- **Offline Support** - Works offline with local data caching

## Tech Stack

- React Native with Expo
- TypeScript
- Firebase (Authentication, Firestore, Storage)
- React Navigation
- React Native Paper (UI)
- AsyncStorage (local caching)

## Prerequisites

- Node.js 18+ installed
- Expo Go app on your iOS/Android device (for testing)
- Firebase account (for backend services)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Create a Firestore Database
5. Enable Storage
6. Copy your Firebase config values

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Then update `.env` with your Firebase credentials:

```
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_auth_domain_here
FIREBASE_PROJECT_ID=your_project_id_here
FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
FIREBASE_APP_ID=your_app_id_here
```

### 4. Run the App

Start the development server:

```bash
npm start
```

Then:
- **iOS**: Scan the QR code with your Camera app
- **Android**: Scan the QR code with the Expo Go app

Or run on a simulator:

```bash
npm run ios    # iOS simulator (macOS only)
npm run android # Android emulator
```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── screens/          # Screen components
│   ├── auth/         # Authentication screens
│   ├── home/         # Home dashboard
│   ├── products/     # Product management
│   ├── routines/     # Routine builder
│   ├── progress/     # Progress tracking
│   └── profile/      # User profile
├── navigation/       # Navigation configuration
├── services/         # Firebase & storage services
├── contexts/         # React Context providers
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── constants/        # App constants
```

## Firebase Security Rules

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Development Workflow

1. Make changes to the code
2. Save files (hot reload will update the app automatically)
3. Test on your device using Expo Go
4. Commit changes and create a PR

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser

## Next Steps

- [ ] Set up Firebase project and add credentials
- [ ] Implement full product CRUD operations
- [ ] Add routine execution tracking
- [ ] Implement progress photo comparison
- [ ] Add data visualization for progress metrics
- [ ] Implement search and filtering
- [ ] Add dark mode support

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT
