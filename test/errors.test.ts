import rehypeMinifyWhitespace from 'rehype-minify-whitespace'
import rehypeStringify from 'rehype-stringify'
import remarkDirective from 'remark-directive'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { describe, test, expect } from 'vitest'

import remarkDirectiveSugar from '../src/index.js'

import type { Options } from '../src/types.js'

function createProcessor(options?: Options) {
  return unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkDirectiveSugar, options)
    .use(remarkRehype)
    .use(rehypeMinifyWhitespace)
    .use(rehypeStringify)
}

function expectToThrow(md: string, errorMessage: string, options?: Options) {
  expect(() => createProcessor(options).processSync(md)).toThrowError(
    errorMessage
  )
}

describe('Error Cases', () => {
  /* image */
  test('should throw if alias is invalid', () => {
    const md = `:::image-a
                ![](https://images.pexels.com/photos/237272/pexels-photo-237272.jpeg)
                :::
                `
    expectToThrow(
      md,
      "The alias 'video' is reserved and cannot be used for the 'image' directive.",
      { image: { alias: 'video' } }
    )
  })

  test('should throw on text directive', () => {
    const md = ':image-a[]'
    expectToThrow(
      md,
      'Unexpected text directive. Use three colons (`:::`) for an `image` container directive.'
    )
  })

  test('should throw on leaf directive', () => {
    const md = '::image-a[]'
    expectToThrow(
      md,
      'Unexpected leaf directive. Use three colons (`:::`) for an `image` container directive.'
    )
  })

  test('should throw if directive fails to match valid tag', () => {
    const md = `:::image-xxx
                :::
                `
    expectToThrow(
      md,
      'Invalid `image` directive. The directive failed to match a valid HTML tag. See https://github.com/lin-stephanie/remark-directive-sugar/blob/main/src/directives/image.ts#L14 for details.'
    )
  })

  test('should throw if directive is missing image', () => {
    const md = `:::image-figure
                :::
                `
    expectToThrow(md, 'Invalid `image` directive. The image is missing.')
  })

  /* test('should throw if directive is missing figcaption text', () => {
    const md = `:::image-figure
                ![]()
                :::`
    expectToThrow(
      md,
      'Invalid `image` directive. The figcaption text is missing. Specify it in the `[]` of `:::image-figure[]{}` or `![]()`.'
    )
  }) */

  /* video */
  test('should throw if alias is invalid', () => {
    const md = `::video-vimeo{#912831806}`
    expectToThrow(
      md,
      "The alias 'image' is reserved and cannot be used for the 'video' directive.",
      { video: { alias: 'image' } }
    )
  })

  test('should throw on text directive', () => {
    const md = ':video-vimeo{id=912831806}'
    expectToThrow(
      md,
      'Unexpected text directive. Use double colons (`::`) for a `video` leaf directive.'
    )
  })

  test('should throw on container directive', () => {
    const md = ':::video-vimeo{id=912831806}'
    expectToThrow(
      md,
      'Unexpected container directive. Use double colons (`::`) for a `video` leaf directive.'
    )
  })

  test('should throw if `id` attribute is missing', () => {
    const md = '::video-youtube{}'
    expectToThrow(md, 'Invalid `video` directive. The `id` is missing.')
  })

  test('should throw if directive does not match a valid video platform', () => {
    const md = '::video-custom[]{id=912831806}'
    expectToThrow(
      md,
      'Invalid `video` directive. The directive failed to match a valid video platform.'
    )
  })

  test('should throw if invalid URL is passed via `id`', () => {
    const md = '::video{#https://www.youtube-nocookie.com/embed/gxBkghlglTg}'
    expectToThrow(
      md,
      'Invalid `video` directive. Ensure a valid URL is passed via `id` instead of `#`.'
    )
  })

  /* link */
  test('should throw on leaf directive', () => {
    const md = '::link[]{#withastro/astro}'
    expectToThrow(
      md,
      'Unexpected leaf directive. Use single colon (`:`) for a `link` text directive.'
    )
  })

  test('should throw on container directive', () => {
    const md = `:::link[]{#withastro/astro}
                :::`
    expectToThrow(
      md,
      'Unexpected container directive. Use single colon (`:`) for a `link` text directive.'
    )
  })

  test('should throw if id is missing', () => {
    const md = ':link[]{}'
    expectToThrow(md, 'Invalid `link` directive. The `id` is missing.')
  })

  test('should throw if id is invalid', () => {
    const md = ':link[]{id=http://exa*mple.com}'
    expectToThrow(md, 'Invalid `link` directive. The `id` is invalid.')
  })

  test('should throw if tab is invalid', () => {
    const md = ':link[]{#withastro/astro tab=invalid}'
    expectToThrow(md, 'Invalid `link` directive. The `tab` is invalid.')
  })

  /* badge */
  test('should throw on leaf directive', () => {
    const md = '::badge[ISSUE]'
    expectToThrow(
      md,
      'Unexpected leaf directive. Use single colon (`:`) for a `badge` text directive.'
    )
  })

  test('should throw on container directive', () => {
    const md = `:::badge[ISSUE]
                :::`
    expectToThrow(
      md,
      'Unexpected container directive. Use single colon (`:`) for a `badge` text directive.'
    )
  })

  test('should throw if badge type is invalid', () => {
    const md = ':badge-invalid[]'
    expectToThrow(
      md,
      'Invalid `badge` directive. The directive failed to match a valid badge type. Please check the `presets` option in the `badge` config.'
    )
  })

  test('should throw if text is missing', () => {
    const md = ':badge[]'
    expectToThrow(
      md,
      'Invalid `badge` directive. The text is missing. Specify it in the `[]` of `:badge[]{}` or in the `text` field of the `presets` option in the `badge` config.'
    )
  })
})
