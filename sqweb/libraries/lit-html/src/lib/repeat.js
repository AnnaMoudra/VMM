"use strict";
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
Object.defineProperty(exports, "__esModule", { value: true });
var lit_html_js_1 = require("../lit-html.js");
var keyMapCache = new WeakMap();
function cleanMap(part, key, map) {
    if (!part.startNode.parentNode) {
        map.delete(key);
    }
}
function repeat(items, keyFnOrTemplate, template) {
    var keyFn;
    if (arguments.length === 2) {
        template = keyFnOrTemplate;
    }
    else if (arguments.length === 3) {
        keyFn = keyFnOrTemplate;
    }
    return lit_html_js_1.directive(function (part) {
        var keyMap = keyMapCache.get(part);
        if (keyMap === undefined) {
            keyMap = new Map();
            keyMapCache.set(part, keyMap);
        }
        var container = part.startNode.parentNode;
        var index = -1;
        var currentMarker = part.startNode.nextSibling;
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            var result = void 0;
            var key = void 0;
            try {
                ++index;
                result = template(item, index);
                key = keyFn ? keyFn(item) : index;
            }
            catch (e) {
                console.error(e);
                continue;
            }
            // Try to reuse a part
            var itemPart = keyMap.get(key);
            if (itemPart === undefined) {
                var marker = document.createTextNode('');
                var endNode = document.createTextNode('');
                container.insertBefore(marker, currentMarker);
                container.insertBefore(endNode, currentMarker);
                itemPart = new lit_html_js_1.NodePart(part.instance, marker, endNode);
                if (key !== undefined) {
                    keyMap.set(key, itemPart);
                }
            }
            else if (currentMarker !== itemPart.startNode) {
                // Existing part in the wrong position
                var end = itemPart.endNode.nextSibling;
                if (currentMarker !== end) {
                    lit_html_js_1.reparentNodes(container, itemPart.startNode, end, currentMarker);
                }
            }
            else {
                // else part is in the correct position already
                currentMarker = itemPart.endNode.nextSibling;
            }
            itemPart.setValue(result);
        }
        // Cleanup
        if (currentMarker !== part.endNode) {
            lit_html_js_1.removeNodes(container, currentMarker, part.endNode);
            keyMap.forEach(cleanMap);
        }
    });
}
exports.repeat = repeat;
