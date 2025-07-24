import React from "react";
import { Modal, FormLayout, TextField } from "@shopify/polaris";

/**
 * @param {Object} props
 * @param {boolean} props.open
 * @param {boolean} props.loading
 * @param {Object} props.newProduct
 * @param {function} props.onChange
 * @param {function} props.onCreate
 * @param {function} props.onClose
 */
export default function CreateProductModal({ open, loading, newProduct, onChange, onCreate, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New Product"
      primaryAction={{
        content: "Create Product",
        onAction: onCreate,
        loading
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: onClose
        }
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
          />
          <TextField
            label="Description"
            value={newProduct.description}
            onChange={(value) => onChange("description", value)}
            placeholder="Enter product description (optional)"
            multiline={3}
            autoComplete="off"
          />
          <TextField
            label="Price"
            type="number"
            value={newProduct.price}
            onChange={(value) => onChange("price", value)}
            placeholder="Enter price (e.g. 19.99)"
            autoComplete="off"
            min={0}
            required
          />
          <TextField
            label="Image URL"
            value={newProduct.image}
            onChange={(value) => onChange("image", value)}
            placeholder="Enter image URL (optional)"
            autoComplete="off"
          />
          <TextField
            label="Inventory Quantity"
            type="number"
            value={newProduct.inventory}
            onChange={(value) => onChange("inventory", value)}
            placeholder="Enter inventory quantity (optional)"
            autoComplete="off"
            min={0}
          />
        </FormLayout>
      </Modal.Section>
    </Modal>
  );
} 