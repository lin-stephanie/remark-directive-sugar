import { visit, EXIT } from 'unist-util-visit'
import { createIfNeeded, mergeProps } from '../utils.js'

import type {
  BlockContent,
  DefinitionContent,
  Paragraph,
  PhrasingContent,
} from 'mdast'
import type { Directives } from 'mdast-util-directive'
import type { ImageDirectiveOptions } from '../types.js'

const validTags = new Set<string>([
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
 * Handles the `image` directive.
 */
export function handleImageDirective(
  node: Directives,
  config: ImageDirectiveOptions,
  regex: RegExp
) {
  if (node.type === 'textDirective')
    throw new Error(
      'Unexpected text directive. Use three colons (`:::`) for an `image` container directive.'
    )
  if (node.type === 'leafDirective')
    throw new Error(
      'Unexpected leaf directive. Use three colons (`:::`) for an `image` container directive.'
    )

  const { imgProps, figureProps, figcaptionProps, elementProps } = config

  const data = (node.data ||= {})
  const attributes = node.attributes || {}

  // check if it matches the valid HTML tag & get tag name
  let matchTag: string
  const match = node.name.match(regex)
  if (match && validTags.has(match[1])) {
    matchTag = match[1]
  } else {
    throw new Error(
      'Invalid `image` directive. The directive failed to match a valid HTML tag. See https://github.com/lin-stephanie/remark-directive-sugar/blob/main/src/directives/image.ts#L22 for details.'
    )
  }

  // check if the image is missing & handle image props
  let hasImage = false
  const imgProperties = createIfNeeded(imgProps, node)
  visit(node, 'image', (imageNode) => {
    if (imgProperties) {
      imageNode.data = imageNode.data || {}
      imageNode.data.hProperties = imgProperties
    }

    hasImage = true
    return EXIT
  })
  if (!hasImage)
    throw new Error('Invalid `image` directive. The image is missing.')

  // remove unnecessary `paragraph` node that only contains an `image` node
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
    // get figcaption text (priority: `[]` of `:::image-figure[]{}`、`![]()`)
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

    // handle figure & figcaption props
    const figureProperties = createIfNeeded(figureProps, node)
    const figcaptionProperties = createIfNeeded(figcaptionProps, node)

    // get figcaption node
    const figcaptionNode: Paragraph = {
      type: 'paragraph',
      data: {
        hName: 'figcaption',
        hProperties: mergeProps(figcaptionProperties, null, attributes),
      },
      children: content,
    }

    // update node
    data.hName = 'figure'
    data.hProperties = figureProperties ? figureProperties : undefined
    children.push(figcaptionNode)
  } else {
    // handle element props
    const elementProperties = createIfNeeded(elementProps, node)

    // update node
    data.hName = matchTag
    data.hProperties = mergeProps(elementProperties, null, attributes)
  }
}
