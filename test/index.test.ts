import rehypeMinifyWhitespace from 'rehype-minify-whitespace'
import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'
import remarkDirective from 'remark-directive'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { readSync } from 'to-vfile'
import { unified } from 'unified'
import { test, expect } from 'vitest'

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

  // console.log('input', input)
  // console.log('output', output)

  // test
  test(name, () => {
    expect(input).toBe(output)
  })
}

run('image-figure', { classPrefix: 'sugar' })
run('image-a', { classPrefix: 'sugar' })
run('video', { classPrefix: 'sugar' })
run('link', { classPrefix: 'sugar' })
run('badge', { classPrefix: 'sugar' })
run('common', { classPrefix: 'sugar' })
