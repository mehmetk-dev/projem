import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['user', 'admin'] }).notNull().default('user'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text('updated_at'),
}, (table) => [
  index('users_email_idx').on(table.email),
]);

export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at').notNull(),
  usedAt: integer('used_at'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
}, (table) => [
  index('reset_tokens_user_id_idx').on(table.userId),
  index('reset_tokens_token_idx').on(table.token),
]);

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
}, (table) => [
  index('sessions_user_id_idx').on(table.userId),
  index('sessions_token_idx').on(table.token),
]);

export const rateLimits = sqliteTable('rate_limits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  keyHash: text('key_hash').notNull().unique(),
  count: integer('count').notNull().default(0),
  resetAt: integer('reset_at').notNull(),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(current_timestamp)`),
}, (table) => [
  uniqueIndex('rate_limits_key_hash_unique').on(table.keyHash),
  index('rate_limits_reset_at_idx').on(table.resetAt),
]);

export const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  image: text('image'),
  color: text('color', { enum: ['neutral', 'blue', 'green', 'amber', 'rose', 'violet'] }).notNull().default('neutral'),
  pinned: integer('pinned', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text('updated_at'),
}, (table) => [
  index('notes_user_id_idx').on(table.userId),
  index('notes_updated_at_idx').on(table.updatedAt),
]);

// --- JOURNAL ---
export const journalEntries = sqliteTable('journal_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  entryDate: text('entry_date').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull().default(''),
  mood: text('mood', { enum: ['calm', 'good', 'hard', 'bright', 'tired'] }).notNull().default('calm'),
  image: text('image'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text('updated_at'),
}, (table) => [
  index('journal_user_id_idx').on(table.userId),
  index('journal_entry_date_idx').on(table.entryDate),
  uniqueIndex('journal_user_date_idx').on(table.userId, table.entryDate),
]);

// --- BLOG ---
export const blogs = sqliteTable('blogs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull().default(''),
  excerpt: text('excerpt'),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  ogImage: text('og_image'),
  coverImage: text('cover_image'),
  category: text('category').notNull().default('Genel'),
  tags: text('tags').notNull().default(''),
  published: integer('published', { mode: 'boolean' }).notNull().default(false),
  publishedAt: text('published_at'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text('updated_at'),
}, (table) => [
  index('blogs_slug_idx').on(table.slug),
  index('blogs_user_id_idx').on(table.userId),
  index('blogs_published_idx').on(table.published),
  index('blogs_category_idx').on(table.category),
]);

// --- PROJECTS ---
export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  image: text('image').notNull().default('/placeholder.svg'),
  link: text('link'),
  category: text('category').notNull().default('Genel'),
  displayOrder: integer('display_order').notNull().default(0),
  published: integer('published', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text('updated_at'),
}, (table) => [
  index('projects_user_id_idx').on(table.userId),
  index('projects_published_idx').on(table.published),
  index('projects_order_idx').on(table.displayOrder),
]);

// --- MESSAGES (Contact Form) ---
export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject'),
  content: text('content').notNull(),
  read: integer('read', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
}, (table) => [
  index('messages_read_idx').on(table.read),
  index('messages_created_at_idx').on(table.createdAt),
]);

// --- DIRECT MESSAGES (Admin <-> Users) ---
export const directMessages = sqliteTable('direct_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  senderId: integer('sender_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  readAt: text('read_at'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
}, (table) => [
  index('direct_messages_user_id_idx').on(table.userId),
  index('direct_messages_sender_id_idx').on(table.senderId),
  index('direct_messages_created_at_idx').on(table.createdAt),
]);

// --- TODOS ---
export const todos = sqliteTable('todos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  priority: text('priority', { enum: ['low', 'medium', 'high'] }).notNull().default('medium'),
  dueDate: text('due_date'),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  completedAt: text('completed_at'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text('updated_at'),
}, (table) => [
  index('todos_user_id_idx').on(table.userId),
  index('todos_completed_idx').on(table.completed),
  index('todos_due_date_idx').on(table.dueDate),
]);

// --- PAYMENTS ---
export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  amountCents: integer('amount_cents').notNull(),
  currency: text('currency').notNull().default('TRY'),
  type: text('type', { enum: ['expense', 'income'] }).notNull().default('expense'),
  category: text('category').notNull().default('other'),
  dueDate: text('due_date'),
  recurrence: text('recurrence', { enum: ['none', 'monthly'] }).notNull().default('none'),
  recurringDay: integer('recurring_day'),
  paid: integer('paid', { mode: 'boolean' }).notNull().default(false),
  paidAt: text('paid_at'),
  notes: text('notes').notNull().default(''),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text('updated_at'),
}, (table) => [
  index('payments_user_id_idx').on(table.userId),
  index('payments_due_date_idx').on(table.dueDate),
  index('payments_type_idx').on(table.type),
  index('payments_category_idx').on(table.category),
]);

// --- BOOKMARKS ---
export const bookmarks = sqliteTable('bookmarks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  url: text('url').notNull(),
  description: text('description').notNull().default(''),
  tags: text('tags').notNull().default(''),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
}, (table) => [
  index('bookmarks_user_id_idx').on(table.userId),
  index('bookmarks_url_idx').on(table.url),
]);

// --- CODE SNIPPETS ---
export const codeSnippets = sqliteTable('code_snippets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  code: text('code').notNull().default(''),
  language: text('language').notNull().default('typescript'),
  description: text('description').notNull().default(''),
  tags: text('tags').notNull().default(''),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text('updated_at'),
}, (table) => [
  index('snippets_user_id_idx').on(table.userId),
  index('snippets_language_idx').on(table.language),
]);

// --- CHAT ---
export const chatConversations = sqliteTable('chat_conversations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  title: text('title').notNull().default('Yeni Sohbet'),
  model: text('model').notNull().default('openai/gpt-4o-mini'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text('updated_at'),
}, (table) => [
  index('chat_conversations_user_id_idx').on(table.userId),
]);

export const chatMessages = sqliteTable('chat_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  conversationId: integer('conversation_id').notNull().references(() => chatConversations.id),
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
}, (table) => [
  index('chat_messages_conversation_id_idx').on(table.conversationId),
]);

export const chatSettings = sqliteTable('chat_settings', {
  userId: integer('user_id').primaryKey().references(() => users.id),
  systemPrompt: text('system_prompt').notNull().default('Sen Mehmet Kerem\'in kişisel asistanısın. Veritabanındaki tüm notlarını, bloglarını, görevlerini, linklerini ve kod snippetlerini bilirsin. Kullanıcı sana soru sorduğunda bu verileri kullanarak yardımcı olursun.'),
  defaultModel: text('default_model').notNull().default('openai/gpt-4o-mini'),
  temperature: text('temperature').notNull().default('0.7'),
  apiKey: text('api_key'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text('updated_at'),
});

export const userPreferences = sqliteTable('user_preferences', {
  userId: integer('user_id').primaryKey().references(() => users.id),
  hiddenTabs: text('hidden_tabs').notNull().default('[]'),
  pomodoroWork: integer('pomodoro_work').notNull().default(25),
  pomodoroBreak: integer('pomodoro_break').notNull().default(5),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text('updated_at'),
});

// --- COMMENTS ---
export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  blogId: integer('blog_id').notNull().references(() => blogs.id),
  parentId: integer('parent_id'),
  name: text('name').notNull(),
  email: text('email').notNull(),
  content: text('content').notNull(),
  approved: integer('approved', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
}, (table) => [
  index('comments_blog_id_idx').on(table.blogId),
  index('comments_approved_idx').on(table.approved),
  index('comments_parent_id_idx').on(table.parentId),
]);

// --- GUESTBOOK ---
export const guestbookEntries = sqliteTable('guestbook_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  message: text('message').notNull(),
  approved: integer('approved', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
}, (table) => [
  index('guestbook_approved_idx').on(table.approved),
  index('guestbook_created_at_idx').on(table.createdAt),
]);

// --- AUDIT LOGS ---
export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  action: text('action', { enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'PUBLISH'] }).notNull(),
  entity: text('entity', { enum: ['blog', 'project', 'note', 'todo', 'bookmark', 'snippet', 'message', 'comment', 'guestbook', 'user', 'settings'] }).notNull(),
  entityId: integer('entity_id'),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  ipAddress: text('ip_address'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
}, (table) => [
  index('audit_user_id_idx').on(table.userId),
  index('audit_entity_idx').on(table.entity),
  index('audit_action_idx').on(table.action),
  index('audit_created_at_idx').on(table.createdAt),
]);

// --- SITE SETTINGS ---
export const siteSettings = sqliteTable('site_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value').notNull().default(''),
  description: text('description'),
  updatedAt: text('updated_at'),
}, (table) => [
  index('settings_key_idx').on(table.key),
]);

// --- SOCIAL LINKS ---
export const socialLinks = sqliteTable('social_links', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  platform: text('platform').notNull(),
  url: text('url').notNull(),
  icon: text('icon').notNull().default('link'),
  displayOrder: integer('display_order').notNull().default(0),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
}, (table) => [
  index('social_links_order_idx').on(table.displayOrder),
]);

// --- SPOTIFY HISTORY ---
export const spotifyRecentTracks = sqliteTable('spotify_recent_tracks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  spotifyTrackId: text('spotify_track_id').notNull(),
  track: text('track').notNull(),
  artist: text('artist').notNull(),
  album: text('album').notNull().default(''),
  albumImageUrl: text('album_image_url').notNull().default(''),
  localImage: text('local_image'),
  trackUrl: text('track_url').notNull().default(''),
  playedAt: text('played_at').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
}, (table) => [
  uniqueIndex('spotify_recent_tracks_unique_idx').on(table.spotifyTrackId, table.playedAt),
  index('spotify_recent_tracks_played_at_idx').on(table.playedAt),
]);

// --- NEWSLETTER SUBSCRIBERS ---
export const subscribers = sqliteTable('subscribers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  status: text('status', { enum: ['active', 'unsubscribed'] }).notNull().default('active'),
  ipAddress: text('ip_address'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
}, (table) => [
  index('subscribers_email_idx').on(table.email),
  index('subscribers_status_idx').on(table.status),
]);

// --- ANALYTICS ---
export const pageViews = sqliteTable('page_views', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  page: text('page').notNull(),
  referrer: text('referrer'),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  sessionId: text('session_id'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(current_timestamp)`),
}, (table) => [
  index('page_views_page_idx').on(table.page),
  index('page_views_created_at_idx').on(table.createdAt),
]);
