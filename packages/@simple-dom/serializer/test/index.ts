import { moduleWithDocument } from '@simple-dom/dom-test-helper';
import { InsertPosition, Namespace } from '@simple-dom/interface';
import Serializer, { WHITESPACE_TRIM_VALS } from '@simple-dom/serializer';
import voidMap from '@simple-dom/void-map';

moduleWithDocument('Serializer', (helper, hooks) => {

  let serializer: Serializer;

  hooks.beforeEach(() => {
    serializer = new Serializer(voidMap);
  });

  hooks.afterEach(() => {
    serializer = undefined as any;
  });

  QUnit.test('serializes single element correctly', (assert) => {
    const { element } = helper;
    const actual = serializer.serialize(element('div'));
    assert.equal(actual, '<div></div>');
  });

  QUnit.test('serializes single element correctly preserves whitespace if trimWhitespace is not set', (assert) => {
    const { element, text } = helper;
    const actual = serializer.serialize(element('div', undefined, text('         ')));
    assert.equal(actual, '<div>         </div>');
  });

  QUnit.test('serializes single element correctly and trims left whitespace if trimWhitespace is LEFT', (assert) => {
    serializer = new Serializer(voidMap, {
      trimWhitespace: WHITESPACE_TRIM_VALS.LEFT,
    });
    const { element, text } = helper;
    const actual = serializer.serialize(element('div', undefined, text('    a     ')));
    assert.equal(actual, '<div>a     </div>');
  });

  QUnit.test('serializes single element correctly and trims right whitespace if trimWhitespace is RIGHT', (assert) => {
    serializer = new Serializer(voidMap, {
      trimWhitespace: WHITESPACE_TRIM_VALS.RIGHT,
    });
    const { element, text } = helper;
    const actual = serializer.serialize(element('div', undefined, text('    a     ')));
    assert.equal(actual, '<div>    a</div>');
  });

  QUnit.test('serializes single element correctly and trims all whitespace if trimWhitespace is ALL', (assert) => {
    serializer = new Serializer(voidMap, {
      trimWhitespace: WHITESPACE_TRIM_VALS.ALL,
    });
    const { element, text } = helper;
    const actual = serializer.serialize(element('div', undefined, text('    a     ')));
    assert.equal(actual, '<div>a</div>');
  });

  QUnit.test('serializes element with attribute number value correctly', (assert) => {
    const { element } = helper;
    const actual = serializer.serialize(element('div', {
      height: 500,
    }));
    assert.equal(actual, '<div height="500"></div>');
  });

  QUnit.test('serializes single void element correctly', (assert) => {
    const { element } = helper;
    const actual = serializer.serialize(element('img', { src: 'foo' }));
    assert.equal(actual, '<img src="foo">');
  });

  QUnit.test('serializes complex tree correctly', (assert) => {
    const { element, fragment, text } = helper;
    const actual = serializer.serialize(fragment(
      element('div', { id: 'foo' },
        element('b', {},
          text('Foo & Bar'),
        ),
        text('!'),
        element('img', { src: 'foo' }),
      ),
    ));
    assert.equal(actual, '<div id="foo"><b>Foo &amp; Bar</b>!<img src="foo"></div>');
  });

  QUnit.test('serializes complex tree correctly, removing left whitespace if trimWhitespace is LEFT', (assert) => {
    serializer = new Serializer(voidMap, {
      trimWhitespace: WHITESPACE_TRIM_VALS.LEFT,
    });
    const { element, fragment, text } = helper;
    const actual = serializer.serialize(fragment(
      element('div', { id: 'foo' },
        element('b', {},
          text('  Foo & Bar   '),
        ),
        text('  !   '),
        element('img', { src: 'foo' }),
      ),
    ));
    assert.equal(actual, '<div id="foo"><b>Foo &amp; Bar   </b>!   <img src="foo"></div>');
  });

  QUnit.test('serializes complex tree correctly, removing right whitespace if trimWhitespace is RIGHT', (assert) => {
    serializer = new Serializer(voidMap, {
      trimWhitespace: WHITESPACE_TRIM_VALS.RIGHT,
    });
    const { element, fragment, text } = helper;
    const actual = serializer.serialize(fragment(
      element('div', { id: 'foo' },
        element('b', {},
          text('  Foo & Bar   '),
        ),
        text('  !   '),
        element('img', { src: 'foo' }),
      ),
    ));
    assert.equal(actual, '<div id="foo"><b>  Foo &amp; Bar</b>  !<img src="foo"></div>');
  });

  QUnit.test('serializes complex tree correctly, removing all whitespace if trimWhitespace is ALL', (assert) => {
    serializer = new Serializer(voidMap, {
      trimWhitespace: WHITESPACE_TRIM_VALS.ALL,
    });
    const { element, fragment, text } = helper;
    const actual = serializer.serialize(fragment(
      element('div', { id: 'foo' },
        element('b', {},
          text('  Foo & Bar   '),
        ),
        text('  !   '),
        element('img', { src: 'foo' }),
      ),
    ));
    assert.equal(actual, '<div id="foo"><b>Foo &amp; Bar</b>!<img src="foo"></div>');
  });

  QUnit.test('does not serialize siblings of an element', (assert) => {
    const { element } = helper;
    const htmlEl = element('html');
    const head = element('head');
    const body = element('body');

    head.appendChild(element('meta', { content: 'foo' }));
    head.appendChild(element('meta', { content: 'bar' }));

    htmlEl.appendChild(head);
    htmlEl.appendChild(body);

    let actual = serializer.serialize(head);
    assert.equal(actual, '<head><meta content="foo"><meta content="bar"></head>');

    actual = serializer.serialize(body);
    assert.equal(actual, '<body></body>');
  });

  QUnit.test('serializes children but not self', (assert) => {
    const { element, fragment, text } = helper;
    const actual = serializer.serializeChildren(fragment(
      element('div', { id: 'foo' },
        element('b', {},
          text('Foo & Bar')),
        text('!'),
        element('img', { src: 'foo' }))).firstChild!);
    assert.equal(actual, '<b>Foo &amp; Bar</b>!<img src="foo">');
  });

  QUnit.test('serializes raw HTML', (assert) => {
    const { element, fragment, text } = helper;
    let actual = serializer.serialize(fragment(
      element('div', { id: 'foo' },
        text('<p></p>'))));

    assert.equal(actual, '<div id="foo">&lt;p&gt;&lt;/p&gt;</div>');

    const el = element('div', { id: 'foo' });

    // Chrome requires parent to be an element
    const parent = element('div', undefined, el);

    // serializes a raw
    el.insertAdjacentHTML(InsertPosition.beforebegin, '<p>beforebegin</p>');
    el.insertAdjacentHTML(InsertPosition.afterbegin, '<p>afterbegin</p>');
    el.insertAdjacentHTML(InsertPosition.beforeend, '<p>beforeend</p>');
    el.insertAdjacentHTML(InsertPosition.afterend, '<p>afterend</p>');

    actual = serializer.serializeChildren(parent);

    assert.equal(actual, '<p>beforebegin</p><div id="foo"><p>afterbegin</p><p>beforeend</p></div><p>afterend</p>');
  });

  QUnit.test('svg preserves case', (assert) => {
    const { document } = helper;
    const svg = document.createElementNS(Namespace.SVG, 'linearGradient');

    assert.equal(serializer.serialize(svg), '<linearGradient></linearGradient>');
  });

  QUnit.test('it serializes comments if stripComments is not set', (assert) => {
    const { comment } = helper;
    const commentVal = 'This is a comment';
    const actual = serializer.comment(comment(commentVal));
    const expected = `<!--${commentVal}-->`;

    assert.equal(actual, expected);
  });

  QUnit.test('it returns an empty string for comments if stripComments is true', (assert) => {
    serializer = new Serializer(voidMap, {
      stripComments: true,
    });
    const { comment } = helper;
    const actual = serializer.comment(comment('I will be gone'));

    assert.equal(actual, '');
  });

});
