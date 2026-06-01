import assert from 'node:assert/strict';
import test from 'node:test';
import { getVisibleTabIds, normalizeHiddenTabs } from './preferences';

const allTabs = ['overview', 'notes', 'blogs', 'payments', 'settings'] as const;
const configurableTabs = ['overview', 'notes', 'payments'] as const;

test('normalizeHiddenTabs keeps only configurable ids', () => {
  assert.deepEqual(normalizeHiddenTabs(['notes', 'blogs', 'settings', 'bad'], configurableTabs), ['notes']);
});

test('getVisibleTabIds hides configurable tabs but always keeps non-configurable tabs', () => {
  assert.deepEqual(getVisibleTabIds(allTabs, ['notes', 'blogs'], configurableTabs), ['overview', 'blogs', 'payments', 'settings']);
});
