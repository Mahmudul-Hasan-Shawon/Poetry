export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .substring(0, 200);
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  }
}

export function shareWriting(writing, author) {
  const text = `"${writing.text}"\n\n— ${author}`;
  if (navigator.share) {
    navigator.share({ title: `Words by ${author}`, text });
  } else {
    copyToClipboard(text);
  }
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function truncate(text, length = 150) {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + '...';
}

export function getReadingTime(text) {
  if (!text) return '1 min read';
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
}

export function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function friendlyDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) return '';
  return `${d} ${MONTHS[m - 1]}, ${y}`;
}

export function toInputDate(display) {
  if (!display) return '';
  const match = display.match(/^(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})$/);
  if (!match) return '';
  const month = MONTHS.findIndex((name) => name.toLowerCase() === match[2].toLowerCase());
  if (month === -1) return '';
  const day = parseInt(match[1], 10);
  const year = parseInt(match[3], 10);
  const d = new Date(Date.UTC(year, month, day));
  if (d.getUTCMonth() !== month || d.getUTCDate() !== day) return '';
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

export const WRITING_TYPES = [
  { value: 'quote', label: 'Quote' },
  { value: 'poetry', label: 'Poetry' },
  { value: 'verse', label: 'Verse' },
  { value: 'ghazal', label: 'Ghazal' },
  { value: 'proverb', label: 'Proverb' },
  { value: 'wisdom', label: 'Wisdom' },
  { value: 'reflection', label: 'Reflection' },
  { value: 'letter', label: 'Letter' },
];

export const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'bangla', label: 'Bangla' },
  { value: 'urdu', label: 'Urdu' },
  { value: 'persian', label: 'Persian' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'french', label: 'French' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'turkish', label: 'Turkish' },
  { value: 'german', label: 'German' },
];

export const STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

export const VERIFICATION_STATUSES = [
  { value: 'verified', label: 'Verified' },
  { value: 'attributed', label: 'Attributed' },
  { value: 'unverified', label: 'Unverified' },
];
