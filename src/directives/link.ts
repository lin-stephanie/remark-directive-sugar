import { createIfNeeded, processUrl, mergeProps } from '../utils.js'

import type { Directives } from 'mdast-util-directive'
import type { LinkDirectiveOptions } from '../types.js'

const customUrlRegex = /^(?:https?:\/\/)?(?:[\w-]+\.)+[a-z]{2,}(?:\/\S*)?$/
const githubAcctRegex = /^@[a-zA-Z\d](?!.*--)[\w-]{0,37}[a-zA-Z\d]$/
const githubRepoRegex = /^([a-zA-Z\d](?!.*--)[\w-]{0,37}[a-zA-Z\d])\/.*$/
const npmPkgRegex =
  /^(?=.{1,214}$)(?:@[a-z\d][a-z\d._-]*\/)?[a-z\d][a-z\d._-]*$/

const tabOrgRegex = /^org-(\w+)$/
const githubTab = new Set([
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
])
const npmTab = new Set([
  'readme',
  'code',
  'dependencies',
  'dependents',
  'versions',
])

/**
 * Handles the `link` directive.
 * Inspired by {@link https://github.com/antfu/markdown-it-magic-link markdown-it-magic-link}.
 */
export function handleLinkDirective(
  node: Directives,
  config: LinkDirectiveOptions
) {
  if (node.type === 'leafDirective')
    throw new Error(
      'Unexpected leaf directive. Use single colon (`:`) for a `link` text directive.'
    )

  if (node.type === 'containerDirective')
    throw new Error(
      'Unexpected container directive. Use single colon (`:`) for a `link` text directive.'
    )

  const defaultLinkProps = { className: ['rds-link'] }
  const { aProps, imgProps, faviconSourceUrl } = config
  const faviconUrl = faviconSourceUrl ?? 'https://api.faviconkit.com/{domain}'

  const data = (node.data ||= {})
  const attributes = node.attributes || {}
  const { children } = node

  const { id, url, img, tab, ...attrs } = attributes

  // check if the id is missing & get type
  let linkType: 'github-acct' | 'github-repo' | 'npm-pkg' | 'custom-url'
  if (!id) {
    throw new Error('Invalid `link` directive. The `id` is missing.')
  } else if (githubAcctRegex.test(id)) {
    linkType = 'github-acct'
  } else if (githubRepoRegex.test(id)) {
    linkType = 'github-repo'
  } else if (npmPkgRegex.test(id)) {
    linkType = 'npm-pkg'
  } else if (customUrlRegex.test(id)) {
    linkType = 'custom-url'
  } else {
    throw new Error('Invalid `link` directive. The `id` is invalid.')
  }

  // check if the tab is valid & get tab
  let isGithubOrg = false
  let resolvedTab = ''
  if (tab) {
    if (!githubTab.has(tab) && !npmTab.has(tab)) {
      throw new Error('Invalid `link` directive. The `tab` is invalid.')
    } else {
      const match = tabOrgRegex.exec(tab)
      isGithubOrg = Boolean(match)
      resolvedTab = match ? match[1] : tab
    }
  }

  // get text
  let resolvedText = ''
  if (children.length > 0 && children[0].type === 'text') {
    resolvedText = children[0].value
  } else {
    resolvedText =
      linkType === 'github-acct'
        ? id.slice(1)
        : linkType === 'custom-url'
          ? processUrl(id)
          : id
  }

  // get url & img
  let resolvedUrl = ''
  let resolvedImg = ''
  if (linkType === 'github-acct') {
    const acct = id.slice(1)
    resolvedUrl =
      url || tab
        ? isGithubOrg
          ? `https://github.com/orgs/${acct}/${resolvedTab}`
          : `https://github.com/${acct}?tab=${resolvedTab}`
        : `https://github.com/${acct}`

    resolvedImg = img || `https://github.com/${acct}.png`
  }

  if (linkType === 'github-repo') {
    const match = githubRepoRegex.exec(id)
    resolvedUrl = url || `https://github.com/${id}`
    resolvedImg = img || `https://github.com/${match?.[1]}.png`
  }

  if (linkType === 'npm-pkg') {
    resolvedUrl =
      url || tab
        ? `https://www.npmjs.com/package/${id}?activeTab=${resolvedTab}`
        : `https://www.npmjs.com/package/${id}`
    resolvedImg =
      img ||
      faviconUrl.replace('{domain}', new URL('https://www.npmjs.com').hostname)
  }

  if (linkType === 'custom-url') {
    resolvedUrl = url || id
    resolvedImg =
      img || faviconUrl.replace('{domain}', new URL(resolvedUrl).hostname)
  }

  // handle props
  const aProperties = createIfNeeded(aProps, node)
  const aNewProperties = mergeProps(
    { ...defaultLinkProps, ...aProperties },
    { 'data-link': linkType },
    attrs
  )
  const imgProperties = createIfNeeded(imgProps, node)

  // update node
  data.hName = 'a'
  data.hProperties = { href: resolvedUrl, ...aNewProperties }
  data.hChildren = [
    {
      type: 'element',
      tagName: 'img',
      properties: {
        src: resolvedImg,
        alt: '',
        ...imgProperties,
      },
      children: [],
    },
    {
      type: 'text',
      value: resolvedText,
    },
  ]
}
