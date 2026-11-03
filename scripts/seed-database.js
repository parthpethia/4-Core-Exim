/**
 * 4Core Exim — Database Seed Script
 * ==================================
 * Reads existing static JSON data files and inserts all records into Supabase.
 * 
 * Usage:
 *   node scripts/seed-database.js
 * 
 * Prerequisites:
 *   1. Run the SQL migration (supabase/migrations/001_create_tables.sql) first
 *   2. Ensure SUPABASE_URL and SUPABASE_SERVICE_KEY env vars are set
 *      (use the SERVICE ROLE key, not the anon key, for seeding)
 * 
 * The script uses the Supabase service role key to bypass RLS policies.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('\n❌ Missing environment variables.');
  console.error('   Required: SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_KEY');
  console.error('\n   Usage:');
  console.error('     SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=eyJ... node scripts/seed-database.js');
  console.error('\n   Get your service role key from: Supabase Dashboard → Settings → API → service_role (secret)\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadJSON(relativePath) {
  const fullPath = resolve(__dirname, '..', relativePath);
  const raw = readFileSync(fullPath, 'utf-8');
  return JSON.parse(raw);
}

function normalizeCurrency(currency) {
  if (!currency) return 'USD';
  const c = String(currency).trim();
  if (c === '₹' || c === 'Rs' || c === 'rs' || c.toUpperCase() === 'INR') return 'INR';
  if (c === '$' || c.toUpperCase() === 'USD') return 'USD';
  if (c === '€' || c.toUpperCase() === 'EUR') return 'EUR';
  if (c === '£' || c.toUpperCase() === 'GBP') return 'GBP';
  return c.toUpperCase();
}

function originCodeFromName(name) {
  const n = (name || 'India').toLowerCase();
  if (n.includes('german')) return 'DE';
  if (n.includes('denmark') || n.includes('danish')) return 'DK';
  if (n.includes('india')) return 'IN';
  return 'IN';
}

/**
 * Convert a product from camelCase JSON to snake_case DB row.
 */
function productToRow(product) {
  return {
    id: product.id,
    category_id: product.category,
    name: product.name,
    brand: product.brand || null,
    manufacturer: product.manufacturer || null,
    marketer: product.marketer || null,
    price: product.price ? parseFloat(product.price) : null,
    currency: normalizeCurrency(product.currency),
    strength: product.strength || null,
    packaging_size: product.packagingSize || null,
    packaging_type: product.packagingType || null,
    salt_composition: product.saltComposition || null,
    country_of_origin: product.countryOfOrigin || 'India',
    origin_country_code: originCodeFromName(product.countryOfOrigin),
    minimum_order_quantity: product.minimumOrderQuantity || null,
    storage: product.storage || null,
    treatment: product.treatment || null,
    description: product.description || null,
    images: product.images || [],
    specifications: product.specifications || {},
    is_active: true
  };
}

/**
 * Convert a category from JSON to DB row.
 */
function categoryToRow(category, index) {
  return {
    id: category.id,
    name: category.name,
    image: category.image || null,
    sort_order: index,
    is_active: true
  };
}

/**
 * Convert company.json to a company_settings row.
 */
function companyToRow(company) {
  return {
    id: 1,
    name: company.name,
    subtitle: company.subtitle || null,
    email: company.email || null,
    phone: company.phone || null,
    whatsapp: company.whatsapp || null,
    address: company.address || null,
    business_hours: company.businessHours || null,
    google_maps_embed_url: company.googleMapsEmbedUrl || null,
    about_short: company.aboutShort || null,
    about_full: company.aboutFull || {}
  };
}

// ---------------------------------------------------------------------------
// Seed Functions
// ---------------------------------------------------------------------------

async function seedCategories(categories) {
  console.log(`\n📦 Seeding ${categories.length} categories...`);

  const rows = categories.map((cat, index) => categoryToRow(cat, index));

  // Upsert to allow re-running the script safely
  const { data, error } = await supabase
    .from('categories')
    .upsert(rows, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('   ❌ Failed to seed categories:', error.message);
    throw error;
  }

  console.log(`   ✅ ${data.length} categories seeded successfully.`);
  return data;
}

async function seedProducts(products) {
  console.log(`\n💊 Seeding ${products.length} products...`);

  const rows = products.map(p => productToRow(p));

  // Insert in batches of 25 to avoid payload limits
  const BATCH_SIZE = 25;
  let totalInserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(rows.length / BATCH_SIZE);

    const { data, error } = await supabase
      .from('products')
      .upsert(batch, { onConflict: 'id' })
      .select();

    if (error) {
      console.error(`   ❌ Batch ${batchNum}/${totalBatches} failed:`, error.message);
      // Log the first failing row for debugging
      console.error('   First row in failing batch:', JSON.stringify(batch[0], null, 2));
      throw error;
    }

    totalInserted += data.length;
    console.log(`   📋 Batch ${batchNum}/${totalBatches}: ${data.length} products upserted (total: ${totalInserted})`);
  }

  console.log(`   ✅ ${totalInserted} products seeded successfully.`);
  return totalInserted;
}

