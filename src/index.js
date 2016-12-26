import {Parser} from 'htmlparser2';
import createElement from 'inferno-create-element';

const id = x => x;
const compose = (f, g) => x => f(g(x));
const coalesce = (v1, v2) => (undefined !== v1) ? v1 : v2;


/**
   Intermediary representation of an HTML node.
   @name node
   @property {string} name - Tag name.
   @property {Object} props - Dictionary of attributes and theirs values.
   @property {(VNode|string)[]} children - Array of already processed nodes.
 */


/** Node preprocessor
   @name preprocessor
   @function
   @arg {node}
   @returns {node}
 */

/** Parse string of html tags and create VNodes using Inferno's
   `createElement`.
   @arg {string} s - HTML text to parse. 

   @arg {Object} userParams - User-provided parameters to alter result.

   @arg {boolean} userParams.multipleNodes - If true, do not throw exceptions
   when number of resulting nodes differs from one, return array of nodes
   instead.

   @arg {preprocessor} userParams.preprocess - Function to apply to nodes
   before passing them to `createElement`.

   @arg {Object} userParams.parserParams - Parameters to `htmlparser2`. See
   https://github.com/fb55/htmlparser2/wiki/Parser-options for reference.

   @returns {Object|(Object[])} - VNode(s)
 */
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

