import { test, expect } from 'vitest'
import { unified } from 'unified'
import { readSync } from 'to-vfile'
import { visit } from 'unist-util-visit'

import remarkParse from 'remark-parse'
import remarkDirective from 'remark-directive'
import remarkRehype from 'remark-rehype'
import rehypeParse from 'rehype-parse'
import rehypeMinifyWhitespace from 'rehype-minify-whitespace'
import rehypeStringify from 'rehype-stringify'

import remarkDirectiveSugar from '../src/index.js'

import type { RemarkDirectiveSugarOptions } from '../src/types.js'

function run(name: string, options?: RemarkDirectiveSugarOptions) {
  // handle input
  const markdownProcessor = unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkDirectiveSugar, options)
    .use(remarkRehype)
    .use(rehypeMinifyWhitespace)
    .use(rehypeStringify)

  const input = String(
    markdownProcessor.processSync(readSync(`./test/fixtures/${name}/input.md`))
  )

  // handle output
  const output = String(
    unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeMinifyWhitespace)
      .use(rehypeStringify)
      .processSync(readSync(`./test/fixtures/${name}/output.html`))
  )

  // test
  test(name, () => {
    expect(input).toBe(output)
  })
}

run('image', { image: { alias: ['i', 'img'] } })
run('image-option', {
  image: {
    imgProps(node) {
      let special = false
      visit(node, 'image', (image) => {
        if (
          image.url ===
          'https://images.pexels.com/photos/237271/pexels-photo-237271.jpeg'
        )
          special = true
        return false
      })
      return special ? { class: 'img-special-class' } : { class: 'img-class' }
    },
    figureProps: { class: 'figure-class' },
    figcaptionProps: { class: 'figcaption-class', style: 'color:red' },
    elementProps(node) {
      let isA = false
      if (node.name === 'image-a') isA = true
      return isA ? { class: 'a-class' } : { class: 'element-class' }
    },
  },
})

// run('video', { classPrefix: 'sugar' })
// run('link', { classPrefix: 'sugar' })
// run('badge', { classPrefix: 'sugar' })
// run('common', { classPrefix: 'sugar' })
