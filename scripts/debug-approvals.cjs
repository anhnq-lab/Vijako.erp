const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oasumwwplomasdssnfaz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hc3Vtd3dwbG9tYXNkc3NuZmF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM1NTAzNywiZXhwIjoyMDgzOTMxMDM3fQ.Aeaj8Uhv_7pwfZ1ENA34SgfoMaTvXzruP3qQ5QeEoKM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugApprovals() {
    console.log('--- Debugging Approvals ---');

    // 1. Check Row Count
    const { count, error: countError } = await supabase
        .from('approval_requests')
        .select('*', { count: 'exact', head: true });

    if (countError) console.error('Count Error:', countError.message);
    else console.log('Total Approval Requests:', count);

    // 2. Try Fetching Data (simulating service)
    const { data: approvals, error: fetchError } = await supabase
        .from('approval_requests')
        .select(`*, projects:project_id (name)`)
        .order('created_at', { ascending: false });

    if (fetchError) {
        console.error('Fetch Error:', fetchError.message);
    } else {
        console.log(`Fetched ${approvals.length} approvals.`);
        if (approvals.length > 0) {
            console.log('Sample approval:', approvals[0]);
        }
    }

    // 3. Check Projects Count
    const { count: projectCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
    console.log('Total Projects:', projectCount);

    // 4. Check Policies (using RPC if available or guessing)
    // We can't easily check policies via client without admin access or specific SQL.
    // However, if Count is > 0 but Fetch is 0, it's definitely RLS (or filtering).
    // If exact count is 0, then INSERTs failed.
}

debugApprovals();
