export type Category =
  | 'Liquor'
  | 'Spices&Oils'
  | 'International'
  | 'Dry Goods'
  | 'Canned-Goods&Condiments'
  | 'Bakery'
  | 'Dairy'
  | 'Meat'
  | 'Seafood'
  | 'Produce'
  | 'Unknown'
  ;

export const INGREDIENT_CATEGORY_MAP: Record<string, Category> = {
  // Liquor
  'dark beer': 'Liquor',
  'red wine': 'Liquor',
  'white wine': 'Liquor',

  // Spices&Oils
  'bay leaf': 'Spices&Oils',
  'black pepper': 'Spices&Oils',
  'butter': 'Spices&Oils',
  'cinnamon': 'Spices&Oils',
  'cumin': 'Spices&Oils',
  'garlic powder': 'Spices&Oils',
  'olive oil': 'Spices&Oils',
  'oregano': 'Spices&Oils',
  'red pepper flakes': 'Spices&Oils',
  'rosemary': 'Spices&Oils',
  'salt': 'Spices&Oils',
  'sesame oil': 'Spices&Oils',
  'smoked paprika': 'Spices&Oils',
  'thyme': 'Spices&Oils',
  'truffle oil': 'Spices&Oils',

  // International
  'anchovy fillets': 'International',
  'anchovy paste': 'International',
  'mirin': 'International',
  'miso paste': 'International',
  'saffron': 'International',
  'soy sauce': 'International',
  'worcestershire sauce': 'International',

  // Dry Goods
  'all-purpose flour': 'Dry Goods',
  'arborio rice': 'Dry Goods',
  'dark chocolate': 'Dry Goods',
  'granulated sugar': 'Dry Goods',
  'instant espresso powder': 'Dry Goods',
  'jasmine rice': 'Dry Goods',
  'pure vanilla extract': 'Dry Goods',
  'spaghetti': 'Dry Goods',

  // Canned-Goods&Condiments
  'apple cider': 'Canned-Goods&Condiments',
  'black beans': 'Canned-Goods&Condiments',
  'capers': 'Canned-Goods&Condiments',
  'diced tomatoes': 'Canned-Goods&Condiments',
  'dijon mustard': 'Canned-Goods&Condiments',
  'kidney beans': 'Canned-Goods&Condiments',
  'low-sodium beef stock': 'Canned-Goods&Condiments',
  'low-sodium chicken stock': 'Canned-Goods&Condiments',
  'san marzano tomatoes': 'Canned-Goods&Condiments',
  'sun-dried tomatoes': 'Canned-Goods&Condiments',
  'tomato paste': 'Canned-Goods&Condiments',

  // Bakery
  'baguette': 'Bakery',
  'cornbread': 'Bakery',
  'country bread': 'Bakery',
  'crusty bread': 'Bakery',

  // Dairy
  'cheddar': 'Dairy',
  'creme fraiche': 'Dairy',
  'egg yolk': 'Dairy',
  'heavy cream': 'Dairy',
  'parmesan': 'Dairy',
  'unsalted butter': 'Dairy',
  'whole egg': 'Dairy',

  // Meat
  'beef chuck': 'Meat',
  'beef shank': 'Meat',
  'chicken breast': 'Meat',
  'ground beef': 'Meat',
  'ground pork': 'Meat',
  'pork tenderloin': 'Meat',
  'sirloin tips': 'Meat',

  // Seafood
  'salmon': 'Seafood',

  // Produce
  'ancho chilies': 'Produce',
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
  'spinach': 'Produce',
  'sweet potato': 'Produce',
  'turnip': 'Produce',
};

export const DEFAULT_CATEGORY: Category = 'Unknown';
