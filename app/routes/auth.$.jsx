import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const response = await authenticate.admin(request);
  if (response instanceof Response) return response;
  return null;
};
