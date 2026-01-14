# Nuxt 101

> - Built on top of vue
> - Accuired by vercel
> - Universal Rendering (SSR + CSR)
>   - Server Side Rendering (SSR) + Client Side Rendering (CSR) + Static Site Generation (SSG )
>   - Better SEO Optimization
>   - Faster browser loading time
>   - Still gets all benifits of an SPA
> - Better Folder structure than Vue
> - Uses Vue 3 + Composition API + Nuxt Composables

## Installation

**Install**

```bash
npm create nuxt@latest <project-path>
```

**Run**

```bash
npm run dev -- -o
```

## Folder Structure

### Nuxt 3

```
.
├─ .nuxt/                  # Build output (auto‑generated)
├─ layouts/
│ └─ default.vue           # Default layout
│
├─ pages/                  # File‑based routing
│ ├─ index.vue             # Home page (/)
│ ├─ about.vue             # /about
│ ├─ error.vue             # Global error page
│ └─ products/
│ ├─ index.vue             # /products
│ └─ [id].vue              # /products/:id
│
├─ server/                 # Nitro backend
│ └─ api/
│ ├─ products.ts
│ └─ products/[id].ts
│
├─ components/             # Reusable Vue components
│ └─ ProductCard.vue
│
├─ composables/            # Custom composables
├─ middleware/             # Route middleware
├─ plugins/                # Nuxt plugins
├─ utils/                  # Utility functions
│
├─ app.vue                 # Root component (optional)
├─ nuxt.config.ts
├─ tsconfig.json
├─ package.json
├─ package-lock.json
├─ README.md
└─ .gitignore
```

> Note: app.vue is optional. If removed, pages/index.vue becomes the entry point.

## nuxt.config.ts

```js
export defailt defineNuxtConfig({
    modules: ['@nuxtjs/tailwindcss'],
    app: {
        head: {                                  // html head
            title: 'Nuxt Project',               // tab title
            meta: [                              // head meta
                {name: 'description', content: 'skgklsadjgl'}
            ],
            link: [                             // css stylesheets
                {rel: 'stylesheet', href: 'url to material icons'}
            ]
        }
    }
})
```

## Adding Pages

- All vue components in the pages will be considered as separate pages
- App.vue Default entry point, if you delete this create an index.vue in pages folder
- Routing is automatically handled in pages
- Every folder inside pages requires to have index.vue
-

```
.
|__ pages/
    |__ index.vue                              <base-url>  -- home page
    |__ about.vue                              /about
    |__ products /
        |__ index.vue                          /products
        |__ [id].vue                           /products/:id
```

### [id].vue

> Route: /products/:id

```vue
<!--pages/products/[id].vue-->
<template>Product Details for id: {{ id }}</template>

<script setup>
const { id } = useRoute().params;
</script>
```

### Error.vue

> error.vue page is the default page where nuxt redirects during error

> Programmaticaly we can redirect using createError() method

```vue
<template>
  <div>
    Status: {{ error.statusCode }} message: {{ error.message }}
    <button @click="handleClearError">Go Home</button>
  </div>
</template>
<script setup>
defineProps(["error"]); // this will automatically have error details

const handleClearError = () => clearError({ redirect: "/" });
</script>
```

## NuxtLink

> Used instead of regular anchor tag/ router-link

```vue
<NuxtLink to="/products">Products</NuxtLink>
<NuxtLink to="`/products/${product.id}`">Item</NuxtLink>
```

## Layouts

> Default.vue is the default page
> Custom layouts needs to be configured in the folder index.vue

```
.
|__ layouts/
|   |__ default.vue
|   |__ products.vue
```

```vue
<!-- /layouts/default.vue -->
<template>
  <div class="flex flex-wrap gap-4">
    <!-- Page is going to be rendered as slot, rest can be part of layout -->
    <slot />
  </div>
</template>
```

### custom layout for products

```vue
<!-- /pages/products/index.vue -->
<template></template>
<script setup>
definePageMeta({
  layout: "products",
});
</script>
```

## Nuxt Modules

For most packages nuxt provides modules that we can import into our project
for example in nuxt modules page we can get the tailswind and pinia.

