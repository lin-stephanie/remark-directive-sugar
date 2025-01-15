import { visit, EXIT } from 'unist-util-visit'

import type { Paragraph, PhrasingContent } from 'mdast'
import type {
  ContainerDirective,
  LeafDirective,
  TextDirective,
} from 'mdast-util-directive'

export const IMAGE_REGEX = /^image-(.*)/
const VALID_TAGS_FOR_IMG = new Set<string>([
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
 * A function that handles the `:::image` directives.
 */
export function handleImageDirective(
  node: ContainerDirective | LeafDirective | TextDirective
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
  const match = node.name.match(IMAGE_REGEX)
  if (match && VALID_TAGS_FOR_IMG.has(match[1])) {
    matchTag = match[1]
  } else {
    throw new Error(
      'Invalid `image` directive. The directive failed to match a valid tag. See https://github.com/lin-stephanie/remark-directive-sugar/blob/main/src/directives/image.rs#L9 for details.'
    )
  }

  const data = (node.data ||= {})
  const attributes = node.attributes || {}
  const { children } = node

  let hasImage = false
  visit(node, 'image', () => {
    hasImage = true
    return EXIT
  })
  if (!hasImage)
    throw new Error('Invalid `image` directive. The image is missing.')

  if (matchTag === 'figure') {
    // add figure node
    data.hName = 'figure'
    data.hProperties = undefined

    // handle figcaption text (priority: content inside [] of `:::image-figure[]{}`、`![]()`)
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
        'Invalid `image` directive. The figcaption text is missing. Specify it in the `[]` of `:::image-figure[]{}` or `![]()`.'
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
  } else {
    data.hName = matchTag
    data.hProperties = attributes
  }
}
