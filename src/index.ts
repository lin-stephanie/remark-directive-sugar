/**
 * @see https://github.com/remarkjs/remark-directive?tab=readme-ov-file#types
 */
// Register `hName`, `hProperties` types, used when turning markdown to HTML:
/// <reference types="mdast-util-to-hast" />
// Register directive nodes in mdast:
/// <reference types="mdast-util-directive" />

import { h } from 'hastscript'
import { visit } from 'unist-util-visit'

import {
  badgeRegex,
  faviconBaseUrl,
  getConfig,
  githubRepoRegex,
  githubTab,
  githubUsernameRegex,
  linkStyle,
  tabOrgRegex,
  iconSvgPath,
  validBadges,
  videoPlatforms,
  imageRegex,
  validTagsForImg,
} from './utils.js'

import type { Paragraph, PhrasingContent, Root } from 'mdast'
import type { Plugin } from 'unified'
import type { UserOptions } from './types.js'

/**
 * A remark plugin based on {@link https://github.com/remarkjs/remark-directive remark-directive},
 * offering the following predefined directives:
 *
 *  - `:::image-figure`: creates a block with an image, figcaption, and optional styling, much like a figure in academic papers.
 *  - `:::image-a`: wraps an image inside a link, making it clickable.
 *  - `:::image-[validTagsForImg]`: wraps an image inside any valid HTML tags.
 *  - `::video`: allows for consistent video embedding across different platforms (youtobe, bilibili, vimeo).
 *  - `:link`: creates styled links to GitHub repositories, users/organizations, or any external URLs. (Inspired by: {@link https://github.com/antfu/markdown-it-magic-link markdown-it-magic-link})
 *  - `:badge`/`:badge-*`: customizable badges to improve document visuals.
 *
 * @remark Supports regular {@link https://github.com/remarkjs/remark-directive?tab=readme-ov-file#use remark-directive usage}.
 *
 * @param options
 *   Optional options to configure the output.
 * @returns
 *   A unified transformer.
 */

