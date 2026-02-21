module.exports = {
  title: 'Subway Builder Mod Wiki',
  tagline: 'A complete directory and guide for all Subway Builder maps and mods',
  url: 'https://subwaybuildermodded.com',
  baseUrl: '/',
  favicon: 'favicon.ico',
  organizationName: 'Subway-Builder-Modded',
  projectName: 'Subway-Builder-Modded-Docs',
  deploymentBranch: 'gh-pages',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw', // 'throw', 'warn', or 'ignore'
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'de', 'fr', 'it'],
    localeConfigs: {
      en: { label: 'English' },
      es: { label: 'Español' },
      de: { label: 'Deutsch' },
      fr: { label: 'Français' },
      it: { label: 'Italiano' },
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: 'wiki',
          sidebarPath: require.resolve('./sidebars.js'),
          showLastUpdateTime: false,
          admonitions: true,
        },
        blog: {
          routeBasePath: 'updates',
          showReadingTime: false,
          blogSidebarTitle: 'Updates',
          blogSidebarCount: 'ALL',
          blogTitle: 'Updates',
          blogDescription: 'Changlogs and release notes for the Subway Builder Mod Wiki website.',
          postsPerPage: 1,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins: [
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {
            from: ['/wiki'],
            to: '/wiki/home',
          },
        ],
      },
    ],
  ],
  themeConfig: {
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 5,
    },
    navbar: {
      title: 'Subway Builder Mod Wiki',
      logo: {
        alt: 'Subway Builder Logo',
        src: 'logo.png',
      },
      items: [
        {
          type: 'doc',
          docId: 'home',
          position: 'left',
          html: `
            <span class="wiki-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 512 512">
                <path fill="currentColor" d="M101.667 400H464V16H100.667A60.863 60.863 0 0 0 40 76.667V430.25h.011c0 .151-.011.3-.011.453c0 35.4 27.782 65.3 60.667 65.3H464V464H100.667C85.664 464 72 448.129 72 430.7c0-16.64 13.585-30.7 29.667-30.7ZM360 48.333v172.816l-48.4-42.49L264 220.9V48.333ZM232 48v216h31.641l48.075-42.659L360.305 264H392V48h40v320H136.08L136 48Zm-131.333 0H104l.076 320h-2.413A59.793 59.793 0 0 0 72 375.883V76.917A28.825 28.825 0 0 1 100.667 48Z"/>
              </svg>
              Wiki
            </span>
          `,
        },
        {
          to: 'updates',
          position: 'left',
          html: `
            <span class="updates-icon">
              <svg width="13" height="13" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M7 9v6m0-6H6c-.932 0-1.398 0-1.765.152a2 2 0 0 0-1.083 1.083C3 10.602 3 11.068 3 12s0 1.398.152 1.765a2 2 0 0 0 1.083 1.083C4.602 15 5.068 15 6 15h1l8.08 2.424c.95.285 1.424.427 1.846.677l.02.012c.42.253.77.604 1.472 1.305l.168.168c.12.12.179.179.245.226a1 1 0 0 0 .421.175c.08.013.165.013.334.013c.385 0 .578 0 .734-.052a1 1 0 0 0 .628-.628c.052-.156.052-.349.052-.734V5.414c0-.385 0-.578-.052-.734a1 1 0 0 0-.628-.628C20.164 4 19.97 4 19.586 4c-.169 0-.253 0-.334.013a1 1 0 0 0-.421.175c-.066.047-.126.107-.245.226l-.168.168c-.701.701-1.052 1.052-1.472 1.304l-.02.013c-.422.25-.897.392-1.846.677z"/>
                <path fill="currentColor" d="M8 15.5v2.546a1.954 1.954 0 0 0 3.58 1.084L13 17"/>
              </svg>
              Updates
            </span>
          `,
        },
        {
          href: 'https://github.com/Subway-Builder-Modded/Subway-Builder-Modded-Docs',
          position: 'right',
          html: `
            <img src="/assets/github.svg" width="24" height="24" style="vertical-align: middle; margin-right: 4px;" />
          `,
        },
        {
          href: 'https://discord.gg/jrNQpbytUQ',
          position: 'right',
          html: `
            <img src="/assets/discord.svg" width="24" height="24" style="vertical-align: middle; margin-right: 4px;" />
          `,
        },
        {
          href: 'https://subwaybuilder.com',
          position: 'right',
          html: `
            <img src="/assets/subway-builder.svg" width="20" height="20" style="vertical-align: middle; margin-right: 4px;" />
          `,
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      links: [
        {
          title: 'Pages',
          items: [
            {
              html: `
                <a href="/wiki/home" class="wiki-icon" style="display: inline-flex; align-items: center; gap: 4px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 512 512">
                    <path fill="currentColor" d="M101.667 400H464V16H100.667A60.863 60.863 0 0 0 40 76.667V430.25h.011c0 .151-.011.3-.011.453c0 35.4 27.782 65.3 60.667 65.3H464V464H100.667C85.664 464 72 448.129 72 430.7c0-16.64 13.585-30.7 29.667-30.7ZM360 48.333v172.816l-48.4-42.49L264 220.9V48.333ZM232 48v216h31.641l48.075-42.659L360.305 264H392V48h40v320H136.08L136 48Zm-131.333 0H104l.076 320h-2.413A59.793 59.793 0 0 0 72 375.883V76.917A28.825 28.825 0 0 1 100.667 48Z"/>
                  </svg>
                  Wiki
                </a>
              `,
            },
            {
              html: `
                <a href="/updates" class="updates-icon" style="display: inline-flex; align-items: center; gap: 4px;">
                  <svg width="13" height="13" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M7 9v6m0-6H6c-.932 0-1.398 0-1.765.152a2 2 0 0 0-1.083 1.083C3 10.602 3 11.068 3 12s0 1.398.152 1.765a2 2 0 0 0 1.083 1.083C4.602 15 5.068 15 6 15h1l8.08 2.424c.95.285 1.424.427 1.846.677l.02.012c.42.253.77.604 1.472 1.305l.168.168c.12.12.179.179.245.226a1 1 0 0 0 .421.175c.08.013.165.013.334.013c.385 0 .578 0 .734-.052a1 1 0 0 0 .628-.628c.052-.156.052-.349.052-.734V5.414c0-.385 0-.578-.052-.734a1 1 0 0 0-.628-.628C20.164 4 19.97 4 19.586 4c-.169 0-.253 0-.334.013a1 1 0 0 0-.421.175c-.066.047-.126.107-.245.226l-.168.168c-.701.701-1.052 1.052-1.472 1.304l-.02.013c-.422.25-.897.392-1.846.677z"/>
                    <path fill="currentColor" d="M8 15.5v2.546a1.954 1.954 0 0 0 3.58 1.084L13 17"/>
                  </svg>
                  Updates
                </a>
              `,
            },
          ],
        },
        {
          title: 'Other Links',
          items: [
            {
              html: `
                <a href="https://discord.gg/jrNQpbytUQ" class="footer-links" style="display: inline-flex; align-items: center; gap: 4px;">
                  <img src="/assets/discord.svg" width="14" height="14" style="vertical-align: middle; margin-right: 4px;" />
                  Discord
                </a>
              `,
            },
            {
              html: `
                <a href="https://github.com/Subway-Builder-Modded/Subway-Builder-Modded-Docs" class="footer-links" style="display: inline-flex; align-items: center; gap: 4px;">
                  <img src="/assets/github.svg" width="14" height="14" style="vertical-align: middle; margin-right: 4px;" />
                  GitHub
                </a>
              `,
            },
            {
              html: `
                <a href="https://subwaybuilder.com" class="footer-links" style="display: inline-flex; align-items: center; gap: 4px;">
                  <img src="/assets/subway-builder.svg" width="12" height="12" style="vertical-align: middle; margin-right: 4px;" />
                  Subway Builder
                </a>
              `,
            },
          ],
        },
      ],
      copyright: `© Subway Builder Mod Wiki ${new Date().getFullYear()}`,
    },
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
    },
  },
};
