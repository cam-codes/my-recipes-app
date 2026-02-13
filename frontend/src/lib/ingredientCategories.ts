export type Category =
  | 'Liquor'
  | 'Spices&Oils'
  | 'International'
  | 'Dry Goods'
  | 'Canned Goods & Condiments'
  | 'Bakery'
  | 'Dairy'
  | 'Meat'
  | 'Seafood'
  | 'Produce'
  | 'Unknown';

export const INGREDIENT_CATEGORY_MAP: Record<string, Category> = {
  // Bakery
  'baguette': 'Bakery',
  'cornbread': 'Bakery',
  'country bread': 'Bakery',
  'crusty bread': 'Bakery',

  // Canned Goods & Condiments
  'anchovy fillets': 'Canned Goods & Condiments',
  'anchovy paste': 'Canned Goods & Condiments',
  'apple cider': 'Canned Goods & Condiments',
  'black beans': 'Canned Goods & Condiments',
  'capers': 'Canned Goods & Condiments',
  'diced tomatoes': 'Canned Goods & Condiments',
  'dijon mustard': 'Canned Goods & Condiments',
  'kidney beans': 'Canned Goods & Condiments',
  'low-sodium beef stock': 'Canned Goods & Condiments',
  'low-sodium chicken stock': 'Canned Goods & Condiments',
  'marinara sauce': 'Canned Goods & Condiments',
  'sun-dried tomatoes': 'Canned Goods & Condiments',
  'tomato paste': 'Canned Goods & Condiments',
  'whole tomatoes': 'Canned Goods & Condiments',
  'worcestershire sauce': 'Canned Goods & Condiments',

  // Dairy
  'cheddar': 'Dairy',
  'creme fraiche': 'Dairy',
  'egg': 'Dairy',
  'egg yolk': 'Dairy',
  'heavy cream': 'Dairy',
  'mozzarella cheese': 'Dairy',
  'parmesan': 'Dairy',
  'shredded mozzarella': 'Dairy',
  'unsalted butter': 'Dairy',
  'whole egg': 'Dairy',

  // Dry Goods
  'all-purpose flour': 'Dry Goods',
  'arborio rice': 'Dry Goods',
  'baking soda': 'Dry Goods',
  'beef broth': 'Dry Goods',
  'beef stock': 'Dry Goods',
  'breadcrumbs': 'Dry Goods',
  'chicken broth': 'Dry Goods',
  'chicken stock': 'Dry Goods',
  'chocolate chips': 'Dry Goods',
  'dark chocolate': 'Dry Goods',
  'flour': 'Dry Goods',
  'granulated sugar': 'Dry Goods',
  'instant espresso powder': 'Dry Goods',
  'jasmine rice': 'Dry Goods',
  'oats': 'Dry Goods',
  'pecans': 'Dry Goods',
  'vanilla extract': 'Dry Goods',
  'rice': 'Dry Goods',
  'spaghetti': 'Dry Goods',
  'sugar': 'Dry Goods',
  'vegetable stock': 'Dry Goods',
  'walnuts': 'Dry Goods',

  // International
  'gochujang': 'International',
  'kimchi': 'International',
  'mirin': 'International',
  'miso paste': 'International',
  'saffron': 'International',
  'soy sauce': 'International',

  // Liquor
  'dark beer': 'Liquor',
  'red wine': 'Liquor',
  'white wine': 'Liquor',

  // Meat
  'beef chuck': 'Meat',
  'beef shank': 'Meat',
  'beef sirloin': 'Meat',
  'chicken breast': 'Meat',
  'chicken thigh': 'Meat',
  'ground chicken': 'Meat',
  'ground beef': 'Meat',
  'ground pork': 'Meat',
  'lamb shank': 'Meat',
  'oxtails': 'Meat',
  'pork tenderloin': 'Meat',
  'ribeye': 'Meat',
  'sirloin tips': 'Meat',

  // Produce
  'ancho chilies': 'Produce',
  'apples': 'Produce',
  'asparagus': 'Produce',
  'avocado': 'Produce',
  'basil': 'Produce',
  'beet': 'Produce',
  'beet greens': 'Produce',
  'berries': 'Produce',
  'bok choy': 'Produce',
  'carrot': 'Produce',
  'celery': 'Produce',
  'cilantro': 'Produce',
  'garlic': 'Produce',
  'green bean': 'Produce',
  'guajillo chilies': 'Produce',
  'lemon': 'Produce',
  'mushrooms': 'Produce',
  'onion': 'Produce',
  'parsley': 'Produce',
  'parsnip': 'Produce',
  'romaine': 'Produce',
  'root vegetable': 'Produce',
  'spinach': 'Produce',
  'sweet potato': 'Produce',
  'turnip': 'Produce',

  // Seafood
  'salmon': 'Seafood',
  'scallops': 'Seafood',

  // Spices&Oils
  'balsamic vinegar': 'Spices&Oils',
  'bay leaf': 'Spices&Oils',
  'bay leaves': 'Spices&Oils',
  'black pepper': 'Spices&Oils',
  'butter': 'Spices&Oils',
  'cinnamon': 'Spices&Oils',
  'cumin': 'Spices&Oils',
  'italian seasoning': 'Spices&Oils',
  'garlic powder': 'Spices&Oils',
  'nutmeg': 'Spices&Oils',
  'olive oil': 'Spices&Oils',
  'oregano': 'Spices&Oils',
  'red pepper flakes': 'Spices&Oils',
  'rosemary': 'Spices&Oils',
  'salt': 'Spices&Oils',
  'sesame oil': 'Spices&Oils',
  'smoked paprika': 'Spices&Oils',
  'thyme': 'Spices&Oils',
  'truffle oil': 'Spices&Oils',
  'vegetable oil': 'Spices&Oils',
};

export const DEFAULT_CATEGORY: Category = 'Unknown';

const CATEGORY_KEYS = Object.keys(INGREDIENT_CATEGORY_MAP).sort((a, b) => b.length - a.length);

const matchesKey = (ingredient: string, key: string) => {
  if (ingredient.includes(key)) return true;
  if (!key.endsWith('s') && ingredient.includes(`${key}s`)) return true;
  return false;
};

export const getIngredientCategory = (ingredient: string): Category => {
  const normalized = ingredient.toLowerCase().trim();
  const exact = INGREDIENT_CATEGORY_MAP[normalized];
  if (exact) return exact;

  for (const key of CATEGORY_KEYS) {
    if (matchesKey(normalized, key)) {
      return INGREDIENT_CATEGORY_MAP[key];
    }
  }

  return DEFAULT_CATEGORY;
};
