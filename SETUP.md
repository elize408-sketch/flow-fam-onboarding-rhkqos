
# Flow Fam - Supabase Authentication Setup

## Overview

This app now includes working Supabase Email+Password authentication with:
- ✅ Email sign up with validation
- ✅ Email login
- ✅ Session persistence using SecureStore
- ✅ Automatic routing based on auth state
- ✅ Logout functionality

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to finish setting up (this takes a few minutes)

### 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

### 3. Configure Environment Variables

Create a `.env` file in the root of your project:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with your actual Supabase credentials from step 2.

### 4. Configure Email Authentication in Supabase

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Go to **Authentication** → **URL Configuration**
4. Add your app's redirect URLs (for development):
   - `exp://localhost:8081`
   - `http://localhost:8081`

### 5. Optional: Disable Email Confirmation (for testing)

By default, Supabase requires users to confirm their email before logging in.

To disable this for testing:
1. Go to **Authentication** → **Providers** → **Email**
2. Uncheck **"Confirm email"**
3. Click **Save**

**Note:** For production, you should keep email confirmation enabled and configure email templates.

### 6. Run the App

```bash
npm run dev
```

## How It Works

### Authentication Flow

1. **First Launch**: User sees language selection → Auth options screen
2. **Sign Up**: User creates account with email + password
3. **Login**: User logs in with existing credentials
4. **Session Persistence**: Session is stored securely using expo-secure-store
5. **Auto-Login**: On app restart, user is automatically logged in if session exists
6. **Logout**: User can log out from the home screen

### File Structure

```
lib/
  └── supabase.ts                    # Supabase client with SecureStore adapter

contexts/
  └── SupabaseAuthContext.tsx        # Auth state management & hooks

app/(tabs)/(home)/
  ├── index.tsx                      # Language selection (onboarding)
  ├── auth-options.tsx               # Auth method selection
  ├── email-signup.tsx               # Email sign up form
  ├── login.tsx                      # Login form
  └── home.tsx                       # Home screen (authenticated)
```

### Key Features

**Email Sign Up Screen:**
- Email validation (required, valid format)
- Password validation (min 8 characters)
- Confirm password matching
- Inline error messages
- Loading state
- Success message

**Login Screen:**
- Email validation
- Password validation
- Inline error messages
- Loading state
- Success message

**Home Screen:**
- Displays logged-in user email
- Shows user ID
- Logout button
- Placeholder for future features

**Session Management:**
- Sessions stored securely using expo-secure-store
- Auto-refresh tokens
- Persistent across app restarts
- Automatic routing based on auth state

## Testing

### Test Sign Up Flow

1. Launch the app
2. Select a language
3. Tap "Aanmelden met e-mail"
4. Enter email: `test@example.com`
5. Enter password: `password123`
6. Confirm password: `password123`
7. Tap "Account aanmaken"
8. You should see success message and be redirected to home

### Test Login Flow

1. From auth options, tap "Inloggen met bestaand account"
2. Enter your email and password
3. Tap "Inloggen"
4. You should be redirected to home

### Test Session Persistence

1. Log in to the app
2. Close the app completely
3. Reopen the app
4. You should be automatically logged in and see the home screen

### Test Logout

1. From the home screen, tap "Uitloggen"
2. You should be redirected to the language selection screen
3. Your session should be cleared

## Validation Rules

**Email:**
- Required
- Must be valid email format

**Password:**
- Required
- Minimum 8 characters

**Confirm Password:**
- Required
- Must match password

## Error Handling

The app handles various error scenarios:
- Invalid email format
- Password too short
- Passwords don't match
- User already exists
- Invalid credentials
- Network errors
- Supabase errors

All errors are displayed as friendly inline messages in Dutch.

## Next Steps

This implementation provides the foundation for:
- Adding Google OAuth authentication
- Adding Apple OAuth authentication
- Implementing family/group features
- Adding user profiles
- Implementing password reset
- Adding email verification flow

## Troubleshooting

**"No storage option exists" warning:**
- This is expected on web. The app uses SecureStore on native platforms and falls back to localStorage on web.

**Sign up succeeds but can't log in:**
- Check if email confirmation is enabled in Supabase
- Either disable it for testing or check your email for confirmation link

**Session not persisting:**
- Make sure expo-secure-store is properly installed
- Check that the Supabase client is configured with the SecureStore adapter

**Environment variables not working:**
- Make sure your .env file is in the root directory
- Restart the Expo dev server after adding .env file
- Variables must start with `EXPO_PUBLIC_` to be accessible in the app
