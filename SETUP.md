
# Flow Fam - Backend API Integration Complete ✅

## 🎉 Integration Status: COMPLETE

All backend API endpoints have been successfully integrated into the frontend application!

---

# Backend API Integration Documentation

## 📋 Overview

This app is fully integrated with a BetterAuth-powered backend API. All endpoints are connected and working:

### ✅ Authentication (BetterAuth)
- ✅ Email/Password signup and login
- ✅ Google OAuth (web popup + native deep linking)
- ✅ Apple OAuth (web popup + native deep linking)
- ✅ Session management with bearer tokens
- ✅ Automatic token refresh
- ✅ Secure token storage (SecureStore on native, localStorage on web)

### ✅ User Management
- ✅ Get current user profile (`GET /api/users/me`)
- ✅ Get profile with family setup status (`GET /api/profile`)
- ✅ Verify session validity (`GET /api/auth/verify`)

### ✅ Family Management
- ✅ Create family with members (`POST /api/families`)
- ✅ Get all family members (`GET /api/families/members`)
- ✅ Update member styling (`PATCH /api/families/members/{memberId}`)
- ✅ Complete family style setup (`POST /api/families/complete-style`)

### ✅ File Upload
- ✅ Upload avatar images (`POST /api/upload/avatar`)

## 🚀 Backend Configuration

### Backend URL

The backend is already configured in `app.json`:

```json
{
  "expo": {
    "extra": {
      "backendUrl": "https://22m6pxpwrn7zbf8z6sj655eutz2eucag.app.specular.dev"
    }
  }
}
```

**⚠️ IMPORTANT:** Never hardcode the backend URL in your code. Always import it:

```typescript
import { BACKEND_URL } from '@/utils/api';
```

### Running the App

```bash
npm install
npm run dev
```

The app will automatically connect to the configured backend.

## 🔄 How It Works

### Authentication Flow

1. **First Launch**: Language selection → Auth options
2. **Sign Up**: Email/password or OAuth (Google/Apple)
3. **Family Setup**: Create family with members
4. **Home**: View and manage family members
5. **Session Persistence**: Automatic login on app restart
6. **Logout**: Clear session and return to auth

### File Structure

```
lib/
  └── auth.ts                        # BetterAuth client configuration

contexts/
  └── AuthContext.tsx                # Auth state management & hooks

utils/
  └── api.ts                         # API utilities & helper functions

app/
  ├── index.tsx                      # Central routing logic
  ├── _layout.tsx                    # Root layout with AuthProvider
  ├── auth-callback.tsx              # OAuth callback handler
  ├── auth-popup.tsx                 # OAuth popup for web
  │
  ├── (onboarding)/
  │   ├── language.tsx               # Language selection
  │   ├── auth-options.tsx           # Auth method selection
  │   └── family-setup.tsx           # Family creation (✅ API integrated)
  │
  └── (tabs)/
      ├── (home)/
      │   ├── index.tsx              # Family members list (✅ API integrated)
      │   ├── email-signup.tsx       # Email signup form
      │   ├── login.tsx              # Login form
      │   └── home.tsx               # Authenticated home
      │
      └── profile.tsx                # User profile (✅ API integrated)
```

## 🎯 Integrated Screens

### 1. Family Setup Screen (`app/(onboarding)/family-setup.tsx`)

**API Integration:**
- ✅ `POST /api/families` - Creates family with members

**Features:**
- Family name input
- Parent name (pre-filled from user profile)
- Optional partner name
- Add/remove children dynamically
- Form validation
- Error handling with user-friendly messages
- Loading states
- Success feedback

**Code Example:**
```typescript
const { authenticatedPost } = await import("@/utils/api");

const response = await authenticatedPost("/api/families", {
  familyName: "Smith Family",
  members: [
    { name: "John", role: "parent" },
    { name: "Jane", role: "partner" },
    { name: "Jimmy", role: "child" },
  ],
});
```

### 2. Profile Screen (`app/(tabs)/profile.tsx`)

