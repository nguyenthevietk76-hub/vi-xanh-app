# Hướng dẫn cài đặt Ví Xanh — Giai đoạn 2

## 1. Cài đặt dependencies
```bash
npm install
```

## 2. Tạo Firebase project
1. Vào https://console.firebase.google.com → **Add project** → đặt tên (VD: `vi-xanh-app`)
2. Vào **Build → Authentication → Get started** → tab **Sign-in method** → bật **Google**
3. Vào **Build → Firestore Database → Create database** → chọn **Production mode** → chọn region gần VN (vd `asia-southeast1`)
4. Vào **Build → Storage → Get started** → Production mode

## 3. Lấy config và tạo file `.env`
Vào **Project settings** (biểu tượng bánh răng) → cuộn xuống **Your apps** → **Add app → Web** (biểu tượng `</>`).
Copy các giá trị vào file `.env` ở gốc project (dựa theo `.env.example`):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

⚠️ Thêm `.env` vào `.gitignore` nếu chưa có — không commit key lên GitHub public.

Trên **Vercel**: vào Project Settings → Environment Variables → thêm đúng 6 biến trên.

## 3b. Cấu hình nhận thanh toán qua VietQR
Không cần đăng ký cổng thanh toán hay tài khoản doanh nghiệp — chỉ cần 1 tài khoản ngân hàng cá nhân đứng tên bạn (hoặc brand). Thêm 3 biến sau vào `.env` (và trên Vercel):

```
VITE_BANK_ID=vietcombank        # tên viết tắt hoặc mã BIN ngân hàng — tra tại https://api.vietqr.io/v2/banks
VITE_BANK_ACCOUNT_NO=0123456789 # số tài khoản nhận tiền
VITE_BANK_ACCOUNT_NAME=NGUYEN VAN A  # tên chủ tài khoản, KHÔNG dấu, viết hoa
```

Nếu bỏ trống 3 biến này, khách chọn "VietQR / CK" khi đặt hàng vẫn tạo được đơn (để bạn test), nhưng màn hình sẽ không hiện ảnh QR thật — chỉ hiện ghi chú nhắc bạn cấu hình.

Sau khi khách quét mã và chuyển khoản, đơn hàng vẫn ở trạng thái "Chưa thanh toán" cho đến khi bạn (chủ brand) vào **Trang quản trị Brand → Đơn hàng nhận được**, kiểm tra đã nhận đúng số tiền trong app ngân hàng, rồi bấm **"Xác nhận đã nhận tiền"**. Đây là bước xác nhận thủ công vì dự án không có backend riêng để tự động đối soát với ngân hàng.

## 4. Publish Security Rules
- **Firestore**: vào **Firestore Database → Rules**, dán nội dung file `firestore.rules`, bấm **Publish**
- **Storage**: vào **Storage → Rules**, dán nội dung file `storage.rules`, bấm **Publish**

## 5. Tạo Composite Index (bắt buộc)
Các query sau yêu cầu composite index. Firebase sẽ tự log link tạo index khi query lần đầu fail — bấm vào link trong Console log trình duyệt để tạo nhanh. Hoặc tạo thủ công:

| Collection | Fields | Order |
|---|---|---|
| `orders` | `brandId` (Ascending) + `createdAt` (Descending) | — |
| `orders` | `buyerId` (Ascending) + `createdAt` (Descending) | — |
| `orders` | `type` (Ascending) + `totalVND` (Ascending) | — |

## 6. Cho phép domain đăng nhập
Vào **Authentication → Settings → Authorized domains** → thêm:
- `localhost` (thường có sẵn)
- domain Vercel của bạn, vd `vi-xanh-app.vercel.app`

## 7. Tự cấp quyền Admin cho chính bạn
1. Chạy `npm run dev`, đăng nhập Google 1 lần bằng tài khoản của bạn
2. Vào **Firestore Database → Data** → mở collection `users` → copy Document ID (đó là UID của bạn)
3. Tạo collection mới tên `admins` → tạo document với **ID = đúng UID vừa copy** → để nội dung trống hoặc thêm field `email` cho dễ nhận biết
4. Reload lại web — bạn sẽ thấy mục "Trang quản trị" trong menu avatar

