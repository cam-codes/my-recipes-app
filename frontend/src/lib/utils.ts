import type { AggregatedIngredient, GroupedIngredient, ParsedIngredient, Recipe } from './types';
import { type Category, getIngredientCategory } from './ingredientCategories';
import { flattenIngredients } from './ingredients';
import {
  EXCLUDED_INGREDIENTS,
  IRREGULAR_PLURAL_MAP,
  IRREGULAR_SINGULAR_MAP,
  SIZE_ADJECTIVES,
  UNIT_PLURAL_MAP,
  UNIT_SINGULAR_MAP,
} from './mappings';

const cleanIngredient = (ingredient: string) => {
  let cleaned = ingredient.toLowerCase();
  cleaned = cleaned.replace(/[\u2013\u2014]/g, '-');
  cleaned = cleaned.replace(/\([^)]*\)/g, '');
  cleaned = cleaned.split(',')[0];
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
};

const parseFraction = (value: string) => {
  const [numerator, denominator] = value.split('/').map(Number);
  if (!denominator) return 0;
  return numerator / denominator;
};

const parseQuantityValue = (value: string) => {
  const parts = value.trim().split(' ');
  if (parts.length === 2) {
    const whole = Number(parts[0]);
    const fraction = parseFraction(parts[1]);
    return whole + fraction;
  }
  if (value.includes('/')) {
    return parseFraction(value);
  }
  return Number(value);
};

const singularizeToken = (word: string) => {
  if (IRREGULAR_SINGULAR_MAP[word]) return IRREGULAR_SINGULAR_MAP[word];
  if (word.endsWith('ies')) return `${word.slice(0, -3)}y`;
  if (word.endsWith('oes')) return word.slice(0, -2);
  if (word.endsWith('ves')) return `${word.slice(0, -3)}f`;
  if (word.endsWith('ches') || word.endsWith('shes') || word.endsWith('ses')) {
    return word.slice(0, -2);
  }
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
};

const singularizeName = (name: string) => {
  const tokens = name.split(' ');
  if (tokens.length === 0) return name;
  tokens[tokens.length - 1] = singularizeToken(tokens[tokens.length - 1]);
  return tokens.join(' ');
};

const pluralizeToken = (word: string) => {
  if (IRREGULAR_PLURAL_MAP[word]) return IRREGULAR_PLURAL_MAP[word];
  if (word.endsWith('y') && !/[aeiou]y$/.test(word)) {
    return `${word.slice(0, -1)}ies`;
  }
  if (word.endsWith('s')) return word;
  return `${word}s`;
};

const pluralizeUnit = (unit: string) => UNIT_PLURAL_MAP[unit] ?? pluralizeToken(unit);

const pluralizeName = (name: string) => {
  const tokens = name.split(' ');
  if (tokens.length === 0) return name;
  tokens[tokens.length - 1] = pluralizeToken(tokens[tokens.length - 1]);
  return tokens.join(' ');
};

const formatQuantity = (value: number) => {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
};

const formatQuantityRange = (min: number, max: number) => {
  if (min === max) return formatQuantity(min);
  return `${formatQuantity(min)}-${formatQuantity(max)}`;
};

