# Nuxt 101 
> - Built on top of vue
> - Accuired by vercel
> - Universal Rendering (SSR + CSR)
>   - Server Side Rendering (SSR) + Client Side Rendering (CSR)
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
|__ .nuxt/
|__ layouts/
|   |__ default.vue
|
|__ pages/
    |__ index.vue         // Secondary Entry point, recommended as primary
    |__ about.vue
    |__ error.vue         // default error page
    |__ Products /
        |__ index.vue
        |__ product.vue
|__ components/
|   |__ ProductCard.vue
|
|__ app.vue               // Default Entry point, can be deleted
|__ nuxt.config.ts
|__ tsconfig.json
|
|__ node_modules/
|__ package.json
|__ package-lock.json
|__ package.json
|__ README.md
|__ .gitinore
```

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
<template>
    Product Details for id:  {{ id }}
</template>

<script setup>
const {id} = useRoute().params;
</script>
```

### Error.vue
> error.vue page is the default page where nuxt redirects during error

> Programmaticaly we can redirect using createError() method

```vue
<template>
    <div>
        Status: {{error.statusCode}}
        message: {{error.message}}
        <button
            @click="handleClearError"
        >
            Go Home
        </button>
    </div>

</template>
<script setup>
defineProps(['error']) // this will automatically have error details

const handleClearError = () => clearError({redirect: '/'})
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
        <slot/> 
    </div>
</template>
```

### custom layout for products
```vue
<!-- /pages/products/index.vue -->
<template></template>
<script setup>
definePageMeta({
    layout: 'products'
})
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
const {id} = useRoute().params;
const uri = 'https://api.com/products';
// get list
const {data: products} =  await useFetch(uri);

// get product
const {data: product} = await useFetch(uri, {key: id}); 
if(!product.value) {
    throw createError({
        statusCode: 404, 
        statusMessage: 'Product not found',
        fatal: true    
    })
}
```

## nuxt.config meta ovveride
> in nuxt.config.ts we can define head and meta values for the project. But for particular page we might need to have some custom values. for that we can use the following

### Option 1: using built in methods
```js
useHead({
    title: 'Product Page',
    meta: [
        {name:'', content: ''}
    ]
})
```

### Option 2: Using Nuxt template
```vue
<template>
<div>
    <Head>
        <Title>Your title</Title>
        <Meta name="description" content="Your content"></Title>
    </Head>
</div>

</template>
