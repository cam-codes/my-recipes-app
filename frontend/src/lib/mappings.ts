export const SIZE_ADJECTIVES = new Set(['small', 'medium', 'large', 'extra-large', 'xl']);

export const UNIT_SINGULAR_MAP: Record<string, string> = {
  clove: 'clove',
  cloves: 'clove',
  cup: 'cup',
  cups: 'cup',
  tablespoon: 'tablespoon',
  tablespoons: 'tablespoon',
  tbsp: 'tablespoon',
  teaspoon: 'teaspoon',
  teaspoons: 'teaspoon',
  tsp: 'teaspoon',
  ounce: 'ounce',
  ounces: 'ounce',
  oz: 'ounce',
  pound: 'pound',
  pounds: 'pound',
  lb: 'pound',
  lbs: 'pound',
  can: 'can',
  cans: 'can',
  jar: 'jar',
  jars: 'jar',
  package: 'package',
  packages: 'package',
  bunch: 'bunch',
  bunches: 'bunch',
  sprig: 'sprig',
  sprigs: 'sprig',
  slice: 'slice',
  slices: 'slice',
  piece: 'piece',
  pieces: 'piece',
  leaf: 'leaf',
  leaves: 'leaf',
};

export const UNIT_PLURAL_MAP: Record<string, string> = {
  clove: 'cloves',
  leaf: 'leaves',
};

export const IRREGULAR_SINGULAR_MAP: Record<string, string> = {
  leaves: 'leaf',
};

export const IRREGULAR_PLURAL_MAP: Record<string, string> = {
  leaf: 'leaves',
};

export const EXCLUDED_INGREDIENTS = new Set(['water']);
