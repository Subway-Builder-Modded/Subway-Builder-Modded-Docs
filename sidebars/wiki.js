module.exports = {
  docs: [
    'home',
    {
      type: 'category',
      label: 'Railyard',
      link: { type: 'doc', id: 'railyard/railyard-index' },
      items: [
        {
          type: 'category',
          label: 'Developers',
          link: { type: 'doc', id: 'railyard/developers/railyard-developers-index' },
          items: [
            'railyard/developers/publishing-projects',
            'railyard/developers/publishing-map-packs',
          ],
        },
        {
          type: 'category',
          label: 'Players',
          link: { type: 'doc', id: 'railyard/players/railyard-players-index' },
          items: [],
        },
      ],
    },
    {
      type: 'category',
      label: 'Creating Custom Maps',
      link: { type: 'doc', id: 'creating-custom-maps/creating-custom-maps-index' },
      items: [
        'creating-custom-maps/making-custom-maps',
        'creating-custom-maps/optional-features',
      ],
    },
    {
      type: 'category',
      label: 'Template Mod',
      link: { type: 'doc', id: 'template-mod/template-mod-index' },
      items: [
        'template-mod/getting-started',
        'template-mod/project-structure',
        'template-mod/common-patterns',
        'template-mod/react-components',
        'template-mod/debugging',
        'template-mod/type-reference',
      ],
    },
    {
      type: 'category',
      label: 'Contributing',
      link: { type: 'doc', id: 'contributing/contributing-index' },
      items: [
        'contributing/translating',
        'contributing/contributing-documentation-content',
      ],
    },
    {
      type: 'category',
      label: 'Legacy',
      link: { type: 'doc', id: 'legacy/legacy-index' },
      items: [
        'legacy/map-directory',
        'legacy/map-installation-guide',
        'legacy/legacy-map-installation-guide',
        'legacy/troubleshooting',
      ],
    },
  ],
};
