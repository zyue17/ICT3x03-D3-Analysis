const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  const link = "http://vanguard.sitict.net:8000";
  app.use(
    '/AdminDashboard',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/Admin_RequestCustomerLoginLogs',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/Admin_Customertransactions',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/Admin_RequestAdminLogs',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/accountdetails',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/add_account',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/transaction_history',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/deposit',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/withdraw',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/forgotusername',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/forgotpassword',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/loginauthentication',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/Profile',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/changepass',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/changeemail',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/changeadd',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/check_email',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/check_phonenumber',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/check_username',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/register',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/send_register_email',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/verifyemail',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/send_register_phone',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/emailaut',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );

  app.use(
    '/resend',
    createProxyMiddleware({
      target: link,
      changeOrigin: true,
    })
  );
};