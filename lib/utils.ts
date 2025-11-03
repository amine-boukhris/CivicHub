import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export  async function shareLink (url: string, title: string, text?: string)  {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: text || "",
        url,
      });
    } catch (err) {
      console.log("Share cancelled");
    }
  } else {
    // Fallback - copy to clipboard
    await navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  }
}