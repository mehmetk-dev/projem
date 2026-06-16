export interface Note { id: number; userId: number; title: string; content: string; image: string | null; color: string; pinned: boolean; createdAt: string; updatedAt: string | null; }
export interface Blog { id: number; userId: number; title: string; slug: string; content: string; excerpt: string | null; metaTitle: string | null; metaDescription: string | null; ogImage: string | null; coverImage: string | null; category: string; tags: string; published: boolean; publishedAt: string | null; createdAt: string; updatedAt: string | null; }
export interface Project { id: number; userId: number; title: string; description: string; image: string; link: string | null; category: string; displayOrder: number; published: boolean; createdAt: string; updatedAt: string | null; }
export interface Message { id: number; name: string; email: string; subject: string | null; content: string; read: boolean; createdAt: string; }
export interface DirectMessage { id: number; userId: number; senderId: number; content: string; readAt: string | null; createdAt: string; }
export interface DirectMessageContact { id: number; email: string; role: string; createdAt: string; }
export interface DirectMessageDashboardData {
  currentUserId: number;
  isAdmin: boolean;
  contacts: DirectMessageContact[];
  directMessages: DirectMessage[];
}
export interface Todo { id: number; userId: number; title: string; description: string; priority: string; dueDate: string | null; completed: boolean; completedAt: string | null; createdAt: string; updatedAt: string | null; }
export interface Payment { id: number; userId: number; title: string; amountCents: number; currency: string; type: 'expense' | 'income'; category: string; dueDate: string | null; recurrence: 'none' | 'monthly'; recurringDay: number | null; paid: boolean; paidAt: string | null; notes: string; createdAt: string; updatedAt: string | null; }
export interface Bookmark { id: number; userId: number; title: string; url: string; description: string; tags: string; createdAt: string; }
export interface Snippet { id: number; userId: number; title: string; code: string; language: string; description: string; tags: string; createdAt: string; updatedAt: string | null; }
export interface AnalyticsData { total: number; today: number; week: number; topPages: { page: string; count: number }[]; chartData: { date: string; count: number }[]; }

export interface ChatConversation { id: number; userId: number; title: string; model: string; createdAt: string; updatedAt: string | null; }
export interface ChatMessage { id: number; conversationId: number; role: 'user' | 'assistant' | 'system'; content: string; createdAt: string; }
export interface ChatSettings { userId: number; systemPrompt: string; defaultModel: string; temperature: string; apiKey: string | null; createdAt: string; updatedAt: string | null; }

export interface GuestbookEntry { id: number; name: string; email: string; message: string; approved: boolean; createdAt: string; }
export interface Comment { id: number; blogId: number; parentId: number | null; name: string; email: string; content: string; approved: boolean; createdAt: string; }

export interface AuditLog { id: number; userId: number | null; action: string; entity: string; entityId: number | null; oldValue: string | null; newValue: string | null; ipAddress: string | null; createdAt: string; }
export interface SiteSetting { id: number; key: string; value: string; description: string | null; updatedAt: string | null; }
export interface SocialLink { id: number; platform: string; url: string; icon: string; displayOrder: number; isActive: boolean; createdAt: string; }
export interface Subscriber { id: number; email: string; status: string; ipAddress: string | null; createdAt: string; }
export interface UserListItem { id: number; email: string; role: string; createdAt: string; }
export interface UserPreferences { hiddenTabs: string[]; pomodoroWork: number; pomodoroBreak: number; }
export interface WeatherData { city: string; temp: number; feelsLike: number; humidity: number; description: string; icon: string; wind: number; }
export interface GitHubEvent { type: string; repo: string; message: string; createdAt: string; }
export interface SpotifyData { isPlaying: boolean; track: string; artist: string; albumImage: string; trackUrl: string; previewUrl: string | null; }
export interface SpotifyRecentTrack { id: number; spotifyTrackId: string; track: string; artist: string; album: string; albumImageUrl: string; localImage: string | null; trackUrl: string; playedAt: string; createdAt: string; }
export interface ChatContextData {
  notes: Pick<Note, 'title' | 'content' | 'color' | 'pinned'>[];
  blogs: Pick<Blog, 'title' | 'slug' | 'category' | 'tags' | 'published'>[];
  todos: Pick<Todo, 'title' | 'completed' | 'priority'>[];
  bookmarks: Pick<Bookmark, 'title' | 'url' | 'tags'>[];
  snippets: Pick<Snippet, 'title' | 'language' | 'code'>[];
  projects: Pick<Project, 'title' | 'description' | 'category'>[];
}

export type JournalMood = 'calm' | 'good' | 'hard' | 'bright' | 'tired';
export interface JournalEntry { id: number; userId: number; entryDate: string; title: string; content: string; mood: JournalMood; image: string | null; createdAt: string; updatedAt: string | null; }
export type TabId = 'overview' | 'notes' | 'blogs' | 'projects' | 'messages' | 'todos' | 'payments' | 'bookmarks' | 'snippets' | 'analytics' | 'calendar' | 'timer' | 'chat' | 'spotify' | 'settings' | 'guestbook' | 'comments' | 'audit' | 'users' | 'social' | 'subscribers' | 'journal' | 'files';

export const COLOR_MAP: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  neutral: { bg: 'bg-neutral-900/60', border: 'border-white/10', text: 'text-white', badge: 'bg-neutral-800' },
  blue: { bg: 'bg-sky-950/40', border: 'border-sky-500/20', text: 'text-sky-100', badge: 'bg-sky-900/60' },
  green: { bg: 'bg-emerald-950/40', border: 'border-emerald-500/20', text: 'text-emerald-100', badge: 'bg-emerald-900/60' },
  amber: { bg: 'bg-amber-950/40', border: 'border-amber-500/20', text: 'text-amber-100', badge: 'bg-amber-900/60' },
  rose: { bg: 'bg-rose-950/40', border: 'border-rose-500/20', text: 'text-rose-100', badge: 'bg-rose-900/60' },
  violet: { bg: 'bg-violet-950/40', border: 'border-violet-500/20', text: 'text-violet-100', badge: 'bg-violet-900/60' },
};
