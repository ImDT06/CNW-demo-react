import { catalog, categories } from '../data/catalog.js';
const fold = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
export function parseCatalogQuery(params) {
  return {
    q: params.get('q') || '',
    category: categories.some((c) => c.id === params.get('category'))
      ? params.get('category')
      : 'all',
    sort: ['featured', 'price-asc', 'price-desc', 'name'].includes(params.get('sort'))
      ? params.get('sort')
      : 'featured',
    available: params.get('available') === 'true',
  };
}
export function selectProducts(query = {}, products = catalog) {
  const result = products.filter(
    (p) =>
      (!query.q || fold(p.name).includes(fold(query.q))) &&
      (!query.category || query.category === 'all' || p.category === query.category) &&
      (!query.available || p.stock > 0),
  );
  if (query.sort === 'price-asc') result.sort((a, b) => a.price - b.price);
  else if (query.sort === 'price-desc') result.sort((a, b) => b.price - a.price);
  else if (query.sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  else result.sort((a, b) => Number(b.featured) - Number(a.featured));
  return result;
}
