// Loads the two editable language files and restores paired fields used by the pages.
async function loadSiteContent() {
  const [arResponse, enResponse] = await Promise.all([
    fetch('/data/ar.json'),
    fetch('/data/en.json'),
  ]);
  if (!arResponse.ok || !enResponse.ok) throw new Error('Unable to load the language content files.');
  const [ar, en] = await Promise.all([arResponse.json(), enResponse.json()]);

  function combine(arValue, enValue) {
    if (arValue === undefined) return enValue;
    if (enValue === undefined) return arValue;
    if (Array.isArray(arValue) || Array.isArray(enValue)) {
      const left = Array.isArray(arValue) ? arValue : [];
      const right = Array.isArray(enValue) ? enValue : [];
      const rightById = new Map(right.filter(item => item && typeof item === 'object' && item.id).map(item => [item.id, item]));
      const used = new Set();
      const merged = left.map((item, index) => {
        const match = item && typeof item === 'object' && item.id ? rightById.get(item.id) : right[index];
        if (match && typeof match === 'object' && match.id) used.add(match.id);
        return combine(item, match);
      });
      right.forEach((item, index) => {
        if (item && typeof item === 'object' && item.id && !used.has(item.id)) merged.push(combine(undefined, item));
        else if (index >= left.length && !(item && typeof item === 'object' && item.id)) merged.push(combine(undefined, item));
      });
      return merged;
    }
    if ((arValue && typeof arValue === 'object') || (enValue && typeof enValue === 'object')) {
      const left = arValue && typeof arValue === 'object' ? arValue : {};
      const right = enValue && typeof enValue === 'object' ? enValue : {};
      const result = {};
      for (const key of new Set([...Object.keys(left), ...Object.keys(right)])) {
        const hasArabic = Object.hasOwn(left, key);
        const hasEnglish = Object.hasOwn(right, key);
        if (hasArabic && hasEnglish && left[key] && right[key] && typeof left[key] === 'object' && typeof right[key] === 'object') {
          result[key] = combine(left[key], right[key]);
        } else if (hasArabic && hasEnglish && left[key] !== right[key]) {
          result[key] = left[key];
          result[`${key}En`] = right[key];
        } else if (hasArabic) {
          result[key] = left[key];
          if (hasEnglish && right[key] && typeof right[key] === 'object') result[key] = combine(left[key], right[key]);
        } else if (hasEnglish) {
          result[`${key}En`] = right[key];
        }
      }
      return result;
    }
    return arValue === undefined ? enValue : arValue;
  }

  return combine(ar, en);
}