async function seedCompanySettings(company) {
  console.log('\n🏢 Seeding company settings...');

  const row = companyToRow(company);

  const { data, error } = await supabase
    .from('company_settings')
    .upsert([row], { onConflict: 'id' })
    .select();

  if (error) {
    console.error('   ❌ Failed to seed company settings:', error.message);
    throw error;
  }

  console.log(`   ✅ Company settings seeded: "${data[0].name}"`);
  return data[0];
}

/**
 * Link every product to target markets with category-based priority boosts.
 * Requires migration 002 (countries + product_markets).
 */
async function seedProductMarkets(products, marketsConfig) {
  console.log('\n🌍 Seeding product ↔ market links...');

  const { data: countries, error: cErr } = await supabase
    .from('countries')
    .select('code, currency_code, is_target_market')
    .eq('is_active', true)
    .eq('is_target_market', true);

  if (cErr) {
    console.warn('   ⚠️  Skipping product_markets (run migration 002 first):', cErr.message);
    return 0;
  }

  if (!countries || countries.length === 0) {
    console.warn('   ⚠️  No target countries found — skip product_markets.');
    return 0;
  }

  const boostMap = marketsConfig.marketCategoryBoost || {};
  const rows = [];

  for (const country of countries) {
    const boostCats = boostMap[country.code] || [];
    for (const product of products) {
      const idx = boostCats.indexOf(product.category);
      const priority = idx >= 0 ? 100 - idx * 15 : 20;
      const isFeatured = idx >= 0 && idx < 2;
      rows.push({
        product_id: product.id,
        country_code: country.code,
        priority,
        is_featured: isFeatured,
        preferred_currency: country.currency_code || null
      });
    }
  }

  const BATCH_SIZE = 200;
  let total = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { data, error } = await supabase
      .from('product_markets')
      .upsert(batch, { onConflict: 'product_id,country_code' })
      .select('product_id');

    if (error) {
      console.error('   ❌ product_markets batch failed:', error.message);
      throw error;
    }
    total += data.length;
  }

  console.log(`   ✅ ${total} product-market links seeded across ${countries.length} markets.`);
  return total;
}

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------

async function verifyData() {
  console.log('\n🔍 Verifying seeded data...');

  const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: compCount } = await supabase.from('company_settings').select('*', { count: 'exact', head: true });
  let marketLinkCount = null;
  let countryCount = null;
  try {
    ({ count: marketLinkCount } = await supabase.from('product_markets').select('*', { count: 'exact', head: true }));
    ({ count: countryCount } = await supabase.from('countries').select('*', { count: 'exact', head: true }));
  } catch {
    /* migration 002 may not be applied yet */
  }

  console.log(`   📊 Categories:      ${catCount}`);
  console.log(`   📊 Products:        ${prodCount}`);
  console.log(`   📊 Company:         ${compCount}`);
  console.log(`   📊 Countries:       ${countryCount ?? 'n/a (run migration 002)'}`);
  console.log(`   📊 Product markets: ${marketLinkCount ?? 'n/a'}`);

  // Spot check a few products
  const { data: sampleProducts } = await supabase
    .from('products')
    .select('id, name, category_id, price, specifications')
    .limit(3);

  if (sampleProducts && sampleProducts.length > 0) {
    console.log('\n   🔬 Sample product verification:');
    sampleProducts.forEach(p => {
      const specCount = Object.keys(p.specifications || {}).length;
      console.log(`      • ${p.name} (${p.category_id}) — $${p.price} — ${specCount} spec keys`);
    });
  }

  // Check category product counts
  const { data: catCounts } = await supabase
    .from('categories')
    .select('id, name, products(count)')
    .order('sort_order');

  if (catCounts) {
    console.log('\n   📁 Category product distribution:');
    catCounts.forEach(c => {
      const count = c.products?.[0]?.count || 0;
      const status = count > 0 ? '✓' : '○';
      console.log(`      ${status} ${c.name}: ${count} products`);
    });
  }
}

// ---------------------------------------------------------------------------
// Main Execution
// ---------------------------------------------------------------------------

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  4Core Exim — Database Seed Script');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Supabase URL: ${SUPABASE_URL}`);
  console.log(`  Timestamp:    ${new Date().toISOString()}`);

  try {
    // Load existing JSON data
    const categories = loadJSON('src/data/categories.json');
    const products = loadJSON('src/data/products.json');
    const company = loadJSON('src/data/company.json');
    const marketsConfig = loadJSON('src/data/markets.json');

    console.log(`\n📂 Loaded source data:`);
    console.log(`   • ${categories.length} categories from categories.json`);
    console.log(`   • ${products.length} products from products.json`);
    console.log(`   • 1 company record from company.json`);
    console.log(`   • market boosts from markets.json`);

    // Seed in order: categories first (products reference them via FK)
    await seedCategories(categories);
    await seedProducts(products);
    await seedCompanySettings(company);
    await seedProductMarkets(products, marketsConfig);

    // Verify everything
    await verifyData();

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  ✅ SEED COMPLETE — All data migrated to Supabase!');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n═══════════════════════════════════════════════════════════');
    console.error('  ❌ SEED FAILED');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('  Error:', err.message);
    if (err.details) console.error('  Details:', err.details);
    if (err.hint) console.error('  Hint:', err.hint);
    console.error('');
    process.exit(1);
  }
}

main();
