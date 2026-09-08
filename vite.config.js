import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Firebase SDK tự tách thành chunk riêng (~575KB), không thể giảm thêm vì là thư viện bên thứ 3.
    // Các route chunk đều < 30KB nhờ React.lazy code-splitting.
    chunkSizeWarningLimit: 600,
  },
});
