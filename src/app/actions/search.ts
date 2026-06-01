'use server';

import { db } from '@/db';
import { blogs, projects } from '@/db/schema';
import { like, or, eq, and } from 'drizzle-orm';

export async function searchContent(query: string) {
  const trimmed = query.trim();
  if (trimmed.length < 2) return { blogs: [], projects: [] };

  const term = `%${trimmed}%`;

  try {
    const [blogResults, projectResults] = await Promise.all([
      db
        .select()
        .from(blogs)
        .where(
          and(
            eq(blogs.published, true),
            or(
              like(blogs.title, term),
              like(blogs.content, term),
              like(blogs.excerpt, term)
            )
          )
        )
        .limit(20)
        .all(),
      db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.published, true),
            or(
              like(projects.title, term),
              like(projects.description, term)
            )
          )
        )
        .limit(20)
        .all(),
    ]);

    return { blogs: blogResults, projects: projectResults };
  } catch (error) {
    console.error('Search Error:', error);
    return { blogs: [], projects: [] };
  }
}
