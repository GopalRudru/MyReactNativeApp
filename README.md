# Avanse Customer Mobile App

A comprehensive React Native mobile application for Avanse customers, providing secure access to loan management, disbursements, payments, and other financial services.

[![React Native](https://img.shields.io/badge/React%20Native-0.76.9-blue.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-blue.svg)](https://www.typescriptlang.org/)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green.svg)](https://reactnative.dev/)
[![Security](https://img.shields.io/badge/Security-FreeRASP-red.svg)](https://github.com/talsec/Free-RASP-ReactNative)

## 📱 Features

- **Secure Authentication**: Multi-factor authentication with OTP verification
- **Loan Management**: View loan details, payment history, and disbursement status
- **Document Management**: Upload and manage loan-related documents
- **Payment Processing**: Secure payment gateway integration
- **Push Notifications**: Real-time updates and alerts
- **Security Features**: Runtime Application Self-Protection (RASP) with FreeRASP
- **Offline Support**: Essential features work offline
- **Multi-language Support**: Localized content
- **Biometric Authentication**: Fingerprint and Face ID support

## 🏗️ Architecture

```
app/
├── components/          # Reusable UI components
├── screens/            # Screen components
├── navigation/         # Navigation configuration
├── services/           # API services and business logic
├── hooks/             # Custom React hooks
├── utils/             # Utility functions and helpers
├── security/          # Security implementations
├── config/            # App configuration
└── assets/            # Images, fonts, and other assets
```

## 🛠️ Tech Stack

### Core Technologies
- **React Native**: 0.76.9
- **TypeScript**: 5.0.4
- **React**: 18.3.1

### State Management
- **Redux Toolkit**: 2.6.1
- **React Redux**: 9.2.0
- **Redux Persist**: 6.0.0 (with encryption)

### Navigation
- **React Navigation v7**: Native stack and bottom tabs
- **React Native Screens**: Optimized screen components
- **React Native Safe Area Context**: Safe area handling

### Security
- **FreeRASP**: Runtime Application Self-Protection
- **SSL Pinning**: Certificate pinning for API calls
- **Crypto JS**: Data encryption and decryption
- **Redux Persist Transform Encrypt**: Encrypted state persistence

### Backend Integration
- **Axios**: HTTP client with interceptors
- **Firebase**: Analytics, Crashlytics, and Push Notifications
- **React Native NetInfo**: Network connectivity monitoring

### UI/UX
- **React Native Vector Icons**: Icon library
- **React Native Linear Gradient**: Gradient backgrounds
- **React Native Reanimated**: High-performance animations
- **React Native Modal**: Enhanced modal components
- **React Native Size Matters**: Responsive design utilities

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Unit testing
- **TypeScript**: Type checking
- **Metro**: JavaScript bundler

## 🚀 Getting Started

### Prerequisites

- **Node.js**: >= 18.0.0
- **React Native CLI**: Latest version
- **Android Studio**: For Android development
- **Xcode**: For iOS development (macOS only)
- **Java**: JDK 17 or newer
- **Ruby**: For iOS dependencies (macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Avanse/customer-mobileapp.git
   cd customer-mobileapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **iOS Setup** (macOS only)
   ```bash
   cd ios
   bundle install
   bundle exec pod install
   cd ..
   ```

4. **Android Setup**
   - Ensure Android SDK is properly configured
   - Create `android/local.properties` file with your SDK path
   ```properties
   sdk.dir=/path/to/your/Android/sdk
   ```

### Running the App

#### Development Mode

**Android**
```bash
npm run android
```

**iOS**
```bash
npm run ios
```

**Start Metro Bundler**
```bash
npm start
```

#### Production Build

**Android**
```bash
cd android
./gradlew assembleRelease
```

**iOS**
```bash
cd ios
xcodebuild -workspace avanseCustomerApp.xcworkspace -scheme avanseCustomerApp -configuration Release -sdk iphoneos
```

## 🔧 Configuration

### Environment Setup

Create environment-specific configuration files:

```typescript
// config/environments/development.ts
export const config = {
  API_BASE_URL: 'https://dev-api.avanse.com',
  API_TIMEOUT: 30000,
  ENABLE_LOGGING: true,
  // ... other config
};
```

### Firebase Configuration

1. Add `google-services.json` to `android/app/`
2. Add `GoogleService-Info.plist` to `ios/avanseCustomerApp/`
3. Configure Firebase project settings

### Security Configuration

The app includes comprehensive security measures:

- **FreeRASP Integration**: See `docs/FreeRASP_Integration.md`
- **SSL Pinning**: Certificate validation for API calls
- **Root/Jailbreak Detection**: Device security checks
- **Code Obfuscation**: Protection against reverse engineering

## 📚 Documentation

- [FreeRASP Integration Guide](docs/FreeRASP_Integration.md)
- [FreeRASP Configuration Guide](docs/FreeRASP_Configuration_Guide.md)
- [App State Monitor](docs/AppStateMonitor.md)
- [Security Implementation](app/security/README.md)
- [Threat Handlers](app/security/README_ThreatHandlers.md)
- [App State Utils](app/utils/appState/README.md)

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 🔨 Development Guidelines

### Code Style
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Add comprehensive logging
- Follow the established folder structure

### Security Best Practices
- Always validate user inputs
- Use encrypted storage for sensitive data
- Implement proper authentication flows
- Follow OWASP mobile security guidelines
- Regular security audits and updates

### Performance
- Optimize image assets
- Use lazy loading where appropriate
- Implement proper caching strategies
- Monitor app performance with Firebase

## 📦 Dependencies

### Key Dependencies
- **@react-navigation/native**: Navigation framework
- **@reduxjs/toolkit**: State management
- **@react-native-firebase/app**: Firebase integration
- **freerasp-react-native**: Security protection
- **react-native-ssl-pinning**: SSL certificate pinning
- **crypto-js**: Encryption utilities
- **formik**: Form handling
- **yup**: Form validation

### Security Dependencies
- **freerasp-react-native**: Runtime protection
- **react-native-ssl-pinning**: Network security
- **redux-persist-transform-encrypt**: State encryption
- **crypto-js**: Data encryption

## 🚢 Deployment

### Android Play Store
1. Generate signed APK/AAB
2. Upload to Google Play Console
3. Configure release management
4. Monitor crash reports

### iOS App Store
1. Archive the app in Xcode
2. Upload to App Store Connect
3. Configure app metadata
4. Submit for review

## 🐛 Troubleshooting

### Common Issues

**Metro bundler issues**
```bash
npm start -- --reset-cache
```

**Android build issues**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

**iOS build issues**
```bash
cd ios
rm -rf Pods
pod install
cd ..
npm run ios
```

## 📞 Support

For technical support and issues:
- Create an issue in the repository
- Contact the development team
- Check existing documentation

## 📄 License

This project is proprietary software owned by Avanse. All rights reserved.

## 🤝 Contributing

Please follow the established coding standards and security guidelines when contributing to this project. All contributions must go through code review and security validation.

---

**Note**: This is a security-sensitive financial application. All development and deployment procedures must follow established security protocols and compliance requirements.
