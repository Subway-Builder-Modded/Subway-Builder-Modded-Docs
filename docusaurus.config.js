// docusaurus.config.js
module.exports = {
  title: 'Subway Builder Modded Docs',
  tagline: 'All your mods and maps in one place',
  url: 'https://subwaybuildermodded.com',
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  organizationName: 'Subway-Builder-Modded', // GitHub org/user
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
          editUrl:
            'https://github.com/Subway-Builder-Modded/Subway-Builder-Modded-Docs/edit/main/',
          routeBasePath: 'docs',
          showLastUpdateTime: true,
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
      title: 'Subway Builder Docs',
      logo: {
        alt: 'Subway Builder Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/Subway-Builder-Modded/Subway-Builder-Modded-Docs',
          label: 'GitHub',
          position: 'right',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
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
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Subway Builder Modded`,
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
    },
  },
};
