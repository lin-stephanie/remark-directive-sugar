**Example 1**: `:link[Astro]{#withastro/astro}` or `:link[Astro]{id=withastro/astro}` creates a link to :link[Astro]{#withastro/astro} repo.

**Example 2**: `:link[Stephanie Lin]{#@lin-stephanie}` links to the GitHub profile of the project maintainer, :link[Stephanie Lin]{#@lin-stephanie}.

**Example 3**: `:link[Vite]{id=@vitejs}` links to the GitHub profile of the :link[Vite]{id=@vitejs} organization.

**Example 4**: `:link{#@lin-stephanie tab=repositories}` links directly to the repositories tab of the GitHub user, like :link{#@lin-stephanie tab=repositories}. For GitHub users, valid `tab` options: `'repositories','projects', 'packages', 'stars', 'sponsoring', 'sponsors'`.

**Example 5**: `:link{#@vitejs tab=org-people}` links directly to the people section of a GitHub organization, like :link{#@vitejs tab=org-people} For GitHub organizations, valid `tab` options: `'org-repositories', 'org-projects', 'org-packages', 'org-sponsoring', and 'org-people'`.

**Example 6**: `:link[Google]{id=https://www.google.com/}` creates an external link to the :link[Google]{id=https://www.google.com/}.

**Example 7**: `:link[Astro]{#withastro/astro .rds-link-rounded}` creates a rounded button like :link[Astro]{#withastro/astro class='rds-link-rounded'}.

**Example 8**: `:link[Vite]{id=@vitejs class=rds-link-square}` creates a square button like :link[Vite]{id=@vitejs class=rds-link-square}.

**Example 9**: `:link{#lin-stephanie/astro-antfustyle-theme className=rds-link-github}` creates a GitHub-styled link like:

:link{#lin-stephanie/astro-antfustyle-theme class=rds-link-github}

**Example 10**: `:link{#remark-directive-sugar}` creates a npm-styled link like:

:link{#remark-directive-sugar}

**Example 11**: `:link[send a little encouragement my way ❤️]{id=https://github.com/sponsors/lin-stephanie img=https://github.githubassets.com/assets/mona-e50f14d05e4b.png}` fully customizes a link.

Thanks for making it this far! Writing is no easy task --- maybe you'd like to :link[send a little encouragement my way ❤️]{id=https://github.com/sponsors/lin-stephanie img=https://github.githubassets.com/assets/mona-e50f14d05e4b.png}.
