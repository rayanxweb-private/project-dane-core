// src/repositories/transaction.repository.ts
export class TransactionRepository {
  async findById(id: string) {
    return { id, status: 'PENDING', amount: 0 };
  }

  async updateStatus(id: string, status: string) {
    return { id, status };
  }

  async create(data: any) {
    return { id: 'mock_tx_id_123', ...data };
  }
}
