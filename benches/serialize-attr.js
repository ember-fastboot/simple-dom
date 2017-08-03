global.VALUES = require('./attribute-values');
global.LEN = VALUES.length;

require('do-you-even-bench')([
  {
    name: 'escapeAttrValue',
    fn() {
      function matcher(char) {
        switch (char) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case '"': return '&quot;';
        }
        return char;
      }

      var ESC = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '&': '&amp;'
      };

      function matcher(char) {
        if (ESC[char] === undefined) {
          return char;
        }

        return ESC[char];
      }

      function escapeAttrValue(attrValue) {
        if (attrValue.indexOf('&') > -1 || attrValue.indexOf('"') > -1) {
          return attrValue.replace(/[&"]/g, matcher);
        }

        return attrValue;
      }

      for (var i = 0; i < VALUES.length; i++) {
        escapeAttrValue(VALUES[i]);
      }
    }
  }, {
    name: 'escapeAttrValue2',
    fn() {
      function matcher(char) {
        switch (char) {
          case '&': return '&amp;';
          case '"': return '&quot;';
        }
        return char;
      }

      function escapeAttrValue(attrValue) {
        if (attrValue.indexOf('&') > -1 || attrValue.indexOf('"') > -1) {
          return attrValue.replace(/[&"]/g, matcher);
        }

        return attrValue;
      }

      for (var i = 0; i < VALUES.length; i++) {
        escapeAttrValue(VALUES[i]);
      }
    }
  }, {
    name: 'escapeAttrValue3',
    fn() {
      function matcher(char) {
        switch (char) {
          case '&': return '&amp;';
          case '"': return '&quot;';
        }
        return char;
      }

      var TEST_REGEX = /[&"]/;
      var REGEX_REPLACE = /[&"]/g;

      function escapeAttrValue(attrValue) {
        if (TEST_REGEX.test(attrValue)) {
          return attrValue.replace(REGEX_REPLACE, matcher);
        }

        return attrValue;
      }

      for (var i = 0; i < VALUES.length; i++) {
        escapeAttrValue(VALUES[i]);
      }
    }
  }, {
    name: 'escapeAttrValue4',
    fn() {
      function escapeAttrValue(val) {
        var escaped = void 0;
        var last = 0;
        for (var i = 0; i < val.length; i++) {
          var c = val.charCodeAt(i);
          if (c === 34 || c === 38) {
            if (escaped === void 0) {
              escaped = '';
            }
            var next = val.slice(last, i) + (c === 34 ? '&quot;' : '&amp;');
            escaped = escaped === void 0 ? next : escaped + next;
            last = i + 1;
          }
        }
        if (escaped === void 0) {
          escaped = val;
        } else if (last < val.length) {
          escaped += val.slice(last);
        }
        return escaped;
      }

      for (var i = 0; i < VALUES.length; i++) {
        escapeAttrValue(VALUES[i]);
      }
    }
  }, {
    name: 'escapeAttrValue5',
    fn() {
      function escapeAttrValue(val) {
        var escaped = '';
        var last = 0;
        for (var i = 0; i < val.length; i++) {
          var c = val.charCodeAt(i);
          if (c === 34 || c === 38) {
            escaped = val.slice(last, i);
            escaped += c === 34 ? '&quot;' : '&amp;';
            last = i + 1;
          }
        }
        if (last < val.length) {
          escaped += val.slice(last);
        }
        return escaped;
      }

      for (var i = 0; i < VALUES.length; i++) {
        escapeAttrValue(VALUES[i]);
      }
    }
  }
]);
