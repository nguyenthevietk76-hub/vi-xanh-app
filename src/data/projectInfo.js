/* ══════════════════════════════════════════
   THÔNG TIN DỰ ÁN CÔNG KHAI — nguồn duy nhất cho mọi con số trên trang
   Chủ và Dự án. Chỉ ghi số liệu nhóm đã kiểm chứng được.
   Khi có số liệu thật sau mỗi đợt thu gom, cập nhật ở đây.
   ══════════════════════════════════════════ */
import { COLLECTION_POINTS } from './mockData';

export const PROJECT_INFO = {
  stage: 'Giai đoạn thí điểm',
  foundedYear: 2026,
  coreMembers: 5,

  // Loại đồ đang nhận — khớp bảng quy đổi trong src/lib/points.js
  acceptedItems: ['Quần áo cũ', 'Bã cà phê'],

  // Điểm thu gom đang thí điểm (danh sách dùng chung với form đổi đồ)
  collectionPoints: COLLECTION_POINTS,
  pilotCities: ['Hà Nội', 'TP. Hồ Chí Minh'],

  // Mục tiêu của đợt thí điểm (là MỤC TIÊU, không phải kết quả)
  pilotTargetKg: 1000,
  // Số kg đã thu gom thực tế. Để null khi chưa có số liệu kiểm chứng
  // → trang sẽ hiện "Đang cập nhật" thay vì một con số.
  collectedKg: null,
};
