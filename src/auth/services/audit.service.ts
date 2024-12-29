import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AuditService {
  private supabase;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL'),
      this.configService.get('SUPABASE_KEY')
    );
  }

  async logEvent(data: {
    userId: string;
    action: string;
    resource: string;
    details: any;
    ip?: string;
    userAgent?: string;
  }) {
    const { error } = await this.supabase
      .from('audit_logs')
      .insert([{
        ...data,
        timestamp: new Date().toISOString(),
      }]);

    if (error) throw error;
  }

  async getAuditLogs(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    let query = this.supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (filters.userId) {
      query = query.eq('userId', filters.userId);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.resource) {
      query = query.eq('resource', filters.resource);
    }
    if (filters.startDate) {
      query = query.gte('timestamp', filters.startDate.toISOString());
    }
    if (filters.endDate) {
      query = query.lte('timestamp', filters.endDate.toISOString());
    }

    const { data, error } = await query
      .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 10) - 1);

    if (error) throw error;
    return data;
  }
}