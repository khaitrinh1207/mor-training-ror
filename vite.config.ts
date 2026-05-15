import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const railsProxy = {
  target: 'http://localhost:3000',
  changeOrigin: true,
  configure: (proxy: { on: (event: string, callback: (proxyReq: { setHeader: (name: string, value: string) => void }) => void) => void }) => {
    proxy.on('proxyReq', (proxyReq) => {
      proxyReq.setHeader('host', 'localhost:5173');
      proxyReq.setHeader('origin', 'http://localhost:5173');
    });
  }
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/admin': railsProxy,
      '/admins': railsProxy,
      '/assets': railsProxy,
      '/match': railsProxy
    }
  }
});
