/**
 * @see https://github.com/remarkjs/remark-directive?tab=readme-ov-file#types
 */
// Register `hName`, `hProperties` types, used when turning markdown to HTML:
/// <reference types="mdast-util-to-hast" />
// Register directive nodes in mdast:
/// <reference types="mdast-util-directive" />

import { h } from 'hastscript'
import { visit } from 'unist-util-visit'

import { handleBadgeDirective } from './directives/badge.js'
import { handleLinkDirective } from './directives/link.js'
import { handleImageDirective } from './directives/image.js'
// import { handleVideoDirective } from './directives/video.js'
import { createDirectiveRegex } from './utils.js'

import type { Root } from 'mdast'
import type { Plugin } from 'unified'
import type { RemarkDirectiveSugarOptions, ConfigOptions } from './types.js'

/**
 * Constructs the configuration.
 */
export function getConfig(
  userOptions: RemarkDirectiveSugarOptions | undefined
): ConfigOptions {
  const defaultOptions: ConfigOptions = {
    image: {},
    video: {},
    link: {
      aProps: { className: ['rds-link'] },
      faviconSourceUrl:
        'https://www.google.com/s2/favicons?domain={domain}&sz=128',
    },
    badge: {
      spanProps: { className: ['rds-badge'] },
    },
  }

  if (userOptions)
    return {
      image: { ...defaultOptions.image, ...userOptions.image },
      video: { ...defaultOptions.video, ...userOptions.video },
      link: { ...defaultOptions.link, ...userOptions.link },
      badge: { ...defaultOptions.badge, ...userOptions.badge },
    }

  return defaultOptions
}

/**
 * A remark plugin based on {@link https://github.com/remarkjs/remark-directive remark-directive},
 * offering the following predefined directives:
 *
 *  - `:::image-figure`: creates a block with an image, figcaption, and optional styling, much like a figure in academic papers.
 *  - `:::image-a`: wraps an image inside a link, making it clickable.
 *  - `:::image-*`: wraps an image inside any {@link https://github.com/lin-stephanie/remark-directive-sugar/blob/main/src/directives/image.ts#L21 valid HTML tags}.
 *  - `::video`: allows for consistent video embedding across different platforms (youtobe, bilibili, vimeo).
 *  - `:link`: creates styled links to GitHub repositories, users/organizations, or any external URLs.
 *  - `:badge`/`:badge-*`: customizable badges to improve document visuals.
 *
 * Also supports {@link https://github.com/remarkjs/remark-directive?tab=readme-ov-file#use regular remark-directive usage}.
 *
 * @param options
 *   Optional options to configure the output.
 * @returns
 *   A unified transformer.
 */

const remarkDirectiveSugar: Plugin<[RemarkDirectiveSugarOptions?], Root> = (
  options
) => {
  const config = getConfig(options)
  const { image, link, video, badge } = config

  return (tree: Root) => {
    visit(tree, function (node) {
      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        const imageDirectiveRegex = createDirectiveRegex('image', image.alias)
        // const videoDirectiveRegex = createDirectiveRegex('video', video.alias)
        const linkDirectiveRegex = createDirectiveRegex('link', link.alias)
        const badgeDirectiveRegex = createDirectiveRegex('badge', badge.alias)

        if (imageDirectiveRegex.test(node.name)) {
          handleImageDirective(node, image, imageDirectiveRegex)
          /* } else if (videoDirectiveRegex.test(node.name)) {
          handleVideoDirective(node, video, videoDirectiveRegex) */
        } else if (linkDirectiveRegex.test(node.name)) {
          handleLinkDirective(node, link, linkDirectiveRegex)
        } else if (badgeDirectiveRegex.test(node.name)) {
          handleBadgeDirective(node, badge, badgeDirectiveRegex)
        } else {
          const data = (node.data ||= {})
          const attributes = node.attributes || {}

          const hast = h(node.name, attributes)
          data.hName = hast.tagName
          data.hProperties = hast.properties
        }
      }
    })
  }
}

export default remarkDirectiveSugar
export type { RemarkDirectiveSugarOptions } from './types.js'
