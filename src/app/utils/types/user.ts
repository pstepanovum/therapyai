/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/utils/types/user.ts

export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    role?: 'patient' | 'therapist' | 'admin';
    createdAt?: string | Date;
    updatedAt?: string | Date;
    firstName?: string;
    lastName?: string;
    phone?: string;
    bio?: string;
    specialization?: string[];
    availability?: Record<string, any>;
    settings?: {
      notifications?: boolean;
      theme?: 'light' | 'dark' | 'system';
      language?: string;
    };
  }
  
  export interface UserAuth {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: UserProfile | null;
  }