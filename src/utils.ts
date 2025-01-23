import { Properties } from 'hast'
import { Directives } from 'mdast-util-directive'

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

  const otherDirectives = Array.from(reservedDirectiveNames).filter(
    (name) => name !== directiveName
  )

  for (const reserved of otherDirectives) {
    if (aliases.has(reserved)) {
      throw new Error(
        `The alias '${reserved}' is reserved and cannot be used for the '${directiveName}' directive.`
      )
    }
  }

  const aliasPattern = Array.from(aliases)
    .map((alias) => alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))
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

  const addClasses = (value: unknown) => {
    if (typeof value === 'string') {
      value.split(/\s+/).forEach((c) => c && classes.add(c))
    } else if (Array.isArray(value)) {
      value.forEach((c) => {
        if (typeof c === 'string' && c) {
          classes.add(c)
        }
      })
    }
  }

  for (const config of configs) {
    if (!config) continue
    for (const key of Object.keys(config)) {
      const value = config[key]
      if (key === 'class' || key === 'className') {
        addClasses(value)
      } else {
        newProps[key] = value
      }
    }
  }

  if (classes.size > 0) newProps.className = Array.from(classes)

  return newProps
}

/**
 * Process a URL by removing the protocol and shortening the path
 * to a maximum length.
 */
export function processUrl(url: string, maxPathLength: number = 14) {
  const urlWithoutProtocol = url.replace(/(^\w+:|^)\/\//, '')
  const [hostname, ...pathParts] = urlWithoutProtocol.split('/')
  const path = pathParts.join('/')
  const shortenedPath =
    path.length > maxPathLength ? path.substring(0, maxPathLength) : path

  return hostname + (shortenedPath ? '/' + shortenedPath + '...' : '')
}
