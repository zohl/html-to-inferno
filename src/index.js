import {Parser} from 'htmlparser2';
import createElement from 'inferno-create-element';


// Parse string of html tags and create VNodes using Inferno's `createElement`.
// 
// userParams accepted keys:
// 
// - multipleNodes: bool
//   Return array of elements when true, otherwise return single element or
//   throw exception when number of elements differs from 1. 
//
// - preprocess: node -> node
//   Use custom function to transform node before it is passed to
//   `createElement`. The transformation happens before transforming attribute
//   names. `node` has the following type:
//   - name: string, tag name
//   - props: dictionary, result of execution `htmlparser2` against the text
//   - children: array of strings and/or Inferno's components.
//
// - parserParams: object
//   Pass parameters to `htmlparser2`. See
//   https://github.com/fb55/htmlparser2/wiki/Parser-options for reference.

const id = x => x;
const compose = (f, g) => x => f(g(x));
const coalesce = (v1, v2) => (undefined !== v1) ? v1 : v2;

const createFromHTML = (s, userParams) => {

  if (!userParams) {
    userParams = {};
  }

  var params = {
    multipleNodes: coalesce(userParams.multipleNodes, false)
  , preprocess:    coalesce(userParams.preprocess, id)
  , parserParams:  Object.assign({decodeEntities: true}, coalesce(userParams.parserParams, {}))
  };

  var preprocess = compose(
    n => createElement(n.name, n.props, n.children)
  , params.preprocess
  );

  var result = [];
  var stack = [];
  var node = null;

  var parser = new Parser({
    onopentag: (name, attribs) => {
      if (node) {
        stack.push(node);
      }

      node = {
        name: name
      , props: attribs
      , children: []
      };
    }

  , onclosetag: name => {
      if (!node) {
        throw new Error(
          'Encountered closing tag "' + name + '" without opening one');
      }

      if (node.name != name) {
        throw new Error(
          'Closing tag "' + name + '" is mismatched with opening one "' + node.name + '"');
      }

      if (!stack.length) {
        result.push(preprocess(node));
        node = null;
      }
      else {
        let parent = stack.pop();
        parent.children.push(preprocess(node));
        node = parent;
      }
    }

  , ontext: text => {
      if (!node) {
        result.push(text);
      }
      else {
        node.children.push(text);
      }
    }
  }, params.parserParams);

  parser.write(s);
  parser.end();


  if (userParams && userParams.multipleNodes) {
    return result;
  }
  else {
    if (1 != result.length) {
      throw new Error(
        'Expected single node, got ' + (result.length));
    }
    return result[0];
  }
};

export default createFromHTML;

