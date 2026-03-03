module.exports = {
  title: "Subway Builder Modded",
  tagline: "A complete directory and guide for all Subway Builder maps and mods",
  url: "https://subwaybuildermodded.com",
  baseUrl: "/",
  favicon: "favicon.ico",
  organizationName: "Subway-Builder-Modded",
  projectName: "Subway-Builder-Modded-Docs",
  deploymentBranch: "gh-pages",
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "throw", // 'throw', 'warn', or 'ignore'
    },
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en", "es-ES", "fr-FR", "it-IT", "de-DE"],
    localeConfigs: {
      en: {
        label: "English",
        htmlLang: "en-US",
      },
      "es-ES": {
        label: "Español",
        htmlLang: "es-ES",
      },
      "fr-FR": {
        label: "Français",
        htmlLang: "fr-FR",
      },
      "it-IT": {
        label: "Italiano",
        htmlLang: "it-IT",
      },
      "de-DE": {
        label: "Deutsch",
        htmlLang: "de-DE",
      },
    },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          routeBasePath: "wiki",
          sidebarPath: require.resolve("./sidebars/wiki.js"),
          admonitions: true,
        },
        theme: {
          customCss: require.resolve("./src/css/global.css"),
        },
      },
    ],
  ],
  plugins: [
    [
      "@docusaurus/plugin-client-redirects",
      {
        redirects: [
          {
            from: ["/wiki"],
            to: "/wiki/home",
          },
          {
            from: ["/modding-docs", "/modding-docs/template-mod/getting-started"],
            to: "/wiki/template-mod/getting-started",
          },
          {
            from: ["/modding-docs/creating-maps/making-custom-maps"],
            to: "/wiki/creating-custom-maps/making-custom-maps",
          }
        ],
      },
    ],
  ],
  themeConfig: {
    metadata: [
      { name: "description", content: "A complete hub for Subway Builder maps, mods, and guides" },
      { name: "og:image", content: "/logo.png" },
      { name: "twitter:image", content: "/logo.png" },
    ],
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 5,
    },
    navbar: {
      title: "Subway Builder Modded",
      logo: {
        alt: "Subway Builder Logo",
        src: "logo.png",
      },
      items: [
        {
          type: "doc",
          docId: "home",
          position: "left",
          label: "Wiki",
        },
        {
          type: "doc",
          docId: "template-mod/getting-started",
          position: "left",
          label: "Template Mod",
        },
        {
          to: "updates",
          position: "left",
          label: "Updates",
        },
        {
          to: "credits",
          position: "left",
          label: "Credits",
        },
        {
          href: "https://github.com/Subway-Builder-Modded/Subway-Builder-Modded-Docs",
          position: "right",
          html: `
            <a class="navbar-icon-link" href="https://github.com/Subway-Builder-Modded/Subway-Builder-Modded-Docs">
              <img src="/assets/github.svg" width="24" height="24" />
            </a>
          `,
        },
        {
          href: "https://discord.gg/jrNQpbytUQ",
          position: "right",
          html: `
            <a class="navbar-icon-link" href="https://discord.gg/jrNQpbytUQ">
              <img src="/assets/discord.svg" width="24" height="24" />
            </a>
          `,
        },
        {
          href: "https://subwaybuilder.com",
          position: "right",
          html: `
            <a class="navbar-icon-link" href="https://subwaybuilder.com">
              <img src="/assets/subway-builder.svg" width="20" height="20" />
            </a>
          `,
        },
        {
          type: "localeDropdown",
          position: "right",
        },
      ],
    },
    algolia: {
      appId: "DV5CJOSPH9",
      apiKey: "3aa7006d94c5b0971cac9aea2940b53f",
      indexName: "Subway Builder Modded",
      contextualSearch: true,
    },
    footer: {
      links: [
        {
          title: "Pages",
          items: [
            {
              label: "Wiki",
              to: "/wiki/home",
            },
            {
              label: "Template Mod",
              to: "/wiki/template-mod/getting-started",
            },
            {
              label: "Updates",
              to: "/updates",
            },
            {
              label: "Credits",
              to: "/credits",
            },
          ],
        },
        {
          title: "Other Links",
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
      copyright: `© Subway Builder Modded ${new Date().getFullYear()}. Not affiliated with Subway Builder or Redistricter, LLC. All content is community-created and shared under appropriate licenses.`,
    },
    colorMode: {
      defaultMode: "dark",
      disableSwitch: false,
    },
  },
};