[https://nuxt.com/modules](https://nuxt.com/modules)

```bash
npx nuxt@latest module add tailwindcss pinia
```

## Fetching Data

> useFetch()

```js
const { id } = useRoute().params;
const uri = "https://api.com/products";
// get list
const { data: products } = await useFetch(uri);

// get product by id
const { data: product } = await useFetch(uri, { key: id });
if (!product.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Product not found",
    fatal: true,
  });
}
```

> useFetch is a lazy loading function, if the parmeters don't change it will not activate again to save unwanted api calls.

## nuxt.config meta override

> In nuxt.config.ts we can define head and meta values for the project like external scripts or css.
> But for particular page we might need to have some custom values. for that we can use the following

#### Option 1: using built in methods

```js
useHead({
  title: "Product Page",
  meta: [{ name: "", content: "" }],
});
```

#### Option 2: Using Nuxt template

```vue
<template>
<div>
    <Head>
        <Title>Your title</Title>
        <Meta name="description" content="Your content"></Title>
    </Head>
</div>

</template>
```

## Server Routes

> Nuxt uses a backend server called Nitro.
> Create a folder called `server` and you declare server routes inside as folders

```
.
|__ server/
|   |__ api/
|       |__ products.js
|       |__ [id].js
|
```

### GET Request

##### `products.js`

```js
export default defineEventHanlder(e => {
    // destructure query params
    const { name } = useQuery(e);

    // data source
    const { data : products } =  await $fetch(`https://<data-source-path>/products?name=${name}`);

    return products
})
```

> **Note:** In server we dont use `useFetch` we use `$fetch`

##### `products.vue`

```vue
<script>
// get products
const { products } = await useFetch("/api/products?name=product");
</script>
```

### GET By ID Request / Dynamic request

##### `[id].js`

> Dynamic routes parameter is fetched as a event context in nitro

```js
export default defineEventHanlder(e => {
    // destructure route params
    const { id } = event.context.params;

    // data source
    const { data : product } =  await $fetch(`https://<data-source-path>/products/${id}`);

    return product;
})
```

##### `[id].vue`

> Dynamic routes parameter is fetched as a prop in vue

```vue
<script>
// dynamic id
defineProps({
  id: Number,
});

const { product } = await useFetch(`/api/products/${id}`);
</script>
```

### POST Request

##### `products.vue`

```vue
<script>
// create new product
const { product } = await useFetch("/api/products", {
  method: "post",
  body: {
    name: "Product 3",
    img: "",
  },
});
</script>
```

##### `products.js`

```js
export default defineEventHanlder((e) => {
  // destructure post params
  const { name, img } = useBody(e);

  const product = new Product({ name, img });
  products.push(product);

  return product;
});
```

## Environment Variables

We can define environment variables in the `.env` file, and then declare them as a runtimeConfig in `nuxt.config.ts`.

##### `.env`

```env
API_KEY=ek43pi53;lkdg0443po3i45kgdfslgj944040
```

##### `nuxt.config.ts`

```ts
{
    ...
    runtimeConfig: {
        apiKey: process.env.API_KEY
        public: {
            // exposes keys to frontend
        }
    }
    ...
}
```

##### `products.js`

```js
export default defineEventHandler(async (e) => {
  const { name } = useQuery(e);
  const { apiKey } = useRuntimeConfig();

  const uri = `https://<base-api-url>?apiKey=${product}&name=${name}`;
  //...
});
```

## useAsyncData / useAsyncFetch

#### What is useAsyncData?

- useAsyncData() is a core Nuxt composable for fetching async data
- Designed specifically for SSR + CSR scenarios
- Runs on:
  - Server during SSR
  - Client during navigation (if needed)
- Supports caching, revalidation, and lazy loading

> In practice, useFetch() is a thin wrapper around useAsyncData() that uses $fetch internally.

#### Basic Syntax

```js
const { data, pending, error, refresh } = await useAsyncData("products", () => {
  return $fetch("https://api.com/products");
});
```

- `data` → resolved response (ref)
- `pending` → loading state (boolean)
- `error` → error state
- `refresh()` → manually refetch

#### Server-Side Rendering Behavior

- On first page load:

  - Data is fetched on the server
  - Result is serialized and sent to the client
  - No duplicate request on hydration

- On client navigation:
  - Data is fetched only if cache key changes
  -

#### Dynamic Params Example

```js
const route = useRoute();

const { data: product } = await useAsyncData(`product-${route.params.id}`, () =>
  $fetch(`/api/products/${route.params.id}`)
);
```

> The key is critical for caching and avoiding stale data.

#### Lazy Loading

```js
const { data, pending } = useAsyncData(
  "products",
  () => $fetch("/api/products"),
  { lazy: true }
);
```

> Data fetch happens after component is mounted

> Useful for non-critical data

#### Watching Reactive Dependencies

```js
const search = ref("");

const { data } = useAsyncData(
  "products",
  () => $fetch(`/api/products?search=${search.value}`),
  { watch: [search] }
);
```

#### Error Handling

```js
const { data, error } = await useAsyncData("product", async () => {
  const product = await $fetch("/api/products/1");

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }

  return product;
});
```

#### Rule of Thumb:

- Use useFetch() for simple API calls
- Use useAsyncData() when:
  - You need custom logic
  - Multiple async calls
  - Conditional fetching

## TODO

- Nuxt LifeCycle
- useAsyncFetch
- ORM and Connect to database
- middlewares
- plugins
- utils
