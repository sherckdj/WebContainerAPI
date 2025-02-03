import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { isSupabaseConfigured } from '../lib/supabase';
import { AuthLayout } from '../components/AuthLayout';
import { signIn, handleAuthError } from '../utils/auth/index';
import { Role, ROLES } from '../types/auth';

export function SignupPage() {
  // Rest of the component remains the same
}