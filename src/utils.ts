import type { UserOptions, ConfigOptions, BadgesPreset } from './types.js'

/* image */
export const imageRegex = /^image-(.*)/

export const validTagsForImg = new Set<string>([
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

export const linkStyle = ['square', 'rounded', 'github'] as const

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

/* badge */
export const badgesPreset: BadgesPreset = {
  a: { text: 'ARTICLE', color: '#e9d66b|#fbf8cc' },
  v: { text: 'VIDEO', color: '#d473d4|#f1c0e8' },
  o: { text: 'OFFICIAL', color: '#4a8ce8|#a3c4f3' },
  f: { text: 'FEED', color: '#9568de|#cfbaf0' },
  t: { text: 'TOOL', color: '#ff9966|#ffcfd2' },
  w: { text: 'WEBSITE', color: '#8ab9f1|#90dbf4' },
  g: { text: 'GITHUB', color: '#74c365|#b9fbc0' },
}

export const badgeRegex = /^badge-(.*)/

export const validBadges = new Set(Object.keys(badgesPreset))

/* default */
export const configOptions: ConfigOptions = {
  classPrefix: 'directive-sugar',
  image: {
    // alias: '',
    // aAttrs: { target: '_blank' },
  },
  video: {
    // alias: '',
  },
  link: {
    // alias: '',
  },
  badge: {
    // alias: '',
    preset: badgesPreset,
    defaultColor: '#bebfc5',
  },
}

/**
 * Constructs the configuration.
 *
 * @param {(userOptions | undefined)} userOptions
 *   Optional user-specific settings to override defaults.
 * @returns {configOptions}
 *   The complete configuration object.
 */
export function getConfig(userOptions: UserOptions | undefined): ConfigOptions {
  const defaultOptions = configOptions

  if (userOptions) {
    // merge badges
    const { badge } = userOptions
    const mergedBadges = { ...defaultOptions.badge.preset }
    if (badge?.preset) {
      for (const key of Object.keys(badge.preset)) {
        mergedBadges[key] = {
          ...defaultOptions.badge.preset[key],
          ...badge.preset[key],
        }
      }
    }

    return {
      classPrefix: userOptions.classPrefix ?? defaultOptions.classPrefix,
      image: { ...defaultOptions.image, ...userOptions.image },
      video: { ...defaultOptions.video, ...userOptions.video },
      link: { ...defaultOptions.link, ...userOptions.link },
      badge: {
        // alias: badge?.alias ?? defaultOptions.badge.alias,
        preset: mergedBadges,
        defaultColor: badge?.defaultColor ?? defaultOptions.badge.defaultColor,
      },
    }
  }

  return defaultOptions
}
