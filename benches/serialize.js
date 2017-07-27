const { ast, serializer } = require('./setup');

require('do-you-even-bench')([
  {
    name: 'serialize',
    fn() {
      serializer.serialize(ast)
    }
  }
]);
