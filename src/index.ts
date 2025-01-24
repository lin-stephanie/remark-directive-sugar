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
import { handleImageDirective } from './directives/image.js'
import { handleLinkDirective } from './directives/link.js'
import { handleVideoDirective } from './directives/video.js'
import { createDirectiveRegex } from './utils.js'

import type { Root } from 'mdast'
import type { Plugin } from 'unified'
import type { RemarkDirectiveSugarOptions } from './types.js'

/**
 * A remark plugin built on top of {@link https://github.com/remarkjs/remark-directive remark-directive},
 * supporting {@link https://github.com/remarkjs/remark-directive?tab=readme-ov-file#use regular usage}
 * and providing the following predefined directives:
 *
 *  - `:::image-figure`:  Wraps an image in a `<figure>` element, allowing
 *     you to add a descriptive  `<figcaption>`.
 *  - `:::image-a`: Wraps an image inside a hyperlink, making it clickable.
 *  - `:::image-*`: wraps an image inside any
 *     {@link https://github.com/lin-stephanie/remark-directive-sugar/blob/main/src/directives/image.ts#L13 valid HTML tags}，
 *     allowing for flexible customization.
 *
 *  - `::video`: Embeds videos from platforms like YouTube, Bilibili, Vimeo, or custom sources.
 *
 *  - `:link`: Creates links to GitHub, npm, or external URLs.
 *
 *  - `:badge`/`:badge-*`: Generates customizable badges for better visuals.
 *
 * @param options
 *   Optional options to configure the output.
 * @returns
 *   A unified transformer.
 */
const remarkDirectiveSugar: Plugin<[RemarkDirectiveSugarOptions?], Root> = (
  options
) => {
  const { image = {}, video = {}, link = {}, badge = {} } = options || {}

  return (tree: Root) => {
    visit(tree, function (node) {
      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        const imageDirectiveRegex = createDirectiveRegex('image', image.alias)
        const videoDirectiveRegex = createDirectiveRegex('video', video.alias)
        const linkDirectiveRegex = createDirectiveRegex('link', link.alias)
        const badgeDirectiveRegex = createDirectiveRegex('badge', badge.alias)

        if (imageDirectiveRegex.test(node.name)) {
          handleImageDirective(node, image, imageDirectiveRegex)
        } else if (videoDirectiveRegex.test(node.name)) {
          handleVideoDirective(node, video, videoDirectiveRegex)
        } else if (linkDirectiveRegex.test(node.name)) {
          handleLinkDirective(node, link)
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
