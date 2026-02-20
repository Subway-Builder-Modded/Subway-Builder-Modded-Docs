module.exports = {
  title: 'Subway Builder Mod Wiki',
  tagline: 'A complete directory and guide for all Subway Builder maps and mods',
  url: 'https://subwaybuildermodded.com',
  baseUrl: '/',
  favicon: 'favicon.ico',
  organizationName: 'Subway-Builder-Modded',
  projectName: 'Subway-Builder-Modded-Docs',
  deploymentBranch: 'gh-pages',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
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
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: 'docs',
          showLastUpdateTime: false,
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  themeConfig: {
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
                <path d="M101.667 400H464V16H100.667A60.863 60.863 0 0 0 40 76.667V430.25h.011c0 .151-.011.3-.011.453c0 35.4 27.782 65.3 60.667 65.3H464V464H100.667C85.664 464 72 448.129 72 430.7c0-16.64 13.585-30.7 29.667-30.7ZM360 48.333v172.816l-48.4-42.49L264 220.9V48.333ZM232 48v216h31.641l48.075-42.659L360.305 264H392V48h40v320H136.08L136 48Zm-131.333 0H104l.076 320h-2.413A59.793 59.793 0 0 0 72 375.883V76.917A28.825 28.825 0 0 1 100.667 48Z"/>
              </svg>
              Wiki
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
      /*links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/Subway-Builder-Modded/Subway-Builder-Modded-Docs',
            },
          ],
        },
      ],*/
      copyright: `© Subway Builder Mod Wiki ${new Date().getFullYear()}`,
    },
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
    },
  },
};
