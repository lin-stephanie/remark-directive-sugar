import { createIfNeeded, mergeProps } from '../utils.js'

import type { Directives } from 'mdast-util-directive'
import type { VideoDirectiveConfig } from '../types.js'

const customUrlRegex = /^(?:https?:\/\/)?(?:[\w-]+\.)+[a-z]{2,}(?:\/\S*)?$/

const defaultPlatforms = {
  youtube: 'https://www.youtube-nocookie.com/embed/{id}',
  bilibili: 'https://player.bilibili.com/player.html?bvid={id}',
  vimeo: 'https://player.vimeo.com/video/{id}',
}

/**
 * Handles the `video` directive.
 */
export function handleVideoDirective(
  node: Directives,
  config: VideoDirectiveConfig,
  regex: RegExp
) {
  if (node.type === 'textDirective')
    throw new Error(
      'Unexpected text directive. Use double colons (`::`) for a `video` leaf directive.'
    )

  if (node.type === 'containerDirective')
    throw new Error(
      'Unexpected container directive. Use double colons (`::`) for a `video` leaf directive.'
    )

  const defaultIframeProps = { className: ['rds-video'] }
  const { iframeProps, platforms } = config
  const expandedPlatforms: Record<string, string> = {
    ...defaultPlatforms,
    ...platforms,
  }

  const data = (node.data ||= {})
  const attributes = node.attributes || {}
  const { children } = node

  const { id, ...attrs } = attributes

  // check if the platforms are invalid
  if (platforms && 'url' in platforms) {
    throw new Error('Invalid `video` directive config. The `url` is reserved.')
  }

  // check if the id is missing
  if (!id) {
    throw new Error('Invalid `video` directive. The `id` is missing.')
  }

  // check if it matches the platform & get type
  let videoType: string | undefined
  const match = node.name.match(regex)
  if (match?.[1]) {
    if (match[1] in expandedPlatforms) {
      videoType = match[1]
    } else {
      throw new Error(
        'Invalid `video` directive. The directive failed to match a valid video platform.'
      )
    }
  } else if (match && !match[1] && customUrlRegex.test(id)) {
    videoType = 'url'
  } else {
    throw new Error(
      'Invalid `video` directive. Ensure a valid URL is passed via `id` instead of `#`.'
    )
  }

  // get src
  const src =
    videoType === 'url' ? id : expandedPlatforms[videoType].replace('{id}', id)

  // get title
  const title =
    children.length > 0 && children[0].type === 'text'
      ? children[0].value
      : 'Video Player'

  // handle props

  const iframeProperties = createIfNeeded(iframeProps, node)
  const iframeNewProperties = mergeProps(
    { ...defaultIframeProps, ...iframeProperties },
    { 'data-video': videoType },
    attrs
  )

  // update node
  data.hName = 'iframe'
  data.hProperties = { src, title, ...iframeNewProperties }
  data.hChildren = []
}
