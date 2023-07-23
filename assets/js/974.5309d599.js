"use strict";
exports.id = 974;
exports.ids = [974];
exports.modules = {

/***/ 96974:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  DocSearchModal: () => (/* reexport */ DocSearchModal)
});

;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-shared/dist/esm/debounce.js
function debounce(fn, time) {
  var timerId = undefined;
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(function () {
      return fn.apply(void 0, args);
    }, time);
  };
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-shared/dist/esm/safelyRunOnBrowser.js
/**
 * Safely runs code meant for browser environments only.
 */
function safelyRunOnBrowser(callback) {
  if (typeof window !== 'undefined') {
    return callback({
      window: window
    });
  }
  return undefined;
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-shared/dist/esm/createRef.js
function createRef(initialValue) {
  return {
    current: initialValue
  };
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-shared/dist/esm/isEqual.js
function isPrimitive(obj) {
  return obj !== Object(obj);
}
function isEqual(first, second) {
  if (first === second) {
    return true;
  }
  if (isPrimitive(first) || isPrimitive(second) || typeof first === 'function' || typeof second === 'function') {
    return first === second;
  }
  if (Object.keys(first).length !== Object.keys(second).length) {
    return false;
  }
  for (var _i = 0, _Object$keys = Object.keys(first); _i < _Object$keys.length; _i++) {
    var key = _Object$keys[_i];
    if (!(key in second)) {
      return false;
    }
    if (!isEqual(first[key], second[key])) {
      return false;
    }
  }
  return true;
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-shared/dist/esm/noop.js
var noop = function noop() {};
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-plugin-algolia-insights/dist/esm/createClickedEvent.js
function createClickedEvent(_ref) {
  var item = _ref.item,
    items = _ref.items;
  return {
    index: item.__autocomplete_indexName,
    items: [item],
    positions: [1 + items.findIndex(function (x) {
      return x.objectID === item.objectID;
    })],
    queryID: item.__autocomplete_queryID,
    algoliaSource: ['autocomplete']
  };
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-plugin-algolia-insights/dist/esm/isModernInsightsClient.js
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
/**
 * Determines if a given insights `client` supports the optional call to `init`
 * and the ability to set credentials via extra parameters when sending events.
 */
function isModernInsightsClient(client) {
  var _split$map = (client.version || '').split('.').map(Number),
    _split$map2 = _slicedToArray(_split$map, 2),
    major = _split$map2[0],
    minor = _split$map2[1];

  /* eslint-disable @typescript-eslint/camelcase */
  var v3 = major >= 3;
  var v2_4 = major === 2 && minor >= 4;
  var v1_10 = major === 1 && minor >= 10;
  return v3 || v2_4 || v1_10;
  /* eslint-enable @typescript-eslint/camelcase */
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-plugin-algolia-insights/dist/esm/createSearchInsightsApi.js
var _excluded = ["items"],
  _excluded2 = ["items"];
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || createSearchInsightsApi_unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function createSearchInsightsApi_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return createSearchInsightsApi_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return createSearchInsightsApi_arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return createSearchInsightsApi_arrayLikeToArray(arr); }
function createSearchInsightsApi_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }

function chunk(item) {
  var chunkSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 20;
  var chunks = [];
  for (var i = 0; i < item.objectIDs.length; i += chunkSize) {
    chunks.push(_objectSpread(_objectSpread({}, item), {}, {
      objectIDs: item.objectIDs.slice(i, i + chunkSize)
    }));
  }
  return chunks;
}
function mapToInsightsParamsApi(params) {
  return params.map(function (_ref) {
    var items = _ref.items,
      param = _objectWithoutProperties(_ref, _excluded);
    return _objectSpread(_objectSpread({}, param), {}, {
      objectIDs: (items === null || items === void 0 ? void 0 : items.map(function (_ref2) {
        var objectID = _ref2.objectID;
        return objectID;
      })) || param.objectIDs
    });
  });
}
function createSearchInsightsApi(searchInsights) {
  var canSendHeaders = isModernInsightsClient(searchInsights);
  function sendToInsights(method, payloads, items) {
    if (canSendHeaders && typeof items !== 'undefined') {
      var _items$0$__autocomple = items[0].__autocomplete_algoliaCredentials,
        appId = _items$0$__autocomple.appId,
        apiKey = _items$0$__autocomple.apiKey;
      var headers = {
        'X-Algolia-Application-Id': appId,
        'X-Algolia-API-Key': apiKey
      };
      searchInsights.apply(void 0, [method].concat(_toConsumableArray(payloads), [{
        headers: headers
      }]));
    } else {
      searchInsights.apply(void 0, [method].concat(_toConsumableArray(payloads)));
    }
  }
  return {
    /**
     * Initializes Insights with Algolia credentials.
     */
    init: function init(appId, apiKey) {
      searchInsights('init', {
        appId: appId,
        apiKey: apiKey
      });
    },
    /**
     * Sets the user token to attach to events.
     */
    setUserToken: function setUserToken(userToken) {
      searchInsights('setUserToken', userToken);
    },
    /**
     * Sends click events to capture a query and its clicked items and positions.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/clicked-object-ids-after-search/
     */
    clickedObjectIDsAfterSearch: function clickedObjectIDsAfterSearch() {
      for (var _len = arguments.length, params = new Array(_len), _key = 0; _key < _len; _key++) {
        params[_key] = arguments[_key];
      }
      if (params.length > 0) {
        sendToInsights('clickedObjectIDsAfterSearch', mapToInsightsParamsApi(params), params[0].items);
      }
    },
    /**
     * Sends click events to capture clicked items.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/clicked-object-ids/
     */
    clickedObjectIDs: function clickedObjectIDs() {
      for (var _len2 = arguments.length, params = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        params[_key2] = arguments[_key2];
      }
      if (params.length > 0) {
        sendToInsights('clickedObjectIDs', mapToInsightsParamsApi(params), params[0].items);
      }
    },
    /**
     * Sends click events to capture the filters a user clicks on.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/clicked-filters/
     */
    clickedFilters: function clickedFilters() {
      for (var _len3 = arguments.length, params = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        params[_key3] = arguments[_key3];
      }
      if (params.length > 0) {
        searchInsights.apply(void 0, ['clickedFilters'].concat(params));
      }
    },
    /**
     * Sends conversion events to capture a query and its clicked items.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/converted-object-ids-after-search/
     */
    convertedObjectIDsAfterSearch: function convertedObjectIDsAfterSearch() {
      for (var _len4 = arguments.length, params = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        params[_key4] = arguments[_key4];
      }
      if (params.length > 0) {
        sendToInsights('convertedObjectIDsAfterSearch', mapToInsightsParamsApi(params), params[0].items);
      }
    },
    /**
     * Sends conversion events to capture clicked items.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/converted-object-ids/
     */
    convertedObjectIDs: function convertedObjectIDs() {
      for (var _len5 = arguments.length, params = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        params[_key5] = arguments[_key5];
      }
      if (params.length > 0) {
        sendToInsights('convertedObjectIDs', mapToInsightsParamsApi(params), params[0].items);
      }
    },
    /**
     * Sends conversion events to capture the filters a user uses when converting.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/converted-filters/
     */
    convertedFilters: function convertedFilters() {
      for (var _len6 = arguments.length, params = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        params[_key6] = arguments[_key6];
      }
      if (params.length > 0) {
        searchInsights.apply(void 0, ['convertedFilters'].concat(params));
      }
    },
    /**
     * Sends view events to capture clicked items.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/viewed-object-ids/
     */
    viewedObjectIDs: function viewedObjectIDs() {
      for (var _len7 = arguments.length, params = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        params[_key7] = arguments[_key7];
      }
      if (params.length > 0) {
        params.reduce(function (acc, _ref3) {
          var items = _ref3.items,
            param = _objectWithoutProperties(_ref3, _excluded2);
          return [].concat(_toConsumableArray(acc), _toConsumableArray(chunk(_objectSpread(_objectSpread({}, param), {}, {
            objectIDs: (items === null || items === void 0 ? void 0 : items.map(function (_ref4) {
              var objectID = _ref4.objectID;
              return objectID;
            })) || param.objectIDs
          })).map(function (payload) {
            return {
              items: items,
              payload: payload
            };
          })));
        }, []).forEach(function (_ref5) {
          var items = _ref5.items,
            payload = _ref5.payload;
          return sendToInsights('viewedObjectIDs', [payload], items);
        });
      }
    },
    /**
     * Sends view events to capture the filters a user uses when viewing.
     *
     * @link https://www.algolia.com/doc/api-reference/api-methods/viewed-filters/
     */
    viewedFilters: function viewedFilters() {
      for (var _len8 = arguments.length, params = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        params[_key8] = arguments[_key8];
      }
      if (params.length > 0) {
        searchInsights.apply(void 0, ['viewedFilters'].concat(params));
      }
    }
  };
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-plugin-algolia-insights/dist/esm/createViewedEvents.js
function createViewedEvents(_ref) {
  var items = _ref.items;
  var itemsByIndexName = items.reduce(function (acc, current) {
    var _acc$current$__autoco;
    acc[current.__autocomplete_indexName] = ((_acc$current$__autoco = acc[current.__autocomplete_indexName]) !== null && _acc$current$__autoco !== void 0 ? _acc$current$__autoco : []).concat(current);
    return acc;
  }, {});
  return Object.keys(itemsByIndexName).map(function (indexName) {
    var items = itemsByIndexName[indexName];
    return {
      index: indexName,
      items: items,
      algoliaSource: ['autocomplete']
    };
  });
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-plugin-algolia-insights/dist/esm/isAlgoliaInsightsHit.js
function isAlgoliaInsightsHit(hit) {
  return hit.objectID && hit.__autocomplete_indexName && hit.__autocomplete_queryID;
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-plugin-algolia-insights/dist/esm/createAlgoliaInsightsPlugin.js
function createAlgoliaInsightsPlugin_typeof(obj) { "@babel/helpers - typeof"; return createAlgoliaInsightsPlugin_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, createAlgoliaInsightsPlugin_typeof(obj); }
function createAlgoliaInsightsPlugin_toConsumableArray(arr) { return createAlgoliaInsightsPlugin_arrayWithoutHoles(arr) || createAlgoliaInsightsPlugin_iterableToArray(arr) || createAlgoliaInsightsPlugin_unsupportedIterableToArray(arr) || createAlgoliaInsightsPlugin_nonIterableSpread(); }
function createAlgoliaInsightsPlugin_nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function createAlgoliaInsightsPlugin_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return createAlgoliaInsightsPlugin_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return createAlgoliaInsightsPlugin_arrayLikeToArray(o, minLen); }
function createAlgoliaInsightsPlugin_iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function createAlgoliaInsightsPlugin_arrayWithoutHoles(arr) { if (Array.isArray(arr)) return createAlgoliaInsightsPlugin_arrayLikeToArray(arr); }
function createAlgoliaInsightsPlugin_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function createAlgoliaInsightsPlugin_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function createAlgoliaInsightsPlugin_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? createAlgoliaInsightsPlugin_ownKeys(Object(source), !0).forEach(function (key) { createAlgoliaInsightsPlugin_defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : createAlgoliaInsightsPlugin_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function createAlgoliaInsightsPlugin_defineProperty(obj, key, value) { key = createAlgoliaInsightsPlugin_toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function createAlgoliaInsightsPlugin_toPropertyKey(arg) { var key = createAlgoliaInsightsPlugin_toPrimitive(arg, "string"); return createAlgoliaInsightsPlugin_typeof(key) === "symbol" ? key : String(key); }
function createAlgoliaInsightsPlugin_toPrimitive(input, hint) { if (createAlgoliaInsightsPlugin_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (createAlgoliaInsightsPlugin_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }





var VIEW_EVENT_DELAY = 400;
var ALGOLIA_INSIGHTS_VERSION = '2.6.0';
var ALGOLIA_INSIGHTS_SRC = "https://cdn.jsdelivr.net/npm/search-insights@".concat(ALGOLIA_INSIGHTS_VERSION, "/dist/search-insights.min.js");
var sendViewedObjectIDs = debounce(function (_ref) {
  var onItemsChange = _ref.onItemsChange,
    items = _ref.items,
    insights = _ref.insights,
    state = _ref.state;
  onItemsChange({
    insights: insights,
    insightsEvents: createViewedEvents({
      items: items
    }).map(function (event) {
      return createAlgoliaInsightsPlugin_objectSpread({
        eventName: 'Items Viewed'
      }, event);
    }),
    state: state
  });
}, VIEW_EVENT_DELAY);
function createAlgoliaInsightsPlugin(options) {
  var _getOptions = getOptions(options),
    providedInsightsClient = _getOptions.insightsClient,
    onItemsChange = _getOptions.onItemsChange,
    onSelectEvent = _getOptions.onSelect,
    onActiveEvent = _getOptions.onActive;
  var insightsClient = providedInsightsClient;
  if (!providedInsightsClient) {
    safelyRunOnBrowser(function (_ref2) {
      var window = _ref2.window;
      var pointer = window.AlgoliaAnalyticsObject || 'aa';
      if (typeof pointer === 'string') {
        insightsClient = window[pointer];
      }
      if (!insightsClient) {
        window.AlgoliaAnalyticsObject = pointer;
        if (!window[pointer]) {
          window[pointer] = function () {
            if (!window[pointer].queue) {
              window[pointer].queue = [];
            }
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }
            window[pointer].queue.push(args);
          };
        }
        window[pointer].version = ALGOLIA_INSIGHTS_VERSION;
        insightsClient = window[pointer];
        loadInsights(window);
      }
    });
  }
  var insights = createSearchInsightsApi(insightsClient);
  var previousItems = createRef([]);
  var debouncedOnStateChange = debounce(function (_ref3) {
    var state = _ref3.state;
    if (!state.isOpen) {
      return;
    }
    var items = state.collections.reduce(function (acc, current) {
      return [].concat(createAlgoliaInsightsPlugin_toConsumableArray(acc), createAlgoliaInsightsPlugin_toConsumableArray(current.items));
    }, []).filter(isAlgoliaInsightsHit);
    if (!isEqual(previousItems.current.map(function (x) {
      return x.objectID;
    }), items.map(function (x) {
      return x.objectID;
    }))) {
      previousItems.current = items;
      if (items.length > 0) {
        sendViewedObjectIDs({
          onItemsChange: onItemsChange,
          items: items,
          insights: insights,
          state: state
        });
      }
    }
  }, 0);
  return {
    name: 'aa.algoliaInsightsPlugin',
    subscribe: function subscribe(_ref4) {
      var setContext = _ref4.setContext,
        onSelect = _ref4.onSelect,
        onActive = _ref4.onActive;
      insightsClient('addAlgoliaAgent', 'insights-plugin');
      setContext({
        algoliaInsightsPlugin: {
          __algoliaSearchParameters: {
            clickAnalytics: true
          },
          insights: insights
        }
      });
      onSelect(function (_ref5) {
        var item = _ref5.item,
          state = _ref5.state,
          event = _ref5.event;
        if (!isAlgoliaInsightsHit(item)) {
          return;
        }
        onSelectEvent({
          state: state,
          event: event,
          insights: insights,
          item: item,
          insightsEvents: [createAlgoliaInsightsPlugin_objectSpread({
            eventName: 'Item Selected'
          }, createClickedEvent({
            item: item,
            items: previousItems.current
          }))]
        });
      });
      onActive(function (_ref6) {
        var item = _ref6.item,
          state = _ref6.state,
          event = _ref6.event;
        if (!isAlgoliaInsightsHit(item)) {
          return;
        }
        onActiveEvent({
          state: state,
          event: event,
          insights: insights,
          item: item,
          insightsEvents: [createAlgoliaInsightsPlugin_objectSpread({
            eventName: 'Item Active'
          }, createClickedEvent({
            item: item,
            items: previousItems.current
          }))]
        });
      });
    },
    onStateChange: function onStateChange(_ref7) {
      var state = _ref7.state;
      debouncedOnStateChange({
        state: state
      });
    },
    __autocomplete_pluginOptions: options
  };
}
function getOptions(options) {
  return createAlgoliaInsightsPlugin_objectSpread({
    onItemsChange: function onItemsChange(_ref8) {
      var insights = _ref8.insights,
        insightsEvents = _ref8.insightsEvents;
      insights.viewedObjectIDs.apply(insights, createAlgoliaInsightsPlugin_toConsumableArray(insightsEvents.map(function (event) {
        return createAlgoliaInsightsPlugin_objectSpread(createAlgoliaInsightsPlugin_objectSpread({}, event), {}, {
          algoliaSource: [].concat(createAlgoliaInsightsPlugin_toConsumableArray(event.algoliaSource || []), ['autocomplete-internal'])
        });
      })));
    },
    onSelect: function onSelect(_ref9) {
      var insights = _ref9.insights,
        insightsEvents = _ref9.insightsEvents;
      insights.clickedObjectIDsAfterSearch.apply(insights, createAlgoliaInsightsPlugin_toConsumableArray(insightsEvents.map(function (event) {
        return createAlgoliaInsightsPlugin_objectSpread(createAlgoliaInsightsPlugin_objectSpread({}, event), {}, {
          algoliaSource: [].concat(createAlgoliaInsightsPlugin_toConsumableArray(event.algoliaSource || []), ['autocomplete-internal'])
        });
      })));
    },
    onActive: noop
  }, options);
}
function loadInsights(environment) {
  var errorMessage = "[Autocomplete]: Could not load search-insights.js. Please load it manually following https://alg.li/insights-autocomplete";
  try {
    var script = environment.document.createElement('script');
    script.async = true;
    script.src = ALGOLIA_INSIGHTS_SRC;
    script.onerror = function () {
      // eslint-disable-next-line no-console
      console.error(errorMessage);
    };
    document.body.appendChild(script);
  } catch (cause) {
    // eslint-disable-next-line no-console
    console.error(errorMessage);
  }
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-core/dist/esm/checkOptions.js

function checkOptions(options) {
   false ? 0 : void 0;
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-core/dist/esm/utils/createCancelablePromiseList.js
function createCancelablePromiseList() {
  var list = [];
  return {
    add: function add(cancelablePromise) {
      list.push(cancelablePromise);
      return cancelablePromise.finally(function () {
        list = list.filter(function (item) {
          return item !== cancelablePromise;
        });
      });
    },
    cancelAll: function cancelAll() {
      list.forEach(function (promise) {
        return promise.cancel();
      });
    },
    isEmpty: function isEmpty() {
      return list.length === 0;
    }
  };
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-core/dist/esm/createStore.js
function createStore_typeof(obj) { "@babel/helpers - typeof"; return createStore_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, createStore_typeof(obj); }
function createStore_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function createStore_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? createStore_ownKeys(Object(source), !0).forEach(function (key) { createStore_defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : createStore_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function createStore_defineProperty(obj, key, value) { key = createStore_toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function createStore_toPropertyKey(arg) { var key = createStore_toPrimitive(arg, "string"); return createStore_typeof(key) === "symbol" ? key : String(key); }
function createStore_toPrimitive(input, hint) { if (createStore_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (createStore_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }

function createStore(reducer, props, onStoreStateChange) {
  var state = props.initialState;
  return {
    getState: function getState() {
      return state;
    },
    dispatch: function dispatch(action, payload) {
      var prevState = createStore_objectSpread({}, state);
      state = reducer(state, {
        type: action,
        props: props,
        payload: payload
      });
      onStoreStateChange({
        state: state,
        prevState: prevState
      });
    },
    pendingRequests: createCancelablePromiseList()
  };
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-shared/dist/esm/flatten.js
function flatten(values) {
  return values.reduce(function (a, b) {
    return a.concat(b);
  }, []);
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-core/dist/esm/getAutocompleteSetters.js
function getAutocompleteSetters_typeof(obj) { "@babel/helpers - typeof"; return getAutocompleteSetters_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, getAutocompleteSetters_typeof(obj); }
function getAutocompleteSetters_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function getAutocompleteSetters_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? getAutocompleteSetters_ownKeys(Object(source), !0).forEach(function (key) { getAutocompleteSetters_defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : getAutocompleteSetters_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function getAutocompleteSetters_defineProperty(obj, key, value) { key = getAutocompleteSetters_toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function getAutocompleteSetters_toPropertyKey(arg) { var key = getAutocompleteSetters_toPrimitive(arg, "string"); return getAutocompleteSetters_typeof(key) === "symbol" ? key : String(key); }
function getAutocompleteSetters_toPrimitive(input, hint) { if (getAutocompleteSetters_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (getAutocompleteSetters_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }

function getAutocompleteSetters(_ref) {
  var store = _ref.store;
  var setActiveItemId = function setActiveItemId(value) {
    store.dispatch('setActiveItemId', value);
  };
  var setQuery = function setQuery(value) {
    store.dispatch('setQuery', value);
  };
  var setCollections = function setCollections(rawValue) {
    var baseItemId = 0;
    var value = rawValue.map(function (collection) {
      return getAutocompleteSetters_objectSpread(getAutocompleteSetters_objectSpread({}, collection), {}, {
        // We flatten the stored items to support calling `getAlgoliaResults`
        // from the source itself.
        items: flatten(collection.items).map(function (item) {
          return getAutocompleteSetters_objectSpread(getAutocompleteSetters_objectSpread({}, item), {}, {
            __autocomplete_id: baseItemId++
          });
        })
      });
    });
    store.dispatch('setCollections', value);
  };
  var setIsOpen = function setIsOpen(value) {
    store.dispatch('setIsOpen', value);
  };
  var setStatus = function setStatus(value) {
    store.dispatch('setStatus', value);
  };
  var setContext = function setContext(value) {
    store.dispatch('setContext', value);
  };
  return {
    setActiveItemId: setActiveItemId,
    setQuery: setQuery,
    setCollections: setCollections,
    setIsOpen: setIsOpen,
    setStatus: setStatus,
    setContext: setContext
  };
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-shared/dist/esm/getItemsCount.js
function getItemsCount(state) {
  if (state.collections.length === 0) {
    return 0;
  }
  return state.collections.reduce(function (sum, collection) {
    return sum + collection.items.length;
  }, 0);
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-shared/dist/esm/generateAutocompleteId.js
var autocompleteId = 0;
function generateAutocompleteId() {
  return "autocomplete-".concat(autocompleteId++);
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-shared/dist/esm/invariant.js
/**
 * Throws an error if the condition is not met in development mode.
 * This is used to make development a better experience to provide guidance as
 * to where the error comes from.
 */
function invariant(condition, message) {
  if (true) {
    return;
  }
  if (!condition) {
    throw new Error("[Autocomplete] ".concat(typeof message === 'function' ? message() : message));
  }
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-shared/dist/esm/decycle.js
function decycle_slicedToArray(arr, i) { return decycle_arrayWithHoles(arr) || decycle_iterableToArrayLimit(arr, i) || decycle_unsupportedIterableToArray(arr, i) || decycle_nonIterableRest(); }
function decycle_nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function decycle_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return decycle_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return decycle_arrayLikeToArray(o, minLen); }
function decycle_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function decycle_iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function decycle_arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function decycle_typeof(obj) { "@babel/helpers - typeof"; return decycle_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, decycle_typeof(obj); }
/**
 * Decycles objects with circular references.
 * This is used to print cyclic structures in development environment only.
 */
function decycle(obj) {
  var seen = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Set();
  if (true) {
    return obj;
  }
  if (seen.has(obj)) {
    return '[Circular]';
  }
  var newSeen = seen.add(obj);
  if (Array.isArray(obj)) {
    return obj.map(function (x) {
      return decycle(x, newSeen);
    });
  }
  return Object.fromEntries(Object.entries(obj).map(function (_ref) {
    var _ref2 = decycle_slicedToArray(_ref, 2),
      key = _ref2[0],
      value = _ref2[1];
    return [key, decycle(value, newSeen)];
  }));
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-core/dist/esm/utils/getNormalizedSources.js
function getNormalizedSources_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function getNormalizedSources_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? getNormalizedSources_ownKeys(Object(source), !0).forEach(function (key) { getNormalizedSources_defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : getNormalizedSources_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function getNormalizedSources_defineProperty(obj, key, value) { key = getNormalizedSources_toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function getNormalizedSources_toPropertyKey(arg) { var key = getNormalizedSources_toPrimitive(arg, "string"); return getNormalizedSources_typeof(key) === "symbol" ? key : String(key); }
function getNormalizedSources_toPrimitive(input, hint) { if (getNormalizedSources_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (getNormalizedSources_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function getNormalizedSources_typeof(obj) { "@babel/helpers - typeof"; return getNormalizedSources_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, getNormalizedSources_typeof(obj); }

function getNormalizedSources(getSources, params) {
  var seenSourceIds = [];
  return Promise.resolve(getSources(params)).then(function (sources) {
    invariant(Array.isArray(sources), function () {
      return "The `getSources` function must return an array of sources but returned type ".concat(JSON.stringify(getNormalizedSources_typeof(sources)), ":\n\n").concat(JSON.stringify(decycle(sources), null, 2));
    });
    return Promise.all(sources
    // We allow `undefined` and `false` sources to allow users to use
    // `Boolean(query) && source` (=> `false`).
    // We need to remove these values at this point.
    .filter(function (maybeSource) {
      return Boolean(maybeSource);
    }).map(function (source) {
      invariant(typeof source.sourceId === 'string', 'A source must provide a `sourceId` string.');
      if (seenSourceIds.includes(source.sourceId)) {
        throw new Error("[Autocomplete] The `sourceId` ".concat(JSON.stringify(source.sourceId), " is not unique."));
      }
      seenSourceIds.push(source.sourceId);
      var defaultSource = {
        getItemInputValue: function getItemInputValue(_ref) {
          var state = _ref.state;
          return state.query;
        },
        getItemUrl: function getItemUrl() {
          return undefined;
        },
        onSelect: function onSelect(_ref2) {
          var setIsOpen = _ref2.setIsOpen;
          setIsOpen(false);
        },
        onActive: noop,
        onResolve: noop
      };
      Object.keys(defaultSource).forEach(function (key) {
        defaultSource[key].__default = true;
      });
      var normalizedSource = getNormalizedSources_objectSpread(getNormalizedSources_objectSpread({}, defaultSource), source);
      return Promise.resolve(normalizedSource);
    }));
  });
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-core/dist/esm/getDefaultProps.js
function getDefaultProps_typeof(obj) { "@babel/helpers - typeof"; return getDefaultProps_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, getDefaultProps_typeof(obj); }
function getDefaultProps_toConsumableArray(arr) { return getDefaultProps_arrayWithoutHoles(arr) || getDefaultProps_iterableToArray(arr) || getDefaultProps_unsupportedIterableToArray(arr) || getDefaultProps_nonIterableSpread(); }
function getDefaultProps_nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function getDefaultProps_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return getDefaultProps_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return getDefaultProps_arrayLikeToArray(o, minLen); }
function getDefaultProps_iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function getDefaultProps_arrayWithoutHoles(arr) { if (Array.isArray(arr)) return getDefaultProps_arrayLikeToArray(arr); }
function getDefaultProps_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function getDefaultProps_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function getDefaultProps_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? getDefaultProps_ownKeys(Object(source), !0).forEach(function (key) { getDefaultProps_defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : getDefaultProps_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function getDefaultProps_defineProperty(obj, key, value) { key = getDefaultProps_toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function getDefaultProps_toPropertyKey(arg) { var key = getDefaultProps_toPrimitive(arg, "string"); return getDefaultProps_typeof(key) === "symbol" ? key : String(key); }
function getDefaultProps_toPrimitive(input, hint) { if (getDefaultProps_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (getDefaultProps_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }


function getDefaultProps(props, pluginSubscribers) {
  var _props$id;
  /* eslint-disable no-restricted-globals */
  var environment = typeof window !== 'undefined' ? window : {};
  /* eslint-enable no-restricted-globals */
  var plugins = props.plugins || [];
  return getDefaultProps_objectSpread(getDefaultProps_objectSpread({
    debug: false,
    openOnFocus: false,
    placeholder: '',
    autoFocus: false,
    defaultActiveItemId: null,
    stallThreshold: 300,
    insights: false,
    environment: environment,
    shouldPanelOpen: function shouldPanelOpen(_ref) {
      var state = _ref.state;
      return getItemsCount(state) > 0;
    },
    reshape: function reshape(_ref2) {
      var sources = _ref2.sources;
      return sources;
    }
  }, props), {}, {
    // Since `generateAutocompleteId` triggers a side effect (it increments
    // an internal counter), we don't want to execute it if unnecessary.
    id: (_props$id = props.id) !== null && _props$id !== void 0 ? _props$id : generateAutocompleteId(),
    plugins: plugins,
    // The following props need to be deeply defaulted.
    initialState: getDefaultProps_objectSpread({
      activeItemId: null,
      query: '',
      completion: null,
      collections: [],
      isOpen: false,
      status: 'idle',
      context: {}
    }, props.initialState),
    onStateChange: function onStateChange(params) {
      var _props$onStateChange;
      (_props$onStateChange = props.onStateChange) === null || _props$onStateChange === void 0 ? void 0 : _props$onStateChange.call(props, params);
      plugins.forEach(function (x) {
        var _x$onStateChange;
        return (_x$onStateChange = x.onStateChange) === null || _x$onStateChange === void 0 ? void 0 : _x$onStateChange.call(x, params);
      });
    },
    onSubmit: function onSubmit(params) {
      var _props$onSubmit;
      (_props$onSubmit = props.onSubmit) === null || _props$onSubmit === void 0 ? void 0 : _props$onSubmit.call(props, params);
      plugins.forEach(function (x) {
        var _x$onSubmit;
        return (_x$onSubmit = x.onSubmit) === null || _x$onSubmit === void 0 ? void 0 : _x$onSubmit.call(x, params);
      });
    },
    onReset: function onReset(params) {
      var _props$onReset;
      (_props$onReset = props.onReset) === null || _props$onReset === void 0 ? void 0 : _props$onReset.call(props, params);
      plugins.forEach(function (x) {
        var _x$onReset;
        return (_x$onReset = x.onReset) === null || _x$onReset === void 0 ? void 0 : _x$onReset.call(x, params);
      });
    },
    getSources: function getSources(params) {
      return Promise.all([].concat(getDefaultProps_toConsumableArray(plugins.map(function (plugin) {
        return plugin.getSources;
      })), [props.getSources]).filter(Boolean).map(function (getSources) {
        return getNormalizedSources(getSources, params);
      })).then(function (nested) {
        return flatten(nested);
      }).then(function (sources) {
        return sources.map(function (source) {
          return getDefaultProps_objectSpread(getDefaultProps_objectSpread({}, source), {}, {
            onSelect: function onSelect(params) {
              source.onSelect(params);
              pluginSubscribers.forEach(function (x) {
                var _x$onSelect;
                return (_x$onSelect = x.onSelect) === null || _x$onSelect === void 0 ? void 0 : _x$onSelect.call(x, params);
              });
            },
            onActive: function onActive(params) {
              source.onActive(params);
              pluginSubscribers.forEach(function (x) {
                var _x$onActive;
                return (_x$onActive = x.onActive) === null || _x$onActive === void 0 ? void 0 : _x$onActive.call(x, params);
              });
            },
            onResolve: function onResolve(params) {
              source.onResolve(params);
              pluginSubscribers.forEach(function (x) {
                var _x$onResolve;
                return (_x$onResolve = x.onResolve) === null || _x$onResolve === void 0 ? void 0 : _x$onResolve.call(x, params);
              });
            }
          });
        });
      });
    },
    navigator: getDefaultProps_objectSpread({
      navigate: function navigate(_ref3) {
        var itemUrl = _ref3.itemUrl;
        environment.location.assign(itemUrl);
      },
      navigateNewTab: function navigateNewTab(_ref4) {
        var itemUrl = _ref4.itemUrl;
        var windowReference = environment.open(itemUrl, '_blank', 'noopener');
        windowReference === null || windowReference === void 0 ? void 0 : windowReference.focus();
      },
      navigateNewWindow: function navigateNewWindow(_ref5) {
        var itemUrl = _ref5.itemUrl;
        environment.open(itemUrl, '_blank', 'noopener');
      }
    }, props.navigator)
  });
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-core/dist/esm/reshape.js
function reshape_typeof(obj) { "@babel/helpers - typeof"; return reshape_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, reshape_typeof(obj); }
function reshape_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function reshape_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? reshape_ownKeys(Object(source), !0).forEach(function (key) { reshape_defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : reshape_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function reshape_defineProperty(obj, key, value) { key = reshape_toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function reshape_toPropertyKey(arg) { var key = reshape_toPrimitive(arg, "string"); return reshape_typeof(key) === "symbol" ? key : String(key); }
function reshape_toPrimitive(input, hint) { if (reshape_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (reshape_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }

function reshape(_ref) {
  var collections = _ref.collections,
    props = _ref.props,
    state = _ref.state;
  // Sources are grouped by `sourceId` to conveniently pick them via destructuring.
  // Example: `const { recentSearchesPlugin } = sourcesBySourceId`
  var originalSourcesBySourceId = collections.reduce(function (acc, collection) {
    return reshape_objectSpread(reshape_objectSpread({}, acc), {}, reshape_defineProperty({}, collection.source.sourceId, reshape_objectSpread(reshape_objectSpread({}, collection.source), {}, {
      getItems: function getItems() {
        // We provide the resolved items from the collection to the `reshape` prop.
        return flatten(collection.items);
      }
    })));
  }, {});
  var _props$plugins$reduce = props.plugins.reduce(function (acc, plugin) {
      if (plugin.reshape) {
        return plugin.reshape(acc);
      }
      return acc;
    }, {
      sourcesBySourceId: originalSourcesBySourceId,
      state: state
    }),
    sourcesBySourceId = _props$plugins$reduce.sourcesBySourceId;
  var reshapeSources = props.reshape({
    sourcesBySourceId: sourcesBySourceId,
    sources: Object.values(sourcesBySourceId),
    state: state
  });

  // We reconstruct the collections with the items modified by the `reshape` prop.
  return flatten(reshapeSources).filter(Boolean).map(function (source) {
    return {
      source: source,
      items: source.getItems()
    };
  });
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-core/dist/esm/utils/mapToAlgoliaResponse.js
function mapToAlgoliaResponse(rawResults) {
  return {
    results: rawResults,
    hits: rawResults.map(function (result) {
      return result.hits;
    }).filter(Boolean),
    facetHits: rawResults.map(function (result) {
      var _facetHits;
      return (_facetHits = result.facetHits) === null || _facetHits === void 0 ? void 0 : _facetHits.map(function (facetHit) {
        // Bring support for the highlighting components.
        return {
          label: facetHit.value,
          count: facetHit.count,
          _highlightResult: {
            label: {
              value: facetHit.highlighted
            }
          }
        };
      });
    }).filter(Boolean)
  };
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-core/dist/esm/resolve.js
function resolve_typeof(obj) { "@babel/helpers - typeof"; return resolve_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, resolve_typeof(obj); }
function resolve_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function resolve_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? resolve_ownKeys(Object(source), !0).forEach(function (key) { resolve_defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : resolve_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function resolve_defineProperty(obj, key, value) { key = resolve_toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function resolve_toPropertyKey(arg) { var key = resolve_toPrimitive(arg, "string"); return resolve_typeof(key) === "symbol" ? key : String(key); }
function resolve_toPrimitive(input, hint) { if (resolve_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (resolve_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function resolve_toConsumableArray(arr) { return resolve_arrayWithoutHoles(arr) || resolve_iterableToArray(arr) || resolve_unsupportedIterableToArray(arr) || resolve_nonIterableSpread(); }
function resolve_nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function resolve_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return resolve_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return resolve_arrayLikeToArray(o, minLen); }
function resolve_iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function resolve_arrayWithoutHoles(arr) { if (Array.isArray(arr)) return resolve_arrayLikeToArray(arr); }
function resolve_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }


function isDescription(item) {
  return Boolean(item.execute);
}
function isRequesterDescription(description) {
  return Boolean(description === null || description === void 0 ? void 0 : description.execute);
}
function preResolve(itemsOrDescription, sourceId, state) {
  if (isRequesterDescription(itemsOrDescription)) {
    var contextParameters = itemsOrDescription.requesterId === 'algolia' ? Object.assign.apply(Object, [{}].concat(resolve_toConsumableArray(Object.keys(state.context).map(function (key) {
      var _state$context$key;
      return (_state$context$key = state.context[key]) === null || _state$context$key === void 0 ? void 0 : _state$context$key.__algoliaSearchParameters;
    })))) : {};
    return resolve_objectSpread(resolve_objectSpread({}, itemsOrDescription), {}, {
      requests: itemsOrDescription.queries.map(function (query) {
        return {
          query: itemsOrDescription.requesterId === 'algolia' ? resolve_objectSpread(resolve_objectSpread({}, query), {}, {
            params: resolve_objectSpread(resolve_objectSpread({}, contextParameters), query.params)
          }) : query,
          sourceId: sourceId,
          transformResponse: itemsOrDescription.transformResponse
        };
      })
    });
  }
  return {
    items: itemsOrDescription,
    sourceId: sourceId
  };
}
function resolve(items) {
  var packed = items.reduce(function (acc, current) {
    if (!isDescription(current)) {
      acc.push(current);
      return acc;
    }
    var searchClient = current.searchClient,
      execute = current.execute,
      requesterId = current.requesterId,
      requests = current.requests;
    var container = acc.find(function (item) {
      return isDescription(current) && isDescription(item) && item.searchClient === searchClient && Boolean(requesterId) && item.requesterId === requesterId;
    });
    if (container) {
      var _container$items;
      (_container$items = container.items).push.apply(_container$items, resolve_toConsumableArray(requests));
    } else {
      var request = {
        execute: execute,
        requesterId: requesterId,
        items: requests,
        searchClient: searchClient
      };
      acc.push(request);
    }
    return acc;
  }, []);
  var values = packed.map(function (maybeDescription) {
    if (!isDescription(maybeDescription)) {
      return Promise.resolve(maybeDescription);
    }
    var _ref = maybeDescription,
      execute = _ref.execute,
      items = _ref.items,
      searchClient = _ref.searchClient;
    return execute({
      searchClient: searchClient,
      requests: items
    });
  });
  return Promise.all(values).then(function (responses) {
    return flatten(responses);
  });
}
function postResolve(responses, sources, store) {
  return sources.map(function (source) {
    var matches = responses.filter(function (response) {
      return response.sourceId === source.sourceId;
    });
    var results = matches.map(function (_ref2) {
      var items = _ref2.items;
      return items;
    });
    var transform = matches[0].transformResponse;
    var items = transform ? transform(mapToAlgoliaResponse(results)) : results;
    source.onResolve({
      source: source,
      results: results,
      items: items,
      state: store.getState()
    });
    invariant(Array.isArray(items), function () {
      return "The `getItems` function from source \"".concat(source.sourceId, "\" must return an array of items but returned type ").concat(JSON.stringify(resolve_typeof(items)), ":\n\n").concat(JSON.stringify(decycle(items), null, 2), ".\n\nSee: https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/sources/#param-getitems");
    });
    invariant(items.every(Boolean), "The `getItems` function from source \"".concat(source.sourceId, "\" must return an array of items but returned ").concat(JSON.stringify(undefined), ".\n\nDid you forget to return items?\n\nSee: https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/sources/#param-getitems"));
    return {
      source: source,
      items: items
    };
  });
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-core/dist/esm/utils/createConcurrentSafePromise.js
/**
 * Creates a runner that executes promises in a concurrent-safe way.
 *
 * This is useful to prevent older promises to resolve after a newer promise,
 * otherwise resulting in stale resolved values.
 */
function createConcurrentSafePromise() {
  var basePromiseId = -1;
  var latestResolvedId = -1;
  var latestResolvedValue = undefined;
  return function runConcurrentSafePromise(promise) {
    basePromiseId++;
    var currentPromiseId = basePromiseId;
    return Promise.resolve(promise).then(function (x) {
      // The promise might take too long to resolve and get outdated. This would
      // result in resolving stale values.
      // When this happens, we ignore the promise value and return the one
      // coming from the latest resolved value.
      //
      // +----------------------------------+
      // |        100ms                     |
      // | run(1) +--->  R1                 |
      // |        300ms                     |
      // | run(2) +-------------> R2 (SKIP) |
      // |        200ms                     |
      // | run(3) +--------> R3             |
      // +----------------------------------+
      if (latestResolvedValue && currentPromiseId < latestResolvedId) {
        return latestResolvedValue;
      }
      latestResolvedId = currentPromiseId;
      latestResolvedValue = x;
      return x;
    });
  };
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-core/dist/esm/utils/createCancelablePromise.js
function createInternalCancelablePromise(promise, initialState) {
  var state = initialState;
  return {
    then: function then(onfulfilled, onrejected) {
      return createInternalCancelablePromise(promise.then(createCallback(onfulfilled, state, promise), createCallback(onrejected, state, promise)), state);
    },
    catch: function _catch(onrejected) {
      return createInternalCancelablePromise(promise.catch(createCallback(onrejected, state, promise)), state);
    },
    finally: function _finally(onfinally) {
      if (onfinally) {
        state.onCancelList.push(onfinally);
      }
      return createInternalCancelablePromise(promise.finally(createCallback(onfinally && function () {
        state.onCancelList = [];
        return onfinally();
      }, state, promise)), state);
    },
    cancel: function cancel() {
      state.isCanceled = true;
      var callbacks = state.onCancelList;
      state.onCancelList = [];
      callbacks.forEach(function (callback) {
        callback();
      });
    },
    isCanceled: function isCanceled() {
      return state.isCanceled === true;
    }
  };
}
function createCancelablePromise(executor) {
  return createInternalCancelablePromise(new Promise(function (resolve, reject) {
    return executor(resolve, reject);
  }), {
    isCanceled: false,
    onCancelList: []
  });
}
createCancelablePromise.resolve = function (value) {
  return cancelable(Promise.resolve(value));
};
createCancelablePromise.reject = function (reason) {
  return cancelable(Promise.reject(reason));
};
function cancelable(promise) {
  return createInternalCancelablePromise(promise, {
    isCanceled: false,
    onCancelList: []
  });
}
function createCallback(onResult, state, fallback) {
  if (!onResult) {
    return fallback;
  }
  return function callback(arg) {
    if (state.isCanceled) {
      return arg;
    }
    return onResult(arg);
  };
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-core/dist/esm/utils/getActiveItem.js
// We don't have access to the autocomplete source when we call `onKeyDown`
// or `onClick` because those are native browser events.
// However, we can get the source from the suggestion index.
function getCollectionFromActiveItemId(state) {
  // Given 3 sources with respectively 1, 2 and 3 suggestions: [1, 2, 3]
  // We want to get the accumulated counts:
  // [1, 1 + 2, 1 + 2 + 3] = [1, 3, 3 + 3] = [1, 3, 6]
  var accumulatedCollectionsCount = state.collections.map(function (collections) {
    return collections.items.length;
  }).reduce(function (acc, collectionsCount, index) {
    var previousValue = acc[index - 1] || 0;
    var nextValue = previousValue + collectionsCount;
    acc.push(nextValue);
    return acc;
  }, []);

  // Based on the accumulated counts, we can infer the index of the suggestion.
  var collectionIndex = accumulatedCollectionsCount.reduce(function (acc, current) {
    if (current <= state.activeItemId) {
      return acc + 1;
    }
    return acc;
  }, 0);
  return state.collections[collectionIndex];
}

/**
 * Gets the highlighted index relative to a suggestion object (not the absolute
 * highlighted index).
 *
 * Example:
 *  [['a', 'b'], ['c', 'd', 'e'], ['f']]
 *                      ↑
 *         (absolute: 3, relative: 1)
 */
function getRelativeActiveItemId(_ref) {
  var state = _ref.state,
    collection = _ref.collection;
  var isOffsetFound = false;
  var counter = 0;
  var previousItemsOffset = 0;
  while (isOffsetFound === false) {
    var currentCollection = state.collections[counter];
    if (currentCollection === collection) {
      isOffsetFound = true;
      break;
    }
    previousItemsOffset += currentCollection.items.length;
    counter++;
  }
  return state.activeItemId - previousItemsOffset;
}
function getActiveItem(state) {
  var collection = getCollectionFromActiveItemId(state);
  if (!collection) {
    return null;
  }
  var item = collection.items[getRelativeActiveItemId({
    state: state,
    collection: collection
  })];
  var source = collection.source;
  var itemInputValue = source.getItemInputValue({
    item: item,
    state: state
  });
  var itemUrl = source.getItemUrl({
    item: item,
    state: state
  });
  return {
    item: item,
    itemInputValue: itemInputValue,
    itemUrl: itemUrl,
    source: source
  };
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-core/dist/esm/onInput.js
function onInput_typeof(obj) { "@babel/helpers - typeof"; return onInput_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, onInput_typeof(obj); }
var onInput_excluded = ["event", "nextState", "props", "query", "refresh", "store"];
function onInput_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function onInput_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? onInput_ownKeys(Object(source), !0).forEach(function (key) { onInput_defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : onInput_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function onInput_defineProperty(obj, key, value) { key = onInput_toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function onInput_toPropertyKey(arg) { var key = onInput_toPrimitive(arg, "string"); return onInput_typeof(key) === "symbol" ? key : String(key); }
function onInput_toPrimitive(input, hint) { if (onInput_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (onInput_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function onInput_objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = onInput_objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function onInput_objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }



var lastStalledId = null;
var runConcurrentSafePromise = createConcurrentSafePromise();
function onInput(_ref) {
  var event = _ref.event,
    _ref$nextState = _ref.nextState,
    nextState = _ref$nextState === void 0 ? {} : _ref$nextState,
    props = _ref.props,
    query = _ref.query,
    refresh = _ref.refresh,
    store = _ref.store,
    setters = onInput_objectWithoutProperties(_ref, onInput_excluded);
  if (lastStalledId) {
    props.environment.clearTimeout(lastStalledId);
  }
  var setCollections = setters.setCollections,
    setIsOpen = setters.setIsOpen,
    setQuery = setters.setQuery,
    setActiveItemId = setters.setActiveItemId,
    setStatus = setters.setStatus;
  setQuery(query);
  setActiveItemId(props.defaultActiveItemId);
  if (!query && props.openOnFocus === false) {
    var _nextState$isOpen;
    var collections = store.getState().collections.map(function (collection) {
      return onInput_objectSpread(onInput_objectSpread({}, collection), {}, {
        items: []
      });
    });
    setStatus('idle');
    setCollections(collections);
    setIsOpen((_nextState$isOpen = nextState.isOpen) !== null && _nextState$isOpen !== void 0 ? _nextState$isOpen : props.shouldPanelOpen({
      state: store.getState()
    }));

    // We make sure to update the latest resolved value of the tracked
    // promises to keep late resolving promises from "cancelling" the state
    // updates performed in this code path.
    // We chain with a void promise to respect `onInput`'s expected return type.
    var _request = cancelable(runConcurrentSafePromise(collections).then(function () {
      return Promise.resolve();
    }));
    return store.pendingRequests.add(_request);
  }
  setStatus('loading');
  lastStalledId = props.environment.setTimeout(function () {
    setStatus('stalled');
  }, props.stallThreshold);

  // We track the entire promise chain triggered by `onInput` before mutating
  // the Autocomplete state to make sure that any state manipulation is based on
  // fresh data regardless of when promises individually resolve.
  // We don't track nested promises and only rely on the full chain resolution,
  // meaning we should only ever manipulate the state once this concurrent-safe
  // promise is resolved.
  var request = cancelable(runConcurrentSafePromise(props.getSources(onInput_objectSpread({
    query: query,
    refresh: refresh,
    state: store.getState()
  }, setters)).then(function (sources) {
    return Promise.all(sources.map(function (source) {
      return Promise.resolve(source.getItems(onInput_objectSpread({
        query: query,
        refresh: refresh,
        state: store.getState()
      }, setters))).then(function (itemsOrDescription) {
        return preResolve(itemsOrDescription, source.sourceId, store.getState());
      });
    })).then(resolve).then(function (responses) {
      return postResolve(responses, sources, store);
    }).then(function (collections) {
      return reshape({
        collections: collections,
        props: props,
        state: store.getState()
      });
    });
  }))).then(function (collections) {
    var _nextState$isOpen2;
    // Parameters passed to `onInput` could be stale when the following code
    // executes, because `onInput` calls may not resolve in order.
    // If it becomes a problem we'll need to save the last passed parameters.
    // See: https://codesandbox.io/s/agitated-cookies-y290z

    setStatus('idle');
    setCollections(collections);
    var isPanelOpen = props.shouldPanelOpen({
      state: store.getState()
    });
    setIsOpen((_nextState$isOpen2 = nextState.isOpen) !== null && _nextState$isOpen2 !== void 0 ? _nextState$isOpen2 : props.openOnFocus && !query && isPanelOpen || isPanelOpen);
    var highlightedItem = getActiveItem(store.getState());
    if (store.getState().activeItemId !== null && highlightedItem) {
      var item = highlightedItem.item,
        itemInputValue = highlightedItem.itemInputValue,
        itemUrl = highlightedItem.itemUrl,
        source = highlightedItem.source;
      source.onActive(onInput_objectSpread({
        event: event,
        item: item,
        itemInputValue: itemInputValue,
        itemUrl: itemUrl,
        refresh: refresh,
        source: source,
        state: store.getState()
      }, setters));
    }
  }).finally(function () {
    setStatus('idle');
    if (lastStalledId) {
      props.environment.clearTimeout(lastStalledId);
    }
  });
  return store.pendingRequests.add(request);
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-core/dist/esm/onKeyDown.js
function onKeyDown_typeof(obj) { "@babel/helpers - typeof"; return onKeyDown_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, onKeyDown_typeof(obj); }
var onKeyDown_excluded = ["event", "props", "refresh", "store"];
function onKeyDown_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function onKeyDown_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? onKeyDown_ownKeys(Object(source), !0).forEach(function (key) { onKeyDown_defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : onKeyDown_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function onKeyDown_defineProperty(obj, key, value) { key = onKeyDown_toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function onKeyDown_toPropertyKey(arg) { var key = onKeyDown_toPrimitive(arg, "string"); return onKeyDown_typeof(key) === "symbol" ? key : String(key); }
function onKeyDown_toPrimitive(input, hint) { if (onKeyDown_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (onKeyDown_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function onKeyDown_objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = onKeyDown_objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function onKeyDown_objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }


function onKeyDown_onKeyDown(_ref) {
  var event = _ref.event,
    props = _ref.props,
    refresh = _ref.refresh,
    store = _ref.store,
    setters = onKeyDown_objectWithoutProperties(_ref, onKeyDown_excluded);
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    // eslint-disable-next-line no-inner-declarations
    var triggerScrollIntoView = function triggerScrollIntoView() {
      var nodeItem = props.environment.document.getElementById("".concat(props.id, "-item-").concat(store.getState().activeItemId));
      if (nodeItem) {
        if (nodeItem.scrollIntoViewIfNeeded) {
          nodeItem.scrollIntoViewIfNeeded(false);
        } else {
          nodeItem.scrollIntoView(false);
        }
      }
    }; // eslint-disable-next-line no-inner-declarations
    var triggerOnActive = function triggerOnActive() {
      var highlightedItem = getActiveItem(store.getState());
      if (store.getState().activeItemId !== null && highlightedItem) {
        var item = highlightedItem.item,
          itemInputValue = highlightedItem.itemInputValue,
          itemUrl = highlightedItem.itemUrl,
          source = highlightedItem.source;
        source.onActive(onKeyDown_objectSpread({
          event: event,
          item: item,
          itemInputValue: itemInputValue,
          itemUrl: itemUrl,
          refresh: refresh,
          source: source,
          state: store.getState()
        }, setters));
      }
    }; // Default browser behavior changes the caret placement on ArrowUp and
    // ArrowDown.
    event.preventDefault();

    // When re-opening the panel, we need to split the logic to keep the actions
    // synchronized as `onInput` returns a promise.
    if (store.getState().isOpen === false && (props.openOnFocus || Boolean(store.getState().query))) {
      onInput(onKeyDown_objectSpread({
        event: event,
        props: props,
        query: store.getState().query,
        refresh: refresh,
        store: store
      }, setters)).then(function () {
        store.dispatch(event.key, {
          nextActiveItemId: props.defaultActiveItemId
        });
        triggerOnActive();
        // Since we rely on the DOM, we need to wait for all the micro tasks to
        // finish (which include re-opening the panel) to make sure all the
        // elements are available.
        setTimeout(triggerScrollIntoView, 0);
      });
    } else {
      store.dispatch(event.key, {});
      triggerOnActive();
      triggerScrollIntoView();
    }
  } else if (event.key === 'Escape') {
    // This prevents the default browser behavior on `input[type="search"]`
    // from removing the query right away because we first want to close the
    // panel.
    event.preventDefault();
    store.dispatch(event.key, null);

    // Hitting the `Escape` key signals the end of a user interaction with the
    // autocomplete. At this point, we should ignore any requests that are still
    // pending and could reopen the panel once they resolve, because that would
    // result in an unsolicited UI behavior.
    store.pendingRequests.cancelAll();
  } else if (event.key === 'Tab') {
    store.dispatch('blur', null);

    // Hitting the `Escape` key signals the end of a user interaction with the
    // autocomplete. At this point, we should ignore any requests that are still
    // pending and could reopen the panel once they resolve, because that would
    // result in an unsolicited UI behavior.
    store.pendingRequests.cancelAll();
  } else if (event.key === 'Enter') {
    // No active item, so we let the browser handle the native `onSubmit` form
    // event.
    if (store.getState().activeItemId === null || store.getState().collections.every(function (collection) {
      return collection.items.length === 0;
    })) {
      // If requests are still pending when the panel closes, they could reopen
      // the panel once they resolve.
      // We want to prevent any subsequent query from reopening the panel
      // because it would result in an unsolicited UI behavior.
      if (!props.debug) {
        store.pendingRequests.cancelAll();
      }
      return;
    }

    // This prevents the `onSubmit` event to be sent because an item is
    // highlighted.
    event.preventDefault();
    var _ref2 = getActiveItem(store.getState()),
      item = _ref2.item,
      itemInputValue = _ref2.itemInputValue,
      itemUrl = _ref2.itemUrl,
      source = _ref2.source;
    if (event.metaKey || event.ctrlKey) {
      if (itemUrl !== undefined) {
        source.onSelect(onKeyDown_objectSpread({
          event: event,
          item: item,
          itemInputValue: itemInputValue,
          itemUrl: itemUrl,
          refresh: refresh,
          source: source,
          state: store.getState()
        }, setters));
        props.navigator.navigateNewTab({
          itemUrl: itemUrl,
          item: item,
          state: store.getState()
        });
      }
    } else if (event.shiftKey) {
      if (itemUrl !== undefined) {
        source.onSelect(onKeyDown_objectSpread({
          event: event,
          item: item,
          itemInputValue: itemInputValue,
          itemUrl: itemUrl,
          refresh: refresh,
          source: source,
          state: store.getState()
        }, setters));
        props.navigator.navigateNewWindow({
          itemUrl: itemUrl,
          item: item,
          state: store.getState()
        });
      }
    } else if (event.altKey) {
      // Keep native browser behavior
    } else {
      if (itemUrl !== undefined) {
        source.onSelect(onKeyDown_objectSpread({
          event: event,
          item: item,
          itemInputValue: itemInputValue,
          itemUrl: itemUrl,
          refresh: refresh,
          source: source,
          state: store.getState()
        }, setters));
        props.navigator.navigate({
          itemUrl: itemUrl,
          item: item,
          state: store.getState()
        });
        return;
      }
      onInput(onKeyDown_objectSpread({
        event: event,
        nextState: {
          isOpen: false
        },
        props: props,
        query: itemInputValue,
        refresh: refresh,
        store: store
      }, setters)).then(function () {
        source.onSelect(onKeyDown_objectSpread({
          event: event,
          item: item,
          itemInputValue: itemInputValue,
          itemUrl: itemUrl,
          refresh: refresh,
          source: source,
          state: store.getState()
        }, setters));
      });
    }
  }
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-core/dist/esm/utils/isOrContainsNode.js
function isOrContainsNode(parent, child) {
  return parent === child || parent.contains(child);
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-core/dist/esm/utils/isSamsung.js
var regex = /((gt|sm)-|galaxy nexus)|samsung[- ]|samsungbrowser/i;
function isSamsung(userAgent) {
  return Boolean(userAgent && userAgent.match(regex));
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-core/dist/esm/getPropGetters.js
function getPropGetters_typeof(obj) { "@babel/helpers - typeof"; return getPropGetters_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, getPropGetters_typeof(obj); }
var getPropGetters_excluded = ["props", "refresh", "store"],
  getPropGetters_excluded2 = ["inputElement", "formElement", "panelElement"],
  _excluded3 = ["inputElement"],
  _excluded4 = ["inputElement", "maxLength"],
  _excluded5 = ["sourceIndex"],
  _excluded6 = ["sourceIndex"],
  _excluded7 = ["item", "source", "sourceIndex"];
function getPropGetters_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function getPropGetters_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? getPropGetters_ownKeys(Object(source), !0).forEach(function (key) { getPropGetters_defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : getPropGetters_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function getPropGetters_defineProperty(obj, key, value) { key = getPropGetters_toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function getPropGetters_toPropertyKey(arg) { var key = getPropGetters_toPrimitive(arg, "string"); return getPropGetters_typeof(key) === "symbol" ? key : String(key); }
function getPropGetters_toPrimitive(input, hint) { if (getPropGetters_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (getPropGetters_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function getPropGetters_objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = getPropGetters_objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }
function getPropGetters_objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }




function getPropGetters(_ref) {
  var props = _ref.props,
    refresh = _ref.refresh,
    store = _ref.store,
    setters = getPropGetters_objectWithoutProperties(_ref, getPropGetters_excluded);
  var getEnvironmentProps = function getEnvironmentProps(providedProps) {
    var inputElement = providedProps.inputElement,
      formElement = providedProps.formElement,
      panelElement = providedProps.panelElement,
      rest = getPropGetters_objectWithoutProperties(providedProps, getPropGetters_excluded2);
    function onMouseDownOrTouchStart(event) {
      // The `onTouchStart`/`onMouseDown` events shouldn't trigger the `blur`
      // handler when it's not an interaction with Autocomplete.
      // We detect it with the following heuristics:
      // - the panel is closed AND there are no pending requests
      //   (no interaction with the autocomplete, no future state updates)
      // - OR the touched target is the input element (should open the panel)
      var isAutocompleteInteraction = store.getState().isOpen || !store.pendingRequests.isEmpty();
      if (!isAutocompleteInteraction || event.target === inputElement) {
        return;
      }

      // @TODO: support cases where there are multiple Autocomplete instances.
      // Right now, a second instance makes this computation return false.
      var isTargetWithinAutocomplete = [formElement, panelElement].some(function (contextNode) {
        return isOrContainsNode(contextNode, event.target);
      });
      if (isTargetWithinAutocomplete === false) {
        store.dispatch('blur', null);

        // If requests are still pending when the user closes the panel, they
        // could reopen the panel once they resolve.
        // We want to prevent any subsequent query from reopening the panel
        // because it would result in an unsolicited UI behavior.
        if (!props.debug) {
          store.pendingRequests.cancelAll();
        }
      }
    }
    return getPropGetters_objectSpread({
      // We do not rely on the native `blur` event of the input to close the
      // panel, but rather on a custom `touchstart`/`mousedown` event outside
      // of the autocomplete elements.
      // This ensures we don't mistakenly interpret interactions within the
      // autocomplete (but outside of the input) as a signal to close the panel.
      // For example, clicking reset button causes an input blur, but if
      // `openOnFocus=true`, it shouldn't close the panel.
      // On touch devices, scrolling results (`touchmove`) causes an input blur
      // but shouldn't close the panel.
      onTouchStart: onMouseDownOrTouchStart,
      onMouseDown: onMouseDownOrTouchStart,
      // When scrolling on touch devices (mobiles, tablets, etc.), we want to
      // mimic the native platform behavior where the input is blurred to
      // hide the virtual keyboard. This gives more vertical space to
      // discover all the suggestions showing up in the panel.
      onTouchMove: function onTouchMove(event) {
        if (store.getState().isOpen === false || inputElement !== props.environment.document.activeElement || event.target === inputElement) {
          return;
        }
        inputElement.blur();
      }
    }, rest);
  };
  var getRootProps = function getRootProps(rest) {
    return getPropGetters_objectSpread({
      role: 'combobox',
      'aria-expanded': store.getState().isOpen,
      'aria-haspopup': 'listbox',
      'aria-owns': store.getState().isOpen ? "".concat(props.id, "-list") : undefined,
      'aria-labelledby': "".concat(props.id, "-label")
    }, rest);
  };
  var getFormProps = function getFormProps(providedProps) {
    var inputElement = providedProps.inputElement,
      rest = getPropGetters_objectWithoutProperties(providedProps, _excluded3);
    return getPropGetters_objectSpread({
      action: '',
      noValidate: true,
      role: 'search',
      onSubmit: function onSubmit(event) {
        var _providedProps$inputE;
        event.preventDefault();
        props.onSubmit(getPropGetters_objectSpread({
          event: event,
          refresh: refresh,
          state: store.getState()
        }, setters));
        store.dispatch('submit', null);
        (_providedProps$inputE = providedProps.inputElement) === null || _providedProps$inputE === void 0 ? void 0 : _providedProps$inputE.blur();
      },
      onReset: function onReset(event) {
        var _providedProps$inputE2;
        event.preventDefault();
        props.onReset(getPropGetters_objectSpread({
          event: event,
          refresh: refresh,
          state: store.getState()
        }, setters));
        store.dispatch('reset', null);
        (_providedProps$inputE2 = providedProps.inputElement) === null || _providedProps$inputE2 === void 0 ? void 0 : _providedProps$inputE2.focus();
      }
    }, rest);
  };
  var getInputProps = function getInputProps(providedProps) {
    var _props$environment$na;
    function onFocus(event) {
      // We want to trigger a query when `openOnFocus` is true
      // because the panel should open with the current query.
      if (props.openOnFocus || Boolean(store.getState().query)) {
        onInput(getPropGetters_objectSpread({
          event: event,
          props: props,
          query: store.getState().completion || store.getState().query,
          refresh: refresh,
          store: store
        }, setters));
      }
      store.dispatch('focus', null);
    }
    var _ref2 = providedProps || {},
      inputElement = _ref2.inputElement,
      _ref2$maxLength = _ref2.maxLength,
      maxLength = _ref2$maxLength === void 0 ? 512 : _ref2$maxLength,
      rest = getPropGetters_objectWithoutProperties(_ref2, _excluded4);
    var activeItem = getActiveItem(store.getState());
    var userAgent = ((_props$environment$na = props.environment.navigator) === null || _props$environment$na === void 0 ? void 0 : _props$environment$na.userAgent) || '';
    var shouldFallbackKeyHint = isSamsung(userAgent);
    var enterKeyHint = activeItem !== null && activeItem !== void 0 && activeItem.itemUrl && !shouldFallbackKeyHint ? 'go' : 'search';
    return getPropGetters_objectSpread({
      'aria-autocomplete': 'both',
      'aria-activedescendant': store.getState().isOpen && store.getState().activeItemId !== null ? "".concat(props.id, "-item-").concat(store.getState().activeItemId) : undefined,
      'aria-controls': store.getState().isOpen ? "".concat(props.id, "-list") : undefined,
      'aria-labelledby': "".concat(props.id, "-label"),
      value: store.getState().completion || store.getState().query,
      id: "".concat(props.id, "-input"),
      autoComplete: 'off',
      autoCorrect: 'off',
      autoCapitalize: 'off',
      enterKeyHint: enterKeyHint,
      spellCheck: 'false',
      autoFocus: props.autoFocus,
      placeholder: props.placeholder,
      maxLength: maxLength,
      type: 'search',
      onChange: function onChange(event) {
        onInput(getPropGetters_objectSpread({
          event: event,
          props: props,
          query: event.currentTarget.value.slice(0, maxLength),
          refresh: refresh,
          store: store
        }, setters));
      },
      onKeyDown: function onKeyDown(event) {
        onKeyDown_onKeyDown(getPropGetters_objectSpread({
          event: event,
          props: props,
          refresh: refresh,
          store: store
        }, setters));
      },
      onFocus: onFocus,
      // We don't rely on the `blur` event.
      // See explanation in `onTouchStart`/`onMouseDown`.
      // @MAJOR See if we need to keep this handler.
      onBlur: noop,
      onClick: function onClick(event) {
        // When the panel is closed and you click on the input while
        // the input is focused, the `onFocus` event is not triggered
        // (default browser behavior).
        // In an autocomplete context, it makes sense to open the panel in this
        // case.
        // We mimic this event by catching the `onClick` event which
        // triggers the `onFocus` for the panel to open.
        if (providedProps.inputElement === props.environment.document.activeElement && !store.getState().isOpen) {
          onFocus(event);
        }
      }
    }, rest);
  };
  var getAutocompleteId = function getAutocompleteId(instanceId, sourceId) {
    return typeof sourceId !== 'undefined' ? "".concat(instanceId, "-").concat(sourceId) : instanceId;
  };
  var getLabelProps = function getLabelProps(providedProps) {
    var _ref3 = providedProps || {},
      sourceIndex = _ref3.sourceIndex,
      rest = getPropGetters_objectWithoutProperties(_ref3, _excluded5);
    return getPropGetters_objectSpread({
      htmlFor: "".concat(getAutocompleteId(props.id, sourceIndex), "-input"),
      id: "".concat(getAutocompleteId(props.id, sourceIndex), "-label")
    }, rest);
  };
  var getListProps = function getListProps(providedProps) {
    var _ref4 = providedProps || {},
      sourceIndex = _ref4.sourceIndex,
      rest = getPropGetters_objectWithoutProperties(_ref4, _excluded6);
    return getPropGetters_objectSpread({
      role: 'listbox',
      'aria-labelledby': "".concat(getAutocompleteId(props.id, sourceIndex), "-label"),
      id: "".concat(getAutocompleteId(props.id, sourceIndex), "-list")
    }, rest);
  };
  var getPanelProps = function getPanelProps(rest) {
    return getPropGetters_objectSpread({
      onMouseDown: function onMouseDown(event) {
        // Prevents the `activeElement` from being changed to the panel so
        // that the blur event is not triggered, otherwise it closes the
        // panel.
        event.preventDefault();
      },
      onMouseLeave: function onMouseLeave() {
        store.dispatch('mouseleave', null);
      }
    }, rest);
  };
  var getItemProps = function getItemProps(providedProps) {
    var item = providedProps.item,
      source = providedProps.source,
      sourceIndex = providedProps.sourceIndex,
      rest = getPropGetters_objectWithoutProperties(providedProps, _excluded7);
    return getPropGetters_objectSpread({
      id: "".concat(getAutocompleteId(props.id, sourceIndex), "-item-").concat(item.__autocomplete_id),
      role: 'option',
      'aria-selected': store.getState().activeItemId === item.__autocomplete_id,
      onMouseMove: function onMouseMove(event) {
        if (item.__autocomplete_id === store.getState().activeItemId) {
          return;
        }
        store.dispatch('mousemove', item.__autocomplete_id);
        var activeItem = getActiveItem(store.getState());
        if (store.getState().activeItemId !== null && activeItem) {
          var _item = activeItem.item,
            itemInputValue = activeItem.itemInputValue,
            itemUrl = activeItem.itemUrl,
            _source = activeItem.source;
          _source.onActive(getPropGetters_objectSpread({
            event: event,
            item: _item,
            itemInputValue: itemInputValue,
            itemUrl: itemUrl,
            refresh: refresh,
            source: _source,
            state: store.getState()
          }, setters));
        }
      },
      onMouseDown: function onMouseDown(event) {
        // Prevents the `activeElement` from being changed to the item so it
        // can remain with the current `activeElement`.
        event.preventDefault();
      },
      onClick: function onClick(event) {
        var itemInputValue = source.getItemInputValue({
          item: item,
          state: store.getState()
        });
        var itemUrl = source.getItemUrl({
          item: item,
          state: store.getState()
        });

        // If `getItemUrl` is provided, it means that the suggestion
        // is a link, not plain text that aims at updating the query.
        // We can therefore skip the state change because it will update
        // the `activeItemId`, resulting in a UI flash, especially
        // noticeable on mobile.
        var runPreCommand = itemUrl ? Promise.resolve() : onInput(getPropGetters_objectSpread({
          event: event,
          nextState: {
            isOpen: false
          },
          props: props,
          query: itemInputValue,
          refresh: refresh,
          store: store
        }, setters));
        runPreCommand.then(function () {
          source.onSelect(getPropGetters_objectSpread({
            event: event,
            item: item,
            itemInputValue: itemInputValue,
            itemUrl: itemUrl,
            refresh: refresh,
            source: source,
            state: store.getState()
          }, setters));
        });
      }
    }, rest);
  };
  return {
    getEnvironmentProps: getEnvironmentProps,
    getRootProps: getRootProps,
    getFormProps: getFormProps,
    getLabelProps: getLabelProps,
    getInputProps: getInputProps,
    getPanelProps: getPanelProps,
    getListProps: getListProps,
    getItemProps: getItemProps
  };
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-shared/dist/esm/version.js
var version = '1.9.3';
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-shared/dist/esm/userAgents.js

var userAgents = [{
  segment: 'autocomplete-core',
  version: version
}];
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-core/dist/esm/metadata.js
function metadata_typeof(obj) { "@babel/helpers - typeof"; return metadata_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, metadata_typeof(obj); }
function metadata_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function metadata_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? metadata_ownKeys(Object(source), !0).forEach(function (key) { metadata_defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : metadata_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function metadata_defineProperty(obj, key, value) { key = metadata_toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function metadata_toPropertyKey(arg) { var key = metadata_toPrimitive(arg, "string"); return metadata_typeof(key) === "symbol" ? key : String(key); }
function metadata_toPrimitive(input, hint) { if (metadata_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (metadata_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }

function getMetadata(_ref) {
  var _, _options$__autocomple, _options$__autocomple2, _options$__autocomple3;
  var plugins = _ref.plugins,
    options = _ref.options;
  var optionsKey = (_ = (((_options$__autocomple = options.__autocomplete_metadata) === null || _options$__autocomple === void 0 ? void 0 : _options$__autocomple.userAgents) || [])[0]) === null || _ === void 0 ? void 0 : _.segment;
  var extraOptions = optionsKey ? metadata_defineProperty({}, optionsKey, Object.keys(((_options$__autocomple2 = options.__autocomplete_metadata) === null || _options$__autocomple2 === void 0 ? void 0 : _options$__autocomple2.options) || {})) : {};
  return {
    plugins: plugins.map(function (plugin) {
      return {
        name: plugin.name,
        options: Object.keys(plugin.__autocomplete_pluginOptions || [])
      };
    }),
    options: metadata_objectSpread({
      'autocomplete-core': Object.keys(options)
    }, extraOptions),
    ua: userAgents.concat(((_options$__autocomple3 = options.__autocomplete_metadata) === null || _options$__autocomple3 === void 0 ? void 0 : _options$__autocomple3.userAgents) || [])
  };
}
function injectMetadata(_ref3) {
  var _environment$navigato, _environment$navigato2;
  var metadata = _ref3.metadata,
    environment = _ref3.environment;
  var isMetadataEnabled = (_environment$navigato = environment.navigator) === null || _environment$navigato === void 0 ? void 0 : (_environment$navigato2 = _environment$navigato.userAgent) === null || _environment$navigato2 === void 0 ? void 0 : _environment$navigato2.includes('Algolia Crawler');
  if (isMetadataEnabled) {
    var metadataContainer = environment.document.createElement('meta');
    var headRef = environment.document.querySelector('head');
    metadataContainer.name = 'algolia:metadata';
    setTimeout(function () {
      metadataContainer.content = JSON.stringify(metadata);
      headRef.appendChild(metadataContainer);
    }, 0);
  }
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-core/dist/esm/getCompletion.js

function getCompletion(_ref) {
  var _getActiveItem;
  var state = _ref.state;
  if (state.isOpen === false || state.activeItemId === null) {
    return null;
  }
  return ((_getActiveItem = getActiveItem(state)) === null || _getActiveItem === void 0 ? void 0 : _getActiveItem.itemInputValue) || null;
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-core/dist/esm/utils/getNextActiveItemId.js
/**
 * Returns the next active item ID from the current state.
 *
 * We allow circular keyboard navigation from the base index.
 * The base index can either be `null` (nothing is highlighted) or `0`
 * (the first item is highlighted).
 * The base index is allowed to get assigned `null` only if
 * `props.defaultActiveItemId` is `null`. This pattern allows to "stop"
 * by the actual query before navigating to other suggestions as seen on
 * Google or Amazon.
 *
 * @param moveAmount The offset to increment (or decrement) the last index
 * @param baseIndex The current index to compute the next index from
 * @param itemCount The number of items
 * @param defaultActiveItemId The default active index to fallback to
 */
function getNextActiveItemId(moveAmount, baseIndex, itemCount, defaultActiveItemId) {
  if (!itemCount) {
    return null;
  }
  if (moveAmount < 0 && (baseIndex === null || defaultActiveItemId !== null && baseIndex === 0)) {
    return itemCount + moveAmount;
  }
  var numericIndex = (baseIndex === null ? -1 : baseIndex) + moveAmount;
  if (numericIndex <= -1 || numericIndex >= itemCount) {
    return defaultActiveItemId === null ? null : 0;
  }
  return numericIndex;
}
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-core/dist/esm/stateReducer.js
function stateReducer_typeof(obj) { "@babel/helpers - typeof"; return stateReducer_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, stateReducer_typeof(obj); }
function stateReducer_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function stateReducer_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? stateReducer_ownKeys(Object(source), !0).forEach(function (key) { stateReducer_defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : stateReducer_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function stateReducer_defineProperty(obj, key, value) { key = stateReducer_toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function stateReducer_toPropertyKey(arg) { var key = stateReducer_toPrimitive(arg, "string"); return stateReducer_typeof(key) === "symbol" ? key : String(key); }
function stateReducer_toPrimitive(input, hint) { if (stateReducer_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (stateReducer_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }



var stateReducer = function stateReducer(state, action) {
  switch (action.type) {
    case 'setActiveItemId':
      {
        return stateReducer_objectSpread(stateReducer_objectSpread({}, state), {}, {
          activeItemId: action.payload
        });
      }
    case 'setQuery':
      {
        return stateReducer_objectSpread(stateReducer_objectSpread({}, state), {}, {
          query: action.payload,
          completion: null
        });
      }
    case 'setCollections':
      {
        return stateReducer_objectSpread(stateReducer_objectSpread({}, state), {}, {
          collections: action.payload
        });
      }
    case 'setIsOpen':
      {
        return stateReducer_objectSpread(stateReducer_objectSpread({}, state), {}, {
          isOpen: action.payload
        });
      }
    case 'setStatus':
      {
        return stateReducer_objectSpread(stateReducer_objectSpread({}, state), {}, {
          status: action.payload
        });
      }
    case 'setContext':
      {
        return stateReducer_objectSpread(stateReducer_objectSpread({}, state), {}, {
          context: stateReducer_objectSpread(stateReducer_objectSpread({}, state.context), action.payload)
        });
      }
    case 'ArrowDown':
      {
        var nextState = stateReducer_objectSpread(stateReducer_objectSpread({}, state), {}, {
          activeItemId: action.payload.hasOwnProperty('nextActiveItemId') ? action.payload.nextActiveItemId : getNextActiveItemId(1, state.activeItemId, getItemsCount(state), action.props.defaultActiveItemId)
        });
        return stateReducer_objectSpread(stateReducer_objectSpread({}, nextState), {}, {
          completion: getCompletion({
            state: nextState
          })
        });
      }
    case 'ArrowUp':
      {
        var _nextState = stateReducer_objectSpread(stateReducer_objectSpread({}, state), {}, {
          activeItemId: getNextActiveItemId(-1, state.activeItemId, getItemsCount(state), action.props.defaultActiveItemId)
        });
        return stateReducer_objectSpread(stateReducer_objectSpread({}, _nextState), {}, {
          completion: getCompletion({
            state: _nextState
          })
        });
      }
    case 'Escape':
      {
        if (state.isOpen) {
          return stateReducer_objectSpread(stateReducer_objectSpread({}, state), {}, {
            activeItemId: null,
            isOpen: false,
            completion: null
          });
        }
        return stateReducer_objectSpread(stateReducer_objectSpread({}, state), {}, {
          activeItemId: null,
          query: '',
          status: 'idle',
          collections: []
        });
      }
    case 'submit':
      {
        return stateReducer_objectSpread(stateReducer_objectSpread({}, state), {}, {
          activeItemId: null,
          isOpen: false,
          status: 'idle'
        });
      }
    case 'reset':
      {
        return stateReducer_objectSpread(stateReducer_objectSpread({}, state), {}, {
          activeItemId:
          // Since we open the panel on reset when openOnFocus=true
          // we need to restore the highlighted index to the defaultActiveItemId. (DocSearch use-case)

          // Since we close the panel when openOnFocus=false
          // we lose track of the highlighted index. (Query-suggestions use-case)
          action.props.openOnFocus === true ? action.props.defaultActiveItemId : null,
          status: 'idle',
          query: ''
        });
      }
    case 'focus':
      {
        return stateReducer_objectSpread(stateReducer_objectSpread({}, state), {}, {
          activeItemId: action.props.defaultActiveItemId,
          isOpen: (action.props.openOnFocus || Boolean(state.query)) && action.props.shouldPanelOpen({
            state: state
          })
        });
      }
    case 'blur':
      {
        if (action.props.debug) {
          return state;
        }
        return stateReducer_objectSpread(stateReducer_objectSpread({}, state), {}, {
          isOpen: false,
          activeItemId: null
        });
      }
    case 'mousemove':
      {
        return stateReducer_objectSpread(stateReducer_objectSpread({}, state), {}, {
          activeItemId: action.payload
        });
      }
    case 'mouseleave':
      {
        return stateReducer_objectSpread(stateReducer_objectSpread({}, state), {}, {
          activeItemId: action.props.defaultActiveItemId
        });
      }
    default:
      invariant(false, "The reducer action ".concat(JSON.stringify(action.type), " is not supported."));
      return state;
  }
};
;// CONCATENATED MODULE: ./node_modules/@algolia/autocomplete-core/dist/esm/createAutocomplete.js
function createAutocomplete_typeof(obj) { "@babel/helpers - typeof"; return createAutocomplete_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, createAutocomplete_typeof(obj); }
function createAutocomplete_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function createAutocomplete_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? createAutocomplete_ownKeys(Object(source), !0).forEach(function (key) { createAutocomplete_defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : createAutocomplete_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function createAutocomplete_defineProperty(obj, key, value) { key = createAutocomplete_toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function createAutocomplete_toPropertyKey(arg) { var key = createAutocomplete_toPrimitive(arg, "string"); return createAutocomplete_typeof(key) === "symbol" ? key : String(key); }
function createAutocomplete_toPrimitive(input, hint) { if (createAutocomplete_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (createAutocomplete_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }









function createAutocomplete(options) {
  checkOptions(options);
  var subscribers = [];
  var props = getDefaultProps(options, subscribers);
  var store = createStore(stateReducer, props, onStoreStateChange);
  var setters = getAutocompleteSetters({
    store: store
  });
  var propGetters = getPropGetters(createAutocomplete_objectSpread({
    props: props,
    refresh: refresh,
    store: store,
    navigator: props.navigator
  }, setters));
  function onStoreStateChange(_ref) {
    var prevState = _ref.prevState,
      state = _ref.state;
    props.onStateChange(createAutocomplete_objectSpread({
      prevState: prevState,
      state: state,
      refresh: refresh,
      navigator: props.navigator
    }, setters));
  }
  function refresh() {
    return onInput(createAutocomplete_objectSpread({
      event: new Event('input'),
      nextState: {
        isOpen: store.getState().isOpen
      },
      props: props,
      navigator: props.navigator,
      query: store.getState().query,
      refresh: refresh,
      store: store
    }, setters));
  }
  if (options.insights && !props.plugins.some(function (plugin) {
    return plugin.name === 'aa.algoliaInsightsPlugin';
  })) {
    var insightsParams = typeof options.insights === 'boolean' ? {} : options.insights;
    props.plugins.push(createAlgoliaInsightsPlugin(insightsParams));
  }
  props.plugins.forEach(function (plugin) {
    var _plugin$subscribe;
    return (_plugin$subscribe = plugin.subscribe) === null || _plugin$subscribe === void 0 ? void 0 : _plugin$subscribe.call(plugin, createAutocomplete_objectSpread(createAutocomplete_objectSpread({}, setters), {}, {
      navigator: props.navigator,
      refresh: refresh,
      onSelect: function onSelect(fn) {
        subscribers.push({
          onSelect: fn
        });
      },
      onActive: function onActive(fn) {
        subscribers.push({
          onActive: fn
        });
      },
      onResolve: function onResolve(fn) {
        subscribers.push({
          onResolve: fn
        });
      }
    }));
  });
  injectMetadata({
    metadata: getMetadata({
      plugins: props.plugins,
      options: options
    }),
    environment: props.environment
  });
  return createAutocomplete_objectSpread(createAutocomplete_objectSpread({
    refresh: refresh,
    navigator: props.navigator
  }, propGetters), setters);
}
// EXTERNAL MODULE: ./node_modules/react/index.js
var react = __webpack_require__(67294);
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/constants.js
var MAX_QUERY_SIZE = 64;
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/AlgoliaLogo.js

function AlgoliaLogo(_ref) {
  var _ref$translations = _ref.translations,
      translations = _ref$translations === void 0 ? {} : _ref$translations;
  var _translations$searchB = translations.searchByText,
      searchByText = _translations$searchB === void 0 ? 'Search by' : _translations$searchB;
  return /*#__PURE__*/react.createElement("a", {
    href: "https://www.algolia.com/ref/docsearch/?utm_source=".concat(window.location.hostname, "&utm_medium=referral&utm_content=powered_by&utm_campaign=docsearch"),
    target: "_blank",
    rel: "noopener noreferrer"
  }, /*#__PURE__*/react.createElement("span", {
    className: "DocSearch-Label"
  }, searchByText), /*#__PURE__*/react.createElement("svg", {
    width: "77",
    height: "19",
    "aria-label": "Algolia",
    role: "img",
    id: "Layer_1",
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 2196.2 500"
  }, /*#__PURE__*/react.createElement("defs", null, /*#__PURE__*/react.createElement("style", null, ".cls-1,.cls-2{fill:#003dff;}.cls-2{fill-rule:evenodd;}")), /*#__PURE__*/react.createElement("path", {
    className: "cls-2",
    d: "M1070.38,275.3V5.91c0-3.63-3.24-6.39-6.82-5.83l-50.46,7.94c-2.87,.45-4.99,2.93-4.99,5.84l.17,273.22c0,12.92,0,92.7,95.97,95.49,3.33,.1,6.09-2.58,6.09-5.91v-40.78c0-2.96-2.19-5.51-5.12-5.84-34.85-4.01-34.85-47.57-34.85-54.72Z"
  }), /*#__PURE__*/react.createElement("rect", {
    className: "cls-1",
    x: "1845.88",
    y: "104.73",
    width: "62.58",
    height: "277.9",
    rx: "5.9",
    ry: "5.9"
  }), /*#__PURE__*/react.createElement("path", {
    className: "cls-2",
    d: "M1851.78,71.38h50.77c3.26,0,5.9-2.64,5.9-5.9V5.9c0-3.62-3.24-6.39-6.82-5.83l-50.77,7.95c-2.87,.45-4.99,2.92-4.99,5.83v51.62c0,3.26,2.64,5.9,5.9,5.9Z"
  }), /*#__PURE__*/react.createElement("path", {
    className: "cls-2",
    d: "M1764.03,275.3V5.91c0-3.63-3.24-6.39-6.82-5.83l-50.46,7.94c-2.87,.45-4.99,2.93-4.99,5.84l.17,273.22c0,12.92,0,92.7,95.97,95.49,3.33,.1,6.09-2.58,6.09-5.91v-40.78c0-2.96-2.19-5.51-5.12-5.84-34.85-4.01-34.85-47.57-34.85-54.72Z"
  }), /*#__PURE__*/react.createElement("path", {
    className: "cls-2",
    d: "M1631.95,142.72c-11.14-12.25-24.83-21.65-40.78-28.31-15.92-6.53-33.26-9.85-52.07-9.85-18.78,0-36.15,3.17-51.92,9.85-15.59,6.66-29.29,16.05-40.76,28.31-11.47,12.23-20.38,26.87-26.76,44.03-6.38,17.17-9.24,37.37-9.24,58.36,0,20.99,3.19,36.87,9.55,54.21,6.38,17.32,15.14,32.11,26.45,44.36,11.29,12.23,24.83,21.62,40.6,28.46,15.77,6.83,40.12,10.33,52.4,10.48,12.25,0,36.78-3.82,52.7-10.48,15.92-6.68,29.46-16.23,40.78-28.46,11.29-12.25,20.05-27.04,26.25-44.36,6.22-17.34,9.24-33.22,9.24-54.21,0-20.99-3.34-41.19-10.03-58.36-6.38-17.17-15.14-31.8-26.43-44.03Zm-44.43,163.75c-11.47,15.75-27.56,23.7-48.09,23.7-20.55,0-36.63-7.8-48.1-23.7-11.47-15.75-17.21-34.01-17.21-61.2,0-26.89,5.59-49.14,17.06-64.87,11.45-15.75,27.54-23.52,48.07-23.52,20.55,0,36.63,7.78,48.09,23.52,11.47,15.57,17.36,37.98,17.36,64.87,0,27.19-5.72,45.3-17.19,61.2Z"
  }), /*#__PURE__*/react.createElement("path", {
    className: "cls-2",
    d: "M894.42,104.73h-49.33c-48.36,0-90.91,25.48-115.75,64.1-14.52,22.58-22.99,49.63-22.99,78.73,0,44.89,20.13,84.92,51.59,111.1,2.93,2.6,6.05,4.98,9.31,7.14,12.86,8.49,28.11,13.47,44.52,13.47,1.23,0,2.46-.03,3.68-.09,.36-.02,.71-.05,1.07-.07,.87-.05,1.75-.11,2.62-.2,.34-.03,.68-.08,1.02-.12,.91-.1,1.82-.21,2.73-.34,.21-.03,.42-.07,.63-.1,32.89-5.07,61.56-30.82,70.9-62.81v57.83c0,3.26,2.64,5.9,5.9,5.9h50.42c3.26,0,5.9-2.64,5.9-5.9V110.63c0-3.26-2.64-5.9-5.9-5.9h-56.32Zm0,206.92c-12.2,10.16-27.97,13.98-44.84,15.12-.16,.01-.33,.03-.49,.04-1.12,.07-2.24,.1-3.36,.1-42.24,0-77.12-35.89-77.12-79.37,0-10.25,1.96-20.01,5.42-28.98,11.22-29.12,38.77-49.74,71.06-49.74h49.33v142.83Z"
  }), /*#__PURE__*/react.createElement("path", {
    className: "cls-2",
    d: "M2133.97,104.73h-49.33c-48.36,0-90.91,25.48-115.75,64.1-14.52,22.58-22.99,49.63-22.99,78.73,0,44.89,20.13,84.92,51.59,111.1,2.93,2.6,6.05,4.98,9.31,7.14,12.86,8.49,28.11,13.47,44.52,13.47,1.23,0,2.46-.03,3.68-.09,.36-.02,.71-.05,1.07-.07,.87-.05,1.75-.11,2.62-.2,.34-.03,.68-.08,1.02-.12,.91-.1,1.82-.21,2.73-.34,.21-.03,.42-.07,.63-.1,32.89-5.07,61.56-30.82,70.9-62.81v57.83c0,3.26,2.64,5.9,5.9,5.9h50.42c3.26,0,5.9-2.64,5.9-5.9V110.63c0-3.26-2.64-5.9-5.9-5.9h-56.32Zm0,206.92c-12.2,10.16-27.97,13.98-44.84,15.12-.16,.01-.33,.03-.49,.04-1.12,.07-2.24,.1-3.36,.1-42.24,0-77.12-35.89-77.12-79.37,0-10.25,1.96-20.01,5.42-28.98,11.22-29.12,38.77-49.74,71.06-49.74h49.33v142.83Z"
  }), /*#__PURE__*/react.createElement("path", {
    className: "cls-2",
    d: "M1314.05,104.73h-49.33c-48.36,0-90.91,25.48-115.75,64.1-11.79,18.34-19.6,39.64-22.11,62.59-.58,5.3-.88,10.68-.88,16.14s.31,11.15,.93,16.59c4.28,38.09,23.14,71.61,50.66,94.52,2.93,2.6,6.05,4.98,9.31,7.14,12.86,8.49,28.11,13.47,44.52,13.47h0c17.99,0,34.61-5.93,48.16-15.97,16.29-11.58,28.88-28.54,34.48-47.75v50.26h-.11v11.08c0,21.84-5.71,38.27-17.34,49.36-11.61,11.08-31.04,16.63-58.25,16.63-11.12,0-28.79-.59-46.6-2.41-2.83-.29-5.46,1.5-6.27,4.22l-12.78,43.11c-1.02,3.46,1.27,7.02,4.83,7.53,21.52,3.08,42.52,4.68,54.65,4.68,48.91,0,85.16-10.75,108.89-32.21,21.48-19.41,33.15-48.89,35.2-88.52V110.63c0-3.26-2.64-5.9-5.9-5.9h-56.32Zm0,64.1s.65,139.13,0,143.36c-12.08,9.77-27.11,13.59-43.49,14.7-.16,.01-.33,.03-.49,.04-1.12,.07-2.24,.1-3.36,.1-1.32,0-2.63-.03-3.94-.1-40.41-2.11-74.52-37.26-74.52-79.38,0-10.25,1.96-20.01,5.42-28.98,11.22-29.12,38.77-49.74,71.06-49.74h49.33Z"
  }), /*#__PURE__*/react.createElement("path", {
    className: "cls-1",
    d: "M249.83,0C113.3,0,2,110.09,.03,246.16c-2,138.19,110.12,252.7,248.33,253.5,42.68,.25,83.79-10.19,120.3-30.03,3.56-1.93,4.11-6.83,1.08-9.51l-23.38-20.72c-4.75-4.21-11.51-5.4-17.36-2.92-25.48,10.84-53.17,16.38-81.71,16.03-111.68-1.37-201.91-94.29-200.13-205.96,1.76-110.26,92-199.41,202.67-199.41h202.69V407.41l-115-102.18c-3.72-3.31-9.42-2.66-12.42,1.31-18.46,24.44-48.53,39.64-81.93,37.34-46.33-3.2-83.87-40.5-87.34-86.81-4.15-55.24,39.63-101.52,94-101.52,49.18,0,89.68,37.85,93.91,85.95,.38,4.28,2.31,8.27,5.52,11.12l29.95,26.55c3.4,3.01,8.79,1.17,9.63-3.3,2.16-11.55,2.92-23.58,2.07-35.92-4.82-70.34-61.8-126.93-132.17-131.26-80.68-4.97-148.13,58.14-150.27,137.25-2.09,77.1,61.08,143.56,138.19,145.26,32.19,.71,62.03-9.41,86.14-26.95l150.26,133.2c6.44,5.71,16.61,1.14,16.61-7.47V9.48C499.66,4.25,495.42,0,490.18,0H249.83Z"
  })));
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/Footer.js



function CommandIcon(props) {
  return /*#__PURE__*/react.createElement("svg", {
    width: "15",
    height: "15",
    "aria-label": props.ariaLabel,
    role: "img"
  }, /*#__PURE__*/react.createElement("g", {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "1.2"
  }, props.children));
}

function Footer(_ref) {
  var _ref$translations = _ref.translations,
      translations = _ref$translations === void 0 ? {} : _ref$translations;
  var _translations$selectT = translations.selectText,
      selectText = _translations$selectT === void 0 ? 'to select' : _translations$selectT,
      _translations$selectK = translations.selectKeyAriaLabel,
      selectKeyAriaLabel = _translations$selectK === void 0 ? 'Enter key' : _translations$selectK,
      _translations$navigat = translations.navigateText,
      navigateText = _translations$navigat === void 0 ? 'to navigate' : _translations$navigat,
      _translations$navigat2 = translations.navigateUpKeyAriaLabel,
      navigateUpKeyAriaLabel = _translations$navigat2 === void 0 ? 'Arrow up' : _translations$navigat2,
      _translations$navigat3 = translations.navigateDownKeyAriaLabel,
      navigateDownKeyAriaLabel = _translations$navigat3 === void 0 ? 'Arrow down' : _translations$navigat3,
      _translations$closeTe = translations.closeText,
      closeText = _translations$closeTe === void 0 ? 'to close' : _translations$closeTe,
      _translations$closeKe = translations.closeKeyAriaLabel,
      closeKeyAriaLabel = _translations$closeKe === void 0 ? 'Escape key' : _translations$closeKe,
      _translations$searchB = translations.searchByText,
      searchByText = _translations$searchB === void 0 ? 'Search by' : _translations$searchB;
  return /*#__PURE__*/react.createElement(react.Fragment, null, /*#__PURE__*/react.createElement("div", {
    className: "DocSearch-Logo"
  }, /*#__PURE__*/react.createElement(AlgoliaLogo, {
    translations: {
      searchByText: searchByText
    }
  })), /*#__PURE__*/react.createElement("ul", {
    className: "DocSearch-Commands"
  }, /*#__PURE__*/react.createElement("li", null, /*#__PURE__*/react.createElement("kbd", {
    className: "DocSearch-Commands-Key"
  }, /*#__PURE__*/react.createElement(CommandIcon, {
    ariaLabel: selectKeyAriaLabel
  }, /*#__PURE__*/react.createElement("path", {
    d: "M12 3.53088v3c0 1-1 2-2 2H4M7 11.53088l-3-3 3-3"
  }))), /*#__PURE__*/react.createElement("span", {
    className: "DocSearch-Label"
  }, selectText)), /*#__PURE__*/react.createElement("li", null, /*#__PURE__*/react.createElement("kbd", {
    className: "DocSearch-Commands-Key"
  }, /*#__PURE__*/react.createElement(CommandIcon, {
    ariaLabel: navigateDownKeyAriaLabel
  }, /*#__PURE__*/react.createElement("path", {
    d: "M7.5 3.5v8M10.5 8.5l-3 3-3-3"
  }))), /*#__PURE__*/react.createElement("kbd", {
    className: "DocSearch-Commands-Key"
  }, /*#__PURE__*/react.createElement(CommandIcon, {
    ariaLabel: navigateUpKeyAriaLabel
  }, /*#__PURE__*/react.createElement("path", {
    d: "M7.5 11.5v-8M10.5 6.5l-3-3-3 3"
  }))), /*#__PURE__*/react.createElement("span", {
    className: "DocSearch-Label"
  }, navigateText)), /*#__PURE__*/react.createElement("li", null, /*#__PURE__*/react.createElement("kbd", {
    className: "DocSearch-Commands-Key"
  }, /*#__PURE__*/react.createElement(CommandIcon, {
    ariaLabel: closeKeyAriaLabel
  }, /*#__PURE__*/react.createElement("path", {
    d: "M13.6167 8.936c-.1065.3583-.6883.962-1.4875.962-.7993 0-1.653-.9165-1.653-2.1258v-.5678c0-1.2548.7896-2.1016 1.653-2.1016.8634 0 1.3601.4778 1.4875 1.0724M9 6c-.1352-.4735-.7506-.9219-1.46-.8972-.7092.0246-1.344.57-1.344 1.2166s.4198.8812 1.3445.9805C8.465 7.3992 8.968 7.9337 9 8.5c.032.5663-.454 1.398-1.4595 1.398C6.6593 9.898 6 9 5.963 8.4851m-1.4748.5368c-.2635.5941-.8099.876-1.5443.876s-1.7073-.6248-1.7073-2.204v-.4603c0-1.0416.721-2.131 1.7073-2.131.9864 0 1.6425 1.031 1.5443 2.2492h-2.956"
  }))), /*#__PURE__*/react.createElement("span", {
    className: "DocSearch-Label"
  }, closeText))));
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/Hit.js

function Hit(_ref) {
  var hit = _ref.hit,
      children = _ref.children;
  return /*#__PURE__*/react.createElement("a", {
    href: hit.url
  }, children);
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/icons/ErrorIcon.js

function ErrorIcon() {
  return /*#__PURE__*/react.createElement("svg", {
    width: "40",
    height: "40",
    viewBox: "0 0 20 20",
    fill: "none",
    fillRule: "evenodd",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/react.createElement("path", {
    d: "M19 4.8a16 16 0 00-2-1.2m-3.3-1.2A16 16 0 001.1 4.7M16.7 8a12 12 0 00-2.8-1.4M10 6a12 12 0 00-6.7 2M12.3 14.7a4 4 0 00-4.5 0M14.5 11.4A8 8 0 0010 10M3 16L18 2M10 18h0"
  }));
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/ErrorScreen.js


function ErrorScreen(_ref) {
  var _ref$translations = _ref.translations,
      translations = _ref$translations === void 0 ? {} : _ref$translations;
  var _translations$titleTe = translations.titleText,
      titleText = _translations$titleTe === void 0 ? 'Unable to fetch results' : _translations$titleTe,
      _translations$helpTex = translations.helpText,
      helpText = _translations$helpTex === void 0 ? 'You might want to check your network connection.' : _translations$helpTex;
  return /*#__PURE__*/react.createElement("div", {
    className: "DocSearch-ErrorScreen"
  }, /*#__PURE__*/react.createElement("div", {
    className: "DocSearch-Screen-Icon"
  }, /*#__PURE__*/react.createElement(ErrorIcon, null)), /*#__PURE__*/react.createElement("p", {
    className: "DocSearch-Title"
  }, titleText), /*#__PURE__*/react.createElement("p", {
    className: "DocSearch-Help"
  }, helpText));
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/icons/NoResultsIcon.js

function NoResultsIcon() {
  return /*#__PURE__*/react.createElement("svg", {
    width: "40",
    height: "40",
    viewBox: "0 0 20 20",
    fill: "none",
    fillRule: "evenodd",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/react.createElement("path", {
    d: "M15.5 4.8c2 3 1.7 7-1 9.7h0l4.3 4.3-4.3-4.3a7.8 7.8 0 01-9.8 1m-2.2-2.2A7.8 7.8 0 0113.2 2.4M2 18L18 2"
  }));
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/NoResultsScreen.js
var NoResultsScreen_excluded = ["translations"];

function NoResultsScreen_toConsumableArray(arr) { return NoResultsScreen_arrayWithoutHoles(arr) || NoResultsScreen_iterableToArray(arr) || NoResultsScreen_unsupportedIterableToArray(arr) || NoResultsScreen_nonIterableSpread(); }

function NoResultsScreen_nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function NoResultsScreen_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return NoResultsScreen_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return NoResultsScreen_arrayLikeToArray(o, minLen); }

function NoResultsScreen_iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function NoResultsScreen_arrayWithoutHoles(arr) { if (Array.isArray(arr)) return NoResultsScreen_arrayLikeToArray(arr); }

function NoResultsScreen_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function NoResultsScreen_objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = NoResultsScreen_objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function NoResultsScreen_objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }



function NoResultsScreen(_ref) {
  var _ref$translations = _ref.translations,
      translations = _ref$translations === void 0 ? {} : _ref$translations,
      props = NoResultsScreen_objectWithoutProperties(_ref, NoResultsScreen_excluded);

  var _translations$noResul = translations.noResultsText,
      noResultsText = _translations$noResul === void 0 ? 'No results for' : _translations$noResul,
      _translations$suggest = translations.suggestedQueryText,
      suggestedQueryText = _translations$suggest === void 0 ? 'Try searching for' : _translations$suggest,
      _translations$reportM = translations.reportMissingResultsText,
      reportMissingResultsText = _translations$reportM === void 0 ? 'Believe this query should return results?' : _translations$reportM,
      _translations$reportM2 = translations.reportMissingResultsLinkText,
      reportMissingResultsLinkText = _translations$reportM2 === void 0 ? 'Let us know.' : _translations$reportM2;
  var searchSuggestions = props.state.context.searchSuggestions;
  return /*#__PURE__*/react.createElement("div", {
    className: "DocSearch-NoResults"
  }, /*#__PURE__*/react.createElement("div", {
    className: "DocSearch-Screen-Icon"
  }, /*#__PURE__*/react.createElement(NoResultsIcon, null)), /*#__PURE__*/react.createElement("p", {
    className: "DocSearch-Title"
  }, noResultsText, " \"", /*#__PURE__*/react.createElement("strong", null, props.state.query), "\""), searchSuggestions && searchSuggestions.length > 0 && /*#__PURE__*/react.createElement("div", {
    className: "DocSearch-NoResults-Prefill-List"
  }, /*#__PURE__*/react.createElement("p", {
    className: "DocSearch-Help"
  }, suggestedQueryText, ":"), /*#__PURE__*/react.createElement("ul", null, searchSuggestions.slice(0, 3).reduce(function (acc, search) {
    return [].concat(NoResultsScreen_toConsumableArray(acc), [/*#__PURE__*/react.createElement("li", {
      key: search
    }, /*#__PURE__*/react.createElement("button", {
      className: "DocSearch-Prefill",
      key: search,
      type: "button",
      onClick: function onClick() {
        props.setQuery(search.toLowerCase() + ' ');
        props.refresh();
        props.inputRef.current.focus();
      }
    }, search))]);
  }, []))), props.getMissingResultsUrl && /*#__PURE__*/react.createElement("p", {
    className: "DocSearch-Help"
  }, "".concat(reportMissingResultsText, " "), /*#__PURE__*/react.createElement("a", {
    href: props.getMissingResultsUrl({
      query: props.state.query
    }),
    target: "_blank",
    rel: "noopener noreferrer"
  }, reportMissingResultsLinkText)));
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/icons/SourceIcon.js


var LvlIcon = function LvlIcon() {
  return /*#__PURE__*/react.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 20 20"
  }, /*#__PURE__*/react.createElement("path", {
    d: "M17 6v12c0 .52-.2 1-1 1H4c-.7 0-1-.33-1-1V2c0-.55.42-1 1-1h8l5 5zM14 8h-3.13c-.51 0-.87-.34-.87-.87V4",
    stroke: "currentColor",
    fill: "none",
    fillRule: "evenodd",
    strokeLinejoin: "round"
  }));
};

function SourceIcon(props) {
  switch (props.type) {
    case 'lvl1':
      return /*#__PURE__*/react.createElement(LvlIcon, null);

    case 'content':
      return /*#__PURE__*/react.createElement(ContentIcon, null);

    default:
      return /*#__PURE__*/react.createElement(AnchorIcon, null);
  }
}

function AnchorIcon() {
  return /*#__PURE__*/react.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 20 20"
  }, /*#__PURE__*/react.createElement("path", {
    d: "M13 13h4-4V8H7v5h6v4-4H7V8H3h4V3v5h6V3v5h4-4v5zm-6 0v4-4H3h4z",
    stroke: "currentColor",
    fill: "none",
    fillRule: "evenodd",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }));
}

function ContentIcon() {
  return /*#__PURE__*/react.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 20 20"
  }, /*#__PURE__*/react.createElement("path", {
    d: "M17 5H3h14zm0 5H3h14zm0 5H3h14z",
    stroke: "currentColor",
    fill: "none",
    fillRule: "evenodd",
    strokeLinejoin: "round"
  }));
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/icons/SelectIcon.js

function SelectIcon() {
  return /*#__PURE__*/react.createElement("svg", {
    className: "DocSearch-Hit-Select-Icon",
    width: "20",
    height: "20",
    viewBox: "0 0 20 20"
  }, /*#__PURE__*/react.createElement("g", {
    stroke: "currentColor",
    fill: "none",
    fillRule: "evenodd",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/react.createElement("path", {
    d: "M18 3v4c0 2-2 4-4 4H2"
  }), /*#__PURE__*/react.createElement("path", {
    d: "M8 17l-6-6 6-6"
  })));
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/Snippet.js
var Snippet_excluded = ["hit", "attribute", "tagName"];

function Snippet_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function Snippet_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? Snippet_ownKeys(Object(source), !0).forEach(function (key) { Snippet_defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : Snippet_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function Snippet_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function Snippet_objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = Snippet_objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function Snippet_objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }



function getPropertyByPath(object, path) {
  var parts = path.split('.');
  return parts.reduce(function (prev, current) {
    if (prev !== null && prev !== void 0 && prev[current]) return prev[current];
    return null;
  }, object);
}

function Snippet(_ref) {
  var hit = _ref.hit,
      attribute = _ref.attribute,
      _ref$tagName = _ref.tagName,
      tagName = _ref$tagName === void 0 ? 'span' : _ref$tagName,
      rest = Snippet_objectWithoutProperties(_ref, Snippet_excluded);

  return (0,react.createElement)(tagName, Snippet_objectSpread(Snippet_objectSpread({}, rest), {}, {
    dangerouslySetInnerHTML: {
      __html: getPropertyByPath(hit, "_snippetResult.".concat(attribute, ".value")) || getPropertyByPath(hit, attribute)
    }
  }));
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/Results.js
function Results_slicedToArray(arr, i) { return Results_arrayWithHoles(arr) || Results_iterableToArrayLimit(arr, i) || Results_unsupportedIterableToArray(arr, i) || Results_nonIterableRest(); }

function Results_nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function Results_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return Results_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return Results_arrayLikeToArray(o, minLen); }

function Results_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function Results_iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function Results_arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }



function Results(props) {
  if (!props.collection || props.collection.items.length === 0) {
    return null;
  }

  return /*#__PURE__*/react.createElement("section", {
    className: "DocSearch-Hits"
  }, /*#__PURE__*/react.createElement("div", {
    className: "DocSearch-Hit-source"
  }, props.title), /*#__PURE__*/react.createElement("ul", props.getListProps(), props.collection.items.map(function (item, index) {
    return /*#__PURE__*/react.createElement(Result, _extends({
      key: [props.title, item.objectID].join(':'),
      item: item,
      index: index
    }, props));
  })));
}

function Result(_ref) {
  var item = _ref.item,
      index = _ref.index,
      renderIcon = _ref.renderIcon,
      renderAction = _ref.renderAction,
      getItemProps = _ref.getItemProps,
      onItemClick = _ref.onItemClick,
      collection = _ref.collection,
      hitComponent = _ref.hitComponent;

  var _React$useState = react.useState(false),
      _React$useState2 = Results_slicedToArray(_React$useState, 2),
      isDeleting = _React$useState2[0],
      setIsDeleting = _React$useState2[1];

  var _React$useState3 = react.useState(false),
      _React$useState4 = Results_slicedToArray(_React$useState3, 2),
      isFavoriting = _React$useState4[0],
      setIsFavoriting = _React$useState4[1];

  var action = react.useRef(null);
  var Hit = hitComponent;

  function runDeleteTransition(cb) {
    setIsDeleting(true);
    action.current = cb;
  }

  function runFavoriteTransition(cb) {
    setIsFavoriting(true);
    action.current = cb;
  }

  return /*#__PURE__*/react.createElement("li", _extends({
    className: ['DocSearch-Hit', item.__docsearch_parent && 'DocSearch-Hit--Child', isDeleting && 'DocSearch-Hit--deleting', isFavoriting && 'DocSearch-Hit--favoriting'].filter(Boolean).join(' '),
    onTransitionEnd: function onTransitionEnd() {
      if (action.current) {
        action.current();
      }
    }
  }, getItemProps({
    item: item,
    source: collection.source,
    onClick: function onClick(event) {
      onItemClick(item, event);
    }
  })), /*#__PURE__*/react.createElement(Hit, {
    hit: item
  }, /*#__PURE__*/react.createElement("div", {
    className: "DocSearch-Hit-Container"
  }, renderIcon({
    item: item,
    index: index
  }), item.hierarchy[item.type] && item.type === 'lvl1' && /*#__PURE__*/react.createElement("div", {
    className: "DocSearch-Hit-content-wrapper"
  }, /*#__PURE__*/react.createElement(Snippet, {
    className: "DocSearch-Hit-title",
    hit: item,
    attribute: "hierarchy.lvl1"
  }), item.content && /*#__PURE__*/react.createElement(Snippet, {
    className: "DocSearch-Hit-path",
    hit: item,
    attribute: "content"
  })), item.hierarchy[item.type] && (item.type === 'lvl2' || item.type === 'lvl3' || item.type === 'lvl4' || item.type === 'lvl5' || item.type === 'lvl6') && /*#__PURE__*/react.createElement("div", {
    className: "DocSearch-Hit-content-wrapper"
  }, /*#__PURE__*/react.createElement(Snippet, {
    className: "DocSearch-Hit-title",
    hit: item,
    attribute: "hierarchy.".concat(item.type)
  }), /*#__PURE__*/react.createElement(Snippet, {
    className: "DocSearch-Hit-path",
    hit: item,
    attribute: "hierarchy.lvl1"
  })), item.type === 'content' && /*#__PURE__*/react.createElement("div", {
    className: "DocSearch-Hit-content-wrapper"
  }, /*#__PURE__*/react.createElement(Snippet, {
    className: "DocSearch-Hit-title",
    hit: item,
    attribute: "content"
  }), /*#__PURE__*/react.createElement(Snippet, {
    className: "DocSearch-Hit-path",
    hit: item,
    attribute: "hierarchy.lvl1"
  })), renderAction({
    item: item,
    runDeleteTransition: runDeleteTransition,
    runFavoriteTransition: runFavoriteTransition
  }))));
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/utils/removeHighlightTags.js
var regexHighlightTags = /(<mark>|<\/mark>)/g;
var regexHasHighlightTags = RegExp(regexHighlightTags.source);
function removeHighlightTags(hit) {
  var _internalDocSearchHit, _internalDocSearchHit2, _internalDocSearchHit3, _hit$_highlightResult, _hit$_highlightResult2;

  var internalDocSearchHit = hit;

  if (!internalDocSearchHit.__docsearch_parent && !hit._highlightResult) {
    return hit.hierarchy.lvl0;
  }

  var _ref = (internalDocSearchHit.__docsearch_parent ? (_internalDocSearchHit = internalDocSearchHit.__docsearch_parent) === null || _internalDocSearchHit === void 0 ? void 0 : (_internalDocSearchHit2 = _internalDocSearchHit._highlightResult) === null || _internalDocSearchHit2 === void 0 ? void 0 : (_internalDocSearchHit3 = _internalDocSearchHit2.hierarchy) === null || _internalDocSearchHit3 === void 0 ? void 0 : _internalDocSearchHit3.lvl0 : (_hit$_highlightResult = hit._highlightResult) === null || _hit$_highlightResult === void 0 ? void 0 : (_hit$_highlightResult2 = _hit$_highlightResult.hierarchy) === null || _hit$_highlightResult2 === void 0 ? void 0 : _hit$_highlightResult2.lvl0) || {},
      value = _ref.value;

  return value && regexHasHighlightTags.test(value) ? value.replace(regexHighlightTags, '') : value;
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/ResultsScreen.js
function ResultsScreen_extends() { ResultsScreen_extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return ResultsScreen_extends.apply(this, arguments); }





function ResultsScreen(props) {
  return /*#__PURE__*/react.createElement("div", {
    className: "DocSearch-Dropdown-Container"
  }, props.state.collections.map(function (collection) {
    if (collection.items.length === 0) {
      return null;
    }

    var title = removeHighlightTags(collection.items[0]);
    return /*#__PURE__*/react.createElement(Results, ResultsScreen_extends({}, props, {
      key: collection.source.sourceId,
      title: title,
      collection: collection,
      renderIcon: function renderIcon(_ref) {
        var _collection$items;

        var item = _ref.item,
            index = _ref.index;
        return /*#__PURE__*/react.createElement(react.Fragment, null, item.__docsearch_parent && /*#__PURE__*/react.createElement("svg", {
          className: "DocSearch-Hit-Tree",
          viewBox: "0 0 24 54"
        }, /*#__PURE__*/react.createElement("g", {
          stroke: "currentColor",
          fill: "none",
          fillRule: "evenodd",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }, item.__docsearch_parent !== ((_collection$items = collection.items[index + 1]) === null || _collection$items === void 0 ? void 0 : _collection$items.__docsearch_parent) ? /*#__PURE__*/react.createElement("path", {
          d: "M8 6v21M20 27H8.3"
        }) : /*#__PURE__*/react.createElement("path", {
          d: "M8 6v42M20 27H8.3"
        }))), /*#__PURE__*/react.createElement("div", {
          className: "DocSearch-Hit-icon"
        }, /*#__PURE__*/react.createElement(SourceIcon, {
          type: item.type
        })));
      },
      renderAction: function renderAction() {
        return /*#__PURE__*/react.createElement("div", {
          className: "DocSearch-Hit-action"
        }, /*#__PURE__*/react.createElement(SelectIcon, null));
      }
    }));
  }), props.resultsFooterComponent && /*#__PURE__*/react.createElement("section", {
    className: "DocSearch-HitsFooter"
  }, /*#__PURE__*/react.createElement(props.resultsFooterComponent, {
    state: props.state
  })));
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/icons/RecentIcon.js

function RecentIcon() {
  return /*#__PURE__*/react.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 20 20"
  }, /*#__PURE__*/react.createElement("g", {
    stroke: "currentColor",
    fill: "none",
    fillRule: "evenodd",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/react.createElement("path", {
    d: "M3.18 6.6a8.23 8.23 0 1112.93 9.94h0a8.23 8.23 0 01-11.63 0"
  }), /*#__PURE__*/react.createElement("path", {
    d: "M6.44 7.25H2.55V3.36M10.45 6v5.6M10.45 11.6L13 13"
  })));
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/icons/StarIcon.js

function StarIcon() {
  return /*#__PURE__*/react.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 20 20"
  }, /*#__PURE__*/react.createElement("path", {
    d: "M10 14.2L5 17l1-5.6-4-4 5.5-.7 2.5-5 2.5 5 5.6.8-4 4 .9 5.5z",
    stroke: "currentColor",
    fill: "none",
    fillRule: "evenodd",
    strokeLinejoin: "round"
  }));
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/icons/ResetIcon.js

function ResetIcon() {
  return /*#__PURE__*/react.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 20 20"
  }, /*#__PURE__*/react.createElement("path", {
    d: "M10 10l5.09-5.09L10 10l5.09 5.09L10 10zm0 0L4.91 4.91 10 10l-5.09 5.09L10 10z",
    stroke: "currentColor",
    fill: "none",
    fillRule: "evenodd",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }));
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/StartScreen.js
var StartScreen_excluded = ["translations"];

function StartScreen_extends() { StartScreen_extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return StartScreen_extends.apply(this, arguments); }

function StartScreen_objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = StartScreen_objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function StartScreen_objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }




function StartScreen(_ref) {
  var _ref$translations = _ref.translations,
      translations = _ref$translations === void 0 ? {} : _ref$translations,
      props = StartScreen_objectWithoutProperties(_ref, StartScreen_excluded);

  var _translations$recentS = translations.recentSearchesTitle,
      recentSearchesTitle = _translations$recentS === void 0 ? 'Recent' : _translations$recentS,
      _translations$noRecen = translations.noRecentSearchesText,
      noRecentSearchesText = _translations$noRecen === void 0 ? 'No recent searches' : _translations$noRecen,
      _translations$saveRec = translations.saveRecentSearchButtonTitle,
      saveRecentSearchButtonTitle = _translations$saveRec === void 0 ? 'Save this search' : _translations$saveRec,
      _translations$removeR = translations.removeRecentSearchButtonTitle,
      removeRecentSearchButtonTitle = _translations$removeR === void 0 ? 'Remove this search from history' : _translations$removeR,
      _translations$favorit = translations.favoriteSearchesTitle,
      favoriteSearchesTitle = _translations$favorit === void 0 ? 'Favorite' : _translations$favorit,
      _translations$removeF = translations.removeFavoriteSearchButtonTitle,
      removeFavoriteSearchButtonTitle = _translations$removeF === void 0 ? 'Remove this search from favorites' : _translations$removeF;

  if (props.state.status === 'idle' && props.hasCollections === false) {
    if (props.disableUserPersonalization) {
      return null;
    }

    return /*#__PURE__*/react.createElement("div", {
      className: "DocSearch-StartScreen"
    }, /*#__PURE__*/react.createElement("p", {
      className: "DocSearch-Help"
    }, noRecentSearchesText));
  }

  if (props.hasCollections === false) {
    return null;
  }

  return /*#__PURE__*/react.createElement("div", {
    className: "DocSearch-Dropdown-Container"
  }, /*#__PURE__*/react.createElement(Results, StartScreen_extends({}, props, {
    title: recentSearchesTitle,
    collection: props.state.collections[0],
    renderIcon: function renderIcon() {
      return /*#__PURE__*/react.createElement("div", {
        className: "DocSearch-Hit-icon"
      }, /*#__PURE__*/react.createElement(RecentIcon, null));
    },
    renderAction: function renderAction(_ref2) {
      var item = _ref2.item,
          runFavoriteTransition = _ref2.runFavoriteTransition,
          runDeleteTransition = _ref2.runDeleteTransition;
      return /*#__PURE__*/react.createElement(react.Fragment, null, /*#__PURE__*/react.createElement("div", {
        className: "DocSearch-Hit-action"
      }, /*#__PURE__*/react.createElement("button", {
        className: "DocSearch-Hit-action-button",
        title: saveRecentSearchButtonTitle,
        type: "submit",
        onClick: function onClick(event) {
          event.preventDefault();
          event.stopPropagation();
          runFavoriteTransition(function () {
            props.favoriteSearches.add(item);
            props.recentSearches.remove(item);
            props.refresh();
          });
        }
      }, /*#__PURE__*/react.createElement(StarIcon, null))), /*#__PURE__*/react.createElement("div", {
        className: "DocSearch-Hit-action"
      }, /*#__PURE__*/react.createElement("button", {
        className: "DocSearch-Hit-action-button",
        title: removeRecentSearchButtonTitle,
        type: "submit",
        onClick: function onClick(event) {
          event.preventDefault();
          event.stopPropagation();
          runDeleteTransition(function () {
            props.recentSearches.remove(item);
            props.refresh();
          });
        }
      }, /*#__PURE__*/react.createElement(ResetIcon, null))));
    }
  })), /*#__PURE__*/react.createElement(Results, StartScreen_extends({}, props, {
    title: favoriteSearchesTitle,
    collection: props.state.collections[1],
    renderIcon: function renderIcon() {
      return /*#__PURE__*/react.createElement("div", {
        className: "DocSearch-Hit-icon"
      }, /*#__PURE__*/react.createElement(StarIcon, null));
    },
    renderAction: function renderAction(_ref3) {
      var item = _ref3.item,
          runDeleteTransition = _ref3.runDeleteTransition;
      return /*#__PURE__*/react.createElement("div", {
        className: "DocSearch-Hit-action"
      }, /*#__PURE__*/react.createElement("button", {
        className: "DocSearch-Hit-action-button",
        title: removeFavoriteSearchButtonTitle,
        type: "submit",
        onClick: function onClick(event) {
          event.preventDefault();
          event.stopPropagation();
          runDeleteTransition(function () {
            props.favoriteSearches.remove(item);
            props.refresh();
          });
        }
      }, /*#__PURE__*/react.createElement(ResetIcon, null)));
    }
  })));
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/ScreenState.js
var ScreenState_excluded = ["translations"];

function ScreenState_extends() { ScreenState_extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return ScreenState_extends.apply(this, arguments); }

function ScreenState_objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = ScreenState_objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function ScreenState_objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }






var ScreenState = react.memo(function (_ref) {
  var _ref$translations = _ref.translations,
      translations = _ref$translations === void 0 ? {} : _ref$translations,
      props = ScreenState_objectWithoutProperties(_ref, ScreenState_excluded);

  if (props.state.status === 'error') {
    return /*#__PURE__*/react.createElement(ErrorScreen, {
      translations: translations === null || translations === void 0 ? void 0 : translations.errorScreen
    });
  }

  var hasCollections = props.state.collections.some(function (collection) {
    return collection.items.length > 0;
  });

  if (!props.state.query) {
    return /*#__PURE__*/react.createElement(StartScreen, ScreenState_extends({}, props, {
      hasCollections: hasCollections,
      translations: translations === null || translations === void 0 ? void 0 : translations.startScreen
    }));
  }

  if (hasCollections === false) {
    return /*#__PURE__*/react.createElement(NoResultsScreen, ScreenState_extends({}, props, {
      translations: translations === null || translations === void 0 ? void 0 : translations.noResultsScreen
    }));
  }

  return /*#__PURE__*/react.createElement(ResultsScreen, props);
}, function areEqual(_prevProps, nextProps) {
  // We don't update the screen when Autocomplete is loading or stalled to
  // avoid UI flashes:
  //  - Empty screen → Results screen
  //  - NoResults screen → NoResults screen with another query
  return nextProps.state.status === 'loading' || nextProps.state.status === 'stalled';
});
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/icons/LoadingIcon.js

function LoadingIcon() {
  return /*#__PURE__*/react.createElement("svg", {
    viewBox: "0 0 38 38",
    stroke: "currentColor",
    strokeOpacity: ".5"
  }, /*#__PURE__*/react.createElement("g", {
    fill: "none",
    fillRule: "evenodd"
  }, /*#__PURE__*/react.createElement("g", {
    transform: "translate(1 1)",
    strokeWidth: "2"
  }, /*#__PURE__*/react.createElement("circle", {
    strokeOpacity: ".3",
    cx: "18",
    cy: "18",
    r: "18"
  }), /*#__PURE__*/react.createElement("path", {
    d: "M36 18c0-9.94-8.06-18-18-18"
  }, /*#__PURE__*/react.createElement("animateTransform", {
    attributeName: "transform",
    type: "rotate",
    from: "0 18 18",
    to: "360 18 18",
    dur: "1s",
    repeatCount: "indefinite"
  })))));
}
// EXTERNAL MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/icons/SearchIcon.js
var SearchIcon = __webpack_require__(12076);
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/SearchBox.js
var SearchBox_excluded = ["translations"];

function SearchBox_extends() { SearchBox_extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return SearchBox_extends.apply(this, arguments); }

function SearchBox_objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = SearchBox_objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function SearchBox_objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }






function SearchBox(_ref) {
  var _ref$translations = _ref.translations,
      translations = _ref$translations === void 0 ? {} : _ref$translations,
      props = SearchBox_objectWithoutProperties(_ref, SearchBox_excluded);

  var _translations$resetBu = translations.resetButtonTitle,
      resetButtonTitle = _translations$resetBu === void 0 ? 'Clear the query' : _translations$resetBu,
      _translations$resetBu2 = translations.resetButtonAriaLabel,
      resetButtonAriaLabel = _translations$resetBu2 === void 0 ? 'Clear the query' : _translations$resetBu2,
      _translations$cancelB = translations.cancelButtonText,
      cancelButtonText = _translations$cancelB === void 0 ? 'Cancel' : _translations$cancelB,
      _translations$cancelB2 = translations.cancelButtonAriaLabel,
      cancelButtonAriaLabel = _translations$cancelB2 === void 0 ? 'Cancel' : _translations$cancelB2;

  var _props$getFormProps = props.getFormProps({
    inputElement: props.inputRef.current
  }),
      onReset = _props$getFormProps.onReset;

  react.useEffect(function () {
    if (props.autoFocus && props.inputRef.current) {
      props.inputRef.current.focus();
    }
  }, [props.autoFocus, props.inputRef]);
  react.useEffect(function () {
    if (props.isFromSelection && props.inputRef.current) {
      props.inputRef.current.select();
    }
  }, [props.isFromSelection, props.inputRef]);
  return /*#__PURE__*/react.createElement(react.Fragment, null, /*#__PURE__*/react.createElement("form", {
    className: "DocSearch-Form",
    onSubmit: function onSubmit(event) {
      event.preventDefault();
    },
    onReset: onReset
  }, /*#__PURE__*/react.createElement("label", SearchBox_extends({
    className: "DocSearch-MagnifierLabel"
  }, props.getLabelProps()), /*#__PURE__*/react.createElement(SearchIcon/* SearchIcon */.W, null)), /*#__PURE__*/react.createElement("div", {
    className: "DocSearch-LoadingIndicator"
  }, /*#__PURE__*/react.createElement(LoadingIcon, null)), /*#__PURE__*/react.createElement("input", SearchBox_extends({
    className: "DocSearch-Input",
    ref: props.inputRef
  }, props.getInputProps({
    inputElement: props.inputRef.current,
    autoFocus: props.autoFocus,
    maxLength: MAX_QUERY_SIZE
  }))), /*#__PURE__*/react.createElement("button", {
    type: "reset",
    title: resetButtonTitle,
    className: "DocSearch-Reset",
    "aria-label": resetButtonAriaLabel,
    hidden: !props.state.query
  }, /*#__PURE__*/react.createElement(ResetIcon, null))), /*#__PURE__*/react.createElement("button", {
    className: "DocSearch-Cancel",
    type: "reset",
    "aria-label": cancelButtonAriaLabel,
    onClick: props.onClose
  }, cancelButtonText));
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/stored-searches.js
var stored_searches_excluded = ["_highlightResult", "_snippetResult"];

function stored_searches_objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = stored_searches_objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function stored_searches_objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function isLocalStorageSupported() {
  var key = '__TEST_KEY__';

  try {
    localStorage.setItem(key, '');
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
}

function createStorage(key) {
  if (isLocalStorageSupported() === false) {
    return {
      setItem: function setItem() {},
      getItem: function getItem() {
        return [];
      }
    };
  }

  return {
    setItem: function setItem(item) {
      return window.localStorage.setItem(key, JSON.stringify(item));
    },
    getItem: function getItem() {
      var item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    }
  };
}

function createStoredSearches(_ref) {
  var key = _ref.key,
      _ref$limit = _ref.limit,
      limit = _ref$limit === void 0 ? 5 : _ref$limit;
  var storage = createStorage(key);
  var items = storage.getItem().slice(0, limit);
  return {
    add: function add(item) {
      var _ref2 = item,
          _highlightResult = _ref2._highlightResult,
          _snippetResult = _ref2._snippetResult,
          hit = stored_searches_objectWithoutProperties(_ref2, stored_searches_excluded);

      var isQueryAlreadySaved = items.findIndex(function (x) {
        return x.objectID === hit.objectID;
      });

      if (isQueryAlreadySaved > -1) {
        items.splice(isQueryAlreadySaved, 1);
      }

      items.unshift(hit);
      items = items.slice(0, limit);
      storage.setItem(items);
    },
    remove: function remove(item) {
      items = items.filter(function (x) {
        return x.objectID !== item.objectID;
      });
      storage.setItem(items);
    },
    getAll: function getAll() {
      return items;
    }
  };
}
;// CONCATENATED MODULE: ./node_modules/algoliasearch/dist/algoliasearch-lite.esm.browser.js
function createBrowserLocalStorageCache(options) {
    const namespaceKey = `algoliasearch-client-js-${options.key}`;
    // eslint-disable-next-line functional/no-let
    let storage;
    const getStorage = () => {
        if (storage === undefined) {
            storage = options.localStorage || window.localStorage;
        }
        return storage;
    };
    const getNamespace = () => {
        return JSON.parse(getStorage().getItem(namespaceKey) || '{}');
    };
    const setNamespace = (namespace) => {
        getStorage().setItem(namespaceKey, JSON.stringify(namespace));
    };
    const removeOutdatedCacheItems = () => {
        const timeToLive = options.timeToLive ? options.timeToLive * 1000 : null;
        const namespace = getNamespace();
        const filteredNamespaceWithoutOldFormattedCacheItems = Object.fromEntries(Object.entries(namespace).filter(([, cacheItem]) => {
            return cacheItem.timestamp !== undefined;
        }));
        setNamespace(filteredNamespaceWithoutOldFormattedCacheItems);
        if (!timeToLive)
            return;
        const filteredNamespaceWithoutExpiredItems = Object.fromEntries(Object.entries(filteredNamespaceWithoutOldFormattedCacheItems).filter(([, cacheItem]) => {
            const currentTimestamp = new Date().getTime();
            const isExpired = cacheItem.timestamp + timeToLive < currentTimestamp;
            return !isExpired;
        }));
        setNamespace(filteredNamespaceWithoutExpiredItems);
    };
    return {
        get(key, defaultValue, events = {
            miss: () => Promise.resolve(),
        }) {
            return Promise.resolve()
                .then(() => {
                removeOutdatedCacheItems();
                const keyAsString = JSON.stringify(key);
                return getNamespace()[keyAsString];
            })
                .then(value => {
                return Promise.all([value ? value.value : defaultValue(), value !== undefined]);
            })
                .then(([value, exists]) => {
                return Promise.all([value, exists || events.miss(value)]);
            })
                .then(([value]) => value);
        },
        set(key, value) {
            return Promise.resolve().then(() => {
                const namespace = getNamespace();
                // eslint-disable-next-line functional/immutable-data
                namespace[JSON.stringify(key)] = {
                    timestamp: new Date().getTime(),
                    value,
                };
                getStorage().setItem(namespaceKey, JSON.stringify(namespace));
                return value;
            });
        },
        delete(key) {
            return Promise.resolve().then(() => {
                const namespace = getNamespace();
                // eslint-disable-next-line functional/immutable-data
                delete namespace[JSON.stringify(key)];
                getStorage().setItem(namespaceKey, JSON.stringify(namespace));
            });
        },
        clear() {
            return Promise.resolve().then(() => {
                getStorage().removeItem(namespaceKey);
            });
        },
    };
}

// @todo Add logger on options to debug when caches go wrong.
function createFallbackableCache(options) {
    const caches = [...options.caches];
    const current = caches.shift(); // eslint-disable-line functional/immutable-data
    if (current === undefined) {
        return createNullCache();
    }
    return {
        get(key, defaultValue, events = {
            miss: () => Promise.resolve(),
        }) {
            return current.get(key, defaultValue, events).catch(() => {
                return createFallbackableCache({ caches }).get(key, defaultValue, events);
            });
        },
        set(key, value) {
            return current.set(key, value).catch(() => {
                return createFallbackableCache({ caches }).set(key, value);
            });
        },
        delete(key) {
            return current.delete(key).catch(() => {
                return createFallbackableCache({ caches }).delete(key);
            });
        },
        clear() {
            return current.clear().catch(() => {
                return createFallbackableCache({ caches }).clear();
            });
        },
    };
}

function createNullCache() {
    return {
        get(_key, defaultValue, events = {
            miss: () => Promise.resolve(),
        }) {
            const value = defaultValue();
            return value
                .then(result => Promise.all([result, events.miss(result)]))
                .then(([result]) => result);
        },
        set(_key, value) {
            return Promise.resolve(value);
        },
        delete(_key) {
            return Promise.resolve();
        },
        clear() {
            return Promise.resolve();
        },
    };
}

function createInMemoryCache(options = { serializable: true }) {
    // eslint-disable-next-line functional/no-let
    let cache = {};
    return {
        get(key, defaultValue, events = {
            miss: () => Promise.resolve(),
        }) {
            const keyAsString = JSON.stringify(key);
            if (keyAsString in cache) {
                return Promise.resolve(options.serializable ? JSON.parse(cache[keyAsString]) : cache[keyAsString]);
            }
            const promise = defaultValue();
            const miss = (events && events.miss) || (() => Promise.resolve());
            return promise.then((value) => miss(value)).then(() => promise);
        },
        set(key, value) {
            // eslint-disable-next-line functional/immutable-data
            cache[JSON.stringify(key)] = options.serializable ? JSON.stringify(value) : value;
            return Promise.resolve(value);
        },
        delete(key) {
            // eslint-disable-next-line functional/immutable-data
            delete cache[JSON.stringify(key)];
            return Promise.resolve();
        },
        clear() {
            cache = {};
            return Promise.resolve();
        },
    };
}

function createAuth(authMode, appId, apiKey) {
    const credentials = {
        'x-algolia-api-key': apiKey,
        'x-algolia-application-id': appId,
    };
    return {
        headers() {
            return authMode === AuthMode.WithinHeaders ? credentials : {};
        },
        queryParameters() {
            return authMode === AuthMode.WithinQueryParameters ? credentials : {};
        },
    };
}

// eslint-disable-next-line functional/prefer-readonly-type
function shuffle(array) {
    let c = array.length - 1; // eslint-disable-line functional/no-let
    // eslint-disable-next-line functional/no-loop-statement
    for (c; c > 0; c--) {
        const b = Math.floor(Math.random() * (c + 1));
        const a = array[c];
        array[c] = array[b]; // eslint-disable-line functional/immutable-data, no-param-reassign
        array[b] = a; // eslint-disable-line functional/immutable-data, no-param-reassign
    }
    return array;
}
function addMethods(base, methods) {
    if (!methods) {
        return base;
    }
    Object.keys(methods).forEach(key => {
        // eslint-disable-next-line functional/immutable-data, no-param-reassign
        base[key] = methods[key](base);
    });
    return base;
}
function encode(format, ...args) {
    // eslint-disable-next-line functional/no-let
    let i = 0;
    return format.replace(/%s/g, () => encodeURIComponent(args[i++]));
}

const algoliasearch_lite_esm_browser_version = '4.19.1';

const AuthMode = {
    /**
     * If auth credentials should be in query parameters.
     */
    WithinQueryParameters: 0,
    /**
     * If auth credentials should be in headers.
     */
    WithinHeaders: 1,
};

function createMappedRequestOptions(requestOptions, timeout) {
    const options = requestOptions || {};
    const data = options.data || {};
    Object.keys(options).forEach(key => {
        if (['timeout', 'headers', 'queryParameters', 'data', 'cacheable'].indexOf(key) === -1) {
            data[key] = options[key]; // eslint-disable-line functional/immutable-data
        }
    });
    return {
        data: Object.entries(data).length > 0 ? data : undefined,
        timeout: options.timeout || timeout,
        headers: options.headers || {},
        queryParameters: options.queryParameters || {},
        cacheable: options.cacheable,
    };
}

const CallEnum = {
    /**
     * If the host is read only.
     */
    Read: 1,
    /**
     * If the host is write only.
     */
    Write: 2,
    /**
     * If the host is both read and write.
     */
    Any: 3,
};

const HostStatusEnum = {
    Up: 1,
    Down: 2,
    Timeouted: 3,
};

// By default, API Clients at Algolia have expiration delay
// of 5 mins. In the JavaScript client, we have 2 mins.
const EXPIRATION_DELAY = 2 * 60 * 1000;
function createStatefulHost(host, status = HostStatusEnum.Up) {
    return {
        ...host,
        status,
        lastUpdate: Date.now(),
    };
}
function isStatefulHostUp(host) {
    return host.status === HostStatusEnum.Up || Date.now() - host.lastUpdate > EXPIRATION_DELAY;
}
function isStatefulHostTimeouted(host) {
    return (host.status === HostStatusEnum.Timeouted && Date.now() - host.lastUpdate <= EXPIRATION_DELAY);
}

function createStatelessHost(options) {
    if (typeof options === 'string') {
        return {
            protocol: 'https',
            url: options,
            accept: CallEnum.Any,
        };
    }
    return {
        protocol: options.protocol || 'https',
        url: options.url,
        accept: options.accept || CallEnum.Any,
    };
}

const MethodEnum = {
    Delete: 'DELETE',
    Get: 'GET',
    Post: 'POST',
    Put: 'PUT',
};

function createRetryableOptions(hostsCache, statelessHosts) {
    return Promise.all(statelessHosts.map(statelessHost => {
        return hostsCache.get(statelessHost, () => {
            return Promise.resolve(createStatefulHost(statelessHost));
        });
    })).then(statefulHosts => {
        const hostsUp = statefulHosts.filter(host => isStatefulHostUp(host));
        const hostsTimeouted = statefulHosts.filter(host => isStatefulHostTimeouted(host));
        /**
         * Note, we put the hosts that previously timeouted on the end of the list.
         */
        const hostsAvailable = [...hostsUp, ...hostsTimeouted];
        const statelessHostsAvailable = hostsAvailable.length > 0
            ? hostsAvailable.map(host => createStatelessHost(host))
            : statelessHosts;
        return {
            getTimeout(timeoutsCount, baseTimeout) {
                /**
                 * Imagine that you have 4 hosts, if timeouts will increase
                 * on the following way: 1 (timeouted) > 4 (timeouted) > 5 (200)
                 *
                 * Note that, the very next request, we start from the previous timeout
                 *
                 *  5 (timeouted) > 6 (timeouted) > 7 ...
                 *
                 * This strategy may need to be reviewed, but is the strategy on the our
                 * current v3 version.
                 */
                const timeoutMultiplier = hostsTimeouted.length === 0 && timeoutsCount === 0
                    ? 1
                    : hostsTimeouted.length + 3 + timeoutsCount;
                return timeoutMultiplier * baseTimeout;
            },
            statelessHosts: statelessHostsAvailable,
        };
    });
}

const isNetworkError = ({ isTimedOut, status }) => {
    return !isTimedOut && ~~status === 0;
};
const isRetryable = (response) => {
    const status = response.status;
    const isTimedOut = response.isTimedOut;
    return (isTimedOut || isNetworkError(response) || (~~(status / 100) !== 2 && ~~(status / 100) !== 4));
};
const isSuccess = ({ status }) => {
    return ~~(status / 100) === 2;
};
const retryDecision = (response, outcomes) => {
    if (isRetryable(response)) {
        return outcomes.onRetry(response);
    }
    if (isSuccess(response)) {
        return outcomes.onSuccess(response);
    }
    return outcomes.onFail(response);
};

function retryableRequest(transporter, statelessHosts, request, requestOptions) {
    const stackTrace = []; // eslint-disable-line functional/prefer-readonly-type
    /**
     * First we prepare the payload that do not depend from hosts.
     */
    const data = serializeData(request, requestOptions);
    const headers = serializeHeaders(transporter, requestOptions);
    const method = request.method;
    // On `GET`, the data is proxied to query parameters.
    const dataQueryParameters = request.method !== MethodEnum.Get
        ? {}
        : {
            ...request.data,
            ...requestOptions.data,
        };
    const queryParameters = {
        'x-algolia-agent': transporter.userAgent.value,
        ...transporter.queryParameters,
        ...dataQueryParameters,
        ...requestOptions.queryParameters,
    };
    let timeoutsCount = 0; // eslint-disable-line functional/no-let
    const retry = (hosts, // eslint-disable-line functional/prefer-readonly-type
    getTimeout) => {
        /**
         * We iterate on each host, until there is no host left.
         */
        const host = hosts.pop(); // eslint-disable-line functional/immutable-data
        if (host === undefined) {
            throw createRetryError(stackTraceWithoutCredentials(stackTrace));
        }
        const payload = {
            data,
            headers,
            method,
            url: serializeUrl(host, request.path, queryParameters),
            connectTimeout: getTimeout(timeoutsCount, transporter.timeouts.connect),
            responseTimeout: getTimeout(timeoutsCount, requestOptions.timeout),
        };
        /**
         * The stackFrame is pushed to the stackTrace so we
         * can have information about onRetry and onFailure
         * decisions.
         */
        const pushToStackTrace = (response) => {
            const stackFrame = {
                request: payload,
                response,
                host,
                triesLeft: hosts.length,
            };
            // eslint-disable-next-line functional/immutable-data
            stackTrace.push(stackFrame);
            return stackFrame;
        };
        const decisions = {
            onSuccess: response => deserializeSuccess(response),
            onRetry(response) {
                const stackFrame = pushToStackTrace(response);
                /**
                 * If response is a timeout, we increaset the number of
                 * timeouts so we can increase the timeout later.
                 */
                if (response.isTimedOut) {
                    timeoutsCount++;
                }
                return Promise.all([
                    /**
                     * Failures are individually send the logger, allowing
                     * the end user to debug / store stack frames even
                     * when a retry error does not happen.
                     */
                    transporter.logger.info('Retryable failure', stackFrameWithoutCredentials(stackFrame)),
                    /**
                     * We also store the state of the host in failure cases. If the host, is
                     * down it will remain down for the next 2 minutes. In a timeout situation,
                     * this host will be added end of the list of hosts on the next request.
                     */
                    transporter.hostsCache.set(host, createStatefulHost(host, response.isTimedOut ? HostStatusEnum.Timeouted : HostStatusEnum.Down)),
                ]).then(() => retry(hosts, getTimeout));
            },
            onFail(response) {
                pushToStackTrace(response);
                throw deserializeFailure(response, stackTraceWithoutCredentials(stackTrace));
            },
        };
        return transporter.requester.send(payload).then(response => {
            return retryDecision(response, decisions);
        });
    };
    /**
     * Finally, for each retryable host perform request until we got a non
     * retryable response. Some notes here:
     *
     * 1. The reverse here is applied so we can apply a `pop` later on => more performant.
     * 2. We also get from the retryable options a timeout multiplier that is tailored
     * for the current context.
     */
    return createRetryableOptions(transporter.hostsCache, statelessHosts).then(options => {
        return retry([...options.statelessHosts].reverse(), options.getTimeout);
    });
}

function createTransporter(options) {
    const { hostsCache, logger, requester, requestsCache, responsesCache, timeouts, userAgent, hosts, queryParameters, headers, } = options;
    const transporter = {
        hostsCache,
        logger,
        requester,
        requestsCache,
        responsesCache,
        timeouts,
        userAgent,
        headers,
        queryParameters,
        hosts: hosts.map(host => createStatelessHost(host)),
        read(request, requestOptions) {
            /**
             * First, we compute the user request options. Now, keep in mind,
             * that using request options the user is able to modified the intire
             * payload of the request. Such as headers, query parameters, and others.
             */
            const mappedRequestOptions = createMappedRequestOptions(requestOptions, transporter.timeouts.read);
            const createRetryableRequest = () => {
                /**
                 * Then, we prepare a function factory that contains the construction of
                 * the retryable request. At this point, we may *not* perform the actual
                 * request. But we want to have the function factory ready.
                 */
                return retryableRequest(transporter, transporter.hosts.filter(host => (host.accept & CallEnum.Read) !== 0), request, mappedRequestOptions);
            };
            /**
             * Once we have the function factory ready, we need to determine of the
             * request is "cacheable" - should be cached. Note that, once again,
             * the user can force this option.
             */
            const cacheable = mappedRequestOptions.cacheable !== undefined
                ? mappedRequestOptions.cacheable
                : request.cacheable;
            /**
             * If is not "cacheable", we immediatly trigger the retryable request, no
             * need to check cache implementations.
             */
            if (cacheable !== true) {
                return createRetryableRequest();
            }
            /**
             * If the request is "cacheable", we need to first compute the key to ask
             * the cache implementations if this request is on progress or if the
             * response already exists on the cache.
             */
            const key = {
                request,
                mappedRequestOptions,
                transporter: {
                    queryParameters: transporter.queryParameters,
                    headers: transporter.headers,
                },
            };
            /**
             * With the computed key, we first ask the responses cache
             * implemention if this request was been resolved before.
             */
            return transporter.responsesCache.get(key, () => {
                /**
                 * If the request has never resolved before, we actually ask if there
                 * is a current request with the same key on progress.
                 */
                return transporter.requestsCache.get(key, () => {
                    return (transporter.requestsCache
                        /**
                         * Finally, if there is no request in progress with the same key,
                         * this `createRetryableRequest()` will actually trigger the
                         * retryable request.
                         */
                        .set(key, createRetryableRequest())
                        .then(response => Promise.all([transporter.requestsCache.delete(key), response]), err => Promise.all([transporter.requestsCache.delete(key), Promise.reject(err)]))
                        .then(([_, response]) => response));
                });
            }, {
                /**
                 * Of course, once we get this response back from the server, we
                 * tell response cache to actually store the received response
                 * to be used later.
                 */
                miss: response => transporter.responsesCache.set(key, response),
            });
        },
        write(request, requestOptions) {
            /**
             * On write requests, no cache mechanisms are applied, and we
             * proxy the request immediately to the requester.
             */
            return retryableRequest(transporter, transporter.hosts.filter(host => (host.accept & CallEnum.Write) !== 0), request, createMappedRequestOptions(requestOptions, transporter.timeouts.write));
        },
    };
    return transporter;
}

function createUserAgent(version) {
    const userAgent = {
        value: `Algolia for JavaScript (${version})`,
        add(options) {
            const addedUserAgent = `; ${options.segment}${options.version !== undefined ? ` (${options.version})` : ''}`;
            if (userAgent.value.indexOf(addedUserAgent) === -1) {
                // eslint-disable-next-line functional/immutable-data
                userAgent.value = `${userAgent.value}${addedUserAgent}`;
            }
            return userAgent;
        },
    };
    return userAgent;
}

function deserializeSuccess(response) {
    // eslint-disable-next-line functional/no-try-statement
    try {
        return JSON.parse(response.content);
    }
    catch (e) {
        throw createDeserializationError(e.message, response);
    }
}
function deserializeFailure({ content, status }, stackFrame) {
    // eslint-disable-next-line functional/no-let
    let message = content;
    // eslint-disable-next-line functional/no-try-statement
    try {
        message = JSON.parse(content).message;
    }
    catch (e) {
        // ..
    }
    return createApiError(message, status, stackFrame);
}

function serializeUrl(host, path, queryParameters) {
    const queryParametersAsString = serializeQueryParameters(queryParameters);
    // eslint-disable-next-line functional/no-let
    let url = `${host.protocol}://${host.url}/${path.charAt(0) === '/' ? path.substr(1) : path}`;
    if (queryParametersAsString.length) {
        url += `?${queryParametersAsString}`;
    }
    return url;
}
function serializeQueryParameters(parameters) {
    const isObjectOrArray = (value) => Object.prototype.toString.call(value) === '[object Object]' ||
        Object.prototype.toString.call(value) === '[object Array]';
    return Object.keys(parameters)
        .map(key => encode('%s=%s', key, isObjectOrArray(parameters[key]) ? JSON.stringify(parameters[key]) : parameters[key]))
        .join('&');
}
function serializeData(request, requestOptions) {
    if (request.method === MethodEnum.Get ||
        (request.data === undefined && requestOptions.data === undefined)) {
        return undefined;
    }
    const data = Array.isArray(request.data)
        ? request.data
        : { ...request.data, ...requestOptions.data };
    return JSON.stringify(data);
}
function serializeHeaders(transporter, requestOptions) {
    const headers = {
        ...transporter.headers,
        ...requestOptions.headers,
    };
    const serializedHeaders = {};
    Object.keys(headers).forEach(header => {
        const value = headers[header];
        // @ts-ignore
        // eslint-disable-next-line functional/immutable-data
        serializedHeaders[header.toLowerCase()] = value;
    });
    return serializedHeaders;
}

function stackTraceWithoutCredentials(stackTrace) {
    return stackTrace.map(stackFrame => stackFrameWithoutCredentials(stackFrame));
}
function stackFrameWithoutCredentials(stackFrame) {
    const modifiedHeaders = stackFrame.request.headers['x-algolia-api-key']
        ? { 'x-algolia-api-key': '*****' }
        : {};
    return {
        ...stackFrame,
        request: {
            ...stackFrame.request,
            headers: {
                ...stackFrame.request.headers,
                ...modifiedHeaders,
            },
        },
    };
}

function createApiError(message, status, transporterStackTrace) {
    return {
        name: 'ApiError',
        message,
        status,
        transporterStackTrace,
    };
}

function createDeserializationError(message, response) {
    return {
        name: 'DeserializationError',
        message,
        response,
    };
}

function createRetryError(transporterStackTrace) {
    return {
        name: 'RetryError',
        message: 'Unreachable hosts - your application id may be incorrect. If the error persists, contact support@algolia.com.',
        transporterStackTrace,
    };
}

const createSearchClient = options => {
    const appId = options.appId;
    const auth = createAuth(options.authMode !== undefined ? options.authMode : AuthMode.WithinHeaders, appId, options.apiKey);
    const transporter = createTransporter({
        hosts: [
            { url: `${appId}-dsn.algolia.net`, accept: CallEnum.Read },
            { url: `${appId}.algolia.net`, accept: CallEnum.Write },
        ].concat(shuffle([
            { url: `${appId}-1.algolianet.com` },
            { url: `${appId}-2.algolianet.com` },
            { url: `${appId}-3.algolianet.com` },
        ])),
        ...options,
        headers: {
            ...auth.headers(),
            ...{ 'content-type': 'application/x-www-form-urlencoded' },
            ...options.headers,
        },
        queryParameters: {
            ...auth.queryParameters(),
            ...options.queryParameters,
        },
    });
    const base = {
        transporter,
        appId,
        addAlgoliaAgent(segment, version) {
            transporter.userAgent.add({ segment, version });
        },
        clearCache() {
            return Promise.all([
                transporter.requestsCache.clear(),
                transporter.responsesCache.clear(),
            ]).then(() => undefined);
        },
    };
    return addMethods(base, options.methods);
};

const customRequest = (base) => {
    return (request, requestOptions) => {
        if (request.method === MethodEnum.Get) {
            return base.transporter.read(request, requestOptions);
        }
        return base.transporter.write(request, requestOptions);
    };
};

const initIndex = (base) => {
    return (indexName, options = {}) => {
        const searchIndex = {
            transporter: base.transporter,
            appId: base.appId,
            indexName,
        };
        return addMethods(searchIndex, options.methods);
    };
};

const multipleQueries = (base) => {
    return (queries, requestOptions) => {
        const requests = queries.map(query => {
            return {
                ...query,
                params: serializeQueryParameters(query.params || {}),
            };
        });
        return base.transporter.read({
            method: MethodEnum.Post,
            path: '1/indexes/*/queries',
            data: {
                requests,
            },
            cacheable: true,
        }, requestOptions);
    };
};

const multipleSearchForFacetValues = (base) => {
    return (queries, requestOptions) => {
        return Promise.all(queries.map(query => {
            const { facetName, facetQuery, ...params } = query.params;
            return initIndex(base)(query.indexName, {
                methods: { searchForFacetValues },
            }).searchForFacetValues(facetName, facetQuery, {
                ...requestOptions,
                ...params,
            });
        }));
    };
};

const findAnswers = (base) => {
    return (query, queryLanguages, requestOptions) => {
        return base.transporter.read({
            method: MethodEnum.Post,
            path: encode('1/answers/%s/prediction', base.indexName),
            data: {
                query,
                queryLanguages,
            },
            cacheable: true,
        }, requestOptions);
    };
};

const search = (base) => {
    return (query, requestOptions) => {
        return base.transporter.read({
            method: MethodEnum.Post,
            path: encode('1/indexes/%s/query', base.indexName),
            data: {
                query,
            },
            cacheable: true,
        }, requestOptions);
    };
};

const searchForFacetValues = (base) => {
    return (facetName, facetQuery, requestOptions) => {
        return base.transporter.read({
            method: MethodEnum.Post,
            path: encode('1/indexes/%s/facets/%s/query', base.indexName, facetName),
            data: {
                facetQuery,
            },
            cacheable: true,
        }, requestOptions);
    };
};

const LogLevelEnum = {
    Debug: 1,
    Info: 2,
    Error: 3,
};

/* eslint no-console: 0 */
function createConsoleLogger(logLevel) {
    return {
        debug(message, args) {
            if (LogLevelEnum.Debug >= logLevel) {
                console.debug(message, args);
            }
            return Promise.resolve();
        },
        info(message, args) {
            if (LogLevelEnum.Info >= logLevel) {
                console.info(message, args);
            }
            return Promise.resolve();
        },
        error(message, args) {
            console.error(message, args);
            return Promise.resolve();
        },
    };
}

function createBrowserXhrRequester() {
    return {
        send(request) {
            return new Promise((resolve) => {
                const baseRequester = new XMLHttpRequest();
                baseRequester.open(request.method, request.url, true);
                Object.keys(request.headers).forEach(key => baseRequester.setRequestHeader(key, request.headers[key]));
                const createTimeout = (timeout, content) => {
                    return setTimeout(() => {
                        baseRequester.abort();
                        resolve({
                            status: 0,
                            content,
                            isTimedOut: true,
                        });
                    }, timeout * 1000);
                };
                const connectTimeout = createTimeout(request.connectTimeout, 'Connection timeout');
                // eslint-disable-next-line functional/no-let
                let responseTimeout;
                // eslint-disable-next-line functional/immutable-data
                baseRequester.onreadystatechange = () => {
                    if (baseRequester.readyState > baseRequester.OPENED && responseTimeout === undefined) {
                        clearTimeout(connectTimeout);
                        responseTimeout = createTimeout(request.responseTimeout, 'Socket timeout');
                    }
                };
                // eslint-disable-next-line functional/immutable-data
                baseRequester.onerror = () => {
                    // istanbul ignore next
                    if (baseRequester.status === 0) {
                        clearTimeout(connectTimeout);
                        clearTimeout(responseTimeout);
                        resolve({
                            content: baseRequester.responseText || 'Network request failed',
                            status: baseRequester.status,
                            isTimedOut: false,
                        });
                    }
                };
                //  eslint-disable-next-line functional/immutable-data
                baseRequester.onload = () => {
                    clearTimeout(connectTimeout);
                    clearTimeout(responseTimeout);
                    resolve({
                        content: baseRequester.responseText,
                        status: baseRequester.status,
                        isTimedOut: false,
                    });
                };
                baseRequester.send(request.data);
            });
        },
    };
}

function algoliasearch(appId, apiKey, options) {
    const commonOptions = {
        appId,
        apiKey,
        timeouts: {
            connect: 1,
            read: 2,
            write: 30,
        },
        requester: createBrowserXhrRequester(),
        logger: createConsoleLogger(LogLevelEnum.Error),
        responsesCache: createInMemoryCache(),
        requestsCache: createInMemoryCache({ serializable: false }),
        hostsCache: createFallbackableCache({
            caches: [
                createBrowserLocalStorageCache({ key: `${algoliasearch_lite_esm_browser_version}-${appId}` }),
                createInMemoryCache(),
            ],
        }),
        userAgent: createUserAgent(algoliasearch_lite_esm_browser_version).add({
            segment: 'Browser',
            version: 'lite',
        }),
        authMode: AuthMode.WithinQueryParameters,
    };
    return createSearchClient({
        ...commonOptions,
        ...options,
        methods: {
            search: multipleQueries,
            searchForFacetValues: multipleSearchForFacetValues,
            multipleQueries,
            multipleSearchForFacetValues,
            customRequest,
            initIndex: base => (indexName) => {
                return initIndex(base)(indexName, {
                    methods: { search, searchForFacetValues, findAnswers },
                });
            },
        },
    });
}
// eslint-disable-next-line functional/immutable-data
algoliasearch.version = algoliasearch_lite_esm_browser_version;

/* harmony default export */ const algoliasearch_lite_esm_browser = (algoliasearch);

;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/version.js
var version_version = '3.5.1';
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/useSearchClient.js



function useSearchClient(appId, apiKey, transformSearchClient) {
  var searchClient = react.useMemo(function () {
    var client = algoliasearch_lite_esm_browser(appId, apiKey);
    client.addAlgoliaAgent('docsearch', version_version); // Since DocSearch.js relies on DocSearch React with an alias to Preact,
    // we cannot add the `docsearch-react` user agent by default, otherwise
    // it would also be sent on a DocSearch.js integration.
    // We therefore only add the `docsearch-react` user agent if `docsearch.js`
    // is not present.

    if (/docsearch.js \(.*\)/.test(client.transporter.userAgent.value) === false) {
      client.addAlgoliaAgent('docsearch-react', version_version);
    }

    return transformSearchClient(client);
  }, [appId, apiKey, transformSearchClient]);
  return searchClient;
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/useTouchEvents.js

function useTouchEvents(_ref) {
  var getEnvironmentProps = _ref.getEnvironmentProps,
      panelElement = _ref.panelElement,
      formElement = _ref.formElement,
      inputElement = _ref.inputElement;
  react.useEffect(function () {
    if (!(panelElement && formElement && inputElement)) {
      return undefined;
    }

    var _getEnvironmentProps = getEnvironmentProps({
      panelElement: panelElement,
      formElement: formElement,
      inputElement: inputElement
    }),
        onTouchStart = _getEnvironmentProps.onTouchStart,
        onTouchMove = _getEnvironmentProps.onTouchMove;

    window.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    return function () {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [getEnvironmentProps, panelElement, formElement, inputElement]);
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/useTrapFocus.js

function useTrapFocus(_ref) {
  var container = _ref.container;
  react.useEffect(function () {
    if (!container) {
      return undefined;
    }

    var focusableElements = container.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), input:not([disabled])');
    var firstElement = focusableElements[0];
    var lastElement = focusableElements[focusableElements.length - 1];

    function trapFocus(event) {
      if (event.key !== 'Tab') {
        return;
      }

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    container.addEventListener('keydown', trapFocus);
    return function () {
      container.removeEventListener('keydown', trapFocus);
    };
  }, [container]);
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/utils/noop.js
function noop_noop() {}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/utils/identity.js
function identity(x) {
  return x;
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/utils/isModifierEvent.js
/**
 * Detect when an event is modified with a special key to let the browser
 * trigger its default behavior.
 */
function isModifierEvent(event) {
  var isMiddleClick = event.button === 1;
  return isMiddleClick || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/utils/groupBy.js
function groupBy(values, predicate, maxResultsPerGroup) {
  return values.reduce(function (acc, item) {
    var key = predicate(item);

    if (!acc.hasOwnProperty(key)) {
      acc[key] = [];
    } // We limit each section to show 5 hits maximum.
    // This acts as a frontend alternative to `distinct`.


    if (acc[key].length < (maxResultsPerGroup || 5)) {
      acc[key].push(item);
    }

    return acc;
  }, {});
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/dist/esm/DocSearchModal.js
var DocSearchModal_excluded = ["footer", "searchBox"];

function DocSearchModal_extends() { DocSearchModal_extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return DocSearchModal_extends.apply(this, arguments); }

function DocSearchModal_ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function DocSearchModal_objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? DocSearchModal_ownKeys(Object(source), !0).forEach(function (key) { DocSearchModal_defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : DocSearchModal_ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function DocSearchModal_defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function DocSearchModal_slicedToArray(arr, i) { return DocSearchModal_arrayWithHoles(arr) || DocSearchModal_iterableToArrayLimit(arr, i) || DocSearchModal_unsupportedIterableToArray(arr, i) || DocSearchModal_nonIterableRest(); }

function DocSearchModal_nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function DocSearchModal_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return DocSearchModal_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return DocSearchModal_arrayLikeToArray(o, minLen); }

function DocSearchModal_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function DocSearchModal_iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function DocSearchModal_arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function DocSearchModal_objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = DocSearchModal_objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function DocSearchModal_objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }













function DocSearchModal(_ref) {
  var appId = _ref.appId,
      apiKey = _ref.apiKey,
      indexName = _ref.indexName,
      _ref$placeholder = _ref.placeholder,
      placeholder = _ref$placeholder === void 0 ? 'Search docs' : _ref$placeholder,
      searchParameters = _ref.searchParameters,
      maxResultsPerGroup = _ref.maxResultsPerGroup,
      _ref$onClose = _ref.onClose,
      onClose = _ref$onClose === void 0 ? noop_noop : _ref$onClose,
      _ref$transformItems = _ref.transformItems,
      transformItems = _ref$transformItems === void 0 ? identity : _ref$transformItems,
      _ref$hitComponent = _ref.hitComponent,
      hitComponent = _ref$hitComponent === void 0 ? Hit : _ref$hitComponent,
      _ref$resultsFooterCom = _ref.resultsFooterComponent,
      resultsFooterComponent = _ref$resultsFooterCom === void 0 ? function () {
    return null;
  } : _ref$resultsFooterCom,
      navigator = _ref.navigator,
      _ref$initialScrollY = _ref.initialScrollY,
      initialScrollY = _ref$initialScrollY === void 0 ? 0 : _ref$initialScrollY,
      _ref$transformSearchC = _ref.transformSearchClient,
      transformSearchClient = _ref$transformSearchC === void 0 ? identity : _ref$transformSearchC,
      _ref$disableUserPerso = _ref.disableUserPersonalization,
      disableUserPersonalization = _ref$disableUserPerso === void 0 ? false : _ref$disableUserPerso,
      _ref$initialQuery = _ref.initialQuery,
      initialQueryFromProp = _ref$initialQuery === void 0 ? '' : _ref$initialQuery,
      _ref$translations = _ref.translations,
      translations = _ref$translations === void 0 ? {} : _ref$translations,
      getMissingResultsUrl = _ref.getMissingResultsUrl,
      _ref$insights = _ref.insights,
      insights = _ref$insights === void 0 ? false : _ref$insights;

  var footerTranslations = translations.footer,
      searchBoxTranslations = translations.searchBox,
      screenStateTranslations = DocSearchModal_objectWithoutProperties(translations, DocSearchModal_excluded);

  var _React$useState = react.useState({
    query: '',
    collections: [],
    completion: null,
    context: {},
    isOpen: false,
    activeItemId: null,
    status: 'idle'
  }),
      _React$useState2 = DocSearchModal_slicedToArray(_React$useState, 2),
      state = _React$useState2[0],
      setState = _React$useState2[1];

  var containerRef = react.useRef(null);
  var modalRef = react.useRef(null);
  var formElementRef = react.useRef(null);
  var dropdownRef = react.useRef(null);
  var inputRef = react.useRef(null);
  var snippetLength = react.useRef(10);
  var initialQueryFromSelection = react.useRef(typeof window !== 'undefined' ? window.getSelection().toString().slice(0, MAX_QUERY_SIZE) : '').current;
  var initialQuery = react.useRef(initialQueryFromProp || initialQueryFromSelection).current;
  var searchClient = useSearchClient(appId, apiKey, transformSearchClient);
  var favoriteSearches = react.useRef(createStoredSearches({
    key: "__DOCSEARCH_FAVORITE_SEARCHES__".concat(indexName),
    limit: 10
  })).current;
  var recentSearches = react.useRef(createStoredSearches({
    key: "__DOCSEARCH_RECENT_SEARCHES__".concat(indexName),
    // We display 7 recent searches and there's no favorites, but only
    // 4 when there are favorites.
    limit: favoriteSearches.getAll().length === 0 ? 7 : 4
  })).current;
  var saveRecentSearch = react.useCallback(function saveRecentSearch(item) {
    if (disableUserPersonalization) {
      return;
    } // We don't store `content` record, but their parent if available.


    var search = item.type === 'content' ? item.__docsearch_parent : item; // We save the recent search only if it's not favorited.

    if (search && favoriteSearches.getAll().findIndex(function (x) {
      return x.objectID === search.objectID;
    }) === -1) {
      recentSearches.add(search);
    }
  }, [favoriteSearches, recentSearches, disableUserPersonalization]);
  var sendItemClickEvent = react.useCallback(function (item) {
    if (!state.context.algoliaInsightsPlugin || !item.__autocomplete_id) return;
    var insightsItem = item;
    var insightsClickParams = {
      eventName: 'Item Selected',
      index: insightsItem.__autocomplete_indexName,
      items: [insightsItem],
      positions: [item.__autocomplete_id],
      queryID: insightsItem.__autocomplete_queryID
    };
    state.context.algoliaInsightsPlugin.insights.clickedObjectIDsAfterSearch(insightsClickParams);
  }, [state.context.algoliaInsightsPlugin]);
  var autocomplete = react.useMemo(function () {
    return createAutocomplete({
      id: 'docsearch',
      defaultActiveItemId: 0,
      placeholder: placeholder,
      openOnFocus: true,
      initialState: {
        query: initialQuery,
        context: {
          searchSuggestions: []
        }
      },
      insights: insights,
      navigator: navigator,
      onStateChange: function onStateChange(props) {
        setState(props.state);
      },
      getSources: function getSources(_ref2) {
        var query = _ref2.query,
            sourcesState = _ref2.state,
            setContext = _ref2.setContext,
            setStatus = _ref2.setStatus;

        if (!query) {
          if (disableUserPersonalization) {
            return [];
          }

          return [{
            sourceId: 'recentSearches',
            onSelect: function onSelect(_ref3) {
              var item = _ref3.item,
                  event = _ref3.event;
              saveRecentSearch(item);

              if (!isModifierEvent(event)) {
                onClose();
              }
            },
            getItemUrl: function getItemUrl(_ref4) {
              var item = _ref4.item;
              return item.url;
            },
            getItems: function getItems() {
              return recentSearches.getAll();
            }
          }, {
            sourceId: 'favoriteSearches',
            onSelect: function onSelect(_ref5) {
              var item = _ref5.item,
                  event = _ref5.event;
              saveRecentSearch(item);

              if (!isModifierEvent(event)) {
                onClose();
              }
            },
            getItemUrl: function getItemUrl(_ref6) {
              var item = _ref6.item;
              return item.url;
            },
            getItems: function getItems() {
              return favoriteSearches.getAll();
            }
          }];
        }

        var insightsActive = Boolean(insights);
        return searchClient.search([{
          query: query,
          indexName: indexName,
          params: DocSearchModal_objectSpread({
            attributesToRetrieve: ['hierarchy.lvl0', 'hierarchy.lvl1', 'hierarchy.lvl2', 'hierarchy.lvl3', 'hierarchy.lvl4', 'hierarchy.lvl5', 'hierarchy.lvl6', 'content', 'type', 'url'],
            attributesToSnippet: ["hierarchy.lvl1:".concat(snippetLength.current), "hierarchy.lvl2:".concat(snippetLength.current), "hierarchy.lvl3:".concat(snippetLength.current), "hierarchy.lvl4:".concat(snippetLength.current), "hierarchy.lvl5:".concat(snippetLength.current), "hierarchy.lvl6:".concat(snippetLength.current), "content:".concat(snippetLength.current)],
            snippetEllipsisText: '…',
            highlightPreTag: '<mark>',
            highlightPostTag: '</mark>',
            hitsPerPage: 20,
            clickAnalytics: insightsActive
          }, searchParameters)
        }]).catch(function (error) {
          // The Algolia `RetryError` happens when all the servers have
          // failed, meaning that there's no chance the response comes
          // back. This is the right time to display an error.
          // See https://github.com/algolia/algoliasearch-client-javascript/blob/2ffddf59bc765cd1b664ee0346b28f00229d6e12/packages/transporter/src/errors/createRetryError.ts#L5
          if (error.name === 'RetryError') {
            setStatus('error');
          }

          throw error;
        }).then(function (_ref7) {
          var results = _ref7.results;
          var _results$ = results[0],
              hits = _results$.hits,
              nbHits = _results$.nbHits;
          var sources = groupBy(hits, function (hit) {
            return removeHighlightTags(hit);
          }, maxResultsPerGroup); // We store the `lvl0`s to display them as search suggestions
          // in the "no results" screen.

          if (sourcesState.context.searchSuggestions.length < Object.keys(sources).length) {
            setContext({
              searchSuggestions: Object.keys(sources)
            });
          }

          setContext({
            nbHits: nbHits
          });
          var insightsParams = {};

          if (insightsActive) {
            insightsParams = {
              __autocomplete_indexName: indexName,
              __autocomplete_queryID: results[0].queryID,
              __autocomplete_algoliaCredentials: {
                appId: appId,
                apiKey: apiKey
              }
            };
          }

          return Object.values(sources).sort(function (a, b) {
            var pathnameA = new URL(a[0].url).pathname;
            var pathnameB = new URL(b[0].url).pathname;
            var _window = window,
                pathname = _window.location.pathname;

            if (['/', ''].includes(pathname)) {
              pathname = '/academy';
            }

            var getLongestCommonPrefix = function getLongestCommonPrefix(a, b) {
              return a.split('/').filter(Boolean).reduce(function (acc, curr, i) {
                if (curr === b.split('/').filter(Boolean)[i]) {
                  return acc + curr + '/';
                }

                return acc;
              }, '');
            };

            var isTheSameLang = function isTheSameLang(a, b) {
              return Number(['js', 'python'].some(function (lang) {
                return a.includes(lang) && b.includes(lang);
              }));
            };

            return getLongestCommonPrefix(pathnameB, pathname).length + 20 * isTheSameLang(pathnameB, pathname) - getLongestCommonPrefix(pathnameA, pathname).length - 20 * isTheSameLang(pathnameA, pathname);
          }).map(function (items, index) {
            return {
              sourceId: "hits".concat(index),
              onSelect: function onSelect(_ref8) {
                var item = _ref8.item,
                    event = _ref8.event;
                saveRecentSearch(item);

                if (!isModifierEvent(event)) {
                  onClose();
                }
              },
              getItemUrl: function getItemUrl(_ref9) {
                var item = _ref9.item;
                return item.url;
              },
              getItems: function getItems() {
                return Object.values(groupBy(items, function (item) {
                  return item.hierarchy.lvl1;
                }, maxResultsPerGroup)).map(transformItems).map(function (groupedHits) {
                  return groupedHits.map(function (item) {
                    var parent = null;
                    var potentialParent = groupedHits.find(function (siblingItem) {
                      return siblingItem.type === 'lvl1' && siblingItem.hierarchy.lvl1 === item.hierarchy.lvl1;
                    });

                    if (item.type !== 'lvl1' && potentialParent) {
                      parent = potentialParent;
                    }

                    return DocSearchModal_objectSpread(DocSearchModal_objectSpread({}, item), {}, {
                      __docsearch_parent: parent
                    }, insightsParams);
                  });
                }).map(function (x) {
                  return x.sort(function (a, b) {
                    return !a.__docsearch_parent ? -1 : !b.__docsearch_parent ? 1 : 0;
                  });
                }).flat();
              }
            };
          });
        });
      }
    });
  }, [indexName, searchParameters, maxResultsPerGroup, searchClient, onClose, recentSearches, favoriteSearches, saveRecentSearch, initialQuery, placeholder, navigator, transformItems, disableUserPersonalization, insights, appId, apiKey]);
  var getEnvironmentProps = autocomplete.getEnvironmentProps,
      getRootProps = autocomplete.getRootProps,
      refresh = autocomplete.refresh;
  useTouchEvents({
    getEnvironmentProps: getEnvironmentProps,
    panelElement: dropdownRef.current,
    formElement: formElementRef.current,
    inputElement: inputRef.current
  });
  useTrapFocus({
    container: containerRef.current
  });
  react.useEffect(function () {
    document.body.classList.add('DocSearch--active');
    return function () {
      var _window$scrollTo, _window2;

      document.body.classList.remove('DocSearch--active'); // IE11 doesn't support `scrollTo` so we check that the method exists
      // first.

      (_window$scrollTo = (_window2 = window).scrollTo) === null || _window$scrollTo === void 0 ? void 0 : _window$scrollTo.call(_window2, 0, initialScrollY);
    }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  react.useEffect(function () {
    var isMobileMediaQuery = window.matchMedia('(max-width: 768px)');

    if (isMobileMediaQuery.matches) {
      snippetLength.current = 5;
    }
  }, []);
  react.useEffect(function () {
    if (dropdownRef.current) {
      dropdownRef.current.scrollTop = 0;
    }
  }, [state.query]); // We don't focus the input when there's an initial query (i.e. Selection
  // Search) because users rather want to see the results directly, without the
  // keyboard appearing.
  // We therefore need to refresh the autocomplete instance to load all the
  // results, which is usually triggered on focus.

  react.useEffect(function () {
    if (initialQuery.length > 0) {
      refresh();

      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [initialQuery, refresh]); // We rely on a CSS property to set the modal height to the full viewport height
  // because all mobile browsers don't compute their height the same way.
  // See https://css-tricks.com/the-trick-to-viewport-units-on-mobile/

  react.useEffect(function () {
    function setFullViewportHeight() {
      if (modalRef.current) {
        var vh = window.innerHeight * 0.01;
        modalRef.current.style.setProperty('--docsearch-vh', "".concat(vh, "px"));
      }
    }

    setFullViewportHeight();
    window.addEventListener('resize', setFullViewportHeight);
    return function () {
      window.removeEventListener('resize', setFullViewportHeight);
    };
  }, []);
  return /*#__PURE__*/react.createElement("div", DocSearchModal_extends({
    ref: containerRef
  }, getRootProps({
    'aria-expanded': true
  }), {
    className: ['DocSearch', 'DocSearch-Container', state.status === 'stalled' && 'DocSearch-Container--Stalled', state.status === 'error' && 'DocSearch-Container--Errored'].filter(Boolean).join(' '),
    role: "button",
    tabIndex: 0,
    onMouseDown: function onMouseDown(event) {
      if (event.target === event.currentTarget) {
        onClose();
      }
    }
  }), /*#__PURE__*/react.createElement("div", {
    className: "DocSearch-Modal",
    ref: modalRef
  }, /*#__PURE__*/react.createElement("header", {
    className: "DocSearch-SearchBar",
    ref: formElementRef
  }, /*#__PURE__*/react.createElement(SearchBox, DocSearchModal_extends({}, autocomplete, {
    state: state,
    autoFocus: initialQuery.length === 0,
    inputRef: inputRef,
    isFromSelection: Boolean(initialQuery) && initialQuery === initialQueryFromSelection,
    translations: searchBoxTranslations,
    onClose: onClose
  }))), /*#__PURE__*/react.createElement("div", {
    className: "DocSearch-Dropdown",
    ref: dropdownRef
  }, /*#__PURE__*/react.createElement(ScreenState, DocSearchModal_extends({}, autocomplete, {
    indexName: indexName,
    state: state,
    hitComponent: hitComponent,
    resultsFooterComponent: resultsFooterComponent,
    disableUserPersonalization: disableUserPersonalization,
    recentSearches: recentSearches,
    favoriteSearches: favoriteSearches,
    inputRef: inputRef,
    translations: screenStateTranslations,
    getMissingResultsUrl: getMissingResultsUrl,
    onItemClick: function onItemClick(item, event) {
      // If insights is active, send insights click event
      sendItemClickEvent(item);
      saveRecentSearch(item);

      if (!isModifierEvent(event)) {
        onClose();
      }
    }
  }))), /*#__PURE__*/react.createElement("footer", {
    className: "DocSearch-Footer"
  }, /*#__PURE__*/react.createElement(Footer, {
    translations: footerTranslations
  }))));
}
;// CONCATENATED MODULE: ./node_modules/@apify/docsearch-apify-docs/modal.js



/***/ })

};
;