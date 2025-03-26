import rehypeMinifyWhitespace from 'rehype-minify-whitespace'
import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'
import remarkDirective from 'remark-directive'
import remarkImgattr from 'remark-imgattr'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { readSync } from 'to-vfile'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'
import { test, expect } from 'vitest'

import remarkDirectiveSugar from '../src/index.js'

import type { Options } from '../src/types.js'

function run(name: string, options?: Options) {
  // handle input
  const markdownProcessor = unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkDirectiveSugar, options)
    .use(remarkImgattr)
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

/* badge */
run('badge', { badge: { alias: 'b' } })
run('badgeOptions', {
  badge: {
    spanProps(node) {
      let noPreset = false
      const match = /^(?:b|badge)(?:-(\w+))?$/.exec(node.name)
      if (match && !match[1]) noPreset = true

      return noPreset
        ? { 'data-badge': 'default' }
        : { className: 'custom-class' }
    },
    presets: {
      a: { text: 'ARTICLE' },
      v: { text: 'VIDEO' },
      o: { text: 'OFFICIAL' },
      f: { text: 'FEED' },
      t: { text: 'TOOL' },
      w: { text: 'WEBSITE' },
      g: { text: 'GITHUB' },
    },
  },
})

/* link */
run('link', { link: { alias: 'l' } })
run('linkOptions', {
  link: {
    aProps: { className: ['custom-class1', 'custom-class2'] },
    imgProps: { style: 'width:1em; height:1em' },
    faviconSourceUrl: 'https://favicon.yandex.net/favicon/{domain}',
  },
})

/* video */
run('video', { video: { alias: 'v' } })
run('videoOptions', {
  video: {
    iframeProps: {
      className: 'custom-class',
      loading: 'lazy',
      allow:
        'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    },
    platforms: { my: 'https://custom.com/{id}' },
  },
})

/* image */
run('image', { image: { alias: ['i', 'img'] } })
run('imageOptions', {
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
    stripParagraph: false,
  },
})
run('imageWithAttr', {
  image: {
    stripParagraph: false,
  },
})

/* common */
run('common')
