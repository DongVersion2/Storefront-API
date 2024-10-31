import Client from 'shopify-buy';

const client = Client.buildClient({
  domain: 'phandong-test.myshopify.com',
  storefrontAccessToken: 'dc9cfdecf701618b8a1a2be0309a8b05'
});

export default client; 