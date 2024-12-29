import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class UsersService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY,
    );
  }

  async create(userData: any) {
    const { data, error } = await this.supabase
      .from('users')
      .insert([
        {
          ...userData,
          roles: ['user'],
          failedAttempts: 0,
          isEmailVerified: false,
        },
      ])
      .single();

    if (error) throw error;
    return data;
  }

  async findByEmail(email: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  }

  async findById(id: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async findByVerificationToken(token: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('verificationToken', token)
      .single();

    if (error) throw error;
    return data;
  }

  async verifyEmail(userId: string) {
    const { error } = await this.supabase
      .from('users')
      .update({ isEmailVerified: true, verificationToken: null })
      .eq('id', userId);

    if (error) throw error;
  }

  async incrementFailedAttempts(userId: string) {
    const { error } = await this.supabase.rpc('increment_failed_attempts', {
      user_id: userId,
    });

    if (error) throw error;
  }

  async resetFailedAttempts(userId: string) {
    const { error } = await this.supabase
      .from('users')
      .update({ failedAttempts: 0 })
      .eq('id', userId);

    if (error) throw error;
  }

  async saveRefreshToken(userId: string, refreshToken: string) {
    const { error } = await this.supabase
      .from('users')
      .update({ refreshToken })
      .eq('id', userId);

    if (error) throw error;
  }

  async removeRefreshToken(userId: string) {
    const { error } = await this.supabase
      .from('users')
      .update({ refreshToken: null })
      .eq('id', userId);

    if (error) throw error;
  }
}