**API Integration:**
- ✅ `GET /api/users/me` - Fetches user profile

**Features:**
- Display user information (name, email, ID)
- Email verification badge
- Member since date
- Last updated date
- Edit profile button (placeholder)
- Settings button (placeholder)
- Sign out functionality
- Error handling with retry
- Loading states
- Pull-to-refresh

**Code Example:**
```typescript
import { authenticatedGet } from "@/utils/api";

const profile = await authenticatedGet<UserProfile>("/api/users/me");
```

### 3. Home Screen (`app/(tabs)/(home)/index.tsx`)

**API Integration:**
- ✅ `GET /api/families/members` - Fetches family members

**Features:**
- Display all family members
- Show member role (parent/partner/child)
- Color-coded member cards
- Avatar display
- Pull-to-refresh
- Empty state with setup prompt
- Error handling with retry
- Loading states
- Member count display

**Code Example:**
```typescript
import { authenticatedGet } from "@/utils/api";

const data = await authenticatedGet<{ members: FamilyMember[] }>(
  "/api/families/members"
);
```

### 4. Auth Context (`contexts/AuthContext.tsx`)

**API Integration:**
- ✅ `GET /api/profile` - Fetches profile with family setup status
- ✅ BetterAuth session management

**Features:**
- Centralized auth state
- Email/password authentication
- Google OAuth (web popup + native)
- Apple OAuth (web popup + native)
- Session persistence
- Automatic token management
- Family setup status tracking
- User profile caching

## 🧪 Testing the Integration

### Interactive API Testing

The app includes an **API Integration Demo** screen accessible from the home screen:

1. Launch the app and navigate to home
2. Tap "API Integration Demo"
3. Test each endpoint with interactive buttons:
   - Get Family Members
   - Update Member Style
   - Complete Style Setup
   - Get User Profile
   - Verify Session

All API calls are logged to the console with detailed request/response information.

### Manual Testing Flow

**1. Sign Up Flow:**
```
Language Selection → Auth Options → Email Signup
→ Family Setup → Home (Family Members List)
```

**2. Login Flow:**
```
Language Selection → Auth Options → Login
→ (If family setup incomplete) Family Setup → Home
→ (If family setup complete) Home
```

**3. OAuth Flow (Web):**
```
Auth Options → Google/Apple → OAuth Popup
→ Callback → Family Setup → Home
```

**4. OAuth Flow (Native):**
```
Auth Options → Google/Apple → Native OAuth
→ Deep Link Callback → Family Setup → Home
```

### Debugging

All API calls include comprehensive logging:

```
[API] Backend URL configured: https://...
[API] Calling: https://.../api/families/members GET
[API] Making authenticated request with token
[API] Success: { members: [...] }
```

Check the console for:
- ✅ Request URLs and methods
- ✅ Authentication token presence
- ✅ Request/response data
- ✅ Error messages with status codes

### Error Handling

The app handles all error scenarios:
- ✅ 400 Bad Request - Invalid data
- ✅ 401 Unauthorized - Not authenticated
- ✅ 403 Forbidden - Insufficient permissions
- ✅ 404 Not Found - Resource doesn't exist
- ✅ 413 Payload Too Large - File too big
- ✅ 500 Server Error - Backend issues
- ✅ Network errors - Connection issues

All errors display user-friendly messages in Dutch.

## 📚 API Usage Examples

### Using Helper Functions

All API endpoints have dedicated helper functions in `utils/api.ts`:

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

// Verify session
const { authenticated, user } = await verifySession();
```

### Using Generic API Functions

For custom endpoints or flexibility:

```typescript
import {
  authenticatedGet,
  authenticatedPost,
  authenticatedPatch,
  authenticatedDelete,
  authenticatedUpload,
} from '@/utils/api';

// GET request
const data = await authenticatedGet('/api/custom-endpoint');

// POST request
const result = await authenticatedPost('/api/custom-endpoint', {
  key: 'value',
});

// PATCH request
const updated = await authenticatedPatch('/api/resource/123', {
  field: 'new value',
});

