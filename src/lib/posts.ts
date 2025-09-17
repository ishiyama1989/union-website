export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  isPublished: boolean;
  imageUrls?: string[];
  pdfUrls?: string[];
  createdAt: string;
  updatedAt: string;
}

// メモリベースのデータストレージ（Vercel対応）
let posts: Post[] = [];
let counter = 0;

export class PostService {
  private static getNextId(): string {
    counter += 1;
    return counter.toString();
  }

  static async create(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    const id = this.getNextId();
    const now = new Date().toISOString();
    
    const post: Post = {
      ...postData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    posts.push(post);
    return post;
  }

  static async getAll(): Promise<Post[]> {
    return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async getPublished(): Promise<Post[]> {
    const allPosts = await this.getAll();
    return allPosts.filter(post => post.isPublished);
  }

  static async getById(id: string): Promise<Post | null> {
    return posts.find(post => post.id === id) || null;
  }

  static async update(id: string, updates: Partial<Post>): Promise<Post | null> {
    const index = posts.findIndex(post => post.id === id);
    
    if (index === -1) return null;
    
    const updated = { 
      ...posts[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    
    posts[index] = updated;
    return updated;
  }

  static async delete(id: string): Promise<boolean> {
    const initialLength = posts.length;
    posts = posts.filter(post => post.id !== id);
    return posts.length < initialLength;
  }

  static async getRecentNews(limit: number = 3): Promise<Post[]> {
    const publishedPosts = await this.getPublished();
    return publishedPosts.slice(0, limit);
  }
}