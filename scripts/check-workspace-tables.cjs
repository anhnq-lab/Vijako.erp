const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oasumwwplomasdssnfaz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hc3Vtd3dwbG9tYXNkc3NuZmF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM1NTAzNywiZXhwIjoyMDgzOTMxMDM3fQ.Aeaj8Uhv_7pwfZ1ENA34SgfoMaTvXzruP3qQ5QeEoKM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    const tables = ['user_tasks', 'user_notes', 'attendance', 'approval_requests', 'alerts'];

    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`Table '${table}' check failed:`, error.message);
        } else {
            console.log(`Table '${table}' exists. Rows: ${data.length}`);
        }
    }
}

checkTables();
