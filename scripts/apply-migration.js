
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://oasumwwplomasdssnfaz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hc3Vtd3dwbG9tYXNkc3NuZmF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM1NTAzNywiZXhwIjoyMDgzOTMxMDM3fQ.Aeaj8Uhv_7pwfZ1ENA34SgfoMaTvXzruP3qQ5QeEoKM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260115_seed_p001_data.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying migration...');

    // Using a more direct method if RPC is missing: 
    // Usually we'd use a postgres client for DDL/DML migrations, 
    // but here we are trying to seed via API.

    // NOTE: Supabase client doesn't have a direct 'sql' method for security reasons.
    // It's expected to use migrations or RPC.

    console.log('Checking for exec_sql RPC...');
    const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (rpcError) {
        console.error('RPC Error:', rpcError);
        console.log('\n--- MANUAL ACTION REQUIRED ---');
        console.log('The script cannot execute arbitrary SQL directly via the anon/service key without an RPC function.');
        console.log('Please copy the content of: ' + migrationPath);
        console.log('And paste it into the Supabase SQL Editor.');
        console.log('-------------------------------\n');
    } else {
        console.log('Migration applied successfully!');
    }
}

applyMigration();
