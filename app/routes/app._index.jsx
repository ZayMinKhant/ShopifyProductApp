import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useFetcher, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  ResourceList,
  Filters,
  ChoiceList,
  Button,
  Toast,
  Frame,
  Spinner,
} from "@shopify/polaris";
import ProductItem from "../components/ProductItem";
import CreateProductModal from "../components/CreateProductModal";
import useDebounce from "../hooks/useDebounce";


export const STATUS_FILTER_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
];
export const STOCK_FILTER_OPTIONS = [
  { label: "In Stock", value: "in-stock" },
  { label: "Out of Stock", value: "out-of-stock" },
];
export const SORT_OPTIONS = [
  { label: "Title A-Z", value: "title-asc" },
  { label: "Title Z-A", value: "title-desc" },
  { label: "Price Low-High", value: "price-asc" },
  { label: "Price High-Low", value: "price-desc" },
];

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} title
 * @property {string} status
 * @property {string} price
 * @property {string} image
 * @property {number} inventoryQuantity
 */

export default function Index() {
  const fetcher = useFetcher();
  const createFetcher = useFetcher();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState([]);
  const [stockFilter, setStockFilter] = useState([]);
  const [sortValue, setSortValue] = useState(SORT_OPTIONS[0].value);
  const [queryValue, setQueryValue] = useState("");
  const debouncedQuery = useDebounce(queryValue, 300);

  const [modalActive, setModalActive] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    image: "",
    inventory: ""
  });

  const [creationStep, setCreationStep] = useState(null);

  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastStatus, setToastStatus] = useState(undefined); 

  const pageSize = 50;

  const shopDomain = useMemo(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("shop") || 'zmk-test-store.myshopify.com';
    }
    return undefined;
  }, []);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    let url = `/api/products?first=${pageSize}`;
    if (statusFilter.length > 0) url += `&status=${statusFilter.join(",")}`;
    if (stockFilter.length > 0) url += `&stock=${stockFilter.join(",")}`;
    if (debouncedQuery) url += `&query=${encodeURIComponent(debouncedQuery)}`;
    // Always use title-asc for backend if sorting by price
    const backendSort = (sortValue === "price-asc" || sortValue === "price-desc") ? "title-asc" : sortValue;
    if (backendSort) url += `&sort=${encodeURIComponent(backendSort)}`;
    fetcher.load(url);
  }, [fetcher, pageSize, statusFilter, stockFilter, debouncedQuery, sortValue]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, stockFilter, debouncedQuery, sortValue]);

  useEffect(() => {
    if (createFetcher.state === "idle" && createFetcher.data) {
      if (createFetcher.data.success) {
        setModalActive(false);
        setNewProduct({ title: "", description: "", image: "", inventory: "" });
        setToastMessage("Product created successfully!");
        setToastStatus("success");
        setToastActive(true);
        fetchProducts();
      } else if (createFetcher.data.error) {
        setToastMessage(createFetcher.data.error);
        setToastStatus("error");
        setToastActive(true);
      }
      setCreationStep(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createFetcher.state, createFetcher.data]);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        if (Array.isArray(fetcher.data.products)) {
          fetcher.data.products.forEach((product, idx) => {
            if (
              typeof product.id !== 'string' ||
              typeof product.title !== 'string'
            ) {
              // eslint-disable-next-line no-console
              console.warn(`Product at index ${idx} is missing required fields or has wrong types`, product);
              setToastMessage(`Warning: Product at index ${idx} is missing required fields or has wrong types.`);
              setToastStatus("warning");
              setToastActive(true);
            }
          });
        }
        setProducts(fetcher.data.products);
        setError(null);
      } else {
        if ((sortValue === "price-asc" || sortValue === "price-desc") && !fetcher.data.products) {
          if (!fetcher.data._frontendPriceSort) {
            fetchProducts("title-asc");
            fetcher.data._frontendPriceSort = true;
            setToastActive(true);
            return;
          }
        }
        setError(fetcher.data.error);
        setProducts([]);
        setToastMessage(fetcher.data.error);
        setToastStatus("error");
        setToastActive(true);
      }
      setLoading(false);
    }
  }, [fetcher.data, sortValue, fetchProducts]);

  const displayedProducts = React.useMemo(() => {
    if ((sortValue === "price-asc" || sortValue === "price-desc") && products.length > 0) {
      const sorted = [...products].sort((a, b) => {
        const priceA = parseFloat(a.price || "0");
        const priceB = parseFloat(b.price || "0");
        if (sortValue === "price-asc") return priceA - priceB;
        else return priceB - priceA;
      });
      return sorted;
    }
    return products;
  }, [products, sortValue]);

  const handleStatusFilterChange = useCallback((value) => {
    setStatusFilter(value);
  }, []);

  const handleStockFilterChange = useCallback((value) => {
    setStockFilter(value);
  }, []);

  const handleQueryChange = useCallback((value) => {
    setQueryValue(value);
  }, []);

  const handleQueryClear = useCallback(() => {
    setQueryValue("");
  }, []);

  const handleSortChange = useCallback((value) => {
    setSortValue(value);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setStatusFilter([]);
    setStockFilter([]);
    setQueryValue("");
    setSortValue(SORT_OPTIONS[0].value);
  }, []);

  const handleModalToggle = useCallback(() => {
    if (createFetcher.state !== "submitting") {
      setModalActive(!modalActive);
    }
  }, [modalActive, createFetcher.state]);

  const handleProductChange = useCallback((field, value) => {
    setNewProduct(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleCreateProduct = useCallback(() => {
    if (!newProduct.title) {
      setToastMessage("Product title is required.");
      setToastStatus("error");
      setToastActive(true);
      return;
    }
    // Removed price validation

    let imageUrl = newProduct.image.trim();
    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
      imageUrl = `https://${imageUrl}`;
    }

    const formData = new FormData();
    formData.append("title", newProduct.title);
    formData.append("description", newProduct.description);
    formData.append("image", imageUrl);
    formData.append("inventory", newProduct.inventory);
    // Removed price from formData
    
    setCreationStep("product");
    createFetcher.submit(formData, {
      method: "POST",
      action: "/api/products"
    });
  }, [newProduct, createFetcher]);

  const filters = [
    {
      key: "status",
      label: "Status",
      filter: (
        <ChoiceList
          title="Status"
          titleHidden
          choices={STATUS_FILTER_OPTIONS}
          selected={statusFilter}
          onChange={handleStatusFilterChange}
          allowMultiple
        />
      ),
      shortcut: true
    },
    {
      key: "stock",
      label: "Stock",
      filter: (
        <ChoiceList
          title="Stock"
          titleHidden
          choices={STOCK_FILTER_OPTIONS}
          selected={stockFilter}
          onChange={handleStockFilterChange}
          allowMultiple
        />
      ),
      shortcut: true
    }
  ];

  const appliedFilters = [];
  if (statusFilter.length > 0) {
    appliedFilters.push({
      key: "status",
      label: `Status: ${statusFilter.join(", ")}`,
      onRemove: () => setStatusFilter([])
    });
  }
  if (stockFilter.length > 0) {
    appliedFilters.push({
      key: "stock",
      label: `Stock: ${stockFilter.join(", ")}`,
      onRemove: () => setStockFilter([])
    });
  }

  const sortOptions = SORT_OPTIONS;

  const toast = toastActive ? (
    <Toast
      content={toastMessage}
      onDismiss={() => setToastActive(false)}
      status={toastStatus}
    />
  ) : null;

  if (loading) {
  return (
      <Page title="Products">
        <Layout>
          <Layout.Section>
            <Card>
              <div style={{ padding: "40px", textAlign: "center" }}>
                <Spinner accessibilityLabel="Loading products" size="large" />
                <div style={{ marginTop: 16 }}>
                  <span>Loading products...</span>
                </div>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  if (error) {
    console.error("[DEBUG] ErrorBoundary error:", error);
    return (
      <Page title="Products">
        <Layout>
          <Layout.Section>
              <Card>
              <div style={{ padding: "40px", textAlign: "center" }}>
                <div role="alert" style={{ color: 'red', marginBottom: 16 }}>{error}</div>
                <div style={{ marginTop: "16px" }}>
                  <Button onClick={fetchProducts}>Try Again</Button>
                </div>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
        {toast}
      </Page>
    );
  }

  return (
    <Frame>
      <Page
        title="Products"
        primaryAction={{
          content: "Create Product",
          onAction: handleModalToggle
        }}
      >
        <Layout>
          <Layout.Section>
              <Card>
              <ResourceList
                resourceName={{ singular: "product", plural: "products" }}
                items={displayedProducts}
                renderItem={(item) => {
                  const shopifyIdMatch = item.id.match(/Product\/(\d+)/);
                  const shopifyId = shopifyIdMatch ? shopifyIdMatch[1] : null;
                  const adminUrl = shopifyId ? `https://admin.shopify.com/store/${shopDomain}/products/${shopifyId}` : undefined;
                  return <ProductItem product={item} url={adminUrl} />;
                }}
                filterControl={
                  <Filters
                    queryValue={queryValue}
                    filters={filters}
                    appliedFilters={appliedFilters}
                    onQueryChange={handleQueryChange}
                    onQueryClear={handleQueryClear}
                    onClearAll={handleClearAllFilters}
                  />
                }
                sortOptions={sortOptions}
                sortValue={sortValue}
                onSortChange={handleSortChange}
                emptyState={
                  <div style={{ padding: "40px", textAlign: "center" }}>
                    <span>No products found</span>
                  </div>
                }
              />
              </Card>
          </Layout.Section>
        </Layout>

        <CreateProductModal
          open={modalActive}
          loading={createFetcher.state === "submitting"}
          creationStep={creationStep}
          newProduct={newProduct}
          onChange={handleProductChange}
          onCreate={handleCreateProduct}
          onClose={handleModalToggle}
        />

        {toast}
      </Page>
    </Frame>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let message = "An unexpected error occurred.";
  if (isRouteErrorResponse(error)) {
    message = error.data || error.statusText;
  } else if (error instanceof Error) {
    message = error.message;
  }
  console.error("[DEBUG] ErrorBoundary error:", error);
  return (
    <Frame>
      <Page title="Error">
        <Layout>
          <Layout.Section>
            <Card>
              <div style={{ padding: 40, textAlign: "center" }}>
                <div role="alert" style={{ color: 'red', marginBottom: 16 }}>{message}</div>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </Frame>
  );
}

export function CatchBoundary() {
  return (
    <Frame>
      <Page title="Not Found">
        <Layout>
          <Layout.Section>
            <Card>
              <div style={{ padding: 40, textAlign: "center" }}>
                <div role="alert" style={{ color: 'red', marginBottom: 16 }}>This page could not be found.</div>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </Frame>
  );
}
