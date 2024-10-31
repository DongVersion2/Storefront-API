const STOREFRONT_ACCESS_TOKEN = 'dc9cfdecf701618b8a1a2be0309a8b05';
const SHOP_DOMAIN = 'phandong-test.myshopify.com';

const shopifyAPI = {
  testConnection: async function() {
    try {
      const response = await fetch(`https://${SHOP_DOMAIN}/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN
        },
        body: JSON.stringify({
          query: `
            {
              shop {
                name
                description
              }
            }
          `
        })
      });

      const data = await response.json();
      console.log('Kết nối thành công:', data);
      return data;
    } catch (error) {
      console.error('Lỗi kết nối:', error);
      throw error;
    }
  }
};

export default shopifyAPI; 