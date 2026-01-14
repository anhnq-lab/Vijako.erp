import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export interface ExtractedInvoice {
    vendor_name: string;
    invoice_code: string;
    date: string;
    amount: number;
    currency: string;
    items: { description: string; quantity: number; unit_price: number; amount: number }[];
    type: 'revenue' | 'expense';
    suggested_budget_category: string;
    summary: string;
}

export const invoiceService = {
    async scanInvoice(file: File): Promise<ExtractedInvoice> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const base64Content = (reader.result as string).split(',')[1];
                    const mimeType = file.type;

                    const prompt = `
                        Hãy đóng vai một chuyên gia kế toán thông minh. Hãy phân tích hình ảnh/file hóa đơn này và trích xuất các thông tin sau dưới định dạng JSON:
                        - vendor_name: Tên đơn vị bán hàng/cung cấp dịch vụ.
                        - invoice_code: Số hóa đơn hoặc Mã số hóa đơn.
                        - date: Ngày lập hóa đơn (định dạng YYYY-MM-DD).
                        - amount: Tổng tiền thanh toán (số).
                        - currency: Loại tiền tệ (VD: VND, USD).
                        - items: Danh sách mặt hàng, mỗi mặt hàng gồm: description, quantity, unit_price, amount.
                        - type: 'revenue' nếu đây là hóa đơn đầu ra của công ty Vijako, 'expense' nếu là hóa đơn mua vào/chi phí.
                        - suggested_budget_category: Gợi ý loại chi phí (chọn 1 trong: Vật tư, Nhân công, Máy thi công, Chi phí quản lý, Chi phí khác).
                        - summary: Tóm tắt ngắn gọn nội dung hóa đơn (1 câu).

                        Lưu ý quan trọng: 
                        1. Chỉ trả về JSON nguyên bản, không kèm markdown code block hay text giải thích.
                        2. Ngôn ngữ trả về cho các trường text là Tiếng Việt.
                        3. Nếu không tìm thấy thông tin nào đó, hãy để giá trị là null hoặc chuỗi rỗng.
                    `;

                    const result = await model.generateContent([
                        prompt,
                        {
                            inlineData: {
                                data: base64Content,
                                mimeType: mimeType
                            }
                        }
                    ]);

                    const response = await result.response;
                    const text = response.text().trim();

                    // Cleanup potential markdown blocks if AI ignored instructions
                    const jsonStr = text.replace(/^```json/, '').replace(/```$/, '').trim();
                    const data = JSON.parse(jsonStr) as ExtractedInvoice;

                    resolve(data);
                } catch (error) {
                    console.error('Error scanning invoice:', error);
                    reject(error);
                }
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    }
};
