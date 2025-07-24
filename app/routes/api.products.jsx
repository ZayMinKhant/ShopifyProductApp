import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  try {
    const url = new URL(request.url);
    const first = parseInt(url.searchParams.get("first")) || 50;
    const after = url.searchParams.get("after") || null;
    const status = url.searchParams.get("status")?.split(",") || [];
    const stock = url.searchParams.get("stock")?.split(",") || [];
    const query = url.searchParams.get("query") || "";
    const sort = url.searchParams.get("sort") || "title-asc";

    const { admin } = await authenticate.admin(request);
    
    const response = await admin.graphql(`
      query getProducts($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          edges {
            node {
              id
              title
              status
              variants(first: 1) {
                edges {
                  node {
                    price
                    inventoryQuantity
                  }
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    `, {
      variables: {
        first,
        after
      }
    });

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    let products = data.data.products.edges.map(({ node }) => ({
      id: node.id,
      title: node.title,
      status: node.status,
      price: node.variants.edges[0]?.node.price || "0.00",
      image: node.images.edges[0]?.node.url || "",
      inventoryQuantity: node.variants.edges[0]?.node.inventoryQuantity || 0
    }));

    // Server-side filtering
    if (status.length > 0 && status[0] !== "") {
      products = products.filter(product => status.includes(product.status.toLowerCase()));
    }
    if (stock.length > 0 && stock[0] !== "") {
      products = products.filter(product => {
        const inStock = product.inventoryQuantity > 0;
        return stock.includes(inStock ? "in-stock" : "out-of-stock");
      });
    }
    if (query) {
      products = products.filter(product =>
        product.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Server-side sorting
    products.sort((a, b) => {
      switch (sort) {
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "price-asc":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-desc":
          return parseFloat(b.price) - parseFloat(a.price);
        default:
          return 0;
      }
    });

    return json({ products, success: true });
    
  } catch (error) {
    console.error("Error fetching products:", error);
    return json({ 
      error: "Failed to fetch products. Please try again later.",
      success: false 
    }, { status: 500 });
  }
}

export async function action({ request }) {
  try {
    const { admin } = await authenticate.admin(request);
    const formData = await request.formData();
    const title = formData.get("title");
    const price = formData.get("price");
    const description = formData.get("description");
    const imageUrl = formData.get("imageUrl");

    if (!title || !price) {
      return json({ 
        error: "Title and price are required",
        success: false 
      }, { status: 400 });
    }

    const productInput = {
      title,
      descriptionHtml: description || "",
    };
    const createResponse = await admin.graphql(`
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            variants(first: 1) {
              edges {
                node {
                  id
                  price
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `, {
      variables: {
        input: productInput
      }
    });

    const createData = await createResponse.json();
    const userErrors = createData.data.productCreate.userErrors;
    if (userErrors && userErrors.length > 0) {
      throw new Error(userErrors[0].message);
    }
    const product = createData.data.productCreate.product;
    const productId = product.id;
    const variantId = product.variants.edges[0]?.node.id;

    let createdImage = null;
    if (imageUrl && productId) {
      const mediaResponse = await admin.graphql(`
        mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
          productCreateMedia(productId: $productId, media: $media) {
            media {
              ... on MediaImage {
                id
                image {
                  url
                }
              }
            }
            mediaUserErrors {
              field
              message
            }
          }
        }
      `, {
        variables: {
          productId,
          media: [{ originalSource: imageUrl, mediaContentType: "IMAGE" }]
        }
      });
      const mediaData = await mediaResponse.json();
      const mediaErrors = mediaData.data.productCreateMedia.mediaUserErrors;
      if (mediaErrors && mediaErrors.length > 0) {
        throw new Error(mediaErrors[0].message);
      }
      createdImage = mediaData.data.productCreateMedia.media[0]?.image?.url;
    }

    let updatedVariant = null;
    if (variantId) {
      const updateVariantResponse = await admin.graphql(`
        mutation productVariantUpdate($input: ProductVariantInput!) {
          productVariantUpdate(input: $input) {
            productVariant {
              id
              price
            }
            userErrors {
              field
              message
            }
          }
        }
      `, {
        variables: {
          input: {
            id: variantId,
            price: price
          }
        }
      });
      const updateVariantData = await updateVariantResponse.json();
      const variantErrors = updateVariantData.data.productVariantUpdate.userErrors;
      if (variantErrors && variantErrors.length > 0) {
        throw new Error(variantErrors[0].message);
      }
      updatedVariant = updateVariantData.data.productVariantUpdate.productVariant;
    }

    return json({ 
      success: true,
      product: {
        ...product,
        price: updatedVariant ? updatedVariant.price : price,
        image: createdImage || ""
      }
    });
    
  } catch (error) {
    console.error("Error creating product:", error);
    return json({ 
      error: error.message || (typeof error === 'string' ? error : JSON.stringify(error)) || "Failed to create product. Please try again later.",
      success: false 
    }, { status: 500 });
  }
}
