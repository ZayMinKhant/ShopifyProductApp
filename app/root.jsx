import { redirect } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { AppProvider, Frame } from '@shopify/polaris';

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const pathname = url.pathname;
  if (pathname !== "/auth/login") {
    const host = url.searchParams.get("host");
    const shop = url.searchParams.get("shop");
    if (!host || !shop) {
      return redirect("/auth/login");
    }
  }
  return null;
};

export default function App() {
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
        <AppProvider>
          <Frame>
            <Outlet />
          </Frame>
        </AppProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
