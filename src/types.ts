import type { Properties } from 'hast'
import type {
  ContainerDirective,
  LeafDirective,
  TextDirective,
} from 'mdast-util-directive'

/**
 * Create props for an HTML element based on a container directive node.
 */
export type PropertiesFromContainerDirective = (
  node: ContainerDirective
) => Properties | null | undefined

/**
 * Create props for an HTML element based on a leaf directive node.
 */
export type PropertiesFromLeafDirective = (
  node: LeafDirective
) => Properties | null | undefined

/**
 * Create props for an HTML element based on a text directive node.
 */
export type PropertiesFromTextDirective = (
  node: TextDirective
) => Properties | null | undefined

export interface BadgeDirectiveConfig {
  /**
   * Alias for the `badge` directive.
   * E.g., `'b'` matches `:badge`, `:badge-*`, `:b` and `:b-*`,
   * where `*` is a key in {@link presets} for a badge type.
   */
  alias?: string | string[] | null | undefined

  /**
   * Properties for the generated `span` element containing the badge.
   * Use `className` to override the default class (`'rds-badge'`).
   *
   * Note that `{}` in `:badge[]{}` and `props` defined in {@link presets}
   * will override these properties, except `className`, which is appended.
   */
  spanProps?: PropertiesFromTextDirective | Properties | null | undefined

  /**
   * Configurations for `:badge-*` directives.
   *
   * Each key defines a badge type (`*`) and adds `data-badge='*'` to the element.
   * The value specifies the badge's details:
   *
   * - `text` (required): Default text for the badge.
   * - `props` (optional): Custom properties for the generated element. Properties are
   *   resolved in the following order (the latter overrides the former):
   *   {@link spanProps}, `props` here, and `{}` in `:badge-*[]{}`,
   *   except `className`, which is appended.
   *
   * @example
   * {
   *   v: { text: 'VIDEO', props: { className: ['custom'] } },
   *   // Output: `<span data-badge="v" class="rds-badge custom">VIDEO</span>`
   *   w: { text: 'WEB', props: { style: '--bg-light:#ff9966; --bg-dark:#ffcfd2' } },
   *   // Output: `<span data-badge="w" class="rds-badge" style="--bg-light:#ff9966; --bg-dark:#ffcfd2">WEB</span>`
   * }
   */
  presets?:
    | Record<
        string,
        {
          text: string
          props?: PropertiesFromTextDirective | Properties | null | undefined
        }
      >
    | null
    | undefined
}

export interface LinkDirectiveConfig {
  /**
   * Alias for the `link` directive.
   * E.g., `'l'` matches `:link` and `:l`.
   */
  alias?: string | string[] | null | undefined

  /**
   * Properties for the generated `a` element containing the link.
   * Use `className` to override the default class (`'rds-link'`).
   *
   * Note that `{}` in `:link[]{}` will override these properties,
   * except `className`, which is appended.
   */
  aProps?: PropertiesFromTextDirective | Properties | null | undefined

  /**
   * Properties for the generated `img` element
   * used to display an avatar or a website's favicon.
   */
  imgProps?: PropertiesFromTextDirective | Properties | null | undefined

  /**
   * Template URL to fetch favicons from a remote service
   * when the `link` directive `id` is set as a URL.
   * Must include the `{domain}` placeholder, replaced by the actual domain name.
   *
   * @default
   * 'https://icons.duckduckgo.com/ip3/{domain}.ico'
   *
   * @example
   * 'https://favicon.yandex.net/favicon/{domain}'
   * 'https://www.google.com/s2/favicons?domain={domain}'
   */
  faviconSourceUrl?:
    | `http://${string}{domain}${string}`
    | `https://${string}{domain}${string}`
}

export interface VideoDirectiveConfig {
  /**
   * Alias for the `video` directive,
   * E.g., `'v'` matches `::video`, `::video-*`, `::v` and `::v-*`,
   * where `*` is a video platform (e.g., 'youtube', 'bilibili', 'vimeo',
   * or {@link platforms} keys).
   */
  alias?: string | string[] | null | undefined

  /**
   * Properties for the generated `iframe` element.
   * Use `className` to override the default class (`'rds-video'`).
   *
   * Note that `{}` in `::video[]{}` will override these properties,
   * except `className`, which is appended.
   */
  iframeProps?: PropertiesFromLeafDirective | Properties | null | undefined

  /**
   * Configurations for additional video platforms to support.
   *
   * Each key defines a platform (`*`) and adds `data-video='*'` to the element.
   * The value specifies the platform's base URL with a `{id}` placeholder,
   * replaced by the video `id` when used.
   *
   * Keys matching built-in platforms (`'youtube'`, `'bilibili'`, `'vimeo'`)
   * will override default URLs. The key `'url'` is reserved and used internally
   * when `id` is a URL, setting `data-video='url'`.
   */
  platforms?: Record<
    string,
    `http://${string}{id}${string}` | `https://${string}{id}${string}`
  >
}

export interface ImageDirectiveConfig {
  /**
   * Alias for the `image` directive.
   * E.g., `'img'` matches `:::image-*` and `:::img-*`,
   * where `*` must be a valid HTML tag.
   */
  alias?: string | string[] | null | undefined

  /**
   * Properties for the generated `img` element.
   */
  imgProps?: PropertiesFromContainerDirective | Properties | null | undefined

  /**
   * Properties for the generated `figure` element.
   */
  figureProps?: PropertiesFromContainerDirective | Properties | null | undefined

  /**
   * Properties for the generated `figcaption` element.
   *
   * Note that `{}` in `:::image-figure[]{}` will override these properties,
   * except `className`, which is appended.
   */
  figcaptionProps?:
    | PropertiesFromContainerDirective
    | Properties
    | null
    | undefined

  /**
   * Properties for the other
   * {@link https://github.com/lin-stephanie/remark-directive-sugar/blob/main/src/directives/image.ts#L14 valid HTML element}.
   *
   * Note that `{}` in `:::image-*[]{}` will override these properties,
   * except `className`, which is appended.
   */
  elementProps?:
    | PropertiesFromContainerDirective
    | Properties
    | null
    | undefined

  /**
   * Whether to remove `<p>` that directly wrap `<img>`.
   *
   * @default true
   */
  stripParagraph?: boolean
}

export interface Options {
  /**
   * Configures the `:badge-[*]` directive.
   */
  badge?: BadgeDirectiveConfig

  /**
   * Configures the `:link` directive.
   */
  link?: LinkDirectiveConfig

  /**
   * Configures the `::video[-*]` directive.
   */
  video?: VideoDirectiveConfig

  /**
   * Configures the `:::image-*` directive.
   */
  image?: ImageDirectiveConfig
}
