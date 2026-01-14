import { supabase } from '../lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { tools, Tool } from './tools';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY || '');

// Define tools for Gemini
const geminiTools: any = [
    {
        functionDeclarations: Object.values(tools).map((tool: Tool) => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
        })),
    },
];

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
    tools: geminiTools
});
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

export interface SearchResult {
    id: number;
    content: string;
    metadata: any;
    similarity: number;
}

export const aiService = {
    // Search for relevant documents using the match_documents RPC
    async searchDocuments(query: string, matchThreshold = 0.5, matchCount = 5): Promise<SearchResult[]> {
        // 1. Generate embedding for the query
        const embeddingResult = await embeddingModel.embedContent(query);
        const queryEmbedding = embeddingResult.embedding.values;

        // 2. Call Supabase RPC
        const { data, error } = await supabase.rpc('match_documents', {
            query_embedding: queryEmbedding,
            match_threshold: matchThreshold,
            match_count: matchCount,
        });

        if (error) {
            console.error('Error searching documents:', error);
            // Return empty list instead of throwing to allow chat to continue without RAG if DB fails
            return [];
        }

        return data || [];
    },

    // Send message to AI (RAG + Function Calling flow)
    async sendMessage(message: string): Promise<string> {
        try {
            // 1. Search for context (RAG)
            const relevantDocs = await this.searchDocuments(message);
            const context = relevantDocs.map(doc => doc.content).join('\n---\n');

            // 2. Start chat session with tools
            const chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{
                            text: `
                            text: `
Bạn là "Mio" - Trợ lý AI thông minh chuyên dụng cho hệ thống quản lý dự án Vijako ERP.

NHIỆM VỤ CỦA BẠN:
                                1. Hỗ trợ người dùng tra cứu thông tin dự án, hợp đồng, nhân sự, tài chính.
2. Thực hiện các tác vụ tự động như tạo công việc, cập nhật trạng thái, tạo báo cáo vấn đề.
3. Phân tích dữ liệu và đưa ra tóm tắt ngắn gọn.

QUY TẮC ỨNG XỬ(PERSONA):
- Tên bạn là: Mio.
- Luôn trả lời bằng TIẾNG VIỆT.
- Phong cách: Chuyên nghiệp, thân thiện, ngắn gọn, súc tích.
- Dùng Markdown để định dạng câu trả lời(in đậm các thông tin quan trọng như tên dự án, số tiền, ngày tháng).

HƯỚNG DẪN XỬ LÝ:
                        - Dữ liệu tham khảo(RAG Context) ở bên dưới.Hãy ưu tiên sử dụng nó để trả lời.
- Nếu người dùng yêu cầu hành động(tạo, cập nhật, tìm kiếm), hãy SỬ DỤNG TOOL.
- Nếu không tìm thấy thông tin trong Context và không có Tool phù hợp, hãy nói: "Em chưa tìm thấy thông tin này trong hệ thống. Anh/chị có thể cung cấp thêm chi tiết không ạ?"

DỮ LIỆU THAM KHẢO(CONTEXT):
                            ${ context }
                            `}],
                    },
                    {
                        role: "model",
                        parts: [{ text: "Hello! I am ready to help you with project management actions." }],
                    }
                ],
            });

            // 3. Send message
            const result = await chat.sendMessage(message);
            const response = await result.response;

            // 4. Handle Function Calls
            const functionCalls = response.functionCalls();
            if (functionCalls && functionCalls.length > 0) {
                // Execute functions and send back result
                const call = functionCalls[0];
                const toolName = call.name;
                const toolArgs = call.args;

                if (tools[toolName]) {
                    console.log(`Executing tool: ${ toolName }`, toolArgs);
                    const toolResult = await tools[toolName].execute(toolArgs);

                    // Send result back to model to generate final response
                    const result2 = await chat.sendMessage([
                        {
                            functionResponse: {
                                name: toolName,
                                response: { name: toolName, content: toolResult }
                            }
                        }
                    ]);
                    return result2.response.text();
                }
            }

            return response.text();
        } catch (error) {
            console.error("AI Error:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            return `Em đang gặp chút vấn đề: ${ errorMessage }.Anh vui lòng kiểm tra lại Key hoặc Console log nhé!`;
        }
    }
};
