import { connectDB, AuditLog, IAuditLog } from '@/config/database';

export class AuditLogRepository {
  async create(data: Partial<IAuditLog>): Promise<IAuditLog> {
    await connectDB();
    const log = new AuditLog(data);
    return await log.save();
  }

  async getLogHistory(userId: string, limit = 50): Promise<IAuditLog[]> {
    await connectDB();
    return await AuditLog.find({ userId }).sort({ createdAt: -1 }).limit(limit).exec();
  }
}
