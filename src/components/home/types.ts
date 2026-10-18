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
  results: string;
  featured: boolean;
}

export interface HomeTestimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar: string | null;
  projectTitle: string | null;
  projectSlug: string | null;
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
