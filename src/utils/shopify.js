const storefrontAccessToken = 'dc9cfdecf701618b8a1a2be0309a8b05';
const shopifyDomain = 'phandong-test.myshopify.com';

export async function shopifyFetch({query, variables}) {
    try {
        // Log request để debug
        console.log('Shopify Request:', {
            url: `https://${shopifyDomain}/api/2024-07/graphql.json`,
            variables
        });

        const response = await fetch(
            `https://${shopifyDomain}/api/2024-07/graphql.json`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
                },
                body: JSON.stringify({query, variables}),
            }
        );

        // Kiểm tra response status
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();

        // Log response để debug
        console.log('Shopify Response:', json);

        // Kiểm tra lỗi từ Shopify API
        if (json.errors) {
            console.error('Shopify API Errors:', json.errors);
            throw new Error(json.errors[0].message);
        }

        // Kiểm tra data
        if (!json.data) {
            throw new Error('No data returned from Shopify');
        }

        return json;
    } catch (error) {
        console.error('Shopify Fetch Error:', error);
        throw error;
    }
}
