/* ======== Utility functions ========= */

const cyrillicToMongolianLatin = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 
  'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'i', 'к': 'k', 'л': 'l', 'м': 'm', 
  'н': 'n', 'о': 'o', 'ө': 'u', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 
  'у': 'u', 'ү': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 
  'щ': 'sh', 'ъ': '', 'ы': 'ii', 'ь': 'i', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  'А': 'a', 'Б': 'b', 'В': 'v', 'Г': 'g', 'Д': 'd', 'Е': 'e', 'Ё': 'yo', 
  'Ж': 'j', 'З': 'z', 'И': 'i', 'Й': 'i', 'К': 'k', 'Л': 'l', 'М': 'm', 
  'Н': 'n', 'О': 'o', 'Ө': 'u', 'П': 'p', 'Р': 'r', 'С': 's', 'Т': 't', 
  'У': 'u', 'Ү': 'u', 'Ф': 'f', 'Х': 'kh', 'Ц': 'ts', 'Ч': 'ch', 'Ш': 'sh', 
  'Щ': 'sh', 'Ъ': '', 'Ы': 'ii', 'Ь': 'i', 'Э': 'e', 'Ю': 'yu', 'Я': 'ya'
}

const transliterateCyrillicToLatin = (text) => {
  return text.split('').map(char => cyrillicToMongolianLatin[char] || char).join('');
}

export const slugify = (text) => {
  return transliterateCyrillicToLatin(text).toString().toLowerCase().trim().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '');
}

export const removeHttp = (url) => {
  if (!url) return '';
  if (url.startsWith('https://')) {
    return url.replace('https://', '');
  } else if (url.startsWith('http://')) {
    return url.replace('http://', '');
  }
  return url;
}

export function removeHTMLTags(str) {
  if (!str) return '';
  return str.replace(/<\/?[^>]+(>|$)/g, '');
}