
# remark-directive-sugar

[![version][version-badge]][version-link]
[![codecov][coverage-badge]][coverage]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![jsDocs.io][jsdocs-src]][jsdocs-href]

A [remark](https://github.com/remarkjs/remark) plugin provides predefined directives for customizable badges, links, video embeds, enhanced image formatting, and more.

## What is this?

This plugin is built on top of [remark-directive](https://github.com/remarkjs/remark-directive), supporting [regular usage](https://github.com/remarkjs/remark-directive?tab=readme-ov-file#use) and providing the following predefined directives:

- [`:badge[-*]`](#badge-): Generates customizable badges.  
- [`:link`](#link): Creates links to GitHub, npm, or custom URLs.  
- [`::video[-*]`](#video-): Embeds videos from platforms like YouTube, Bilibili, Vimeo, or custom sources.  
- [`:::image-*`](#image-): Wraps an image inside valid HTML tags, such as a `<figure>` element to allow adding a descriptive `<figcaption>`, or a hyperlink to make it clickable, and more.

## When should I use this?

If you're using `remark-directive`, this plugin provides ready-to-use directives, saving you from writing custom code. If you're building a blog with frameworks like Astro or Next.js, it helps enhance your Markdown / MDX content without repetitive HTML.

> [!NOTE]  
> This plugin requires `remark-directive`, so make sure to install it as well. Check out the [Remark Directive Syntax](https://github.com/micromark/micromark-extension-directive?tab=readme-ov-file#syntax) for a quick and easy overview!

## Installation

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c). In Node.js (version 16+), install with your package manager:

```sh
npm install remark-directive-sugar
yarn add remark-directive-sugar
pnpm add remark-directive-sugar
```

In Deno with [`esm.sh`](https://esm.sh/):

```js
import remarkDirectiveSugar from 'https://esm.sh/remark-directive-sugar'
```

In browsers with [`esm.sh`](https://esm.sh/):

```html
<script type="module">
  import remarkDirectiveSugar from 'https://esm.sh/remark-directive-sugar?bundle'
</script>
```

## Usage

Import and configure the plugin based on your target environment.

For vanilla JS：

```js
// example.js
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkDirective from 'remark-directive'
import remarkDirectiveSugar from 'remark-directive-sugar'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { readSync } from 'to-vfile'

const file = unified()
  .use(remarkParse)
  .use(remarkDirective)
  .use(remarkDirectiveSugar)
  .use(remarkRehype)
  .use(rehypeStringify)
  .processSync(readSync('example.md'))

console.log(String(file))
```

For Astro projects:

```ts
// astro.config.ts
import { defineConfig } from 'astro/config'
import remarkDirective from 'remark-directive'
import remarkDirectiveSugar from 'remark-directive-sugar'

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  markdown: {
    remarkPlugins: [remarkDirective, remarkDirectiveSugar],
  },
})
```

For Next.js projects:

```ts
// next.config.ts
import createMDX from '@next/mdx'
import remarkDirective from 'remark-directive'
import remarkDirectiveSugar from 'remark-directive-sugar'
import type { NextConfig } from 'next'

// https://nextjs.org/docs/app/api-reference/config/next-config-js
const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkDirective, remarkDirectiveSugar],
    // With Turbopack, specify plugin names as strings
    // remarkPlugins: [['remark-directive'],['remark-directive-sugar']],
  },
})

export default withMDX(nextConfig)
```

All predefined directives generate only the HTML structure, allowing you to style them with class names or attributes.

### `:badge[-*]`

Use `:badge[-*]` directive to display small pieces of information, such as status or category. Say `example.md` contains: 

```md
<!-- Direct usage with text in `[]` -->

Example 1: :badge[New]
Example 2: :badge[Success]{style="color: black; background-color: #aaf233"}

<!-- Using presets: `presets: {a: { text: 'ARTICLE' }, v: { text: 'VIDEO', props: { className: ['custom'] } }}` -->

Example 3: :badge-a
Example 4: :badge-v
```

Run `node example.js` (`pnpm dev`) to get:

```html
<p>
  Example 1: <span class="rds-badge">New</span>
  Example 2: <span style="color: black; background-color: #aaf233" class="rds-badge">Success</span>
</p>
<p>
  Example 3: <span data-badge="a" class="rds-badge">ARTICLE</span>
  Example 4: <span data-badge="v" class="rds-badge custom">VIDEO</span>
</p>
```

### `:link`

Use `:link` directive to create links with avatars or favicons for GitHub, npm, or custom URLs. Say `example.md` contains: 

```md
<!-- Link to a GitHub user or organization (prepend `id` or `#` with `@`) -->
<!-- Use `tab` to navigate sections: -->
<!-- for users: 'repositories', 'projects', 'packages', 'stars', 'sponsoring', 'sponsors' -->
<!-- for orgs: 'org-repositories', 'org-projects', 'org-packages', 'org-sponsoring', 'org-people' -->

Example 1: :link{#@lin-stephanie}
Example 2: :link{#@lin-stephanie tab=repositories}
Example 3: :link[Vite]{id=@vitejs}
Example 4: :link[Vite]{id=@vitejs tab=org-people}

<!-- Link to a GitHub repository -->

Example 5: :link{#lin-stephanie/remark-directive-sugar}
Example 6: :link[Astro]{id=withastro/astro}

<!-- Link to an npm package -->
<!-- Use `tab` to navigate sections: 'readme', 'code', 'dependencies', 'dependents', 'versions' -->

Example 7: :link{#remark-directive-sugar}
Example 8: :link{id=remark-directive-sugar tab=dependencies}

<!-- Link to a custom URL (must use `id`, not `#`) -->

Example 9: :link{id=https://developer.mozilla.org/en-US/docs/Web/JavaScript}
Example 10: :link[Google]{id=https://www.google.com/}

<!-- Use `url` to override the default link -->
<!-- Use `img` to set a custom display image -->

Example 11: :link[Vite]{id=@vitejs url=https://vite.dev/}
Example 12: :link[Vite]{id=@vitejs img=https://vitejs.dev/logo.svg}
```

Run `node example.js` (`pnpm dev`) to get:

```html
<p>
  Example 1:
  <a href="https://github.com/lin-stephanie" data-link="github-acct" class="rds-link">
    <img src="https://github.com/lin-stephanie.png" alt="" />
    lin-stephanie
  </a>
  Example 2:
  <a href="https://github.com/lin-stephanie?tab=repositories" data-link="github-acct" class="rds-link">
    <img src="https://github.com/lin-stephanie.png" alt="" />
    lin-stephanie
  </a>
  Example 3:
  <a href="https://github.com/vitejs" data-link="github-acct" class="rds-link">
    <img src="https://github.com/vitejs.png" alt="" />
    Vite
  </a>
  Example 4:
  <a href="https://github.com/orgs/vitejs/people" data-link="github-acct" class="rds-link">
    <img src="https://github.com/vitejs.png" alt="" />
    Vite
  </a>
</p>

<p>
  Example 5:
  <a href="https://github.com/lin-stephanie/remark-directive-sugar" data-link="github-repo" class="rds-link">
    <img src="https://github.com/lin-stephanie.png" alt=""/>
    lin-stephanie/remark-directive-sugar
  </a>
  Example 6:
  <a href="https://github.com/withastro/astro" data-link="github-repo" class="rds-link">
    <img src="https://github.com/withastro.png" alt="" />
    Astro
  </a>
</p>

<p>
  Example 7:
  <a href="https://www.npmjs.com/package/remark-directive-sugar" data-link="npm-pkg" class="rds-link">
    <img src="https://api.faviconkit.com/www.npmjs.com" alt="">
    remark-directive-sugar
  </a>
  Example 8:
  <a href="https://www.npmjs.com/package/remark-directive-sugar?activeTab=dependencies" data-link="npm-pkg" class="rds-link">
    <img src="https://api.faviconkit.com/www.npmjs.com" alt="">
    remark-directive-sugar
  </a>
</p>

<p>
  Example 9:
  <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" data-link="custom-url" class="rds-link">
    <img src="https://api.faviconkit.com/developer.mozilla.org" alt="">
    developer.mozilla.org/en-US/docs/Web...
  </a>
  Example 10:
  <a href="https://www.google.com/" data-link="custom-url" class="rds-link">
    <img src="https://api.faviconkit.com/www.google.com" alt="">
    Google
  </a>
</p>

<p>
  Example 11:
  <a href="https://vite.dev/" data-link="github-acct" class="rds-link">
    <img src="https://github.com/vitejs.png" alt="">
    Vite
  </a>
  Example 12:
  <a href="https://github.com/vitejs" data-link="github-acct" class="rds-link">
    <img src="https://vitejs.dev/logo.svg" alt="">
    Vite
  </a>
</p>
```

### `::video[-*]`

Use `::video[-*]` for consistent video embedding across different platforms. Say `example.md` contains: 

```md
<!-- Embed a YouTube video -->

::video-youtube{#gxBkghlglTg}

<!-- Embed a Bilibili video -->

::video-bilibili{id=BV1MC4y1c7Kv}

<!-- Embed a Vimeo video with a custom `title` attr -->

::video-vimeo[custom title]{id=912831806}

<!-- Embed a custom video URL (must use `id`, not `#`) -->

::video{id=https://www.youtube-nocookie.com/embed/gxBkghlglTg}
```

Run `node example.js` (`pnpm dev`) to get:

```html
<iframe
  src="https://www.youtube-nocookie.com/embed/gxBkghlglTg"
  title="Video Player"
  data-video="youtube"
  class="rds-video"
></iframe>

<iframe
  src="https://player.bilibili.com/player.html?bvid=BV1MC4y1c7Kv"
  title="Video Player"
  data-video="bilibili"
  class="rds-video"
></iframe>

<iframe
  src="https://player.vimeo.com/video/912831806"
  title="custom title"
  data-video="vimeo"
  class="rds-video"
></iframe>

<iframe
  src="https://www.youtube-nocookie.com/embed/gxBkghlglTg"
  title="Video Player"
  data-video="url"
  class="rds-video"
></iframe>
```

### `:::image-*`

Use `:::image-*` to wrap images in a container for captions, clickable links, and more (`*` must be a [valid HTML tag](https://github.com/lin-stephanie/remark-directive-sugar/blob/main/src/directives/image.ts#L14)). Say `example.md` contains: 

```md
<!-- `:::image-figure[caption]{<figcaption> attrs}` -->
<!-- `[]` hold the figcaption，if not set, the alt text from `![]()` will be used as the default -->

:::image-figure[Figcaption text]
![Alt text](https://images.pexels.com/photos/237273/pexels-photo-237273.jpeg)
:::

:::image-figure{style="text-align:center; color:orange"}
![Text for both alt and figcaption](https://images.pexels.com/photos/237273/pexels-photo-237273.jpeg)
:::

<!-- `:::image-a{<a> attrs}` -->

:::image-a{href="https://github.com/lin-stephanie/remark-directive-sugar"}
![](https://images.pexels.com/photos/237273/pexels-photo-237273.jpeg)
:::

<!-- `:::image-*{<*> attrs}` -->

:::image-div
![](https://images.pexels.com/photos/237273/pexels-photo-237273.jpeg)
:::

<!-- Setting `stripParagraph: false` keeps `<p>` to prevent parsing issues with other remark plugins like `remark-imgattr` -->

:::image-figure[Figcaption text]
![Alt text](https://images.pexels.com/photos/237273/pexels-photo-237273.jpeg)
:::

:::image-a{href="https://github.com/lin-stephanie/remark-directive-sugar"}
![](https://images.pexels.com/photos/237273/pexels-photo-237273.jpeg)
:::
```

Run `node example.js` (`pnpm dev`) to get:

```html
<figure>
  <img src="https://images.pexels.com/photos/237273/pexels-photo-237273.jpeg" alt="Alt text">
  <figcaption>Figcaption text</figcaption>
</figure>

<figure>
  <img src="https://images.pexels.com/photos/237273/pexels-photo-237273.jpeg" alt="Text for both alt and figcaption">
  <figcaption style="text-align:center; color:orange">Text for both alt and figcaption</figcaption>
</figure>

<a href="https://github.com/lin-stephanie/remark-directive-sugar">
  <img src="https://images.pexels.com/photos/237272/pexels-photo-237273.jpeg" alt="">
</a>

<div>
  <img src="https://images.pexels.com/photos/237272/pexels-photo-237273.jpeg" alt="">
</div>

<figure>
  <p>
    <img src="https://images.pexels.com/photos/237273/pexels-photo-237273.jpeg" alt="Alt text">
  </p>
  <figcaption>Figcaption text</figcaption>
</figure>

<a href="https://github.com/lin-stephanie/remark-directive-sugar">
  <p>
    <img src="https://images.pexels.com/photos/237273/pexels-photo-237273.jpeg" alt="">
  </p>
</a>
```

## API

This package exports no identifiers. The default export is [`remarkDirectiveSugar`](#unifieduseremarkdirectivesugar-options).

### `unified().use(remarkDirectiveSugar[, options])`

Used to provid predefined directives.

###### Parameters

* `options` ([`Options`](#options), optional) — configuration

###### Returns

Transform ([`Transformer`](https://github.com/unifiedjs/unified#transformer)).

### `Options`

Configuration (TypeScript type). All options are optional.

###### Fields

- `badge` ([`BadgeDirectiveConfig`](https://github.com/lin-stephanie/remark-directive-sugar/blob/main/src/types.ts#L29)) — `:badge[-*]` configuration options.
- `link` ([`LinkDirectiveConfig`](https://github.com/lin-stephanie/remark-directive-sugar/blob/main/src/types.ts#L78)) — `:link` configuration options.
- `video` ([`VideoDirectiveConfig`](https://github.com/lin-stephanie/remark-directive-sugar/blob/main/src/types.ts#L117)) — `::video[-*]` configuration options.
- `image` ([`ImageDirectiveConfig`](https://github.com/lin-stephanie/remark-directive-sugar/blob/main/src/types.ts#L152)) — `:::image-*` configuration options.

## Types

This package is fully typed with [TypeScript](https://www.typescriptlang.org/). It exports the additional types `Options`, `BadgeDirectiveConfig`, `LinkDirectiveConfig`, `VideoDirectiveConfig`, `ImageDirectiveConfig`, `PropertiesFromContainerDirective`, `PropertiesFromLeafDirective` and `PropertiesFromTextDirective`. See [jsDocs.io](https://www.jsdocs.io/package/remark-directive-sugar) for type details.

## Contribution

If you see any errors or room for improvement on this plugin, feel free to open an [issues](https://github.com/lin-stephanie/remark-directive-sugar/issues) or [pull request](https://github.com/lin-stephanie/remark-directive-sugar/pulls) . Thank you in advance for contributing!

## License

[MIT](https://github.com/lin-stephanie/remark-directive-sugar/blob/main/LICENSE) © 2024-PRESENT [Stephanie Lin](https://github.com/lin-stephanie)

<!-- Badges -->

[version-badge]: https://img.shields.io/github/v/release/lin-stephanie/remark-directive-sugar?label=release&style=flat&colorA=080f12&colorB=f87171
[version-link]: https://github.com/lin-stephanie/remark-directive-sugar/releases
[coverage-badge]: https://img.shields.io/codecov/c/github/lin-stephanie/remark-directive-sugar?style=flat&colorA=080f12&colorB=ef7575
[coverage]: https://codecov.io/github/lin-stephanie/remark-directive-sugar
[npm-downloads-src]: https://img.shields.io/npm/dm/remark-directive-sugar?style=flat&colorA=080f12&colorB=ef7575
[npm-downloads-href]: https://npmjs.com/package/remark-directive-sugar
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=ef7575
[jsdocs-href]: https://www.jsdocs.io/package/remark-directive-sugar
