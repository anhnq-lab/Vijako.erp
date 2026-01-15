import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!; // Actually service role key

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function runMigration() {
    try {
        console.log('🚀 Running finance demo data migration...');
        console.log('📍 Supabase URL:', supabaseUrl);

        const sqlPath = path.join(__dirname, '../supabase/migrations/20260115_connected_finance_demo.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

        console.log('📄 Executing SQL migration...');

        // Execute SQL directly using Supabase REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({ query: sqlContent })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('❌ Migration failed:', error);

            // Try alternative: execute via pg connection string
            console.log('🔄 Trying direct SQL execution...');
            const { data, error: rpcError } = await supabase.rpc('exec', { sql: sqlContent });

            if (rpcError) {
                console.error('❌ RPC also failed:', rpcError);
                process.exit(1);
            }

            console.log('✅ Migration completed via RPC!');
            return;
        }

        const result = await response.json();
        console.log('✅ Migration completed successfully!');
        console.log('Result:', result);

    } catch (err: any) {
        console.error('❌ Error:', err.message);
        console.log('\n💡 Please run the SQL script manually in Supabase SQL Editor');
        console.log('📂 File location: supabase/migrations/20260115_connected_finance_demo.sql');
        process.exit(1);
    }
}

runMigration();
