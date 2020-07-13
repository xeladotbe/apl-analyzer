const YAML = require('yaml');
const glob = require('glob');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const _ = require('lodash');
const sorty = require('sorty');
const document = require('./document.json');

const files = glob.sync('**/*.yml');

const build = (belongsTo, specifications) => {
  const nodes = _.filter(specifications, { belongsTo }).map(node => {
    const children = build(node.name, specifications);

    if (!!children && !!children.length) {
      node.children = node.children || [];
      node.children.push(...children.map(child => {
        if ('children' in child || 'specification' in child) {
          return { ...child };
        }

        return child;        
      }));
    }

    return node;
  });
  
  sorty([{
    name: 'position',
    type: 'number',
    dir: 'asc'
  },  {
    name: 'name',
    dir: 'asc'
  }], nodes);

  return nodes;
};

const element = (item, parent = {}, options = {}) => {
  if ('children' in item || 'specification' in item) {
    return {
      type: 'Link',
      label: item.name,
      minimumVersion: item.minimumVersion || parent.minimumVersion,
      documentation: item.documentation || parent.documentation,
      page: (options.items || []).filter(item => item.type === 'Link').length + 1,
      description: item.description
    };
  } else if ('value' in item) {
    const result = {
      type: 'Option',
      label: item.name,
      documentation: item.documentation,
      description: item.description,
      value: item.value
    };

    if ('values' in item) {
      result.values = item.values.map(value => ({ minimumVersion: item.minimumVersion || parent.minimumVersion, ...value }));
    }

    return result;
  }

  const result = {
    type: 'Option',
    label: item.name,
    description: item.description,
    documentation: item.documentation,
    minimumVersion: item.minimumVersion || parent.minimumVersion,
    isAvailable: item.expression || `\${@APL_VERSION >= '${item.minimumVersion || parent.minimumVersion}'}`
  };

  if ('values' in item) {
    result.values = item.values.map(value => ({ minimumVersion: item.minimumVersion || parent.minimumVersion, ...value }));
  }

  return result;
};

const specification = (specs, parent = {}, options = {}) => {
  const items = [];

  try {
    if ('properties' in specs) {
      sorty([{
        name: 'name',
        dir: 'asc'
      }], specs.properties);

      items.push(...specs.properties.map(property => element(property, parent, options)));
    }

    if ('functions' in specs) {
      sorty([{
        name: 'name',
        dir: 'asc'
      }], specs.functions);

      items.push(...specs.functions.map(func => element(func, parent, options)));
    }

    if ('groups' in specs) {
      items.push(...specs.groups.map(group => {
        return {
          type: 'Group',
          label: group.name,
          items: separator(specification(group.specification, { ...parent, ...group }, options))
        };
      }));
    }

    if ('sections' in specs) {
      items.push(...specs.sections.map(section => {
        return {
          type: 'Section',
          label: section.name,
          items: separator(specification(section.specification, { ...parent, ...section }, options))
        };
      }));
    }
  } catch (e) {
    console.log(e);
    console.log(specs);
  }

  return items;
};

const ids = [];

const separator = items => {
  return items.reduce((items, item) => {
    if (!!items.length && ['Group'].indexOf(item.type) === -1) {
      items.push({
        type: 'Separator'
      });
    }

    return items.concat({
      ...item,
      hasPrecedingSibling: !!items.length
    });
  }, []);
}

const iterator = (items = [], parent = {}, options = {}) => {
  try {
    const pagerLayout = _.isArray(items) && !!_.find(items, item => {
      return 'specification' in item || 'children' in item;
    });

    const fragment = {
      type: 'Layout',
      headline: parent.name || 'APL Analyzer',
      componentId: options.pagerId,
      items: separator(_.isArray(items) && items.reduce((items, item) => {
        return items.concat(element(item, parent, { ...options, items }));
      }, []) || specification(items, parent, options))
    };
  
    if (pagerLayout) {
      let id = undefined;

      do {
        id = (Math.random() + 1).toString(36).substring(7);
  
        break;
      } while (ids.indexOf(id) === -1);
  
      ids.push(id);

      fragment.items.forEach(item => {
        if (item.type === 'Link' && !!!item.componentId) {
          item.componentId = id;
        }
      });

      return {
        type: 'Pager',
        navigation: 'none',
        id: id,
        width: '100%',
        height: '100%',
        items: [fragment].concat(...items.filter(item => 'specification' in item || 'children' in item).map(item => iterator(item.children || item.specification, item, { pagerId: id })))
      };
    }
    
    return fragment;
  } catch (e) {
    console.log(e);
    console.log(items);
  }
};

const specs = build(undefined, files.reduce((values, file) => {
  return values.concat(_.defaultsDeep(YAML.parse(fs.readFileSync(file, 'utf8')), {
    position: Number.MAX_SAFE_INTEGER,
    belongsTo: undefined
  }));
}, []));

_.set(document, 'layouts.Analyzer.item', iterator(specs));

const x = mkdirp.sync(path.join(__dirname, '../skill-package/apl/dist'));

fs.writeFileSync(path.join(__dirname, '../skill-package/apl/dist/document.json'), JSON.stringify(document), {
  encoding: 'utf8'
});