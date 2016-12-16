const mapping = {
  'class': 'className' 
, 'for': 'htmlFor'
};

const toCamelCase = name => name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const toReactName = name => name;
//(undefined !== mapping[name])
//  ? mapping[name]
//  : name;
//  : (name.startsWith('data-') || name.startsWith('aria-'))
//    ? name
//    : toCamelCase(name);

export default toReactName;
