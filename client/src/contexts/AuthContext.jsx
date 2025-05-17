import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink, 
  signOut as firebaseSignOut, 
  updateProfile, 
  sendPasswordResetEmail 
} from 'firebase/auth';

// Import configured Firebase instances
import { auth, app } from '../config/firebase';

// Create the auth context
const AuthContext = createContext();

// Custom hook to access the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Auth provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Initialize auth state from local storage
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        
        // Add the missing methods to the user object
        const enhancedUser = {
          ...parsedUser,
          // Add getIdToken method
          getIdToken: async (forceRefresh = false) => {
            // In a real implementation, this would check if the token needs refresh
            return parsedUser.sessionToken;
          },
          // Add getIdTokenResult method
          getIdTokenResult: async () => {
            return {
              claims: {
                admin: false // This will be updated after profile is fetched
              },
              token: parsedUser.sessionToken,
              authTime: new Date().toISOString(),
              issuedAtTime: new Date().toISOString(),
              expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            };
          }
        };
        
        setCurrentUser(enhancedUser);
        fetchUserProfile(parsedUser.uid);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('user');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);
  
  // Fetch user profile from Firestore
  const fetchUserProfile = async (userId) => {
    if (!userId) {
      setUserProfile(null);
      return;
    }

    try {
      // Get the current user to access the session token
      const currentUserValue = currentUser || JSON.parse(localStorage.getItem('user'));
      if (!currentUserValue || !currentUserValue.sessionToken) {
        throw new Error('No authenticated user');
      }

      // Add Authorization header with the session token
      const response = await axios.get('/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${currentUserValue.sessionToken}`
        }
      });
      
      // Update user profile with the returned data
      setUserProfile(response.data);
      
      // Update admin status in the currentUser object
      if (currentUser && response.data.isAdmin) {
        setCurrentUser(prevUser => ({
          ...prevUser,
          getIdTokenResult: async () => ({
            claims: {
              admin: response.data.isAdmin
            },
            token: prevUser.sessionToken,
            authTime: new Date().toISOString(),
            issuedAtTime: new Date().toISOString(),
            expirationTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          })
        }));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Sign in with email function that's used in EmailSignIn.jsx
  const signInWithEmail = async (email) => {
    setLoading(true);
    setError(null); // Clear any previous errors
    try {
      // Send login request to the backend endpoint
      const response = await axios.post('/api/auth/login', { email });
      
      if (response.data.sessionToken && response.data.userProfile) {
        // Create a user object that includes the getIdToken method
        const userData = {
          uid: response.data.userProfile.uid,
          email: response.data.userProfile.email,
          sessionToken: response.data.sessionToken,
          // Add a getIdToken method to the user object to match Firebase Auth API
          getIdToken: async (forceRefresh = false) => {
            // In a real implementation, this might check if the token needs refresh
            // For now, we just return the session token we have
            return response.data.sessionToken;
          },
          // Add getIdTokenResult method for completeness
          getIdTokenResult: async () => {
            return {
              claims: {
                admin: response.data.userProfile.isAdmin || false
              },
              token: response.data.sessionToken,
              authTime: new Date().toISOString(),
              issuedAtTime: new Date().toISOString(),
              expirationTime: response.data.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            };
          }
        };
        
        localStorage.setItem('user', JSON.stringify({
          uid: userData.uid,
          email: userData.email,
          sessionToken: userData.sessionToken
        }));
        
        // Update current user state
        setCurrentUser(userData);
        setUserProfile(response.data.userProfile);
        
        setLoading(false);
        return { 
          success: true, 
          user: userData
        };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      // Handle different error cases based on response status and error code
      if (error.response) {
        const { status, data } = error.response;
        
        // Handle Shopify customer not found (422 Unprocessable Entity)
        if (status === 422) {
          const errorMessage = data.error || `Email "${email}" not found in Shopify database. Only existing Shopify customers can login.`;
          setError(errorMessage);
          setLoading(false);
          return { 
            success: false,
            notInShopify: true, 
            message: errorMessage
          };
        }
        
        // Handle server errors
        if (status === 500) {
          const errorMessage = data.error || 'Server error. Please try again later.';
          setError(errorMessage);
          setLoading(false);
          return { 
            success: false,
            serverError: true,
            message: errorMessage
          };
        }
      }
      
      // Handle network errors or other issues
      const errorMessage = error.response?.data?.error || error.message || 'Failed to sign in';
      setError(errorMessage);
      setLoading(false);
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };
  
  // Send email for sign in
  const sendSignInEmail = async (email) => {
    setLoading(true);
    try {
      // First check if the email exists in Shopify
      const checkResponse = await axios.post('/api/shopify/check-customer', { email });
      
      if (!checkResponse.data.exists) {
        setError('Email not found in Shopify database. Only existing Shopify customers can login.');
        setLoading(false);
        return { 
          success: false, 
          notInShopify: true,
          message: 'Email not found in Shopify database. Only existing Shopify customers can login.' 
        };
      }
      
      // Proceed with sending sign-in link
      const actionCodeSettings = {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: true,
      };
      
      // Send sign-in link to user's email
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      // Store the email in localStorage to use it on verification
      localStorage.setItem('emailForSignIn', email);
      
      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error("Error sending sign-in email:", error);
      
      // Check if this is a 404 Not Found error from the Shopify check
      if (error.response && error.response.status === 404) {
        setError(error.response.data.error || 'Email not found in Shopify database. Only existing Shopify customers can login.');
        setLoading(false);
        return { 
          success: false,
          notInShopify: true,
          message: error.response.data.error || 'Email not found in Shopify database. Only existing Shopify customers can login.'
        };
      }
      
      setError(error.message);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };
  
  // Verify email token
  const verifyEmailToken = async (token) => {
    setLoading(true);
    try {
      // Get email from localStorage
      const email = localStorage.getItem('emailForSignIn');
      
      if (!email) {
        throw new Error('No email found. Please try signing in again.');
      }
      
      // First verify that the email exists in Shopify
      const checkResponse = await axios.post('/api/shopify/check-customer', { email });
      
      if (!checkResponse.data.exists) {
        localStorage.removeItem('emailForSignIn');
        setError('Email not found in Shopify database. Only existing Shopify customers can login.');
        setLoading(false);
        return { 
          success: false, 
          notInShopify: true,
          message: 'Email not found in Shopify database. Only existing Shopify customers can login.' 
        };
      }
      
      // Now verify the email link
      const result = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          token,
          shopifyId: checkResponse.data.shopifyId // Include the Shopify ID from the check response
        }),
      });
      
      const data = await result.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to verify email');
      }
      
      // Set the user in the context
      setCurrentUser(data.user);
      
      // Clear the email from localStorage
      localStorage.removeItem('emailForSignIn');
      
      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error("Error verifying email token:", error);
      
      // Check if this is a 404 Not Found error from the Shopify check
      if (error.response && error.response.status === 404) {
        localStorage.removeItem('emailForSignIn');
        setError(error.response.data.error || 'Email not found in Shopify database. Only existing Shopify customers can login.');
        setLoading(false);
        return { 
          success: false,
          notInShopify: true,
          message: error.response.data.error || 'Email not found in Shopify database. Only existing Shopify customers can login.'
        };
      }
      
      setError(error.message);
      setLoading(false);
      return { success: false, message: error.message };
    }
  };
  
  // Sign out
  const logout = () => {
    setCurrentUser(null);
    setUserProfile(null);
    localStorage.removeItem('user');
  };
  
  // Value object to be provided to consumers
  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    signInWithEmail,
    sendSignInEmail,
    verifyEmailToken,
    signOut: logout,
    fetchUserProfile
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 