import { RecipeFrontMatter } from "../types.ts";

export function normalizeRecipe(slug: string, attrs: RecipeFrontMatter) {
  const collection =
    typeof attrs.collection === "string" &&
      attrs.collection.toLowerCase() === "sweet"
      ? "sweet"
      : "savory";
  return {
    slug,
    title: attrs.title ??
      slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    description: attrs.description ?? "",
    image: `/recipes/${slug}/image.jpg`,
    collection,
    prepTime: attrs.prepTime != null ? attrs.prepTime : 0,
    cookTime: attrs.cookTime != null ? attrs.cookTime : 0,
    estimatedCost: attrs.estimatedCost != null ? attrs.estimatedCost : 0,
    ingredients: Array.isArray(attrs.ingredients) ? attrs.ingredients : [],
    instructions: Array.isArray(attrs.instructions) ? attrs.instructions : [],
    tips: Array.isArray(attrs.tips) ? attrs.tips : [],
  };
}
