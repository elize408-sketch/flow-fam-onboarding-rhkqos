# Flow Fam onboarding

This app was built using [Natively.dev](https://natively.dev) - a platform for creating mobile apps.

Made with 💙 for creativity.

## 🔌 Backend API Integration

This app is fully integrated with a backend API powered by BetterAuth. All API endpoints are properly connected and working.

### 🔐 Authentication

The app uses **BetterAuth** for authentication with the following features:
- ✅ Email/Password signup and login
- ✅ Google OAuth (web popup + native deep linking)
- ✅ Apple OAuth (web popup + native deep linking)
- ✅ Session management with bearer tokens
- ✅ Automatic token refresh
- ✅ Secure token storage (localStorage on web, SecureStore on native)

### 📡 API Endpoints Integrated

All endpoints from the backend are integrated and ready to use:

#### Authentication & User Management
- ✅ `POST /api/auth/*` - Authentication endpoints (handled by BetterAuth)
- ✅ `GET /api/auth/verify` - Verify session validity
- ✅ `GET /api/users/me` - Get current user profile
- ✅ `GET /api/profile` - Get user profile with family setup status

#### Family Management
- ✅ `POST /api/families` - Create a new family with members
- ✅ `GET /api/families/members` - Get all family members
- ✅ `PATCH /api/families/members/{memberId}` - Update member styling (color, avatar)
- ✅ `POST /api/families/complete-style` - Mark family styling as complete

#### File Upload
- ✅ `POST /api/upload/avatar` - Upload avatar images for family members

### 🛠️ Using the API

All API utilities are available in `utils/api.ts`. Here are some examples:

```typescript
import {
  getFamilyMembers,
  updateFamilyMemberStyle,
  completeFamilyStyleSetup,
  uploadAvatar,
  getUserProfile,
  createFamily,
  verifySession,
} from '@/utils/api';

// Get family members
const { members } = await getFamilyMembers();

// Update member styling
await updateFamilyMemberStyle(memberId, {
  color: '#FF6B6B',
  avatar_url: 'https://...',
});

// Upload avatar
const formData = new FormData();
formData.append('avatar', file);
const { avatar_url } = await uploadAvatar(formData);

// Get user profile
const profile = await getUserProfile();

// Create family
await createFamily('Smith Family', [
  { name: 'John', role: 'parent' },
  { name: 'Jane', role: 'partner' },
  { name: 'Jimmy', role: 'child' },
]);
```

### 🧪 Testing API Integration

Open the app and navigate to the modal screen (accessible from the home screen) to test all API endpoints interactively. Each button will make a real API call and display the results.

### 🔧 Configuration

The backend URL is configured in `app.json`:

```json
{
  "expo": {
    "extra": {
      "backendUrl": "https://22m6pxpwrn7zbf8z6sj655eutz2eucag.app.specular.dev"
    }
  }
}
```

**Important:** Never hardcode the backend URL in your code. Always use:

```typescript
import { BACKEND_URL } from '@/utils/api';
```

### 📱 Screens with Backend Integration

1. **Family Setup** (`app/(onboarding)/family-setup.tsx`)
   - Creates family with members via `POST /api/families`
   - Validates and submits family data
   - Handles errors and loading states

2. **Profile Screen** (`app/(tabs)/profile.tsx`)
   - Fetches user profile via `GET /api/users/me`
   - Displays user information
   - Sign out functionality

3. **Home Screen** (`app/(tabs)/(home)/index.tsx`)
   - Fetches family members via `GET /api/families/members`
   - Displays family member list
   - Pull-to-refresh functionality

4. **Auth Context** (`contexts/AuthContext.tsx`)
   - Manages authentication state
   - Fetches profile with family setup status
   - Handles OAuth flows (Google, Apple)

### 🔒 Protected Routes

The app uses `ProtectedRoute` component to guard authenticated screens. All API calls to protected endpoints automatically include the bearer token from secure storage.

### 🐛 Debugging

All API calls are logged to the console with the `[API]` prefix. Check the console for:
- Request URLs and methods
- Request/response data
- Error messages

Example log output:
```
[API] Backend URL configured: https://...
[API] Calling: https://.../api/families/members GET
[API] Success: { members: [...] }
```

### 📚 Additional Resources

- **API Documentation**: See the OpenAPI spec in the backend deployment
- **BetterAuth Docs**: https://www.better-auth.com/docs
- **Expo Router**: https://docs.expo.dev/router/introduction/
- **Detailed Setup Guide**: See `SETUP.md` for comprehensive documentation

---

## 🎯 What Was Integrated

This backend integration includes:

### Files Modified/Created:
1. ✅ `utils/api.ts` - Complete API utilities with all helper functions
2. ✅ `lib/auth.ts` - BetterAuth client configuration
3. ✅ `contexts/AuthContext.tsx` - Auth state management with profile fetching
4. ✅ `app/(onboarding)/family-setup.tsx` - Family creation with API integration
5. ✅ `app/(tabs)/profile.tsx` - User profile with API integration
6. ✅ `app/(tabs)/profile.ios.tsx` - iOS-specific profile (removed TODO)
7. ✅ `app/(tabs)/(home)/index.tsx` - Family members list with API integration
8. ✅ `app/modal.tsx` - Interactive API testing screen
9. ✅ `app/_layout.tsx` - Added startup logging
10. ✅ `app/(onboarding)/_layout.tsx` - Added family-setup route
11. ✅ `components/homeData.ts` - Updated demo cards
12. ✅ `README.md` - This comprehensive documentation
13. ✅ `SETUP.md` - Detailed integration guide

### API Endpoints Integrated:
- ✅ `POST /api/auth/*` - Authentication (BetterAuth)
- ✅ `GET /api/auth/verify` - Session verification
- ✅ `GET /api/users/me` - User profile
- ✅ `GET /api/profile` - Profile with family setup status
- ✅ `POST /api/families` - Create family
- ✅ `GET /api/families/members` - Get family members
- ✅ `PATCH /api/families/members/{memberId}` - Update member styling
- ✅ `POST /api/families/complete-style` - Complete style setup
- ✅ `POST /api/upload/avatar` - Upload avatar images

### Features Implemented:
- ✅ Email/password authentication
- ✅ Google OAuth (web + native)
- ✅ Apple OAuth (web + native)
- ✅ Session persistence
- ✅ Automatic token management
- ✅ Family creation flow
- ✅ Family members display
- ✅ User profile display
- ✅ Error handling on all API calls
- ✅ Loading states on all screens
- ✅ Pull-to-refresh functionality
- ✅ Comprehensive logging
- ✅ Interactive API testing screen

### Developer Experience:
- ✅ Type-safe API calls with TypeScript
- ✅ Reusable API helper functions
- ✅ Centralized error handling
- ✅ Automatic bearer token injection
- ✅ Console logging for debugging
- ✅ Example code for all endpoints
- ✅ Comprehensive documentation

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# The app will automatically connect to:
# https://22m6pxpwrn7zbf8z6sj655eutz2eucag.app.specular.dev
```

## 📱 Testing

1. **Launch the app** - Select language
2. **Sign up** - Create account with email or OAuth
3. **Create family** - Add family members
4. **View home** - See your family members list
5. **Test API** - Open modal screen to test all endpoints
6. **View profile** - Check your user profile

All API calls are logged to the console for debugging.

---

**Integration Status**: ✅ **COMPLETE**

All backend API endpoints are integrated and working!
