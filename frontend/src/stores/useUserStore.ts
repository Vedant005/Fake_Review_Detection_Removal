import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  user_name: string;
  email: string;
  isAdmin?: boolean;
}


