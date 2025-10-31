'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = compose;

var _assign = require('lodash/assign');

var _assign2 = _interopRequireDefault(_assign);

var _forEach = require('lodash/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

var _merge = require('lodash/merge');

var _merge2 = _interopRequireDefault(_merge);

var _stampUtils = require('stamp-utils');

var _ = require('./');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Given a description object, return a stamp aka composable.
 *
 * (desc?: SpecDesc) => Stamp
 */
function createStamp() {
  var specDesc = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var Component = function Component(options) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var instance = Object.create(specDesc.methods || {});

    (0, _merge2.default)(instance, specDesc.deepProperties);
    (0, _assign2.default)(instance, specDesc.properties, specDesc.configuration);
    Object.defineProperties(instance, specDesc.propertyDescriptors || {});

    if (specDesc.initializers) {
      specDesc.initializers.forEach(function (initializer) {
        var result = initializer.call(instance, options, { instance: instance, stamp: Component, args: [options].concat(args) });
        typeof result !== 'undefined' && (instance = result);
      });
    }

    return instance;
  };

  (0, _merge2.default)(Component, specDesc.deepStaticProperties);
  (0, _assign2.default)(Component, specDesc.staticProperties);
  Object.defineProperties(Component, specDesc.staticPropertyDescriptors || {});

  !Component.displayName && (Component.displayName = 'Component');

  return Component;
}

/**
 * Take any number of stamps or descriptors. Return a new stamp
 * that encapsulates combined behavior. If nothing is passed in,
 * an empty stamp is returned.
 *
 * (...args?: Stamp|ReactDesc|SpecDesc[]) => Stamp
 */
function compose() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  var descs = args.map(function (arg) {
    return (0, _.parseDesc)(arg);
  });
  var compDesc = {};

  (0, _stampUtils.isStamp)(this) && descs.unshift(this.compose);

  (0, _forEach2.default)(descs, function (desc) {
    var initializers = desc.initializers,
        methods = desc.methods,
        properties = desc.properties,
        staticProperties = desc.staticProperties,
        propertyDescriptors = desc.propertyDescriptors,
        staticPropertyDescriptors = desc.staticPropertyDescriptors,
        deepProperties = desc.deepProperties,
        deepStaticProperties = desc.deepStaticProperties,
        configuration = desc.configuration;

    // Wrap React lifecycle methods

    compDesc.methods = (0, _.wrapMethods)(compDesc.methods, methods);

    // Stamp spec
    compDesc.initializers = (compDesc.initializers || []).concat(initializers).filter(function (initializer) {
      return typeof initializer === 'function';
    });

    (0, _forEach2.default)({ properties: properties, staticProperties: staticProperties, propertyDescriptors: propertyDescriptors, staticPropertyDescriptors: staticPropertyDescriptors }, function (val, key) {
      return val && (compDesc[key] = (0, _assign2.default)(compDesc[key] || {}, val));
    });

    (0, _forEach2.default)({ deepProperties: deepProperties, deepStaticProperties: deepStaticProperties, configuration: configuration }, function (val, key) {
      return val && (compDesc[key] = (0, _merge2.default)(compDesc[key] || {}, val));
    });
  });

  var stamp = createStamp(compDesc);
  stamp.compose = (0, _assign2.default)(compose.bind(stamp), compDesc);

  return stamp;
}