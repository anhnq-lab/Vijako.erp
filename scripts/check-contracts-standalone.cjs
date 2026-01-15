
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oasumwwplomasdssnfaz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hc3Vtd3dwbG9tYXNkc3NuZmF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODM1NTAzNywiZXhwIjoyMDgzOTMxMDM3fQ.Aeaj8Uhv_7pwfZ1ENA34SgfoMaTvXzruP3qQ5QeEoKM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkContracts() {
    console.log('Checking contracts...');
    const { data, error } = await supabase
        .from('contracts')
        .select('*');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Contracts found:', data?.length);
        if (data.length > 0) {
            console.log('Sample contract:', data[0]);
            // Check specifically for types or status
            const types = [...new Set(data.map(c => c.type))];
            console.log('Unique types:', types);

            const owners = data.filter(c => c.type === 'revenue' || c.is_owner_contract); // Guessing field names based on hypothesis
            console.log('Potential owner contracts:', owners.length);
        }
    }
}

checkContracts();
