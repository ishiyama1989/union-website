export interface Opinion {
  id: string;
  name: string;
  department?: string;
  email?: string;
  subject: string;
  content: string;
  isAnonymous: boolean;
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