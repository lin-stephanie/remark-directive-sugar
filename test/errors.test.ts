import { describe, test, expect } from 'vitest'
import { unified } from 'unified'

import remarkParse from 'remark-parse'
import remarkDirective from 'remark-directive'
import remarkRehype from 'remark-rehype'
import rehypeMinifyWhitespace from 'rehype-minify-whitespace'
import rehypeStringify from 'rehype-stringify'

import remarkDirectiveSugar from '../src/index'

function createProcessor() {
  return unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkDirectiveSugar)
    .use(remarkRehype)
    .use(rehypeMinifyWhitespace)
    .use(rehypeStringify)
}

function expectToThrow(md: string, errorMessage: string) {
  expect(() => createProcessor().processSync(md)).toThrowError(errorMessage)
}

describe('Error Cases', () => {
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
      'Invalid `image` directive. The directive failed to match a valid tag. See https://github.com/lin-stephanie/remark-directive-sugar/blob/main/src/directives/image.rs#L9 for details.'
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
                :::
                `
    expectToThrow(
      md,
      'Invalid `image` directive. The figcaption text is missing. Specify it in the `[]` of `:::image-figure[]{}` or `![]()`.'
    )
  }) */
})
