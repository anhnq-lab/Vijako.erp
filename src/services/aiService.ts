import { supabase } from '../lib/supabase';

export interface SearchResult {
    id: number;
    content: string;
    metadata: any;
    similarity: number;
}

export const aiService = {
    // Search for relevant documents using the match_documents RPC
    async searchDocuments(queryEmbedding: numbe[], matchThreshold = 0.7, matchCount = 5): Promise<SearchResult[]> {
        const { data, error } = await supabase.rpc('match_documents', {
            query_embedding: queryEmbedding,
            match_threshold: matchThreshold,
            match_count: matchCount,
        });

        if (error) {
            console.error('Error searching documents:', error);
            return [];
        }

        return data || [];
    },

    // Placeholder for generating embeddings (this should ideally be done server-side to hide API keys)
    // For prototype/dev, we might call OpenAI directly if implicit allow is set, but better to structure it for a backend.
    async generateEmbedding(text: string): Promise<number[]> {
        // This function needs to call an Edge Function or Backend API that proxies to OpenAI
        // For now, we'll throw an error if not implemented, or use a placeholder
        console.warn('generateEmbedding: Backend integration required for OpenAI API');
        return [];
    },

    // Send message to AI (RAG flow)
    async sendMessage(message: string, context: string): Promise<string> {
        // This function also needs a backend to call OpenAI Chat Completion
        console.warn('sendMessage: Backend integration required for OpenAI API');
        return "Comparison with AI backend not yet implemented.";
    }
};
