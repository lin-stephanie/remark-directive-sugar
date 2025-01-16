import { test, expect } from 'vitest'
import { unified } from 'unified'
import { readSync } from 'to-vfile'

import remarkParse from 'remark-parse'
import remarkDirective from 'remark-directive'
import remarkRehype from 'remark-rehype'
import rehypeParse from 'rehype-parse'
import rehypeMinifyWhitespace from 'rehype-minify-whitespace'
import rehypeStringify from 'rehype-stringify'

import remarkDirectiveSugar from '../src/index.js'

import type { UserOptions } from '../src/types.js'

function run(name: string, options?: UserOptions) {
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
run('video', { classPrefix: 'sugar' })
run('link', { classPrefix: 'sugar' })
run('badge', { classPrefix: 'sugar' })
run('common', { classPrefix: 'sugar' })
