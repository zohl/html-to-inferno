const words = ['foo', 'bar', 'baz', 'qux', 'quux', 'corge', 'grault', 'garply'];

const arbitraryWord = rng => words[(rng() * words.length)|0];

const arbitraryProps = (rng, params, tagName) => {
  var props = {};
  words
   .filter(w => w != tagName)
   .slice((rng() * params.maxProps)|0)
   .forEach(w => {
     props[w] = arbitraryWord(rng);
   });

  return props;
};

const arbitraryTag = (rng, params) => {
  var name = arbitraryWord(rng, params);
  return {
    name: name
  , props: arbitraryProps(rng, params, name)
  };
};

const generate = (rng, params) => {
  var result = '';

  var tag = arbitraryTag(rng, params);
  result += '<' + tag.name;
  for (let i = 0; i < tag.props.length; ++i) {
    result += ' ' + tag.props[i].name + '="' + tag.props[i].value + '"';
  }
  result += '>';

  var n = (0.5 * (1 + rng()) * (1 + params.maxWidth))|0;

  if (0 == n || 0 == params.maxHeight) {
    result += arbitraryWord(rng);
  }
  else {
    let newParams = Object.assign({}, params, {maxHeight: params.maxHeight - 1});

    for(let i = 0; i < n; ++i) {
      result += generate(rng, newParams);
    }
  }
  result += '</' + tag.name + '>';
  return result;
};

export default generate;

