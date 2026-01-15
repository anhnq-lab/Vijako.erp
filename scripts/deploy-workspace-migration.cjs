const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://oasumwwplomasdssnfaz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hc3Vtd3dwbG9tYXNkc3NuZmF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM1NTAzNywiZXhwIjoyMDgzOTMxMDM3fQ.Aeaj8Uhv_7pwfZ1ENA34SgfoMaTvXzruP3qQ5QeEoKM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('Reading migration file...');
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20260115_seed_workspace_data.sql');

    try {
        const sql = fs.readFileSync(migrationPath, 'utf8');
        console.log('Executing SQL migration via RPC exec_sql...');

        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            console.error('RPC exec_sql failed:', error.message);
            console.log('Attempting to use direct query (unlikely to work for DDL without admin)...');
            // Fallback: This usually fails for DDL with anon key, but worth a try or just notify user.
            console.log('----------------------------------------------------');
            console.log('PLEASE RUN THE FOLLOWING SQL IN YOUR SUPABASE SQL EDITOR:');
            console.log('----------------------------------------------------');
            console.log(sql);
            console.log('----------------------------------------------------');
        } else {
            console.log('Migration executed successfully via RPC.');
        }

    } catch (err) {
        console.error('Error reading/running migration:', err);
    }
}

runMigration();