const parseIngredient = (ingredient: string): ParsedIngredient => {
  const cleaned = cleanIngredient(ingredient);
  // Match a leading quantity (with optional range) plus the rest of the ingredient.
  // Examples that should match:
  // - "1 cup sugar" -> min=1, max=1, rest="cup sugar"
  // - "1/2 cup sugar" -> min=1/2, max=1/2, rest="cup sugar"
  // - "1 1/2 cups sugar" -> min=1 1/2, max=1 1/2, rest="cups sugar"
  // - "1-2 lbs chicken" -> min=1, max=2, rest="lbs chicken"
  // - "1 1/2 - 2 1/2 lbs chicken" -> min=1 1/2, max=2 1/2, rest="lbs chicken"
  // Captures:
  //  1) quantity min (integer, fraction, or mixed number)
  //  2) quantity max (optional; same forms as min)
  //  3) the remainder of the ingredient (unit + name)
  const quantityPattern = String.raw`\d+(?:\s+\d+/\d+)?|\d+/\d+`;
  const ingredientPattern = String.raw`^(${quantityPattern})(?:\s*-\s*(${quantityPattern}))?\s+(.*)$`;
  const match = cleaned.match(new RegExp(ingredientPattern));

  if (!match) {
    return {
      key: `raw|${cleaned}`,
      nameKey: cleaned,
      displayName: cleaned,
      categoryName: cleaned,
      unit: null,
      quantityMin: null,
      quantityMax: null,
      hasQuantity: false,
    };
  }

  const quantityMin = parseQuantityValue(match[1]);
  const quantityMax = match[2] ? parseQuantityValue(match[2]) : quantityMin;
  const rest = match[3] ?? '';
  const tokens = rest.split(' ');
  const unitCandidate = UNIT_SINGULAR_MAP[tokens[0]];
  let unit: string | null = null;
  let nameTokens = tokens;

  if (unitCandidate) {
    unit = unitCandidate;
    nameTokens = tokens.slice(1);
  }

  if (nameTokens[0] === 'of') {
    nameTokens = nameTokens.slice(1);
  }

  while (nameTokens.length > 0 && SIZE_ADJECTIVES.has(nameTokens[0])) {
    nameTokens = nameTokens.slice(1);
  }

  const name = nameTokens.join(' ').trim() || rest;
  const nameKey = singularizeName(name);
  const key = `${unit ?? 'count'}|${nameKey}`;
  const displayName = unit ? name : nameKey;

  return {
    key,
    nameKey,
    displayName,
    categoryName: cleaned,
    unit,
    quantityMin,
    quantityMax,
    hasQuantity: true,
  };
};

const shouldExcludeIngredient = (parsed: ParsedIngredient) =>
  EXCLUDED_INGREDIENTS.has(parsed.nameKey);

const buildDisplay = (item: AggregatedIngredient) => {
  if (item.quantityMin == null || item.quantityMax == null) return item.displayName;
  const quantity = formatQuantityRange(item.quantityMin, item.quantityMax);
  const usePlural = item.quantityMax > 1;

  if (item.unit) {
    const unitText = usePlural ? pluralizeUnit(item.unit) : item.unit;
    return `${quantity} ${unitText} ${item.displayName}`;
  }

  const nameText = usePlural ? pluralizeName(item.displayName) : item.displayName;
  return `${quantity} ${nameText}`;
};

export const groupIngredientsByCategory = (
  recipes: Recipe[],
): Partial<Record<Category, GroupedIngredient[]>> => {
  const aggregated = new Map<string, AggregatedIngredient>();

  for (const recipe of recipes) {
    for (const ingredient of flattenIngredients(recipe.ingredients)) {
      const parsed = parseIngredient(ingredient);
      if (shouldExcludeIngredient(parsed)) continue;
      const existing = aggregated.get(parsed.key);

      if (!existing) {
        aggregated.set(parsed.key, {
          key: parsed.key,
          nameKey: parsed.nameKey,
          displayName: parsed.displayName,
          unit: parsed.unit,
          quantityMin: parsed.quantityMin,
          quantityMax: parsed.quantityMax,
          recipes: [recipe.title],
          category: getIngredientCategory(parsed.categoryName),
        });
        continue;
      }

      if (!existing.recipes.includes(recipe.title)) {
        existing.recipes.push(recipe.title);
      }

      if (
        parsed.hasQuantity &&
        existing.quantityMin != null &&
        existing.quantityMax != null &&
        parsed.quantityMin != null &&
        parsed.quantityMax != null
      ) {
        existing.quantityMin += parsed.quantityMin;
        existing.quantityMax += parsed.quantityMax;
      }
    }
  }

  const groups: Partial<Record<Category, GroupedIngredient[]>> = {};

  for (const item of aggregated.values()) {
    const category = item.category;
    groups[category] ??= [];
    groups[category]!.push({
      key: item.key,
      display: buildDisplay(item),
      recipes: item.recipes,
    });
  }

  return groups;
};
