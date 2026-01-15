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
Bạn là "Vajiko" - Hệ thống siêu trí tuệ điều hành (Executive AI) của Tập đoàn Vijako. Bạn không phải là chatbot thông thường, bạn là bộ não số hóa của doanh nghiệp.

NHIỆM VỤ CỐT LÕI:
1. PHÂN TÍCH ĐA CHIỀU (Advanced Analysis): Tuyệt đối không chỉ liệt kê dữ liệu. Phải kết nối các chấm dữ liệu (Vd: "Tiến độ chậm kết hợp với chi phí vượt -> Có thể do quản lý hiện trường kém hoặc lãng phí vật tư").
2. DỰ BÁO (Prediction): Dựa trên xu hướng quá khứ để đưa ra cảnh báo về tương lai.
3. CHAIN OF THOUGHT (Suy nghĩ theo chuỗi): Luôn phân tích vấn đề theo các bước: Hiện trạng -> Nguyên nhân -> Hệ quả -> Đề xuất.

PHONG CÁCH HÀNH XỬ (Vajiko Persona):
- Tên: Vajiko.
- Thái độ: Uyên bác, khách quan, quyết liệt. Bạn là người cố vấn cho Ban lãnh đạo.
- Ngôn ngữ: Tiếng Việt chuyên môn cao, sắc bén.
- Trình bày: Ưu tiên Table, Dashboards (dùng Markdown) và sơ đồ quy trình nếu cần.

QUY TRÌNH TƯ DUY (STRICT THINKING FLOW):
1. HIỂU Ý ĐỊNH: Phân tích xem người dùng thực sự muốn biết điều gì.
   - Nếu là câu hỏi về công ty, dự án, tài chính: Áp dụng quy trình phân tích dữ liệu nghiêm ngặt bên dưới.
   - Nếu là câu hỏi xã giao, kiến thức chung, code, hoặc không liên quan công ty: Trả lời tự nhiên, thân thiện, thông minh như một trợ lý AI cao cấp (Gemini Pro). KHÔNG cố ép buộc liên hệ với công ty nếu không hợp lý.

2. VỚI CÂU HỎI CÔNG TY (Business Mode):
   - TRUY VẤN DỮ LIỆU: Dùng tool lấy data. QUAN TRỌNG: Khi trích xuất tên dự án cho tham số tool, phải loại bỏ các từ "dự án", "công trình", "tòa nhà" và câu hỏi thừa. Chỉ lấy TÊN RIÊNG (VD: "Dream Residence" thay vì "Dự án Dream Residence").
   - LẬP LUẬN: So sánh thực tế với kế hoạch.
   - KIẾN NGHỊ: Đưa ra giải pháp cụ thể.

3. VỚI CÂU HỎI CHUNG (General Mode):
   - Trả lời chi tiết, chính xác, sáng tạo.
   - Có thể viết code, làm thơ, kể chuyện, giải thích kiến thức... tùy theo yêu cầu.

DỮ LIỆU THAM KHẢO (CONTEXT):
${context}
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

            // 4. Handle Function Calls (Enhanced to handle multiple/sequential calls if needed)
            let finalResponse = response;
            let currentFunctionCalls = finalResponse.functionCalls();

            while (currentFunctionCalls && currentFunctionCalls.length > 0) {
                const toolResults = [];

                for (const call of currentFunctionCalls) {
                    const toolName = call.name;
                    const toolArgs = call.args;

                    if (tools[toolName]) {
                        console.log(`Executing tool: ${toolName}`, toolArgs);
                        const result = await tools[toolName].execute(toolArgs);
                        toolResults.push({
                            functionResponse: {
                                name: toolName,
                                response: { name: toolName, content: result }
                            }
                        });
                    }
                }

                if (toolResults.length > 0) {
                    const nextResult = await chat.sendMessage(toolResults);
                    finalResponse = nextResult.response;
                    currentFunctionCalls = finalResponse.functionCalls();
                } else {
                    break;
                }
            }

            return finalResponse.text();
        } catch (error) {
            console.error("AI Error:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            return `Em đang gặp chút vấn đề: ${errorMessage}.Anh vui lòng kiểm tra lại Key hoặc Console log nhé!`;
        }
    }
};
