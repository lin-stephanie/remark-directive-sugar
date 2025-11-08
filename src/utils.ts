import type { Properties } from 'hast'
import type { Directives } from 'mdast-util-directive'

const reservedDirectiveNames = new Set(['image', 'video', 'badge', 'link'])

/**
 * Creates a regex for matching the directive.
 */
export const createDirectiveRegex = (
  directiveName: string,
  alias: string | string[] | null | undefined
) => {
  const aliases = new Set([
    directiveName,
    ...(Array.isArray(alias)
      ? alias
      : typeof alias === 'string'
        ? [alias]
        : []),
  ])

  const otherDirectives = [...reservedDirectiveNames].filter(
    (name) => name !== directiveName
  )

  for (const reserved of otherDirectives) {
    if (aliases.has(reserved)) {
      throw new Error(
        `The alias '${reserved}' is reserved and cannot be used for the '${directiveName}' directive.`
      )
    }
  }

  const aliasPattern = [...aliases]
    .map((alias) => alias.replaceAll(/[-/\\^$*+?.()|[\]{}]/g, String.raw`\$&`))
    .join('|')

  return new RegExp(`^(?:${aliasPattern})(?:-(\\w+))?$`)
}

/**
 * Call a function to get a return value or use the value.
 */
export function createIfNeeded<T extends Directives>(
  value:
    | ((node: T) => Properties | null | undefined)
    | Properties
    | null
    | undefined,
  node: T
) {
  return typeof value === 'function' ? value(node) : value
}

/**
 * Merges the props of global, preset, and local into a single object:
 * - The order of precedence is: localProps > presetProps > globalProps.
 * - For class or className, do not override but merge into a new className.
 */
export function mergeProps(
  globalProps: Properties | null | undefined,
  presetProps: Properties | null | undefined,
  localProps: Record<string, string | null | undefined> | null | undefined
) {
  const configs = [globalProps, presetProps, localProps]
  const classes = new Set<string>()
  const newProps: Properties = {}

  const addClasses = (
    value: string | number | boolean | Array<string | number>
  ) => {
    if (typeof value === 'string') {
      for (const c of value.split(/\s+/)) {
        if (c) classes.add(c)
      }
    } else if (Array.isArray(value)) {
      for (const c of value) {
        if (typeof c === 'string' && c) {
          classes.add(c)
        }
      }
    }
  }

  for (const config of configs) {
    if (!config) continue
    for (const key of Object.keys(config)) {
      const value = config[key]
      if (value) {
        if (key === 'class' || key === 'className') {
          addClasses(value)
        } else {
          newProps[key] = value
        }
      }
    }
  }

  if (classes.size > 0) newProps.className = [...classes]

  return newProps
}

/**
 * Process a URL by removing the protocol and shortening the path
 * to a maximum length.
 */
export function processUrl(url: string, maxPathLength = 14) {
  const urlWithoutProtocol = url.replace(/(^\w+:|^)\/\//, '')
  const [hostname, ...pathParts] = urlWithoutProtocol.split('/')
  const path = pathParts.join('/')
  const shortenedPath =
    path.length > maxPathLength
      ? path.slice(0, Math.max(0, maxPathLength))
      : path

  return hostname + (shortenedPath ? '/' + shortenedPath + '...' : '')
}
