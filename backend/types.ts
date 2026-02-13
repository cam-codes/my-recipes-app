export interface RecipeFrontMatter {
  title?: string;

  // meta
  description?: string;
  image?: string;

  // timing/cost
  prepTime?: number | string; // allow string since YAML can parse as string
  cookTime?: number | string;
  estimatedCost?: number | string;

  // content
  ingredients?: string[];
  instructions?: string[];
  tips?: string[];

  // allow for future expansion
  [key: string]: unknown;
}

export interface ResumeFrontMatter {
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
    details?: Array<string | Record<string, string>>;
  }>;
  volunteering: string[];
}

export interface CreateAppOptions {
  recipesDir: URL;
  resumeFile: URL;
  ratingsFile?: URL;
}
