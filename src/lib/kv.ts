import { kv } from '@vercel/kv';

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

export class OpinionService {
  private static OPINIONS_KEY = 'opinions';
  private static COUNTER_KEY = 'opinion_counter';

  static async create(opinionData: Omit<Opinion, 'id' | 'createdAt' | 'isRead'>): Promise<Opinion> {
    // IDを生成
    const counter = await kv.incr(this.COUNTER_KEY);
    const id = counter.toString();
    
    const opinion: Opinion = {
      ...opinionData,
      id,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // KVに保存
    await kv.hset(this.OPINIONS_KEY, { [id]: JSON.stringify(opinion) });
    
    return opinion;
  }

  static async getAll(): Promise<Opinion[]> {
    const opinionsHash = await kv.hgetall(this.OPINIONS_KEY);
    
    if (!opinionsHash) return [];
    
    const opinions = Object.values(opinionsHash)
      .map(json => JSON.parse(json as string) as Opinion)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return opinions;
  }

  static async getById(id: string): Promise<Opinion | null> {
    const opinionJson = await kv.hget(this.OPINIONS_KEY, id);
    
    if (!opinionJson) return null;
    
    return JSON.parse(opinionJson as string) as Opinion;
  }

  static async update(id: string, updates: Partial<Opinion>): Promise<Opinion | null> {
    const existing = await this.getById(id);
    
    if (!existing) return null;
    
    const updated = { ...existing, ...updates };
    await kv.hset(this.OPINIONS_KEY, { [id]: JSON.stringify(updated) });
    
    return updated;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await kv.hdel(this.OPINIONS_KEY, id);
    return result > 0;
  }

  static async getStats(): Promise<{
    total: number;
    unread: number;
    thisMonth: number;
  }> {
    const opinions = await this.getAll();
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