export function normalizeHiddenTabs<T extends string>(hiddenTabs: readonly string[], configurableTabs: readonly T[]): T[] {
  const configurable = new Set(configurableTabs);
  return hiddenTabs.filter((tab): tab is T => configurable.has(tab as T));
}

export function getVisibleTabIds<T extends string>(
  allTabs: readonly T[],
  hiddenTabs: readonly string[],
  configurableTabs: readonly T[]
): T[] {
  const hidden = new Set(normalizeHiddenTabs(hiddenTabs, configurableTabs));
  return allTabs.filter((tab) => !hidden.has(tab));
}

export function parseHiddenTabs(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}
