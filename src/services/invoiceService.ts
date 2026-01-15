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

export interface ExtractedContract {
    contract_code: string;
    partner_name: string;
    signing_date: string;
    contract_value: number;
    currency: string;
    contract_type: 'revenue' | 'expense';
    summary: string;
    duration_months?: number;
    payment_terms?: string;
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
    },

    async scanContract(file: File): Promise<ExtractedContract> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const base64Content = (reader.result as string).split(',')[1];
                    const mimeType = file.type;

                    const prompt = `
                        Hãy đóng vai một chuyên gia pháp lý và hợp đồng xây dựng. Hãy phân tích tài liệu hợp đồng này (ảnh hoặc PDF) và trích xuất các thông tin quan trọng sau dưới định dạng JSON:
                        - contract_code: Số hợp đồng / Mã hợp đồng.
                        - partner_name: Tên đối tác (bên A hoặc bên B, không phải là công ty Vijako).
                        - signing_date: Ngày ký kết (định dạng YYYY-MM-DD).
                        - contract_value: Giá trị hợp đồng (số).
                        - currency: Loại tiền tệ.
                        - contract_type: 'revenue' nếu Vijako là bên nhận thầu/bán hàng, 'expense' nếu Vijako là bên thuê thầu/mua hàng.
                        - summary: Tóm tắt ngắn gọn nội dung/phạm vi công việc của hợp đồng (1 câu).
                        - duration_months: Thời gian thực hiện hợp đồng (số tháng), nếu không rõ hãy ước lượng hoặc để null.
                        - payment_terms: Tóm tắt ngắn gọn điều khoản thanh toán chính.

                        Lưu ý:
                        1. Chỉ trả về JSON.
                        2. Ngôn ngữ Tiếng Việt.
                        3. Nếu không tìm thấy, để null hoặc rỗng.
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

                    const jsonStr = text.replace(/^```json/, '').replace(/```$/, '').trim();
                    const data = JSON.parse(jsonStr) as ExtractedContract;

                    resolve(data);
                } catch (error) {
                    console.error('Error scanning contract:', error);
                    reject(error);
                }
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    }
};
