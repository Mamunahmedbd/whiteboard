export default {
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT || 3003),
  corsOrigin: {
    prod: 'https://whiteboard.ispcrmcloud.com',
    dev: 'http://localhost:5174',
  },
} as const;
