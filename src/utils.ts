import { Properties } from 'hast'
import { Directives } from 'mdast-util-directive'

const RESERVED_DIRECTIVE_NAMES = new Set(['image', 'video', 'badge', 'link'])

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

  const otherDirectives = Array.from(RESERVED_DIRECTIVE_NAMES).filter(
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

/* video */
export const videoPlatforms: Record<string, (id: string) => string> = {
  youtubeId: (id) => `https://www.youtube-nocookie.com/embed/${id}`,
  bilibiliId: (id) => `https://player.bilibili.com/player.html?bvid=${id}`,
  vimeoId: (id) => `https://player.vimeo.com/video/${id}`,
}

/* link */
export const faviconBaseUrl = 'https://favicon.yandex.net/favicon/'

export const githubUsernameRegex = /^@[a-zA-Z\d](?!.*--)[\w-]{0,37}[a-zA-Z\d]$/

export const githubRepoRegex =
  /^@?([a-zA-Z\d](?!.*--)[\w-]{0,37}[a-zA-Z\d])\/.*$/

export const linkStyle = ['square', 'rounded', 'github', 'npm'] as const

export const tabOrgRegex = /^org-(\w+)$/

export const githubTab = [
  'repositories',
  'projects',
  'packages',
  'stars',
  'sponsoring',
  'sponsors',
  'org-repositories',
  'org-projects',
  'org-packages',
  'org-sponsoring',
  'org-people',
]

export const iconSvgPath = {
  github:
    'M16 2a14 14 0 0 0-4.43 27.28c.7.13 1-.3 1-.67v-2.38c-3.89.84-4.71-1.88-4.71-1.88a3.7 3.7 0 0 0-1.62-2.05c-1.27-.86.1-.85.1-.85a2.94 2.94 0 0 1 2.14 1.45a3 3 0 0 0 4.08 1.16a2.93 2.93 0 0 1 .88-1.87c-3.1-.36-6.37-1.56-6.37-6.92a5.4 5.4 0 0 1 1.44-3.76a5 5 0 0 1 .14-3.7s1.17-.38 3.85 1.43a13.3 13.3 0 0 1 7 0c2.67-1.81 3.84-1.43 3.84-1.43a5 5 0 0 1 .14 3.7a5.4 5.4 0 0 1 1.44 3.76c0 5.38-3.27 6.56-6.39 6.91a3.33 3.33 0 0 1 .95 2.59v3.84c0 .46.25.81 1 .67A14 14 0 0 0 16 2',
  npm: 'M4 28V4h24v24zM8.5 8.5v15H16v-12h4.5v12h3v-15z',
}
