import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes safely.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Formats a date string, object, or timestamp into 'dd/MM/yyyy' or relative format (e.g., '3 jam yang lalu').
 * @param dateInput The date to be formatted.
 * @param lang The language for translation ('ID' | 'EN'). Defaults to 'ID'.
 * @returns Formatted date string or empty string if input is invalid.
 */
export function formatDate(dateInput: Date | string | number | undefined | null, lang: "ID" | "EN" = "ID"): string {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";
  
  const today = new Date();
  const isToday = date.getDate() === today.getDate() && 
                  date.getMonth() === today.getMonth() && 
                  date.getFullYear() === today.getFullYear();
                  
  if (isToday) {
    const diffMs = today.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffHours >= 1) {
      if (lang === "ID") {
        return `${diffHours} jam yang lalu`;
      } else {
        return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
      }
    } else {
      if (diffMins < 1) {
        return lang === "ID" ? "Baru saja" : "Just now";
      }
      if (lang === "ID") {
        return `${diffMins} menit yang lalu`;
      } else {
        return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
      }
    }
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

export function getArticleUrl(article: { category: string; subCategory?: string | null; slug: string }) {
  const cat = slugify(article.category || 'artikel');
  if (article.subCategory) {
    return `/${cat}/${slugify(article.subCategory)}/${article.slug}`;
  }
  return `/${cat}/${article.slug}`;
}
