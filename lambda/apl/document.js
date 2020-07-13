module.exports = (options = {}) => {
  return {
    type: 'APL',
    version: '1.3',
    settings: {
      idleTimeout: 300000
    },
    theme: 'dark',
    import: [
      {
        name: 'apl-analyzer',
        version: '1.0.0',
        source: options.source || 'https://www.alexandermartin.dev/apl-analyzer/document.json'
      }
    ],
    resources: [],
    styles: {},
    onMount: [],
    graphics: {},
    commands: {},
    layouts: {},
    mainTemplate: {
      item: {
        type: 'Analyzer'
      }
    }
  };
};
