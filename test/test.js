import assert from 'assert';
import {renderToString} from 'inferno-server';
import createFromHTML from '../src/index';
import generate from './random-html';
import seedrandom from 'seedrandom';


describe('createFromHTML', () => {

  it('works with simple examples', () => {
    const roundTrip = s => assert.equal(s, renderToString(createFromHTML(s)));

    roundTrip('<div>foo</div>');

    roundTrip(`
      <div>
        <p>bar</p>
      </div>
    `.trim());

    roundTrip(`
      <div>
        <p>baz</p>
        <p>qux</p>
        <p>quux</p>
      </div>
    `.trim());
  });


  it('works with multiple nodes', () => {
    const roundTrip = s => assert.equal(s
      , createFromHTML(s, {multipleNodes: true})
        .map(x => (typeof x == 'string') ? x : renderToString(x))
        .join(''));

    roundTrip('<div>foo</div><div>bar</div>');

    roundTrip(`
      <p>baz</p>
      <p>qux</p>
      <p>quux</p>
    `.trim());
  });
  

  it('works on randomly generated nodes', () => {

    const roundTrip = params => {
      var seed = Math.random();
      console.log('Seed: ' + seed);

      var html = generate(seedrandom(seed), params);

      assert.equal(html
      , createFromHTML(html, {multipleNodes: true})
        .map(renderToString)
        .join(''));
    };

    roundTrip({maxWidth: 4, maxHeight: 2, maxProps: 3});
    roundTrip({maxWidth: 2, maxHeight: 4, maxProps: 3});
    roundTrip({maxWidth: 3, maxHeight: 3, maxProps: 3});
  });


  it('works with preprocessor', () => {

    const roundTrip = (stringTransform, nodeTransform) => {
      var seed = Math.random();
      console.log('Seed: ' + seed);

      var html = generate(seedrandom(seed), {maxWidth: 2, maxHeight: 2, maxProps: 3});

      assert.equal(stringTransform(html)
      , createFromHTML(html, {multipleNodes: true, preprocess: nodeTransform})
        .map(renderToString)
        .join(''));
    };

    roundTrip(
      s => s.replace(/<[a-z]+/g, '<foo').replace(/<\/[a-z]+>/g, '</foo>')
    , n => ({name: 'foo', props: n.props, children: n.children})
    );
  });
});

