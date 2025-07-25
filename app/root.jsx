import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { redirect } from "@remix-run/node";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const host = url.searchParams.get("host");
  const shop = url.searchParams.get("shop");
  console.log("[DEBUG][root loader] url:", url.toString(), "host:", host, "shop:", shop);
  if (!host || !shop) {
    return redirect("/auth/login");
  }
  return { host, shop };
};

export default function App() {
  // Try to get loader data for debug output
  let host = "";
  let shop = "";
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    host = params.get("host") || "";
    shop = params.get("shop") || "";
  }
  console.log("[DEBUG][root App] host:", host, "shop:", shop);
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        {/* TEMPORARY DEBUG OUTPUT */}
        <div style={{background: 'yellow', color: 'black', padding: '10px', zIndex: 9999}}>
          <strong>DEBUG:</strong> host: {host} | shop: {shop}
        </div>
        <AppProvider isEmbeddedApp apiKey={typeof window !== 'undefined' ? window.__SHOPIFY_API_KEY__ : process.env.SHOPIFY_API_KEY}>
          <Outlet />
        </AppProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
