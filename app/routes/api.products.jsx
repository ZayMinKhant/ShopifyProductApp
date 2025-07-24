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

    const productInput = {
      title,
      descriptionHtml: description || "",
      variants: [
        {
          price: price || "0.00",
          inventoryItem: {
            tracked: true,
          },
          inventoryQuantities: {
            availableQuantity: inventory ? parseInt(inventory) : 0,
            locationId: "gid://shopify/Location/95113380152",
          },
        },
      ],
    };

    const mediaInput = image
      ? [
          {
            originalSource: image,
            mediaContentType: "IMAGE",
          },
        ]
      : [];

    const createResponse = await admin.graphql(
      `
        mutation productCreate($input: ProductInput!, $media: [CreateMediaInput!]) {
          productCreate(input: $input, media: $media) {
            product {
              id
              title
              descriptionHtml
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
      `,
      {
        variables: {
          input: productInput,
          media: mediaInput,
        },
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

    const createdProduct = {
      id: product.id,
      title: product.title,
      description: product.descriptionHtml,
      price: product.variants.edges[0]?.node.price || "0.00",
      image: product.images.edges[0]?.node.url || "",
      inventoryQuantity:
        product.variants.edges[0]?.node.inventoryQuantity || 0,
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
