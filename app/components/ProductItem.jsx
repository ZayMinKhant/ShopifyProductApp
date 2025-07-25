import React from "react";
import { ResourceItem, Thumbnail, Text, Badge } from "@shopify/polaris";
import { ImageIcon } from "@shopify/polaris-icons";

/**
 * @param {Object} props
 * @param {Object} props.product
 * @param {string} props.product.id
 * @param {string} props.product.title
 * @param {string} props.product.price
 * @param {string} props.product.image
 * @param {string} props.product.status
 * @param {number} props.product.inventoryQuantity
 * @param {string} [props.url]
 */
export default function ProductItem({ product, url, onClick }) {
  const { id, title, price, image, status, inventoryQuantity } = product;
  const media = image && image.trim() !== "" ? (
    <Thumbnail source={image} alt={title} />
  ) : (
    <Thumbnail source={ImageIcon} alt="No image" />
  );

  const statusBadge = status === "ACTIVE" ? (
    <Badge status="success">Active</Badge>
  ) : (
    <Badge>Draft</Badge>
  );

  const stockBadge = inventoryQuantity > 0 ? (
    <Badge status="success">In Stock ({inventoryQuantity})</Badge>
  ) : (
    <Badge status="critical">Out of Stock</Badge>
  );

  return (
    <ResourceItem
      id={id}
      media={media}
      accessibilityLabel={`View details for ${title}`}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Text variant="bodyMd" fontWeight="bold" as="h3">
            {title}
          </Text>
          <Text variant="bodySm" color="subdued">
            ${price}
          </Text>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {statusBadge}
          {stockBadge}
        </div>
      </div>
    </ResourceItem>
  );
} 