# API Services Structure

This folder contains all API service files organized by functionality.

## Structure

```
src/services/api/
├── index.js                    # Central export point for all services
├── authService.js              # Authentication related APIs
└── forgotPasswordService.js    # Password reset related APIs
```

## Usage

### Import from central index file:
```javascript
import { loginUser, registerUser, sendOtp, verifyOtp, resetPassword } from "@/services/api";
```

### Or import specific service:
```javascript
import { loginUser } from "@/services/api/authService";
import { sendOtp, verifyOtp } from "@/services/api/forgotPasswordService";
```

## Available Services

### Authentication Service (`authService.js`)
- `loginUser({ email, password })` - User login
- `registerUser({ firstName, lastName, phoneNumber, email, password, profilePicture })` - User registration

### Forgot Password Service (`forgotPasswordService.js`)
- `sendOtp(email)` - Send OTP to email
- `verifyOtp(email, otp)` - Verify OTP code
- `resetPassword(email, newPassword)` - Reset user password

### Profile Service (`profileService.js`)
- `getUserProfile(userId, token)` - Get user profile data
- `updateUserProfile(profileData, token)` - Update user profile
- `uploadProfilePicture(file, userId, token)` - Upload profile picture

## API Configuration

Base URL: `https://api.revupbikes.com/api`

All services include:
- Error handling
- Proper response parsing
- Console logging for debugging
- Standardized error messages

## Adding New Services

1. Create a new service file in `src/services/api/`
2. Export functions from the service file
3. Add exports to `index.js`
4. Import and use in components

Example:
```javascript
// src/services/api/userService.js
export const getUserProfile = async (userId) => {
  // implementation
};

// src/services/api/index.js
export * from "./userService";

// In component
import { getUserProfile } from "@/services/api";
```
