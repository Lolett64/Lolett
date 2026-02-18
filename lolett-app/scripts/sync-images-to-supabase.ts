import { createClient } from '@supabase/supabase-js';
import { products } from '../data/products';
import { looks } from '../data/looks';
import fs from 'fs';
import path from 'path';

// Manual env loading for .env.local
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf8');
        envFile.split('\n').forEach(line => {
            const [key, ...value] = line.split('=');
            if (key && value && !line.startsWith('#')) {
                process.env[key.trim()] = value.join('=').trim();
            }
        });
    }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sync() {
    console.log('--- Syncing Products ---');
    for (const product of products) {
        const { error } = await supabase
            .from('products')
            .update({ images: product.images })
            .eq('slug', product.slug);

        if (error) {
            console.error(`Error updating product ${product.slug}:`, error.message);
        } else {
            console.log(`Updated images for product: ${product.slug}`);
        }
    }

    console.log('\n--- Syncing Looks ---');
    for (const look of looks) {
        const { error } = await supabase
            .from('looks')
            .update({ cover_image: look.coverImage })
            .eq('title', look.title);

        if (error) {
            console.error(`Error updating look ${look.title}:`, error.message);
        } else {
            console.log(`Updated cover image for look: ${look.title}`);
        }
    }

    console.log('\nSync completed.');
}

sync().catch(console.error);
