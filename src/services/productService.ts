export interface Product {
  id: string | number;
  title: string;
  price: number | string;
  imageUrl?: string;
  slug?: string;
  [key: string]: any;
}

export interface PaginatedMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface ProductsResponse {
  products: Product[];
  meta: PaginatedMeta;
}

// Fetch products with pagination and normalize varying API response shapes
export async function fetchProducts(
  page: number = 1,
  limit: number = 20
): Promise<ProductsResponse> {
  const url = `/api/v3/products?page=${page}&limit=${limit}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status}`);
  }

  const json = await res.json();

  // Try common shapes: array, json.data.data, json.data.products, json.products, json.items, json.data
  const rawList: any = Array.isArray(json)
    ? json
    : json?.data?.data ??
      json?.data?.products ??
      json?.products ??
      json?.items ??
      json?.data ??
      [];

  const list: any[] = Array.isArray(rawList) ? rawList : [];
  const products: Product[] = list.map(normalizeProduct);

  const meta: PaginatedMeta = {
    page: json?.page ?? json?.data?.page ?? json?.meta?.page,
    limit: json?.limit ?? json?.data?.limit ?? json?.meta?.limit,
    total: json?.total ?? json?.data?.total ?? json?.meta?.total,
    totalPages:
      json?.totalPages ?? json?.data?.totalPages ?? json?.meta?.totalPages,
  };

  return { products, meta };
}

function normalizeProduct(item: any): Product {
  const id = item?.id ?? item?._id ?? item?.productId ?? item?.sku ?? String(Math.random());
  const title = item?.title ?? item?.name ?? item?.productName ?? "Untitled";
  const slug = item?.slug ?? item?.handle ?? item?.productSlug ?? undefined;
  const price =
    item?.price ??
    item?.salePrice ??
    item?.regularPrice ??
    item?.minPrice ??
    0;
  const rawImageUrl =
    item?.image?.url ??
    item?.thumbnail ??
    item?.image ??
    item?.images?.[0]?.url ??
    item?.featuredImage ??
    undefined;
  const imageUrl = sanitizeImageUrl(rawImageUrl) ?? "/file.svg";

  return { id, title, price, imageUrl, slug, ...item };
}

export interface ProductDetail extends Product {
  slug?: string;
  description?: string;
  discount?: number | string;
  images?: Array<{ url: string } | string>;
  specifications?: Record<string, any> | Array<{ key: string; value: any }>;
}

export async function fetchProductDetails(slug: string): Promise<ProductDetail> {
  const url = `/api/v3/products/details?slug=${encodeURIComponent(slug)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch product details: ${res.status}`);
  }
  const json = await res.json();
  const raw = json?.data ?? json?.product ?? json ?? {};

  const base = normalizeProduct(raw);
  const description = raw?.description ?? raw?.shortDescription ?? raw?.details ?? "";
  const discount = raw?.discount ?? raw?.discountPercentage ?? raw?.offer ?? 0;
  const images: Array<{ url: string } | string> =
    raw?.images ??
    raw?.gallery ??
    (raw?.image ? [raw.image] : []);
  const imagesClean: Array<{ url: string } | string> = Array.isArray(images)
    ? images.map((img: any) =>
        typeof img === "string"
          ? (sanitizeImageUrl(img) ?? "/file.svg")
          : { url: sanitizeImageUrl(img?.url) ?? "/file.svg" }
      )
    : [];
  const specifications =
    raw?.specifications ?? raw?.specs ?? raw?.attributes ?? raw?.features ?? {};

  return { ...base, slug: raw?.slug ?? slug, description, discount, images: imagesClean, specifications };
}

function sanitizeImageUrl(url: any): string | undefined {
  if (typeof url !== "string") return undefined;
  let u = url.trim();
  // Remove a stray trailing parenthesis or quote if present
  if (u.endsWith(")")) u = u.slice(0, -1);
  u = u.replace(/^['"]+|['"]+$/g, "");
  // Normalize protocol-relative URLs
  if (u.startsWith("//")) u = "https:" + u;
  return u;
}