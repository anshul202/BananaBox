// app/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getCurrentUser, signIn as appwriteSignIn, signUp as appwriteSignUp, signOut as appwriteSignOut } from '@/services/appwrite';
import { Models } from 'react-native-appwrite';


interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  authInitialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  // const router = useRouter();
  // const segments = useSegments();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to fetch current user on app start:", error);
        setUser(null);
      } finally {
        setAuthInitialized(true);
      }
    };
    checkAuthStatus();
  }, []);

  
  const signIn = async (email: string, password: string) => {
    try {
      const authenticatedUser = await appwriteSignIn(email, password);
      setUser(authenticatedUser);
    } catch (error) {
      console.error("Sign-in error:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const newAuthenticatedUser = await appwriteSignUp(email, password, name);
      setUser(newAuthenticatedUser);
    } catch (error) {
      console.error("Sign-up error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await appwriteSignOut();
      setUser(null);
    } catch (error) {
      console.error("Sign-out error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, authInitialized, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
