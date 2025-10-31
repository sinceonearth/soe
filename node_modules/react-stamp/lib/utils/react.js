'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = wrapMethods;

var _assign = require('lodash/assign');

var _assign2 = _interopRequireDefault(_assign);

var _mapValues = require('lodash/mapValues');

var _mapValues2 = _interopRequireDefault(_mapValues);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * React lifecycle methods
 */
var lifecycle = {
  componentDidMount: 'wrap',
  componentDidUpdate: 'wrap',
  componentWillMount: 'wrap',
  componentWillReceiveProps: 'wrap',
  componentWillUnmount: 'wrap',
  componentWillUpdate: 'wrap',
  getChildContext: 'wrap_merge',
  render: 'override',
  shouldComponentUpdate: 'wrap_or'
};

/**
 * Iterate through object methods, creating wrapper
 * functions for React lifecycle methods, starting
 * execution with first-in.
 *
 * (targ?: Object, src?: Object) => new: Object
 */
function wrapMethods() {
  var targ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var src = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var methods = (0, _mapValues2.default)(src, function (val, key) {
    switch (lifecycle[key]) {
      case 'wrap':
        return function () {
          targ[key] && targ[key].apply(this, arguments);
          val.apply(this, arguments);
        };
      case 'wrap_merge':
        return function () {
          var res1 = targ[key] && targ[key].apply(this, arguments);
          var res2 = val.apply(this, arguments);

          return res1 ? (0, _assign2.default)(res1, res2) : res2;
        };
      case 'wrap_or':
        return function () {
          var res1 = targ[key] && targ[key].apply(this, arguments);
          var res2 = val.apply(this, arguments);

          return res1 || res2;
        };
      case 'override':
      default:
        return val;
    }
  });

  return (0, _assign2.default)(_extends({}, targ), methods);
}