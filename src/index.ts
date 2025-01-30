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
import type { Options } from './types.js'

/**
 * A remark plugin built on top of {@link https://github.com/remarkjs/remark-directive remark-directive},
 * supporting {@link https://github.com/remarkjs/remark-directive?tab=readme-ov-file#use regular usage}
 * and providing the following predefined directives:
 *
 *  - `:badge[-*]`: Generates customizable badges.
 *  - `:link`: Creates links to GitHub, npm, or custom URLs.
 *  - `::video[-*]`: Embeds videos from platforms like YouTube, Bilibili, Vimeo, or custom sources.
 *  - `:::image-*`: Wraps an image inside valid HTML tags, such as a `<figure>` element to
 *     allow adding a descriptive `<figcaption>`, or a hyperlink to make it clickable, and more.
 *
 * @param options
 *   Optional options to configure the output.
 * @returns
 *   A unified transformer.
 *
 * @see https://github.com/lin-stephanie/remark-directive-sugar
 */
const remarkDirectiveSugar: Plugin<[Options?], Root> = (options) => {
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

        if (badgeDirectiveRegex.test(node.name)) {
          handleBadgeDirective(node, badge, badgeDirectiveRegex)
        } else if (linkDirectiveRegex.test(node.name)) {
          handleLinkDirective(node, link)
        } else if (videoDirectiveRegex.test(node.name)) {
          handleVideoDirective(node, video, videoDirectiveRegex)
        } else if (imageDirectiveRegex.test(node.name)) {
          handleImageDirective(node, image, imageDirectiveRegex)
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
export type {
  Options,
  BadgeDirectiveConfig,
  LinkDirectiveConfig,
  VideoDirectiveConfig,
  ImageDirectiveConfig,
  PropertiesFromContainerDirective,
  PropertiesFromLeafDirective,
  PropertiesFromTextDirective,
} from './types.js'
