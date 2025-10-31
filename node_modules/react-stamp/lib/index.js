'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = reactStamp;

var _utils = require('./utils');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Convert the React component constructor function to a stamp.
 *
 * (React?: Object) => Stamp
 */
function reactStamp(React) {
  var desc = {};

  if (React && React.Component) {
    desc.methods = _extends({}, React.Component.prototype);
    desc.initializers = [function (options, _ref) {
      var _React$Component;

      var instance = _ref.instance,
          args = _ref.args;
      return (_React$Component = React.Component).call.apply(_React$Component, [instance, options].concat(_toConsumableArray(args)));
    }];
  }

  return (0, _utils.compose)(desc);
}