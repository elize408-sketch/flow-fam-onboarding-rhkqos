
/**
 * API Utilities - Backend Integration Complete ✅
 *
 * This file provides complete integration with the BetterAuth-powered backend API.
 * All endpoints are integrated and working with proper authentication.
 *
 * Features:
 * ✅ Automatic backend URL configuration from app.json
 * ✅ Cookie-based authentication with Better Auth
 * ✅ Type-safe request/response handling with TypeScript
 * ✅ Comprehensive error handling with logging
 * ✅ Helper functions for all API endpoints
 * ✅ File upload support with multipart/form-data
 * ✅ Automatic cookie injection for authenticated requests
 *
 * Backend URL: https://22m6pxpwrn7zbf8z6sj655eutz2eucag.app.specular.dev
 *
 * Usage Examples:
 * 
 * // Get family members
 * const { members } = await getFamilyMembers();
 * 
 * // Update member styling
 * await updateFamilyMemberStyle(memberId, { color: '#FF6B6B' });
 * 
 * // Upload avatar
 * const formData = new FormData();
 * formData.append('avatar', file);
 * const { avatar_url } = await uploadAvatar(formData);
 * 
 * // Get user profile
 * const profile = await getUserProfile();
 * 
 * // Create family
 * await createFamily('Smith Family', [
 *   { name: 'John', role: 'parent' },
 *   { name: 'Jane', role: 'partner' },
 * ]);
 *
 * For custom endpoints, use the generic functions:
 * - authenticatedGet(endpoint)
 * - authenticatedPost(endpoint, data)
 * - authenticatedPatch(endpoint, data)
 * - authenticatedDelete(endpoint)
 * - authenticatedUpload(endpoint, formData)
 */

import Constants from "expo-constants";
import { authClient } from "@/lib/auth";

/**
 * Backend URL is configured in app.json under expo.extra.backendUrl
 * It is set automatically when the backend is deployed
 */
export const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || "";

// Log backend URL on module load for debugging
console.log("[API] Backend URL configured:", BACKEND_URL);

/**
 * Check if backend is properly configured
 */
export const isBackendConfigured = (): boolean => {
  return !!BACKEND_URL && BACKEND_URL.length > 0;
};

/**
 * Get authentication cookies from Better Auth
 * Better Auth stores session as cookies, not bearer tokens
 *
 * @returns Cookie string or null if not found
 */
export const getBearerToken = async (): Promise<string | null> => {
  try {
    console.log("[API] Getting authentication cookies from Better Auth...");
    const cookies = authClient.getCookie();
    console.log("[API] Cookies retrieved:", !!cookies);
    return cookies || null;
  } catch (error) {
    console.error("[API] Error retrieving authentication cookies:", error);
    return null;
  }
};

/**
 * Generic API call helper with error handling
 *
 * @param endpoint - API endpoint path (e.g., '/users', '/auth/login')
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Parsed JSON response
 * @throws Error if backend is not configured or request fails
 */
export const apiCall = async <T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  if (!isBackendConfigured()) {
    throw new Error("Backend URL not configured. Please rebuild the app.");
  }

  const url = `${BACKEND_URL}${endpoint}`;
  console.log("[API] Calling:", url, options?.method || "GET");

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[API] Error response:", response.status, text);
      throw new Error(`API error: ${response.status} - ${text}`);
    }

    const data = await response.json();
    console.log("[API] Success:", data);
    return data;
  } catch (error) {
    console.error("[API] Request failed:", error);
    throw error;
  }
};

/**
 * GET request helper
 */
export const apiGet = async <T = any>(endpoint: string): Promise<T> => {
  return apiCall<T>(endpoint, { method: "GET" });
};

/**
 * POST request helper
 */
export const apiPost = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return apiCall<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * PUT request helper
 */
export const apiPut = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return apiCall<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/**
 * PATCH request helper
 */
export const apiPatch = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return apiCall<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request helper
 */
export const apiDelete = async <T = any>(endpoint: string): Promise<T> => {
  return apiCall<T>(endpoint, { method: "DELETE" });
};

/**
 * Authenticated API call helper
 * Automatically retrieves session cookies from Better Auth and adds to Cookie header
 *
 * @param endpoint - API endpoint path
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns Parsed JSON response
 * @throws Error if session not found or request fails
 */
export const authenticatedApiCall = async <T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  // Get cookies from Better Auth
  const cookies = authClient.getCookie();

  if (!cookies) {
    console.error("[API] No authentication session found");
    throw new Error("Authentication token not found. Please sign in.");
  }

  console.log("[API] Making authenticated request with cookies");

  if (!isBackendConfigured()) {
    throw new Error("Backend URL not configured. Please rebuild the app.");
  }

  const url = `${BACKEND_URL}${endpoint}`;
  console.log("[API] Authenticated call to:", url, options?.method || "GET");

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
        Cookie: cookies,
      },
      credentials: "omit", // Don't send browser cookies, we're setting them manually
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[API] Error response:", response.status, text);
      throw new Error(`API error: ${response.status} - ${text}`);
    }

    const data = await response.json();
    console.log("[API] Success:", data);
    return data;
  } catch (error) {
    console.error("[API] Request failed:", error);
    throw error;
  }
};

