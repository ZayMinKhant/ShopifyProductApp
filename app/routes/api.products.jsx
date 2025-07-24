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

    const response = await admin.graphql(
      `
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
    `,
      {
        variables: {
          first,
          after,
        },
      },
    );

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
      inventoryQuantity: node.variants.edges[0]?.node.inventoryQuantity || 0,
    }));

    if (status.length > 0 && status[0] !== "") {
      products = products.filter((product) =>
        status.includes(product.status.toLowerCase()),
      );
    }
    if (stock.length > 0 && stock[0] !== "") {
      products = products.filter((product) => {
        const inStock = product.inventoryQuantity > 0;
        return stock.includes(inStock ? "in-stock" : "out-of-stock");
      });
    }
    if (query) {
      products = products.filter((product) =>
        product.title.toLowerCase().includes(query.toLowerCase()),
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
    return json(
      {
        error: "Failed to fetch products. Please try again later.",
        success: false,
      },
      { status: 500 },
    );
  }
}

export async function action({ request }) {
  try {
    const { admin } = await authenticate.admin(request);
    const formData = await request.formData();
    const title = formData.get("title");
    const description = formData.get("description");
    const price = formData.get("price");
    const image = formData.get("image");
    const inventory = formData.get("inventory");

    if (!title) {
      return json(
        {
          error: "Title is required",
          success: false,
        },
        { status: 400 },
      );
    }
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      return json(
        {
          error: "Valid price is required",
          success: false,
        },
        { status: 400 },
      );
    }

    // Step 1: Create product with title and description only (no variants)
    const productInput = {
      title,
      descriptionHtml: description || "",
    };

    const createResponse = await admin.graphql(
      `
        mutation productCreate($product: ProductCreateInput!) {
          productCreate(product: $product) {
            product {
              id
              title
              descriptionHtml
            }
            userErrors { field message }
          }
        }
      `,
      {
        variables: { product: productInput },
      },
    );
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

    // Step 2: Add variant using productVariantCreate if available
    let variantId = null;
    let imageUrl = "";
    let variantPrice = price;
    let variantInventory = inventory ? parseInt(inventory) : 0;
    try {
      const variantInput = {
        productId: product.id,
        price: price || "0.00",
        inventoryQuantity: variantInventory,
      };
      const variantResponse = await admin.graphql(
        `
          mutation productVariantCreate($variant: ProductVariantInput!) {
            productVariantCreate(productVariant: $variant) {
              productVariant { id price inventoryQuantity }
              userErrors { field message }
            }
          }
        `,
        {
          variables: { variant: variantInput },
        },
      );
      const variantData = await variantResponse.json();
      if (variantData.errors) {
        throw new Error(variantData.errors[0].message);
      }
      const vUserErrors = variantData.data.productVariantCreate.userErrors;
      if (vUserErrors && vUserErrors.length > 0) {
        throw new Error(vUserErrors[0].message);
      }
      const variantNode = variantData.data.productVariantCreate.productVariant;
      if (variantNode) {
        variantId = variantNode.id;
        variantPrice = variantNode.price;
        variantInventory = variantNode.inventoryQuantity;
      }
    } catch (variantError) {
      // If productVariantCreate is not available, instruct user to upgrade API version
      return json({
        error: "Your Shopify API version does not support productVariantCreate. Please upgrade to the latest stable API version.",
        success: false,
      }, { status: 500 });
    }

    // Step 3: Add image if provided
    if (image && image.trim() !== "") {
      const imageInput = {
        productId: product.id,
        src: image,
      };
      const imageResponse = await admin.graphql(
        `
          mutation productImageCreate($image: ImageInput!) {
            productImageCreate(image: $image) {
              image { id url }
              userErrors { field message }
            }
          }
        `,
        {
          variables: { image: imageInput },
        },
      );
      const imageData = await imageResponse.json();
      if (imageData.errors) {
        throw new Error(imageData.errors[0].message);
      }
      const iUserErrors = imageData.data.productImageCreate.userErrors;
      if (iUserErrors && iUserErrors.length > 0) {
        throw new Error(iUserErrors[0].message);
      }
      imageUrl = imageData.data.productImageCreate.image.url;
    }

    const createdProduct = {
      id: product.id,
      title: product.title,
      description: product.descriptionHtml,
      price: variantPrice,
      image: imageUrl || image || "",
      inventoryQuantity: variantInventory,
    };

    return json({
      success: true,
      product: createdProduct,
      message: "Product created successfully!",
    });
  } catch (error) {
    console.error("Error creating product:", error);

    let errorMessage = "Failed to create product. Please try again later.";

    if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    if (errorMessage.includes("title")) {
      errorMessage = "Invalid product title. Please enter a valid title.";
    }

    return json(
      {
        error: errorMessage,
        success: false,
      },
      { status: 500 },
    );
  }
}
