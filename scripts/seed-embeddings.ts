
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import { Project, Contract } from '../types';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const googleApiKey = process.env.GOOGLE_API_KEY;

if (!supabaseUrl || !supabaseKey || !googleApiKey) {
    console.error('Missing environment variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, or GOOGLE_API_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(googleApiKey);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

async function getEmbedding(text: string) {
    const result = await model.embedContent(text);
    return result.embedding.values;
}

async function seedProjects() {
    console.log('Fetching projects...');
    const { data: projects, error } = await supabase.from('projects').select('*');

    if (error) {
        console.error('Error fetching projects:', error);
        return;
    }

    console.log(`Found ${projects.length} projects. Generating embeddings...`);

    for (const project of projects as Project[]) {
        // Create a text representation of the project
        const content = `Type: Project
Code: ${project.code}
Name: ${project.name}
Status: ${project.status}
Location: ${project.location || 'N/A'}
Manager: ${project.manager || 'N/A'}
Description: ${project.description || ''}
Budget: ${project.budget || '0'}
Start Date: ${project.start_date || 'N/A'}
End Date: ${project.end_date || 'N/A'}`;

        try {
            const embedding = await getEmbedding(content);

            // Insert into embeddings table
            const { error: insertError } = await supabase.from('embeddings').insert({
                content,
                metadata: {
                    type: 'project',
                    id: project.id,
                    code: project.code,
                    name: project.name
                },
                embedding
            });

            if (insertError) console.error(`Failed to insert project ${project.code}:`, insertError);
            else console.log(`Indexed project: ${project.code}`);

        } catch (e) {
            console.error(`Error processing project ${project.code}:`, e);
        }
    }
}

async function seedContracts() {
    console.log('Fetching contracts...');
    const { data: contracts, error } = await supabase.from('contracts').select('*');

    if (error) {
        console.error('Error fetching contracts:', error);
        return;
    }

    console.log(`Found ${contracts.length} contracts. Generating embeddings...`);

    for (const contract of contracts as Contract[]) {
        const content = `Type: Contract
Code: ${contract.contract_code}
Partner: ${contract.partner_name}
Value: ${contract.value}
Status: ${contract.status}
Type: ${contract.type || 'N/A'}
Project ID: ${contract.project_id}`;

        try {
            const embedding = await getEmbedding(content);

            const { error: insertError } = await supabase.from('embeddings').insert({
                content,
                metadata: {
                    type: 'contract',
                    id: contract.id,
                    code: contract.contract_code
                },
                embedding
            });

            if (insertError) console.error(`Failed to insert contract ${contract.contract_code}:`, insertError);
            else console.log(`Indexed contract: ${contract.contract_code}`);

        } catch (e) {
            console.error(`Error processing contract ${contract.contract_code}:`, e);
        }
    }
}

async function main() {
    await seedProjects();
    await seedContracts();
    console.log('Done!');
}

main().catch(console.error);
