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
  
      console.log("Creating product with:", { title, price, description, imageUrl });
  
      if (imageUrl && !isValidImageUrl(imageUrl)) {
        return json({ 
          error: "Please provide a valid image URL (must start with http:// or https://)",
          success: false 
        }, { status: 400 });
      }
  
      // 1. Create the product (no variants, no image)
      const productInput = {
        title,
        descriptionHtml: description || ""
      };

      const createResponse = await admin.graphql(`
        mutation productCreate($product: ProductCreateInput!) {
          productCreate(product: $product) {
            product {
              id
              title
              descriptionHtml
            }
            userErrors {
              field
              message
            }
          }
        }
      `, {
        variables: {
          product: productInput
        }
      });

      const createData = await createResponse.json();
      if (createData.errors) {
        throw new Error(createData.errors[0].message);
      }
      const userErrors = createData.data.productCreate.userErrors;
      if (userErrors && userErrors.length > 0) {
        throw new Error(userErrors[0].message);
      }
      const product = createData.data.productCreate.product;
      if (!product) {
        throw new Error("Product creation failed - no product returned");
      }

      // Prepare the created product object
      const createdProduct = {
        id: product.id,
        title: product.title,
        description: product.descriptionHtml
      };

      return json({ 
        success: true,
        product: createdProduct,
        message: "Product created successfully!"
      });
      
    } catch (error) {
      console.error("Error creating product:", error);
      
      let errorMessage = "Failed to create product. Please try again later.";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      if (errorMessage.includes("Image")) {
        errorMessage = "Failed to add image. Please check the image URL and try again.";
      } else if (errorMessage.includes("price")) {
        errorMessage = "Invalid price format. Please enter a valid price.";
      } else if (errorMessage.includes("title")) {
        errorMessage = "Invalid product title. Please enter a valid title.";
      }
  
      return json({ 
        error: errorMessage,
        success: false 
      }, { status: 500 });
    }
  }

function isValidImageUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}