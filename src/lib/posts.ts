import { kv } from '@vercel/kv';

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export class PostService {
  private static POSTS_KEY = 'posts';
  private static COUNTER_KEY = 'post_counter';

  static async create(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    // IDを生成
    const counter = await kv.incr(this.COUNTER_KEY);
    const id = counter.toString();
    
    const now = new Date().toISOString();
    const post: Post = {
      ...postData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    // KVに保存
    await kv.hset(this.POSTS_KEY, { [id]: JSON.stringify(post) });
    
    return post;
  }

  static async getAll(): Promise<Post[]> {
    const postsHash = await kv.hgetall(this.POSTS_KEY);
    
    if (!postsHash) return [];
    
    const posts = Object.values(postsHash)
      .map(json => JSON.parse(json as string) as Post)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return posts;
  }

  static async getPublished(): Promise<Post[]> {
    const posts = await this.getAll();
    return posts.filter(post => post.isPublished);
  }

  static async getById(id: string): Promise<Post | null> {
    const postJson = await kv.hget(this.POSTS_KEY, id);
    
    if (!postJson) return null;
    
    return JSON.parse(postJson as string) as Post;
  }

  static async update(id: string, updates: Partial<Post>): Promise<Post | null> {
    const existing = await this.getById(id);
    
    if (!existing) return null;
    
    const updated = { 
      ...existing, 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    await kv.hset(this.POSTS_KEY, { [id]: JSON.stringify(updated) });
    
    return updated;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await kv.hdel(this.POSTS_KEY, id);
    return result > 0;
  }

  static async getRecentNews(limit: number = 3): Promise<Post[]> {
    const posts = await this.getPublished();
    return posts.slice(0, limit);
  }
}