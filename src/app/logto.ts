export const logtoConfig = {
  endpoint: 'http://localhost:3001/',
  appId: 'esxg6p9ws4xsrltptfrt0',
  appSecret: '4w19YfEwPGVYJhwxqUXyEDeHP9uA4ibq',
  baseUrl: 'http://localhost:3000', // Change to your own base URL
  cookieSecret: 'a9v512F0pmIYLEAdvaEbRvm8FbnYW5lw', // Auto-generated 32 digit secret
  cookieSecure: process.env.NODE_ENV === 'production',
  resources: ['http://localhost:8080'],
  scopes: ['api:read', 'api:write']
};