const remarkDirectiveSugar: Plugin<[UserOptions?], Root> = (options) => {
  const config = getConfig(options)
  const { classPrefix, image, link, video, badge } = config

  return (tree: Root) => {
    visit(tree, function (node) {
      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        const data = (node.data ||= {})
        const attributes = node.attributes || {}
        const { children } = node

        if (imageRegex.test(node.name)) {
          /* :::image-* */
          if (node.type === 'textDirective')
            throw new Error(
              'Unexpected `:image` text directive. Use three colons (`:::`) for an `image` container directive.'
            )
          if (node.type === 'leafDirective')
            throw new Error(
              'Unexpected `::image` leaf directive. Use three colons (`:::`) for an `image` container directive.'
            )

          if (node.name === 'image-figure') {
            /* image-figure */
            const data = (node.data ||= {})
            const attributes = node.attributes || {}
            const { children } = node

            // add figure node
            data.hName = 'figure'
            data.hProperties = undefined

            // handle figcaption text
            // priority: content inside [] of `:::image-figure[]{}`、`![]()`
            let content: PhrasingContent[]
            if (
              children[0].type === 'paragraph' &&
              children[0].data?.directiveLabel &&
              children[0].children[0].type === 'text'
            ) {
              content = children[0].children
              children.shift()
            } else if (
              children[0].type === 'paragraph' &&
              children[0].children[0].type === 'image' &&
              children[0].children[0].alt
            ) {
              content = [{ type: 'text', value: children[0].children[0].alt }]
            } else {
              throw new Error(
                `Invalid ${node.name} directive. The figcaption text is missing. Specify it in the '[]' of ':::image-figure[]{}' or '![]()'.`
              )
            }

            // add figcaption node
            const figcaptionNode: Paragraph = {
              type: 'paragraph',
              data: {
                hName: 'figcaption',
                hProperties: attributes,
              },
              children: content,
            }

            children.push(figcaptionNode)
          } else if (node.name === 'image-a') {
            /* image-a */
            if (!node.attributes?.href)
              throw new Error(
                'Unexpectedly missing `href` in the `image-a` directive.'
              )

            /* const data = node.data || (node.data = {})
            const attributes = node.attributes || {} */

            data.hName = 'a'
            const defaultAttributes = { target: '_blank' }
            data.hProperties = { ...defaultAttributes, ...attributes }
          } else {
            /* image-* */
            const match = node.name.match(imageRegex)
            if (match && validTagsForImg.has(match[1])) {
              data.hName = match[1]
              data.hProperties = attributes
            } else {
              throw new Error(
                'The `image-*` directive failed to match a valid tag.'
              )
            }
          }
        } else
          switch (node.name) {
            case 'video': {
              /* ::video */
              if (node.type === 'textDirective')
                throw new Error(
                  'Unexpected `:video` text directive. Use double colons (`::`) for an `video` leaf directive.'
                )
              if (node.type === 'containerDirective')
                throw new Error(
                  'Unexpected `:::video` container directive. Use double colons (`::`) for an `video` leaf directive.'
                )

              // handle attributes
              let source = ''
              const { youtubeId, bilibiliId, vimeoId, iframeSrc } = attributes

              if (!youtubeId && !bilibiliId && !vimeoId && !iframeSrc) {
                throw new Error(
                  'Invalid `video` directive. Unexpectedly missing one of the following: `youtubeId`, `bilibiliId`, `iframeSrc`.'
                )
              } else {
                for (const [key, id] of Object.entries({
                  youtubeId,
                  bilibiliId,
                  vimeoId,
                })) {
                  if (id) {
                    source = videoPlatforms[key](id)
                    break
                  }
                }

                if (!source && iframeSrc) {
                  source = iframeSrc
                }
              }

              // nested in div（otherwise, the transform style won‘t apply）
              data.hName = 'div'
              data.hProperties = {
                class: `${classPrefix}-video`,
                style: attributes.noScale && 'margin: 1rem 0',
              }
              data.hChildren = [
                {
                  type: 'element',
                  tagName: 'iframe',
                  properties: {
                    style: attributes.noScale && 'transform: none',
                    src: source,
                    title: attributes.title || 'Video Player',
                    loading: 'lazy',
                    allow:
                      'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
                    allowFullScreen: true,
                  },
                  children: [],
                },
              ]

              break
            }

            case 'link': {
              /* :link */
              if (node.type === 'leafDirective')
                throw new Error(
                  'Unexpected `::link` leaf directive. Use single colon (`:`) for a `link` text directive.'
                )

              if (node.type === 'containerDirective')
                throw new Error(
                  'Unexpected `:::link` container directive. Use single colon (`:`) for a `link` text directive.'
                )

              let resolvedText = ''
              let resolvedLink = ''
              let resolvedImageUrl = ''
              let resolvedTab = ''
              let isOrg = false
              let resolvedStyle = ''

              const { id, link, imageUrl, tab, style } = attributes

              // check label
              if (children.length > 0 && children[0].type === 'text') {
                resolvedText = children[0].value
              } else if (!id) {
                throw new Error(
                  'Invalid `link` directive. The text in the `[]` of `:link[]{}` is required if `id` attribute is not specified.'
                )
              }

              // check type
              if (style && (linkStyle as readonly string[]).includes(style)) {
                resolvedStyle = style
              } else if (
                style &&
                !(linkStyle as readonly string[]).includes(style)
              ) {
                throw new Error(
                  'Invalid `link` directive. The `style` must be one of "square", "rounded", or "github".'
                )
              }

              // check tab
              if (tab && !githubTab.includes(tab)) {
                throw new Error(
                  'Invalid `link` directive. The `tab` must be one of the following: "repositories", "projects", "packages", "stars", "sponsoring", "sponsors", "org-repositories", "org-projects", "org-packages", "org-sponsoring", or "org-people".'
                )
              } else if (tab) {
                const match = tab.match(tabOrgRegex)
                if (match) {
                  isOrg = true
                  resolvedTab = match[1]
                } else {
                  resolvedTab = tab
                }
              }

              // handle
              if (!id && link) {
                // non github scope
                resolvedLink = link
                resolvedImageUrl =
                  imageUrl ||
                  `${faviconBaseUrl}${new URL(resolvedLink).hostname}`
                resolvedStyle ||= 'square'
              } else if (id) {
                // github scope
                if (githubUsernameRegex.test(id)) {
                  resolvedLink =
                    link ||
                    (resolvedTab && isOrg
                      ? `https://github.com/orgs/${id.slice(1)}/${resolvedTab}`
                      : `https://github.com/${id.slice(1)}?tab=${resolvedTab}`)

                  resolvedImageUrl =
                    imageUrl || `https://github.com/${id.slice(1)}.png`

                  resolvedStyle ||= 'rounded'
                  resolvedText ||= id.slice(1)
                } else if (githubRepoRegex.test(id)) {
                  const match = id.match(githubRepoRegex)
                  resolvedLink = link || `https://github.com/${id}`

                  resolvedImageUrl =
                    imageUrl || `https://github.com/${match?.[1]}.png`

                  resolvedStyle ||= 'square'
                  resolvedText ||= id
                } else {
                  throw new Error(
                    'Invalid `link` directive. The `id` attribute must be provided in the format `@username` or `username/reponame`.'
                  )
                }
              } else {
                throw new Error(
                  'Invalid `link` directive. The `link` attribute is required if `id` attribute is not specified.'
                )
              }

              if (resolvedStyle === 'square' || resolvedStyle === 'rounded') {
                data.hName = 'a'
                data.hProperties = {
                  class: `${
                    resolvedStyle === 'square'
                      ? `${classPrefix}-link-square`
                      : `${classPrefix}-link-rounded`
                  }`,
                  href: resolvedLink,
                }
                data.hChildren = [
                  {
                    type: 'element',
                    tagName: 'span',
                    properties: {
                      class: `${classPrefix}-link-image`,
                      style: `background-image: url(${resolvedImageUrl})`,
                    },
                    children: [],
                  },
                  {
                    type: 'text',
                    value: resolvedText,
                  },
                ]
              } else if (
                resolvedStyle === 'github' ||
                resolvedStyle === 'npm'
              ) {
                data.hName = 'span'
                data.hProperties = {
                  style: 'white-space: nowrap',
                }
                data.hChildren = [
                  {
                    type: 'element',
                    tagName: 'svg',
                    properties: {
                      xmlns: 'http://www.w3.org/2000/svg',
                      width: '1.2em',
                      height: '1.2em',
                      viewBox: '0 0 32 32',
                      ariaHidden: 'true',
                    },
                    children: [
                      {
                        type: 'element',
                        tagName: 'path',
                        properties: {
                          fill: 'currentColor',
                          d: iconSvgPath[resolvedStyle],
                        },
                        children: [],
                      },
                    ],
                  },
                  {
                    type: 'element',
                    tagName: 'a',
                    properties: {
                      class: `${classPrefix}-link-${resolvedStyle}`,
                      href: resolvedLink,
                    },
                    children: [{ type: 'text', value: resolvedText }],
                  },
                ]
              }

              break
            }

            case 'badge': {
              /* :badge */
              if (node.type === 'leafDirective')
                throw new Error(
                  'Unexpected `::badge` leaf directive. Use single colon (`:`) for a `badge` text directive.'
                )

              if (node.type === 'containerDirective')
                throw new Error(
                  'Unexpected `:::badge` container directive. Use single colon (`:`) for a `badge` text directive.'
                )

              let resolvedText = ''
              let resolvedColorLight = ''
              let resolvedColorDark = ''

              const { color } = attributes

              // check label & get text
              if (children.length > 0 && children[0].type === 'text') {
                resolvedText = children[0].value
              } else {
                throw new Error(
                  'Invalid `badge` directive. The text in the `[]` of `:badge[]{}` is required.'
                )
              }

              // get color
              // resolvedColor = color || CONFIG.badge.defaultColor
              if (color) {
                const colors = color.split('|').map((color) => color.trim())
                if (colors.length === 1) {
                  resolvedColorLight = resolvedColorDark = colors[0]
                } else if (colors.length === 2) {
                  ;[resolvedColorLight, resolvedColorDark] = colors
                } else {
                  throw new Error(
                    "Invalid `badge` directive. The `color` expected one or two color values split by '|'."
                  )
                }
              } else {
                resolvedColorLight = resolvedColorDark = badge.defaultColor
              }

              data.hName = 'span'
              data.hProperties = {
                class: `${classPrefix}-badge`,
                style: `--badge-color-light:${resolvedColorLight}; --badge-color-dark:${resolvedColorDark}`,
              }
              data.hChildren = [
                {
                  type: 'text',
                  value: resolvedText,
                },
              ]

              break
            }

            default: {
              if (badgeRegex.test(node.name)) {
                /* :badge-* */
                if (node.type === 'leafDirective')
                  throw new Error(
                    'Unexpected `::badge-*` leaf directive. Use single colon (`:`) for a `badge` text directive.'
                  )

                if (node.type === 'containerDirective')
                  throw new Error(
                    'Unexpected `:::badge-*` container directive. Use single colon (`:`) for a `badge` text directive.'
                  )

                const match = node.name.match(badgeRegex)
                if (match && validBadges.has(match[1])) {
                  let resolvedColorLight = ''
                  let resolvedColorDark = ''

                  const { color } = attributes

                  // get type
                  const type = match[1]

                  // get color
                  const resolvedColor = color || badge.preset[type].color

                  if (resolvedColor) {
                    const colors = resolvedColor
                      .split('|')
                      .map((color) => color.trim())
                    if (colors.length === 1) {
                      resolvedColorLight = resolvedColorDark = colors[0]
                    } else if (colors.length === 2) {
                      ;[resolvedColorLight, resolvedColorDark] = colors
                    } else {
                      throw new Error(
                        "Invalid `badge` directive. The `color` expected one or two color values split by '|'."
                      )
                    }
                  } else {
                    resolvedColorLight = resolvedColorDark = badge.defaultColor
                  }

                  data.hName = 'span'
                  data.hProperties = {
                    class: `${classPrefix}-badge`,
                    // style: `background: ${CONFIG.badge.preset[type].color} `,
                    style: `--badge-color-light:${resolvedColorLight}; --badge-color-dark:${resolvedColorDark}`,
                  }
                  data.hChildren = [
                    {
                      type: 'text',
                      value: badge.preset[type].text,
                    },
                  ]
                } else {
                  throw new Error(
                    'The `badge` directive failed to match a valid badge name.'
                  )
                }
              } else {
                /* common */
                const hast = h(node.name, attributes)
                data.hName = hast.tagName
                data.hProperties = hast.properties
              }
            }
          }
      }
    })
  }
}

export default remarkDirectiveSugar
export type {
  UserOptions,
  RemarkDirectiveSugarOptions,
  BadgePreset,
} from './types.js'
