/**
 * Export hardcoded catalog JSON → CSV for Supabase Table Editor upload.
 *
 * Usage: node scripts/export-products-csv.js
 * Output:
 *   exports/products-catalog.csv
 *   exports/categories-catalog.csv
 *
 * Upload order: categories first, then products.
 * For `images`, use pipe-separated URLs. After import, convert with SQL if needed:
 *   UPDATE products SET images = string_to_array(images::text, '|') ...
 * Prefer seed script for arrays/jsonb; this CSV is for spreadsheet review + Table Editor.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadJSON(rel) {
  return JSON.parse(readFileSync(resolve(root, rel), 'utf8'));
}

function normalizeCurrency(currency) {
  if (!currency) return 'USD';
  const c = String(currency).trim();
  if (['₹', 'Rs', 'rs', 'INR', 'inr'].includes(c)) return 'INR';
  if (['$', 'USD', 'usd'].includes(c)) return 'USD';
  if (['€', 'EUR', 'eur'].includes(c)) return 'EUR';
  if (['£', 'GBP', 'gbp'].includes(c)) return 'GBP';
  return c.toUpperCase();
}

function originCode(name) {
  const n = (name || 'India').toLowerCase();
  if (n.includes('german')) return 'DE';
  if (n.includes('denmark') || n.includes('danish')) return 'DK';
  return 'IN';
}

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(headers, rows) {
  return [headers.join(','), ...rows.map((r) => r.map(csvEscape).join(','))].join('\n');
}

const products = loadJSON('src/data/products.json');
const categories = loadJSON('src/data/categories.json');

mkdirSync(resolve(root, 'exports'), { recursive: true });

const productHeaders = [
  'id',
  'category_id',
  'name',
  'brand',
  'manufacturer',
  'marketer',
  'price',
  'currency',
  'strength',
  'packaging_size',
  'packaging_type',
  'salt_composition',
  'country_of_origin',
  'origin_country_code',
  'minimum_order_quantity',
  'storage',
  'treatment',
  'description',
  'images',
  'specifications',
  'is_active'
];

const productRows = products.map((p) => [
  p.id,
  p.category,
  p.name,
  p.brand || '',
  p.manufacturer || '',
  p.marketer || '',
  p.price != null && p.price !== '' ? Number(p.price) : '',
  normalizeCurrency(p.currency),
  p.strength || '',
  p.packagingSize || '',
  p.packagingType || '',
  p.saltComposition || '',
  p.countryOfOrigin || 'India',
  originCode(p.countryOfOrigin),
  p.minimumOrderQuantity || '',
  p.storage || '',
  p.treatment || '',
  p.description || '',
  // Postgres text[] literal for Supabase CSV / COPY import
  Array.isArray(p.images) && p.images.length
    ? `{${p.images.filter(Boolean).map((u) => `"${String(u).replace(/"/g, '\\"')}"`).join(',')}}`
    : '{}',
  JSON.stringify(p.specifications || {}),
  'true'
]);

function writeUtf8Bom(filePath, content) {
  // BOM helps Excel / Windows tools keep °C and other Unicode intact
  writeFileSync(filePath, `\uFEFF${content}`, 'utf8');
}

const productsPath = resolve(root, 'exports/products-catalog.csv');
writeUtf8Bom(productsPath, toCsv(productHeaders, productRows));

const categoryHeaders = ['id', 'name', 'image', 'sort_order', 'is_active'];
const categoryRows = categories.map((c, i) => [
  c.id,
  c.name,
  c.image || '',
  i,
  'true'
]);
const categoriesPath = resolve(root, 'exports/categories-catalog.csv');
writeUtf8Bom(categoriesPath, toCsv(categoryHeaders, categoryRows));

const currencies = [...new Set(productRows.map((r) => r[7]))];
const origins = [...new Set(productRows.map((r) => r[13]))];

console.log(`Wrote ${products.length} products → ${productsPath}`);
console.log(`Wrote ${categories.length} categories → ${categoriesPath}`);
console.log(`Currencies: ${currencies.join(', ')}`);
console.log(`Origins: ${origins.join(', ')}`);
