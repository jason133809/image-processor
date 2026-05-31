export interface User {
  id: number;
  email: string;
  credits: number;
  membership_level: 'free' | 'vip' | 'svip';
  membership_expires_at: string | null;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface TextToImageRequest {
  prompt: string;
  size?: string;
  quality?: string;
}

export interface ImageResponse {
  image_url: string;
  credits_used: number;
  message: string;
}

export interface CreditTransaction {
  id: number;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

export interface Subscription {
  id: number;
  subscription_type: 'monthly' | 'yearly';
  membership_level: 'free' | 'vip' | 'svip';
  start_date: string;
  end_date: string;
  is_active: boolean;
  auto_renew: boolean;
}