## 8. Luồng hoạt động
- Người dùng bấm **Đăng nhập** ở góc phải → chọn tài khoản Google
- User mới được tặng **20 điểm xanh** chào mừng (1 điểm ≈ 1.000đ — mọi con số về điểm nằm trong `src/lib/points.js`)
- **Đổi đồ cũ lấy điểm**: người dùng gửi *yêu cầu thu gom* (quần áo loại A/B/C, bã cà phê). Điểm **chưa cộng ngay** — admin vào `/admin` → mục *Yêu cầu thu gom*, nhập khối lượng cân thực tế + loại đồ rồi bấm **Duyệt** thì điểm mới vào ví
- **Mua bằng VNĐ**: thưởng 1 điểm / 10.000đ, được cộng khi brand chuyển đơn sang **Hoàn thành**
- **Brand huỷ đơn**: tồn kho được hoàn lại; nếu là đơn đổi điểm thì người mua được hoàn điểm
- Ai cũng có thể vào `/brand/dang-ky` để nộp hồ sơ trở thành Brand
- Admin vào `/admin` để **Duyệt** hồ sơ, xem thống kê hệ thống
- Brand vào `/brand/dashboard` để đăng/sửa sản phẩm, quản lý đơn hàng (cập nhật trạng thái)
- Người mua xem trạng thái đơn hàng real-time trong `/vi-cua-toi`
- Điểm xanh được đồng bộ thật theo tài khoản Google, không mất khi refresh

## Bảo mật điểm xanh (firestore.rules)
Client **không thể** tự đặt số điểm. Điểm chỉ thay đổi qua 4 đường, mỗi đường gắn với một chứng từ được rules đối chiếu:
1. Đổi sản phẩm → trừ đúng giá điểm của sản phẩm, cùng transaction với tạo đơn + trừ kho
2. Brand hoàn tất đơn mua → cộng đúng `pointsEarned` của đơn (chỉ 1 lần)
3. Brand huỷ đơn đổi điểm → hoàn đúng `pointsUsed` (chỉ 1 lần)
4. Admin duyệt yêu cầu thu gom

Đơn hàng cũng được đối chiếu với sản phẩm thật: giá, tổng tiền, điểm thưởng, và tồn kho chỉ giảm khi có đơn đi kèm.
Nếu đổi hằng số trong `src/lib/points.js` (điểm chào mừng, thưởng mua hàng, loại thu gom), nhớ sửa các hằng số tương ứng ở đầu `firestore.rules`.

## Schema Firestore

```
users/{uid}           { name, email, photoURL, points, createdAt,
                        lastOrderId, lastCreditOrderId }   // 2 field chứng từ cho rules
admins/{uid}          (tạo thủ công qua Console, doc rỗng = admin)
brands/{uid}          { brandName, description, ownerUid, ownerEmail,
                        status: 'pending'|'approved'|'rejected', createdAt }
products/{id}         { name, description, category, priceVND, points, stock, image,
                        rating, reviews, weeklyRedeemed, badge, isNew,
                        brandId, brandName, status: 'active', createdAt }
orders/{id}           { buyerId, buyerEmail, buyerName, buyerPhone, buyerAddress,
                        productId, productName, productImage, brandId, brandName,
                        quantity, priceVND, totalVND, pointsUsed, pointsEarned,
                        paymentMethod: 'COD'|'VIETQR'|'MOMO',
                        paymentStatus: 'cod'|'unpaid'|'paid',
                        orderCode,   // mã ngắn dùng làm nội dung chuyển khoản, đối soát
                        type: 'redeem'|'buy',
                        status: 'pending'|'confirmed'|'shipping'|'completed'|'cancelled',
                        createdAt }
tradeIns/{id}         { userId, userName, userEmail,
                        categoryId: 'clothes_a'|'clothes_b'|'clothes_c'|'coffee',
                        declaredWeightKg, estimatedPoints, collectionPoint,
                        status: 'pending'|'approved'|'rejected', createdAt,
                        // admin điền khi duyệt:
                        finalCategoryId, actualWeightKg, points, reviewedBy, reviewedAt }
notifications/{uid}/items/{id}  { type, message, link, readAt, createdAt }
```
