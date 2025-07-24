import React from "react";
import { Modal, FormLayout, TextField } from "@shopify/polaris";

/**
 * @param {Object} props
 * @param {boolean} props.open
 * @param {boolean} props.loading
 * @param {string} props.creationStep
 * @param {Object} props.newProduct
 * @param {function} props.onChange
 * @param {function} props.onCreate
 * @param {function} props.onClose
 */
export default function CreateProductModal({
  open,
  loading,
  creationStep,
  newProduct,
  onChange,
  onCreate,
  onClose,
}) {
  const getPrimaryActionContent = () => {
    if (loading) {
      return "Creating Product...";
    }
    return "Create Product";
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New Product"
      primaryAction={{
        content: getPrimaryActionContent(),
        onAction: onCreate,
        loading,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onClose,
          disabled: loading,
        },
      ]}
    >
      <Modal.Section>
        <FormLayout>
          <TextField
            label="Product Title"
            value={newProduct.title}
            onChange={(value) => onChange("title", value)}
            placeholder="Enter product title"
            autoComplete="off"
            required
            disabled={loading}
          />
          <TextField
            label="Description"
            value={newProduct.description}
            onChange={(value) => onChange("description", value)}
            placeholder="Enter product description (optional)"
            multiline={3}
            autoComplete="off"
            disabled={loading}
          />
          <TextField
            label="Price"
            type="number"
            value={newProduct.price}
            onChange={(value) => onChange("price", value)}
            placeholder="Feature coming soon"
            autoComplete="off"
            min={0}
            disabled={true}
            helpText="Price setting is not available yet"
          />
          <TextField
            label="Image URL"
            value={newProduct.image}
            onChange={(value) => onChange("image", value)}
            placeholder="Feature coming soon"
            autoComplete="off"
            disabled={true}
            helpText="Image upload is not available yet"
          />
          <TextField
            label="Inventory Quantity"
            type="number"
            value={newProduct.inventory}
            onChange={(value) => onChange("inventory", value)}
            placeholder="Feature coming soon"
            autoComplete="off"
            min={0}
            disabled={true}
            helpText="Inventory management is not available yet"
          />
        </FormLayout>
      </Modal.Section>
    </Modal>
  );
} 