export interface Opinion {
  id: string;
  name: string;
  department?: string;
  email?: string;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

// メモリベースのデータストレージ（Vercel対応）
let opinions: Opinion[] = [];
let counter = 0;

export class OpinionService {
  private static getNextId(): string {
    counter += 1;
    return counter.toString();
  }

  static async create(opinionData: Omit<Opinion, 'id' | 'createdAt' | 'isRead'>): Promise<Opinion> {
    const id = this.getNextId();
    
    const opinion: Opinion = {
      ...opinionData,
      id,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    opinions.push(opinion);
    return opinion;
  }

  static async getAll(): Promise<Opinion[]> {
    return [...opinions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async getById(id: string): Promise<Opinion | null> {
    return opinions.find(opinion => opinion.id === id) || null;
  }

  static async update(id: string, updates: Partial<Opinion>): Promise<Opinion | null> {
    const index = opinions.findIndex(opinion => opinion.id === id);
    
    if (index === -1) return null;
    
    const updated = { ...opinions[index], ...updates };
    opinions[index] = updated;
    
    return updated;
  }

  static async delete(id: string): Promise<boolean> {
    const initialLength = opinions.length;
    opinions = opinions.filter(opinion => opinion.id !== id);
    return opinions.length < initialLength;
  }

  static async getGroupedByDepartment(): Promise<Record<string, Opinion[]>> {
    const allOpinions = await this.getAll();
    const grouped: Record<string, Opinion[]> = {};
    
    allOpinions.forEach(opinion => {
      const department = opinion.department || '未記入';
      if (!grouped[department]) {
        grouped[department] = [];
      }
      grouped[department].push(opinion);
    });
    
    return grouped;
  }

  static async getMonthlyStats(): Promise<Record<string, { total: number; byDepartment: Record<string, number> }>> {
    const allOpinions = await this.getAll();
    const monthlyStats: Record<string, { total: number; byDepartment: Record<string, number> }> = {};
    
    allOpinions.forEach(opinion => {
      const date = new Date(opinion.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const department = opinion.department || '未記入';
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { total: 0, byDepartment: {} };
      }
      
      monthlyStats[monthKey].total++;
      
      if (!monthlyStats[monthKey].byDepartment[department]) {
        monthlyStats[monthKey].byDepartment[department] = 0;
      }
      monthlyStats[monthKey].byDepartment[department]++;
    });
    
    return monthlyStats;
  }

  static async getOpinionsByMonth(year: number, month: number): Promise<Opinion[]> {
    const allOpinions = await this.getAll();
    
    return allOpinions.filter(opinion => {
      const date = new Date(opinion.createdAt);
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    });
  }

  static async getStats(): Promise<{
    total: number;
    unread: number;
    thisMonth: number;
  }> {
    const now = new Date();
    const thisMonth = now.getFullYear() * 12 + now.getMonth();
    
    return {
      total: opinions.length,
      unread: opinions.filter(op => !op.isRead).length,
      thisMonth: opinions.filter(op => {
        const opinionDate = new Date(op.createdAt);
        const opinionMonth = opinionDate.getFullYear() * 12 + opinionDate.getMonth();
        return opinionMonth === thisMonth;
      }).length,
    };
  }
}