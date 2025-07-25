import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  try {
    const url = new URL(request.url);
    const first = parseInt(url.searchParams.get("first")) || 50;
    const after = url.searchParams.get("after") || null;
    const query = url.searchParams.get("query") || null;
    const status = url.searchParams.get("status")?.split(",") || [];
    const stock = url.searchParams.get("stock")?.split(",") || [];

    const sortKeyMap = {
      "title-asc": "TITLE",
      "title-desc": "TITLE",
      "price-asc": "PRICE",
      "price-desc": "PRICE"
    };
    const sortParam = url.searchParams.get("sort") || "title-asc";
    const sortKey = sortKeyMap[sortParam];
    const reverse = sortParam.endsWith("-desc");

    let apiQueryParts = [];
    if (query) {
      apiQueryParts.push(`title:*${query}*`);
    }
    if (status && status.length > 0) {
      status.forEach(s => {
        if (s) apiQueryParts.push(`status:${s}`)
      });
    }
    const apiQuery = apiQueryParts.join(" AND ") || null;

    const { admin } = await authenticate.admin(request);

    const response = await admin.graphql(
      `
      query getProducts($first: Int!, $after: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
        products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
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
          pageInfo {
             hasNextPage
             endCursor
          }
        }
      }
      `,
      {
        variables: {
          first,
          after,
          query: apiQuery,
          sortKey: sortKey,
          reverse: reverse
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

    if (stock.length > 0 && stock[0] !== "") {
      products = products.filter((product) => {
        const inStock = product.inventoryQuantity > 0;
        return stock.includes(inStock ? "in-stock" : "out-of-stock");
      });
    }

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
    const title = formData.get("title")?.trim();
    const description = formData.get("description")?.trim();

    const errors = [];
    if (!title) {
      errors.push("Title is required");
    } else if (title.length < 2) {
      errors.push("Title must be at least 2 characters long");
    }

    if (errors.length > 0) {
      return json({ 
        error: errors.join(", "),
        success: false 
      }, { status: 400 });
    }

    const productInput = {
      title,
      descriptionHtml: description || ""
    };

    console.log("Creating product with input:", JSON.stringify(productInput, null, 2));

    const productCreateResponse = await admin.graphql(
      `
        mutation productCreate($input: ProductInput!) {
          productCreate(input: $input) {
            product {
              id
              title
              descriptionHtml
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
      `,
      {
        variables: {
          input: productInput,
        },
      },
    );

    const productCreateData = await productCreateResponse.json();
    if (productCreateData.errors) {
      throw new Error(productCreateData.errors[0].message);
    }

    const productCreateErrors = productCreateData.data.productCreate.userErrors;
    if (productCreateErrors && productCreateErrors.length > 0) {
      return json({ error: productCreateErrors[0].message, success: false }, { status: 422 });
    }

    const product = productCreateData.data.productCreate.product;
    if (!product) {
      throw new Error("Product creation failed - no product returned");

    }

    return json({
      success: true,
      product,
      message: "Product created successfully!",
    });

  } catch (error) {
    console.error("Error creating product:", error);
    return json(
      {
        error: error.message || "Failed to create product. Please try again.",
        success: false,
      },
      { status: 500 },
    );
  }
}
