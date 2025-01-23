import { unified } from 'unified'
import { describe, test, expect } from 'vitest'

import remarkParse from 'remark-parse'
import remarkDirective from 'remark-directive'
import remarkRehype from 'remark-rehype'
import rehypeMinifyWhitespace from 'rehype-minify-whitespace'
import rehypeStringify from 'rehype-stringify'

import remarkDirectiveSugar from '../src/index.js'

import type { RemarkDirectiveSugarOptions } from '../src/types.js'

function createProcessor(options?: RemarkDirectiveSugarOptions) {
  return unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkDirectiveSugar, options)
    .use(remarkRehype)
    .use(rehypeMinifyWhitespace)
    .use(rehypeStringify)
}

function expectToThrow(
  md: string,
  errorMessage: string,
  options?: RemarkDirectiveSugarOptions
) {
  expect(() => createProcessor(options).processSync(md)).toThrowError(
    errorMessage
  )
}

describe('Error Cases', () => {
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
      'Invalid `image` directive. The directive failed to match a valid HTML tag. See https://github.com/lin-stephanie/remark-directive-sugar/blob/main/src/directives/image.ts#L22 for details.'
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
})
