
import { supabase } from '../src/lib/supabase';

async function checkContracts() {
    console.log('Checking contracts...');
    const { data, error } = await supabase
        .from('contracts')
        .select('*');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Contracts found:', data?.length);
        console.table(data);
    }
}

checkContracts();