// DELETE request
await authenticatedDelete('/api/resource/123');

// File upload
const formData = new FormData();
formData.append('file', file);
const uploaded = await authenticatedUpload('/api/upload', formData);
```

## 🔐 Authentication Details

### BetterAuth Configuration

The app uses BetterAuth with the Expo client plugin:

```typescript
// lib/auth.ts
export const authClient = createAuthClient({
  baseURL: BACKEND_URL,
  plugins: [
    expoClient({
      scheme: "natively",
      storagePrefix: "natively",
      storage: Platform.OS === "web" ? localStorage : SecureStore,
    }),
  ],
});
```

### Token Management

- **Native**: Tokens stored in SecureStore (encrypted)
- **Web**: Tokens stored in localStorage
- **Auto-refresh**: BetterAuth handles token refresh automatically
- **Bearer tokens**: Automatically added to authenticated requests

### OAuth Flows

**Web:**
1. User clicks OAuth button
2. Popup window opens with OAuth provider
3. User authenticates
4. Callback receives token
5. Token sent to parent window via postMessage
6. Parent window stores token and closes popup

**Native:**
1. User clicks OAuth button
2. Native OAuth flow opens
3. User authenticates
4. Deep link callback with token
5. Token stored in SecureStore
6. User redirected to app

## 🛠️ Adding New API Endpoints

To integrate a new backend endpoint:

1. **Add helper function to `utils/api.ts`:**

```typescript
export const getCustomData = async () => {
  return authenticatedGet<CustomDataType>("/api/custom-endpoint");
};
```

2. **Use in your component:**

```typescript
import { getCustomData } from '@/utils/api';

const fetchData = async () => {
  try {
    const data = await getCustomData();
    console.log('Data:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

3. **Add error handling and loading states:**

```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getCustomData();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);
```

## 🐛 Troubleshooting

**Backend URL not configured:**
- Check `app.json` has `expo.extra.backendUrl` set
- Restart Expo dev server after changing app.json
- Verify BACKEND_URL is imported from `utils/api.ts`

**401 Unauthorized errors:**
- User not authenticated - redirect to login
- Token expired - BetterAuth should auto-refresh
- Check token is being stored correctly

**Network errors:**
- Check backend is running and accessible
- Verify backend URL is correct
- Check CORS settings on backend

**OAuth not working on web:**
- Check popup blockers are disabled
- Verify callback URL is configured correctly
- Check browser console for errors

**OAuth not working on native:**
- Verify deep link scheme matches (`natively://`)
- Check app.json has correct scheme configured
- Test deep link handling

**Session not persisting:**
- Check SecureStore is installed: `expo install expo-secure-store`
- Verify storage adapter is configured in auth client
- Check for errors in token storage/retrieval

## 📖 Additional Resources

- **BetterAuth Documentation**: https://www.better-auth.com/docs
- **Expo Router**: https://docs.expo.dev/router/introduction/
- **Expo SecureStore**: https://docs.expo.dev/versions/latest/sdk/securestore/
- **React Native**: https://reactnative.dev/docs/getting-started

## ✅ Integration Checklist

- [x] Backend URL configured in app.json
- [x] BetterAuth client set up with Expo plugin
- [x] AuthContext with email/password + OAuth
- [x] API utilities with helper functions
- [x] Family setup screen integrated
- [x] Profile screen integrated
- [x] Home screen with family members
- [x] Error handling on all API calls
- [x] Loading states on all screens
- [x] Session persistence
- [x] OAuth popup flows (web)
- [x] OAuth deep linking (native)
- [x] Comprehensive logging
- [x] API testing screen
- [x] Documentation complete

## 🎉 Summary

All backend API endpoints are now fully integrated and working! The app includes:

- ✅ Complete authentication system (email + Google + Apple)
- ✅ Family management (create, view, update)
- ✅ User profile management
- ✅ File upload support
- ✅ Session management
- ✅ Error handling
- ✅ Loading states
- ✅ Interactive API testing
- ✅ Comprehensive documentation

You can now build additional features on top of this solid foundation!
