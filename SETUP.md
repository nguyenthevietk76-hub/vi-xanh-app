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
- User mới được tặng **500 điểm xanh** chào mừng
- Ai cũng có thể vào `/brand/dang-ky` để nộp hồ sơ trở thành Brand
- Admin vào `/admin` để **Duyệt** hồ sơ, xem thống kê hệ thống
- Brand vào `/brand/dashboard` để đăng/sửa sản phẩm, quản lý đơn hàng (cập nhật trạng thái)
- Người mua xem trạng thái đơn hàng real-time trong `/vi-cua-toi`
- Điểm xanh được đồng bộ thật theo tài khoản Google, không mất khi refresh

## Schema Firestore

```
users/{uid}           { name, email, photoURL, points, createdAt }
admins/{uid}          (tạo thủ công qua Console, doc rỗng = admin)
brands/{uid}          { brandName, description, ownerUid, ownerEmail,
                        status: 'pending'|'approved'|'rejected', createdAt }
products/{id}         { name, description, category, priceVND, points, stock, image,
                        rating, reviews, weeklyRedeemed, badge, isNew,
                        brandId, brandName, status: 'active', createdAt }
orders/{id}           { buyerId, buyerEmail, buyerName, buyerPhone, buyerAddress,
                        productId, productName, productImage, brandId, brandName,
                        quantity, priceVND, totalVND, pointsUsed, pointsEarned,
                        paymentMethod, type: 'redeem'|'buy',
                        status: 'pending'|'confirmed'|'shipping'|'completed'|'cancelled',
                        createdAt }
notifications/{uid}/items/{id}  { type, message, link, readAt, createdAt }
```
