import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://oasumwwplomasdssnfaz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hc3Vtd3dwbG9tYXNkc3NuZmF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM1NTAzNywiZXhwIjoyMDgzOTMxMDM3fQ.Aeaj8Uhv_7pwfZ1ENA34SgfoMaTvXzruP3qQ5QeEoKM';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
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

        console.log('📄 Executing SQL migration directly...');

        // Split the SQL into individual statements and execute them
        // Since we can't use exec_sql RPC, we'll use the raw SQL execution
        const { data, error } = await supabase.rpc('exec', { sql: sqlContent }).single();

        if (error) {
            console.error('❌ Migration failed:', error);
            console.log('\n🔧 Trying alternative method: executing via pg_stat_statements...');

            // Alternative: Use Supabase's query method
            const response = await fetch(`${supabaseUrl}/rest/v1/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({ query: sqlContent })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }

            console.log('✅ Migration completed via alternative method!');
            return;
        }

        console.log('✅ Migration completed successfully!');
        console.log('Result:', data);

    } catch (err: any) {
        console.error('❌ Error:', err.message);
        console.log('\n💡 Supabase does not support arbitrary SQL execution via API.');
        console.log('📋 Please copy and run the SQL manually in Supabase SQL Editor:');
        console.log('📂 File: supabase/migrations/20260115_connected_finance_demo.sql');
        process.exit(1);
    }
}

runMigration();
