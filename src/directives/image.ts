import { Properties } from 'hast'
import { visit, EXIT } from 'unist-util-visit'
import { ImageDirectiveOptions, PropsFromContainerDirective } from '../types.js'

import type {
  BlockContent,
  DefinitionContent,
  Paragraph,
  PhrasingContent,
} from 'mdast'
import type {
  ContainerDirective,
  LeafDirective,
  TextDirective,
} from 'mdast-util-directive'

const DEFAULT_NAME = ['image']
const RESERVED_NAMES = ['video', 'badge', 'link']

const VALID_TAGS = new Set<string>([
  'figure',
  'a',
  'div',
  'span',
  'section',
  'article',
  'main',
  'aside',
  'header',
  'footer',
  'nav',
  'fieldset',
  'form',
])

/**
 * Creates a regex for matching the `image` directive.
 */
export const createImageDirectiveRegex = (
  alias: ImageDirectiveOptions['alias']
) => {
  const aliases = new Set([
    ...DEFAULT_NAME,
    ...(Array.isArray(alias)
      ? alias
      : typeof alias === 'string'
        ? [alias]
        : []),
  ])

  for (const reserved of RESERVED_NAMES) {
    if (aliases.has(reserved)) {
      throw new Error(
        `The alias '${reserved}'` +
          ' is reserved and cannot be used for the `image` directive.'
      )
    }
  }

  const aliasPattern = Array.from(aliases)
    .map((alias) => alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))
    .join('|')

  return new RegExp(`^(?:${aliasPattern})-(\\w+)$`)
}

/**
 * Call a function to get a return value or use the value.
 */
function createIfNeeded(
  value: PropsFromContainerDirective | Properties | null | undefined,
  node: ContainerDirective
) {
  return typeof value === 'function' ? value(node) : value
}

/**
 * Handles the `image` directive.
 *
 * @param {ContainerDirective | LeafDirective | TextDirective} node
 *   The directive node to be processed.
 * @param {ImageDirectiveOptions} config
 *   The user configuration options for the `image` directive.
 * @param {RegExp} imageDirectiveRegex
 *   The regex for matching the `image` directive.
 *
 * @throws If the directive is not a container directive.
 * @throws If the directive name does not match a valid HTML tag.
 * @throws If the image is missing.
 * @throws If the figcaption text is missing.
 */
export function handleImageDirective(
  node: ContainerDirective | LeafDirective | TextDirective,
  config: ImageDirectiveOptions,
  imageDirectiveRegex: RegExp
) {
  if (node.type === 'textDirective')
    throw new Error(
      'Unexpected text directive. Use three colons (`:::`) for an `image` container directive.'
    )
  if (node.type === 'leafDirective')
    throw new Error(
      'Unexpected leaf directive. Use three colons (`:::`) for an `image` container directive.'
    )

  // try to match the valid HTML tag
  let matchTag: string
  const match = node.name.match(imageDirectiveRegex)
  if (match && VALID_TAGS.has(match[1])) {
    matchTag = match[1]
  } else {
    throw new Error(
      'Invalid `image` directive. The directive failed to match a valid HTML tag. See https://github.com/lin-stephanie/remark-directive-sugar/blob/main/src/directives/image.ts#L20 for details.'
    )
  }

  // check if the image is missing & set image properties
  let hasImage = false
  const imgProps = createIfNeeded(config.imgProps, node)
  visit(node, 'image', (imageNode) => {
    if (imgProps) {
      imageNode.data = imageNode.data || {}
      imageNode.data.hProperties = imageNode.data.hProperties || {}
      Object.assign(imageNode.data.hProperties, structuredClone(imgProps))
    }

    hasImage = true
    return EXIT
  })
  if (!hasImage)
    throw new Error('Invalid `image` directive. The image is missing.')

  const data = (node.data ||= {})
  const attributes = node.attributes || {}

  // remove unnecessary `paragraph` nodes
  // (if the paragraph node only contains a single `image` node)
  node.children = node.children.reduce((acc: any[], child) => {
    if (child.type === 'paragraph' && child.children[0].type === 'image') {
      acc.push(...child.children)
    } else {
      acc.push(child)
    }
    return acc
  }, [])
  const children = node.children as (
    | DefinitionContent
    | BlockContent
    | PhrasingContent
  )[]

  if (matchTag === 'figure') {
    const figureProps = createIfNeeded(config.figureProps, node)
    const figcaptionProps = createIfNeeded(config.figcaptionProps, node)

    // add figure node
    data.hName = 'figure'
    data.hProperties = figureProps ? structuredClone(figureProps) : undefined

    // handle figcaption text
    // (priority: content inside [] of `:::image-figure[]{}`、`![]()`)
    let content: PhrasingContent[]
    if (
      children[0].type === 'paragraph' &&
      children[0].data?.directiveLabel &&
      children[0].children[0].type === 'text'
    ) {
      content = children[0].children
      children.shift()
    } else if (children[0].type === 'image' && children[0].alt) {
      content = [{ type: 'text', value: children[0].alt }]
    } else {
      throw new Error(
        'Invalid `image` directive. The figcaption text is missing. Specify it in the `[]` of `:::image-figure[]{}` or `![]()`.'
      )
    }

    // add figcaption node
    const figcaptionNode: Paragraph = {
      type: 'paragraph',
      data: {
        hName: 'figcaption',
        hProperties: figcaptionProps
          ? Object.assign(structuredClone(figcaptionProps), attributes)
          : attributes,
      },
      children: content,
    }

    children.push(figcaptionNode)
  } else {
    const elementProps = createIfNeeded(config.elementProps, node)

    data.hName = matchTag
    data.hProperties = elementProps
      ? Object.assign(structuredClone(elementProps), attributes)
      : attributes
  }
}
