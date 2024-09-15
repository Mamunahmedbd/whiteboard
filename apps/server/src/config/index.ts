export default {
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT || 3003),
  corsOrigin: {
    prod: 'https://whiteboard.ispcrmcloud.com',
    dev: 'https://whiteboard.ispcrmcloud.com',
  },
} as const;
