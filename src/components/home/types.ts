export interface HomeProject {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  link: string | null;
  category: string;
  summary: string;
  client: string;
  role: string;
  year: number | null;
  stack: string;
  featured: boolean;
}

export interface HomeBlog {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  publishedAt: string | null;
}

export interface HomeSocialLink {
  platform: string;
  url: string;
}
