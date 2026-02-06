export interface RecipeListItem {
  slug: string;
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  image: string;
}

export interface Recipe extends RecipeListItem {
  slug: string;
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  estimatedCost: number;
  ingredients: string[];
  instructions: string[];
  tips: string[];
  image: string;
}

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  summary: string;
  skills: Record<string, string[]>;
  experience: Array<{
    role: string;
    company: string;
    location: string;
    dates: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    school: string;
    location: string;
    dates: string;
    details: Array<string | Record<string, string>>;
  }>;
  volunteering: string[];
}
