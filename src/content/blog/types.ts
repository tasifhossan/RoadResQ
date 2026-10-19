export type BlogCategory = "Safety" | "Maintenance" | "Emergency";

export interface BlogSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategory;
  publishedAt: string;
  readingMinutes: number;
  sections: BlogSection[];
}
