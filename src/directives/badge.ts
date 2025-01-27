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

  const defaultSpanProps = { className: ['rds-badge'] }
  const { spanProps, presets } = config

  const data = (node.data ||= {})
  const attributes = node.attributes || {}
  const { children } = node

  // check if it matches the badge type defined in presets
  let badgeType: string | undefined
  const match = node.name.match(regex)
  if (match && !match[1]) {
    badgeType = undefined
  } else if (
    match &&
    match[1] &&
    presets &&
    new Set(Object.keys(presets)).has(match[1])
  ) {
    badgeType = match[1]
  } else {
    throw new Error(
      'Invalid `badge` directive. The directive failed to match a valid badge type. Please check the `presets` option in the `badge` config.'
    )
  }

  // check if the text is missing & get text
  const resolvedText = badgeType
    ? presets?.[badgeType].text
    : children.length > 0 && children[0].type === 'text'
      ? children[0].value
      : undefined
  if (!resolvedText)
    throw new Error(
      'Invalid `badge` directive. The text is missing. Specify it in the `[]` of `:badge[]{}` or in the `text` field of the `presets` option in the `badge` config.'
    )

  // handle props
  const spanProperties = createIfNeeded(spanProps, node)
  const presetProps = badgeType
    ? {
        'data-badge': badgeType,
        ...createIfNeeded(presets?.[badgeType].props, node),
      }
    : null
  const spanNewProperties = mergeProps(
    { ...defaultSpanProps, ...spanProperties },
    presetProps,
    attributes
  )

  // update node
  data.hName = 'span'
  data.hProperties = spanNewProperties
  data.hChildren = [
    {
      type: 'text',
      value: resolvedText,
    },
  ]
}
