import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <img src="/public/favicon.ico" alt="App Logo" style={{ width: 64, height: 64, margin: '0 auto 1rem' }} />
        <h1 className={styles.heading}>Welcome to Shopify Product Manager</h1>
        <p className={styles.text}>
          Easily view, filter, and create products in your Shopify store. Fast, modern, and built for merchants.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Enter your Shopify store domain</span>
              <input className={styles.input} type="text" name="shop" placeholder="my-shop-domain.myshopify.com" required />
            </label>
            <button className={styles.button} type="submit">
              Log in with Shopify
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>Product Listing</strong>. Instantly see all your products with images, prices, and status.
          </li>
          <li>
            <strong>Filtering & Sorting</strong>. Quickly find products by availability, status, or price.
          </li>
          <li>
            <strong>Product Creation</strong>. Add new products with title, price, description, and image URL.
          </li>
        </ul>
      </div>
    </div>
  );
}