/**
 * Authenticated GET request
 */
export const authenticatedGet = async <T = any>(endpoint: string): Promise<T> => {
  return authenticatedApiCall<T>(endpoint, { method: "GET" });
};

/**
 * Authenticated POST request
 */
export const authenticatedPost = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return authenticatedApiCall<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * Authenticated PUT request
 */
export const authenticatedPut = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return authenticatedApiCall<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/**
 * Authenticated PATCH request
 */
export const authenticatedPatch = async <T = any>(
  endpoint: string,
  data: any
): Promise<T> => {
  return authenticatedApiCall<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

/**
 * Authenticated DELETE request
 */
export const authenticatedDelete = async <T = any>(endpoint: string): Promise<T> => {
  return authenticatedApiCall<T>(endpoint, { method: "DELETE" });
};

/**
 * Upload file with authentication
 * Special handler for multipart/form-data uploads
 * 
 * @param endpoint - API endpoint path
 * @param formData - FormData object containing the file
 * @returns Parsed JSON response
 */
export const authenticatedUpload = async <T = any>(
  endpoint: string,
  formData: FormData
): Promise<T> => {
  // Get cookies from Better Auth
  const cookies = authClient.getCookie();

  if (!cookies) {
    console.error("[API] No authentication session found");
    throw new Error("Authentication token not found. Please sign in.");
  }

  if (!isBackendConfigured()) {
    throw new Error("Backend URL not configured. Please rebuild the app.");
  }

  const url = `${BACKEND_URL}${endpoint}`;
  console.log("[API] Uploading to:", url);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Cookie: cookies,
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData,
      credentials: "omit", // Don't send browser cookies, we're setting them manually
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[API] Upload error:", response.status, text);
      throw new Error(`Upload failed: ${response.status} - ${text}`);
    }

    const data = await response.json();
    console.log("[API] Upload success:", data);
    return data;
  } catch (error) {
    console.error("[API] Upload request failed:", error);
    throw error;
  }
};

/**
 * Example API Integration Functions
 * These demonstrate how to use the backend API endpoints
 */

/**
 * Get all family members for the current user
 * Endpoint: GET /api/families/members
 */
export const getFamilyMembers = async () => {
  return authenticatedGet<{
    members: Array<{
      id: string;
      name: string;
      role: "parent" | "partner" | "child";
      color?: string;
      avatar_url?: string;
    }>;
  }>("/api/families/members");
};

/**
 * Update family member styling (color and/or avatar)
 * Endpoint: PATCH /api/families/members/{memberId}
 * 
 * @param memberId - ID of the family member to update
 * @param updates - Object containing color and/or avatar_url
 */
export const updateFamilyMemberStyle = async (
  memberId: string,
  updates: { color?: string; avatar_url?: string }
) => {
  return authenticatedPatch<{
    id: string;
    name: string;
    role: string;
    color: string;
    avatar_url?: string;
  }>(`/api/families/members/${memberId}`, updates);
};

/**
 * Mark family styling setup as complete
 * Endpoint: POST /api/families/complete-style
 */
export const completeFamilyStyleSetup = async () => {
  return authenticatedPost<{
    success: boolean;
    message: string;
  }>("/api/families/complete-style", {});
};

/**
 * Upload avatar image for a family member
 * Endpoint: POST /api/upload/avatar
 * 
 * @param file - File object or Blob to upload
 * @returns Object containing the avatar_url
 * 
 * Example usage:
 * ```typescript
 * const formData = new FormData();
 * formData.append('avatar', file);
 * const result = await uploadAvatar(formData);
 * console.log('Avatar URL:', result.avatar_url);
 * ```
 */
export const uploadAvatar = async (formData: FormData) => {
  return authenticatedUpload<{
    avatar_url: string;
  }>("/api/upload/avatar", formData);
};

/**
 * Get current user profile with family setup status
 * Endpoint: GET /api/profile
 */
export const getUserProfile = async () => {
  return authenticatedGet<{
    id: string;
    email: string;
    name: string;
    image?: string;
    emailVerified: boolean;
    familySetupComplete: boolean;
    createdAt: string;
    updatedAt: string;
  }>("/api/profile");
};

/**
 * Create a new family with members
 * Endpoint: POST /api/families
 * 
 * @param familyName - Name of the family
 * @param members - Array of family members with name and role
 */
export const createFamily = async (
  familyName: string,
  members: Array<{
    name: string;
    role: "parent" | "partner" | "child";
  }>
) => {
  return authenticatedPost<{
    familyId: string;
    success: boolean;
    message: string;
  }>("/api/families", {
    familyName,
    members,
  });
};

/**
 * Verify current session validity
 * Endpoint: GET /api/auth/verify
 */
export const verifySession = async () => {
  return authenticatedGet<{
    authenticated: boolean;
    user?: {
      id: string;
      email: string;
      name?: string;
    };
  }>("/api/auth/verify");
};
