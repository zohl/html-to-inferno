# html-to-inferno

## Description
A small library to convert HTML into Inferno's VNodes.

## Status
The library is under development. API might vary a little bit.

## Example
```javascript
import createFromHTML from 'html-to-inferno';

createFromHTML('<div>hello!</div>'); // yields single VNode

createFromHTML(
  '<div>hello</div><div>world!</div>'
, {multipleNodes: true}
); // yields array of two VNodes

createFromHTML(
  '<div>hello</div>'
, {preprocess: n => ({name: 'p', props: n.props, children: n.children})
); // yields p-VNode instead of div-VNode
```

## See also
- [[Live demo](TODO)]
- [[Documentation](TODO)]

