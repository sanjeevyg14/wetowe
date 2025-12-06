/**
 * Basic HTML sanitizer to prevent XSS attacks.
 * In a production environment, use a robust library like 'dompurify'.
 * This simple implementation removes script tags and on* attributes.
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';

  // 1. Remove <script> tags and content
  let clean = html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");

  // 2. Remove event handlers (e.g., onclick, onload)
  clean = clean.replace(/ on\w+="[^"]*"/g, "");
  clean = clean.replace(/ on\w+='[^']*'/g, "");
  
  // 3. Remove javascript: links
  clean = clean.replace(/href="javascript:[^"]*"/g, 'href="#"');
  
  // 4. Remove iframe tags (often used for attacks)
  clean = clean.replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gim, "");

  return clean;
};
