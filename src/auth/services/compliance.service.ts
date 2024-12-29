import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { AuditService } from './audit.service';

@Injectable()
export class ComplianceService {
  private supabase;
  private readonly retentionPeriod: number;

  constructor(
    private configService: ConfigService,
    private auditService: AuditService
  ) {
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL'),
      this.configService.get('SUPABASE_KEY')
    );
    this.retentionPeriod = this.configService.get('DATA_RETENTION_DAYS', 365);
  }

  async recordConsent(userId: string, purpose: string, granted: boolean) {
    const { error } = await this.supabase
      .from('consent_records')
      .insert([{
        userId,
        purpose,
        granted,
        timestamp: new Date().toISOString(),
      }]);

    if (error) throw error;

    await this.auditService.logEvent({
      userId,
      action: granted ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED',
      resource: 'consent_records',
      details: { purpose },
    });
  }

  async getConsentStatus(userId: string, purpose: string) {
    const { data, error } = await this.supabase
      .from('consent_records')
      .select('*')
      .eq('userId', userId)
      .eq('purpose', purpose)
      .order('timestamp', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data[0]?.granted ?? false;
  }

  async exportUserData(userId: string) {
    const tables = ['users', 'audit_logs', 'consent_records'];
    const userData = {};

    for (const table of tables) {
      const { data, error } = await this.supabase
        .from(table)
        .select('*')
        .eq('userId', userId);

      if (error) throw error;
      userData[table] = data;
    }

    return userData;
  }

  async scheduleDataDeletion(userId: string, retentionDays?: number) {
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + (retentionDays || this.retentionPeriod));

    const { error } = await this.supabase
      .from('deletion_schedule')
      .insert([{
        userId,
        scheduledDate: deletionDate.toISOString(),
      }]);

    if (error) throw error;

    await this.auditService.logEvent({
      userId,
      action: 'DELETION_SCHEDULED',
      resource: 'user_data',
      details: { scheduledDate: deletionDate },
    });
  }
}