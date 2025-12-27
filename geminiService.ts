
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function extractReportDataFromImage(base64Image: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { 
            text: `Phân tích ảnh báo cáo RMA/Sorting. 
            Lưu ý quan trọng về cấu trúc dữ liệu:
            1. Tìm thông tin Vendor và Shift ở phần đầu trang (thường có các ô checkbox).
            2. Trong bảng, một nhóm dữ liệu (cùng Model, Color, Type) có thể có nhiều lỗi (nhiều dòng Material và Defect Name).
            3. QUY TẮC NHẬP LIỆU: 
               - Cột Input và NG CHỈ được điền ở dòng ĐẦU TIÊN của một nhóm. 
               - Các dòng tiếp theo trong cùng một nhóm (các dòng lỗi phát sinh thêm của cùng Model/Color/Type đó), các trường Input và NG phải để là 0 hoặc null. KHÔNG ĐƯỢC lặp lại giá trị Input/NG ở các dòng con.
            4. Trích xuất thành mảng phẳng gồm các trường: vendor, shift, model, color, type (RMA/Sorting/Block/RW), input, ng, material, defectName, qtyNg, remark.` 
          },
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vendor: { type: Type.STRING },
            shift: { type: Type.STRING },
            rows: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  model: { type: Type.STRING },
                  color: { type: Type.STRING },
                  type: { type: Type.STRING },
                  input: { type: Type.NUMBER },
                  ng: { type: Type.NUMBER },
                  material: { type: Type.STRING },
                  defectName: { type: Type.STRING },
                  qtyNg: { type: Type.NUMBER },
                  remark: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{"rows": []}');
    return result;
  } catch (error) {
    console.error("Error extracting data:", error);
    return { rows: [] };
  }
}
