import { createIfNeeded, mergeProps } from '../utils.js'

import type { Directives } from 'mdast-util-directive'
import type { BadgeDirectiveOptions } from '../types.js'

/**
 * Handles the `badge` directive.
 */
export function handleBadgeDirective(
  node: Directives,
  config: BadgeDirectiveOptions,
  regex: RegExp
) {
  if (node.type === 'leafDirective')
    throw new Error(
      'Unexpected leaf directive. Use single colon (`:`) for a `badge` text directive.'
    )

  if (node.type === 'containerDirective')
    throw new Error(
      'Unexpected container directive. Use single colon (`:`) for a `badge` text directive.'
    )

  const { tag, props, presets } = config

  const data = (node.data ||= {})
  const attributes = node.attributes || {}
  const { children } = node

  // check if it matches the badge type defined in presets
  let matchType: string | undefined
  const match = node.name.match(regex)
  if (match && !match[1]) {
    matchType = undefined
  } else if (
    match &&
    match[1] &&
    presets &&
    new Set(Object.keys(presets)).has(match[1])
  ) {
    matchType = match[1]
  } else {
    throw new Error(
      'Invalid `badge` directive. The directive failed to match a valid badge type. Please check the `presets` option in the `badge` config.'
    )
  }

  // check if the text is missing & get text
  const resolvedText = matchType
    ? presets?.[matchType].text
    : children[0].type === 'text'
      ? children[0].value
      : undefined
  if (!resolvedText)
    throw new Error(
      'Invalid `badge` directive. The text is missing. Specify it in the `[]` of `:badge[]{}` or in the `text` field of the `presets` option in the `badge` config.'
    )

  // handle props
  const presetProps = matchType
    ? {
        'data-badge': matchType,
        ...createIfNeeded(presets?.[matchType].props, node),
      }
    : null
  const properties = mergeProps(
    createIfNeeded(props, node),
    presetProps,
    attributes
  )

  data.hName = tag
  data.hProperties = properties
  data.hChildren = [
    {
      type: 'text',
      value: resolvedText,
    },
  ]
}
