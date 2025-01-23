import { Properties } from 'hast'
import {
  ContainerDirective,
  LeafDirective,
  TextDirective,
} from 'mdast-util-directive'

/**
 * Create props for an HTML element based on a container directive node.
 */
export type PropsFromContainerDirective = (
  node: ContainerDirective
) => Properties | null | undefined

/**
 * Create props for an HTML element based on a leaf directive node.
 */
export type PropsFromLeafDirective = (
  node: LeafDirective
) => Properties | null | undefined

/**
 * Create props for an HTML element based on a text directive node.
 */
export type PropsFromTextDirective = (
  node: TextDirective
) => Properties | null | undefined

export interface ImageDirectiveOptions {
  /**
   * Alias for the `image` directive,
   * e.g., setting `'img'` matches both `:::image-*` and `:::img-*`,
   * where `*` remains the same and must be a valid HTML tag.
   */
  alias?: string | string[] | null | undefined

  /**
   * Properties for the generated `img` element.
   */
  imgProps?: PropsFromContainerDirective | Properties | null | undefined

  /**
   * Properties for the generated `figure` element.
   */
  figureProps?: PropsFromContainerDirective | Properties | null | undefined

  /**
   * Properties for the generated `figcaption` element.
   *
   * Note that `{}` in `:::image-figure[]{}` will override this.
   */
  figcaptionProps?: PropsFromContainerDirective | Properties | null | undefined

  /**
   * Properties for the other valid HTML element.
   *
   * Note that `{}` in `:::image-*[]{}` will override this.
   */
  elementProps?: PropsFromContainerDirective | Properties | null | undefined
}

export interface VideoDirectiveOptions {}

export interface LinkDirectiveOptions {
  /**
   * The alias for the `link` directive,
   * e.g., setting `'l'` matches both `:link` and `:l`.
   */
  alias?: string | string[] | null | undefined

  /**
   * Properties for the generated `a` element which contains the link.
   *
   * Note that `{}` in `:ink[]{}` will override this.
   *
   * @default
   * {className: ['rds-link']} // ('rds' short for 'remark-directive-sugar')
   */
  aProps?: PropsFromTextDirective | Properties | null | undefined

  /**
   * Properties for the generated `span` element
   * which displays avatar or the website's favicon.
   */
  spanProps?: PropsFromTextDirective | Properties | null | undefined

  /**
   * The template URL is used to fetch favicons from a remote service
   * when the `link` directive `id` is set as the URL.
   *
   * Must contain the `{domain}` placeholder, which will be replaced
   * with the actual domain name.
   *
   * @default
   * 'https://www.google.com/s2/favicons?domain={domain}&sz=128'
   *
   * @example
   * 'https://favicon.yandex.net/favicon/{domain}'
   * 'https://api.faviconkit.com/{domain}'
   */
  faviconSourceUrl?:
    | `http://${string}{domain}${string}`
    | `https://${string}{domain}${string}`
}

export interface BadgeDirectiveOptions {
  /**
   * The alias for the `badge` directive,
   * e.g., setting `'b'` matches both `:badge-*` and `:b-*`,
   * where `*` matches the key of the {@link presets} which is a badge type.
   */
  alias?: string | string[] | null | undefined

  /**
   * Properties for the generated `span` element which contains the badge.
   *
   * @default
   * {className: ['rds-badge']} // ('rds' short for 'remark-directive-sugar')
   */
  spanProps?: PropsFromTextDirective | Properties | null | undefined

  /**
   * Configurations for `:badge-*` directives.
   *
   * Each key defines a badge type (`*`) and applies a `data-badge='*'`
   * to the element for CSS styling. The value specifies the badge's details:
   *
   * - `text` (required): Default text for the badge.
   * - `props` (optional): Custom properties for the generated element. Properties are
   *   resolved in the following order (the latter overrides the former):
   *   {@link props}, `props` here, and `{}` in `:badge-*[]{}`,
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
          props?: PropsFromTextDirective | Properties | null | undefined
        }
      >
    | null
    | undefined
}

export interface RemarkDirectiveSugarOptions {
  /**
   * Configures the `image` directive.
   *
   * @see
   */
  image?: ImageDirectiveOptions
  /**
   * Configures the `video` directive.
   *
   * @see
   */
  video?: VideoDirectiveOptions
  /**
   * Configures the `link` directive.
   *
   * @see
   */
  link?: LinkDirectiveOptions
  /**
   * Configures the `badge` directive.
   *
   * @see
   */
  badge?: BadgeDirectiveOptions
}

export type ConfigOptions = Required<RemarkDirectiveSugarOptions>
