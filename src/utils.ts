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

/* Default Config */
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
