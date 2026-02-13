import { describe, expect, it } from 'vitest';
import {
  EXCLUDED_INGREDIENTS,
  IRREGULAR_PLURAL_MAP,
  IRREGULAR_SINGULAR_MAP,
  SIZE_ADJECTIVES,
  UNIT_PLURAL_MAP,
  UNIT_SINGULAR_MAP,
} from './mappings';

describe('mappings', () => {
  it('includes base sizing and unit mappings', () => {
    expect(SIZE_ADJECTIVES.has('medium')).toBe(true);
    expect(UNIT_SINGULAR_MAP.leaves).toBe('leaf');
    expect(UNIT_PLURAL_MAP.leaf).toBe('leaves');
  });

  it('handles irregular pluralization entries', () => {
    expect(IRREGULAR_SINGULAR_MAP.leaves).toBe('leaf');
    expect(IRREGULAR_PLURAL_MAP.leaf).toBe('leaves');
  });

  it('excludes ingredients that should never appear', () => {
    expect(EXCLUDED_INGREDIENTS.has('water')).toBe(true);
  });
});
