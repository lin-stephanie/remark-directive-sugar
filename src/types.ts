import { Properties } from 'hast'
import {
  ContainerDirective,
  LeafDirective,
  TextDirective,
} from 'mdast-util-directive'

export interface BadgePreset {
  /**
   * The default text for this badge type.
   */
  text: string

  /**
   * The icon for this badge type, which must be a string in SVG element format.
   *
   * @description
   * You can check the icon sets on {@link https://icon-sets.iconify.design/ Iconify}.
   * If unset, this badge type will not display an icon,
   * even if {@link RemarkDirectiveSugarOptions.showIcon} is true.
   *
   * @example
   * '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 6L9 17l-5-5"/></svg>'
   *
   */
  // icon?: string

  /**
   * The color(s) for this badge type, which must be a
   * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#syntax `<color>`}
   * type string.
   *
   * @description
   * For new callout types, if unset, the default color
   * will be `RemarkDirectiveSugarOptions.badge.defaultColor`.
   *
   * @example
   * 'rgb(8, 109, 221)': Suitable for both light and dark themes.
   * '#E9D66B|#fbf8cc': First color for light theme, second for dark theme.
   */
  color?: string
}

/**
 * Create props for an HTML element based on a container directive node.
 */
export type PropsFromContainerDirective = (
  node: ContainerDirective
) => Properties | null | undefined

/**
 * Create props for an HTML element based on a leaf directive node.
 */
export type PropsFromLeftDirective = (
  node: LeafDirective
) => Properties | null | undefined

/**
 * Create props for an HTML element based on a text directive node.
 */
export type PropsFromTextDirective = (
  node: TextDirective
) => Properties | null | undefined

export type ImageDirectiveOptions = {
  /**
   * The alias for the `image` directive,
   * e.g., setting `'img'` matches both `:::image-*` and `:::img-*`,
   * where `*` remains the same and must be a valid HTML tag.
   */
  alias?: string | string[] | null | undefined

  /**
   * Properties to add to the `img` element.
   */
  imgProps?: PropsFromContainerDirective | Properties | null | undefined

  /**
   * Properties to add to the `figure` element.
   */
  figureProps?: PropsFromContainerDirective | Properties | null | undefined

  /**
   * Properties to add to the `figcaption` element.
   * Note that `{}` in `:::image-figure[]{}` will override this.
   */
  figcaptionProps?: PropsFromContainerDirective | Properties | null | undefined

  /**
   * Properties to add to other valid HTML elements.
   * Note that `{}` in `:::image-*[]{}` will override this.
   */
  elementProps?: PropsFromContainerDirective | Properties | null | undefined
}

export interface RemarkDirectiveSugarOptions<T> {
  /**
   * Prefix for the class names.
   *
   * @default 'directive-sugar'
   */
  classPrefix?: string
  /**
   * Configures the `image` directive.
   */
  image?: ImageDirectiveOptions
  video?: {
    // alias: string
    // iframeProps: ProProperties
  }
  link?: {
    // alias: string
  }
  badge?: {
    // alias: string
    preset: T
    defaultColor: string
  }
}

export type BadgesPreset = Record<string, BadgePreset>
export type UserOptions = RemarkDirectiveSugarOptions<BadgesPreset>
export type ConfigOptions = Required<RemarkDirectiveSugarOptions<BadgesPreset>>
