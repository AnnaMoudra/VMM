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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// The first argument to JS template tags retain identity across multiple
// calls to a tag for the same literal, so we can cache work done per literal
// in a Map.
exports.templateCaches = new Map();
/**
 * Interprets a template literal as an HTML template that can efficiently
 * render to and update a container.
 */
exports.html = function (strings) {
    var values = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        values[_i - 1] = arguments[_i];
    }
    return new TemplateResult(strings, values, 'html');
};
/**
 * Interprets a template literal as an SVG template that can efficiently
 * render to and update a container.
 */
exports.svg = function (strings) {
    var values = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        values[_i - 1] = arguments[_i];
    }
    return new SVGTemplateResult(strings, values, 'svg');
};
/**
 * The return type of `html`, which holds a Template and the values from
 * interpolated expressions.
 */
var TemplateResult = /** @class */ (function () {
    function TemplateResult(strings, values, type, partCallback) {
        if (partCallback === void 0) { partCallback = exports.defaultPartCallback; }
        this.strings = strings;
        this.values = values;
        this.type = type;
        this.partCallback = partCallback;
    }
    /**
     * Returns a string of HTML used to create a <template> element.
     */
    TemplateResult.prototype.getHTML = function () {
        var l = this.strings.length - 1;
        var html = '';
        var isTextBinding = true;
        for (var i = 0; i < l; i++) {
            var s = this.strings[i];
            html += s;
            // We're in a text position if the previous string closed its tags.
            // If it doesn't have any tags, then we use the previous text position
            // state.
            var closing = findTagClose(s);
            isTextBinding = closing > -1 ? closing < s.length : isTextBinding;
            html += isTextBinding ? nodeMarker : marker;
        }
        html += this.strings[l];
        return html;
    };
    TemplateResult.prototype.getTemplateElement = function () {
        var template = document.createElement('template');
        template.innerHTML = this.getHTML();
        return template;
    };
    return TemplateResult;
}());
exports.TemplateResult = TemplateResult;
/**
 * A TemplateResult for SVG fragments.
 *
 * This class wraps HTMl in an <svg> tag in order to parse its contents in the
 * SVG namespace, then modifies the template to remove the <svg> tag so that
 * clones only container the original fragment.
 */
var SVGTemplateResult = /** @class */ (function (_super) {
    __extends(SVGTemplateResult, _super);
    function SVGTemplateResult() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SVGTemplateResult.prototype.getHTML = function () {
        return "<svg>" + _super.prototype.getHTML.call(this) + "</svg>";
    };
    SVGTemplateResult.prototype.getTemplateElement = function () {
        var template = _super.prototype.getTemplateElement.call(this);
        var content = template.content;
        var svgElement = content.firstChild;
        content.removeChild(svgElement);
        exports.reparentNodes(content, svgElement.firstChild);
        return template;
    };
    return SVGTemplateResult;
}(TemplateResult));
exports.SVGTemplateResult = SVGTemplateResult;
/**
 * The default TemplateFactory which caches Templates keyed on
 * result.type and result.strings.
 */
function defaultTemplateFactory(result) {
    var templateCache = exports.templateCaches.get(result.type);
    if (templateCache === undefined) {
        templateCache = new Map();
        exports.templateCaches.set(result.type, templateCache);
    }
    var template = templateCache.get(result.strings);
    if (template === undefined) {
        template = new Template(result, result.getTemplateElement());
        templateCache.set(result.strings, template);
    }
    return template;
}
exports.defaultTemplateFactory = defaultTemplateFactory;
/**
 * Renders a template to a container.
 *
 * To update a container with new values, reevaluate the template literal and
 * call `render` with the new result.
 *
 * @param result a TemplateResult created by evaluating a template tag like
 *     `html` or `svg`.
 * @param container A DOM parent to render to. The entire contents are either
 *     replaced, or efficiently updated if the same result type was previous
 *     rendered there.
 * @param templateFactory a function to create a Template or retreive one from
 *     cache.
 */
function render(result, container, templateFactory) {
    if (templateFactory === void 0) { templateFactory = defaultTemplateFactory; }
    var template = templateFactory(result);
    var instance = container.__templateInstance;
    // Repeat render, just call update()
    if (instance !== undefined && instance.template === template &&
        instance._partCallback === result.partCallback) {
        instance.update(result.values);
        return;
    }
    // First render, create a new TemplateInstance and append it
    instance =
        new TemplateInstance(template, result.partCallback, templateFactory);
    container.__templateInstance = instance;
    var fragment = instance._clone();
    instance.update(result.values);
    exports.removeNodes(container, container.firstChild);
    container.appendChild(fragment);
}
exports.render = render;
/**
 * An expression marker with embedded unique key to avoid collision with
 * possible text in templates.
 */
var marker = "{{lit-" + String(Math.random()).slice(2) + "}}";
/**
 * An expression marker used text-positions, not attribute positions,
 * in template.
 */
var nodeMarker = "<!--" + marker + "-->";
var markerRegex = new RegExp(marker + "|" + nodeMarker);
/**
 * This regex extracts the attribute name preceding an attribute-position
 * expression. It does this by matching the syntax allowed for attributes
 * against the string literal directly preceding the expression, assuming that
 * the expression is in an attribute-value position.
 *
 * See attributes in the HTML spec:
 * https://www.w3.org/TR/html5/syntax.html#attributes-0
 *
 * "\0-\x1F\x7F-\x9F" are Unicode control characters
 *
 * " \x09\x0a\x0c\x0d" are HTML space characters:
 * https://www.w3.org/TR/html5/infrastructure.html#space-character
 *
 * So an attribute is:
 *  * The name: any character except a control character, space character, ('),
 *    ("), ">", "=", or "/"
 *  * Followed by zero or more space characters
 *  * Followed by "="
 *  * Followed by zero or more space characters
 *  * Followed by:
 *    * Any character except space, ('), ("), "<", ">", "=", (`), or
 *    * (") then any non-("), or
 *    * (') then any non-(')
 */
var lastAttributeNameRegex = /[ \x09\x0a\x0c\x0d]([^\0-\x1F\x7F-\x9F \x09\x0a\x0c\x0d"'>=/]+)[ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*)$/;
/**
 * Finds the closing index of the last closed HTML tag.
 * This has 3 possible return values:
 *   - `-1`, meaning there is no tag in str.
 *   - `string.length`, meaning the last opened tag is unclosed.
 *   - Some positive number < str.length, meaning the index of the closing '>'.
 */
function findTagClose(str) {
    var close = str.lastIndexOf('>');
    var open = str.indexOf('<', close + 1);
    return open > -1 ? str.length : close;
}
/**
 * A placeholder for a dynamic expression in an HTML template.
 *
 * There are two built-in part types: AttributePart and NodePart. NodeParts
 * always represent a single dynamic expression, while AttributeParts may
 * represent as many expressions are contained in the attribute.
 *
 * A Template's parts are mutable, so parts can be replaced or modified
 * (possibly to implement different template semantics). The contract is that
 * parts can only be replaced, not removed, added or reordered, and parts must
 * always consume the correct number of values in their `update()` method.
 *
 * TODO(justinfagnani): That requirement is a little fragile. A
 * TemplateInstance could instead be more careful about which values it gives
 * to Part.update().
 */
var TemplatePart = /** @class */ (function () {
    function TemplatePart(type, index, name, rawName, strings) {
        this.type = type;
        this.index = index;
        this.name = name;
        this.rawName = rawName;
        this.strings = strings;
    }
    return TemplatePart;
}());
exports.TemplatePart = TemplatePart;
exports.isTemplatePartActive = function (part) { return part.index !== -1; };
/**
 * An updateable Template that tracks the location of dynamic parts.
 */
var Template = /** @class */ (function () {
    function Template(result, element) {
        this.parts = [];
        this.element = element;
        var content = this.element.content;
        // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
        var walker = document.createTreeWalker(content, 133 /* NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT |
               NodeFilter.SHOW_TEXT */, null, false);
        var index = -1;
        var partIndex = 0;
        var nodesToRemove = [];
        // The actual previous node, accounting for removals: if a node is removed
        // it will never be the previousNode.
        var previousNode;
        // Used to set previousNode at the top of the loop.
        var currentNode;
        while (walker.nextNode()) {
            index++;
            previousNode = currentNode;
            var node = currentNode = walker.currentNode;
            if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
                if (!node.hasAttributes()) {
                    continue;
                }
                var attributes = node.attributes;
                // Per https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
                // attributes are not guaranteed to be returned in document order. In
                // particular, Edge/IE can return them out of order, so we cannot assume
                // a correspondance between part index and attribute index.
                var count = 0;
                for (var i = 0; i < attributes.length; i++) {
                    if (attributes[i].value.indexOf(marker) >= 0) {
                        count++;
                    }
                }
                while (count-- > 0) {
                    // Get the template literal section leading up to the first
                    // expression in this attribute
                    var stringForPart = result.strings[partIndex];
                    // Find the attribute name
                    var attributeNameInPart = lastAttributeNameRegex.exec(stringForPart)[1];
                    // Find the corresponding attribute
                    // TODO(justinfagnani): remove non-null assertion
                    var attribute = attributes.getNamedItem(attributeNameInPart);
                    var stringsForAttributeValue = attribute.value.split(markerRegex);
                    this.parts.push(new TemplatePart('attribute', index, attribute.name, attributeNameInPart, stringsForAttributeValue));
                    node.removeAttribute(attribute.name);
                    partIndex += stringsForAttributeValue.length - 1;
                }
            }
            else if (node.nodeType === 3 /* Node.TEXT_NODE */) {
                var nodeValue = node.nodeValue;
                if (nodeValue.indexOf(marker) < 0) {
                    continue;
                }
                var parent_1 = node.parentNode;
                var strings = nodeValue.split(markerRegex);
                var lastIndex = strings.length - 1;
                // We have a part for each match found
                partIndex += lastIndex;
                // Generate a new text node for each literal section
                // These nodes are also used as the markers for node parts
                for (var i = 0; i < lastIndex; i++) {
                    parent_1.insertBefore((strings[i] === '')
                        ? document.createComment('')
                        : document.createTextNode(strings[i]), node);
                    this.parts.push(new TemplatePart('node', index++));
                }
                parent_1.insertBefore(strings[lastIndex] === '' ?
                    document.createComment('') :
                    document.createTextNode(strings[lastIndex]), node);
                nodesToRemove.push(node);
            }
            else if (node.nodeType === 8 /* Node.COMMENT_NODE */ &&
                node.nodeValue === marker) {
                var parent_2 = node.parentNode;
                // Add a new marker node to be the startNode of the Part if any of the
                // following are true:
                //  * We don't have a previousSibling
                //  * previousSibling is being removed (thus it's not the
                //    `previousNode`)
                //  * previousSibling is not a Text node
                //
                // TODO(justinfagnani): We should be able to use the previousNode here
                // as the marker node and reduce the number of extra nodes we add to a
                // template. See https://github.com/PolymerLabs/lit-html/issues/147
                var previousSibling = node.previousSibling;
                if (previousSibling === null || previousSibling !== previousNode ||
                    previousSibling.nodeType !== Node.TEXT_NODE) {
                    parent_2.insertBefore(document.createComment(''), node);
                }
                else {
                    index--;
                }
                this.parts.push(new TemplatePart('node', index++));
                nodesToRemove.push(node);
                // If we don't have a nextSibling add a marker node.
                // We don't have to check if the next node is going to be removed,
                // because that node will induce a new marker if so.
                if (node.nextSibling === null) {
                    parent_2.insertBefore(document.createComment(''), node);
                }
                else {
                    index--;
                }
                currentNode = previousNode;
                partIndex++;
            }
        }
        // Remove text binding nodes after the walk to not disturb the TreeWalker
        for (var _i = 0, nodesToRemove_1 = nodesToRemove; _i < nodesToRemove_1.length; _i++) {
            var n = nodesToRemove_1[_i];
            n.parentNode.removeChild(n);
        }
    }
    return Template;
}());
exports.Template = Template;
/**
 * Returns a value ready to be inserted into a Part from a user-provided value.
 *
 * If the user value is a directive, this invokes the directive with the given
 * part. If the value is null, it's converted to undefined to work better
 * with certain DOM APIs, like textContent.
 */
exports.getValue = function (part, value) {
    // `null` as the value of a Text node will render the string 'null'
    // so we convert it to undefined
    if (isDirective(value)) {
        value = value(part);
        return exports.noChange;
    }
    return value === null ? undefined : value;
};
exports.directive = function (f) {
    f.__litDirective = true;
    return f;
};
var isDirective = function (o) {
    return typeof o === 'function' && o.__litDirective === true;
};
/**
 * A sentinel value that signals that a value was handled by a directive and
 * should not be written to the DOM.
 */
exports.noChange = {};
exports.directiveValue = exports.noChange;
var isPrimitiveValue = function (value) { return value === null ||
    !(typeof value === 'object' || typeof value === 'function'); };
var AttributePart = /** @class */ (function () {
    function AttributePart(instance, element, name, strings) {
        this.instance = instance;
        this.element = element;
        this.name = name;
        this.strings = strings;
        this.size = strings.length - 1;
        this._previousValues = [];
    }
    AttributePart.prototype._interpolate = function (values, startIndex) {
        var strings = this.strings;
        var l = strings.length - 1;
        var text = '';
        for (var i = 0; i < l; i++) {
            text += strings[i];
            var v = exports.getValue(this, values[startIndex + i]);
            if (v && v !== exports.noChange &&
                (Array.isArray(v) || typeof v !== 'string' && v[Symbol.iterator])) {
                for (var _i = 0, v_1 = v; _i < v_1.length; _i++) {
                    var t = v_1[_i];
                    // TODO: we need to recursively call getValue into iterables...
                    text += t;
                }
            }
            else {
                text += v;
            }
        }
        return text + strings[l];
    };
    AttributePart.prototype._equalToPreviousValues = function (values, startIndex) {
        for (var i = startIndex; i < startIndex + this.size; i++) {
            if (this._previousValues[i] !== values[i] ||
                !isPrimitiveValue(values[i])) {
                return false;
            }
        }
        return true;
    };
    AttributePart.prototype.setValue = function (values, startIndex) {
        if (this._equalToPreviousValues(values, startIndex)) {
            return;
        }
        var s = this.strings;
        var value;
        if (s.length === 2 && s[0] === '' && s[1] === '') {
            // An expression that occupies the whole attribute value will leave
            // leading and trailing empty strings.
            value = exports.getValue(this, values[startIndex]);
            if (Array.isArray(value)) {
                value = value.join('');
            }
        }
        else {
            value = this._interpolate(values, startIndex);
        }
        if (value !== exports.noChange) {
            this.element.setAttribute(this.name, value);
        }
        this._previousValues = values;
    };
    return AttributePart;
}());
exports.AttributePart = AttributePart;
var NodePart = /** @class */ (function () {
    function NodePart(instance, startNode, endNode) {
        this.instance = instance;
        this.startNode = startNode;
        this.endNode = endNode;
        this._previousValue = undefined;
    }
    NodePart.prototype.setValue = function (value) {
        value = exports.getValue(this, value);
        if (value === exports.noChange) {
            return;
        }
        if (isPrimitiveValue(value)) {
            // Handle primitive values
            // If the value didn't change, do nothing
            if (value === this._previousValue) {
                return;
            }
            this._setText(value);
        }
        else if (value instanceof TemplateResult) {
            this._setTemplateResult(value);
        }
        else if (Array.isArray(value) || value[Symbol.iterator]) {
            this._setIterable(value);
        }
        else if (value instanceof Node) {
            this._setNode(value);
        }
        else if (value.then !== undefined) {
            this._setPromise(value);
        }
        else {
            // Fallback, will render the string representation
            this._setText(value);
        }
    };
    NodePart.prototype._insert = function (node) {
        this.endNode.parentNode.insertBefore(node, this.endNode);
    };
    NodePart.prototype._setNode = function (value) {
        if (this._previousValue === value) {
            return;
        }
        this.clear();
        this._insert(value);
        this._previousValue = value;
    };
    NodePart.prototype._setText = function (value) {
        var node = this.startNode.nextSibling;
        value = value === undefined ? '' : value;
        if (node === this.endNode.previousSibling &&
            node.nodeType === Node.TEXT_NODE) {
            // If we only have a single text node between the markers, we can just
            // set its value, rather than replacing it.
            // TODO(justinfagnani): Can we just check if _previousValue is
            // primitive?
            node.textContent = value;
        }
        else {
            this._setNode(document.createTextNode(value));
        }
        this._previousValue = value;
    };
    NodePart.prototype._setTemplateResult = function (value) {
        var template = this.instance._getTemplate(value);
        var instance;
        if (this._previousValue && this._previousValue.template === template) {
            instance = this._previousValue;
        }
        else {
            instance = new TemplateInstance(template, this.instance._partCallback, this.instance._getTemplate);
            this._setNode(instance._clone());
            this._previousValue = instance;
        }
        instance.update(value.values);
    };
    NodePart.prototype._setIterable = function (value) {
        // For an Iterable, we create a new InstancePart per item, then set its
        // value to the item. This is a little bit of overhead for every item in
        // an Iterable, but it lets us recurse easily and efficiently update Arrays
        // of TemplateResults that will be commonly returned from expressions like:
        // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
        // If _previousValue is an array, then the previous render was of an
        // iterable and _previousValue will contain the NodeParts from the previous
        // render. If _previousValue is not an array, clear this part and make a new
        // array for NodeParts.
        if (!Array.isArray(this._previousValue)) {
            this.clear();
            this._previousValue = [];
        }
        // Lets us keep track of how many items we stamped so we can clear leftover
        // items from a previous render
        var itemParts = this._previousValue;
        var partIndex = 0;
        for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
            var item = value_1[_i];
            // Try to reuse an existing part
            var itemPart = itemParts[partIndex];
            // If no existing part, create a new one
            if (itemPart === undefined) {
                // If we're creating the first item part, it's startNode should be the
                // container's startNode
                var itemStart = this.startNode;
                // If we're not creating the first part, create a new separator marker
                // node, and fix up the previous part's endNode to point to it
                if (partIndex > 0) {
                    var previousPart = itemParts[partIndex - 1];
                    itemStart = previousPart.endNode = document.createTextNode('');
                    this._insert(itemStart);
                }
                itemPart = new NodePart(this.instance, itemStart, this.endNode);
                itemParts.push(itemPart);
            }
            itemPart.setValue(item);
            partIndex++;
        }
        if (partIndex === 0) {
            this.clear();
            this._previousValue = undefined;
        }
        else if (partIndex < itemParts.length) {
            var lastPart = itemParts[partIndex - 1];
            // Truncate the parts array so _previousValue reflects the current state
            itemParts.length = partIndex;
            this.clear(lastPart.endNode.previousSibling);
            lastPart.endNode = this.endNode;
        }
    };
    NodePart.prototype._setPromise = function (value) {
        var _this = this;
        this._previousValue = value;
        value.then(function (v) {
            if (_this._previousValue === value) {
                _this.setValue(v);
            }
        });
    };
    NodePart.prototype.clear = function (startNode) {
        if (startNode === void 0) { startNode = this.startNode; }
        exports.removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
    };
    return NodePart;
}());
exports.NodePart = NodePart;
exports.defaultPartCallback = function (instance, templatePart, node) {
    if (templatePart.type === 'attribute') {
        return new AttributePart(instance, node, templatePart.name, templatePart.strings);
    }
    else if (templatePart.type === 'node') {
        return new NodePart(instance, node, node.nextSibling);
    }
    throw new Error("Unknown part type " + templatePart.type);
};
/**
 * An instance of a `Template` that can be attached to the DOM and updated
 * with new values.
 */
var TemplateInstance = /** @class */ (function () {
    function TemplateInstance(template, partCallback, getTemplate) {
        this._parts = [];
        this.template = template;
        this._partCallback = partCallback;
        this._getTemplate = getTemplate;
    }
    TemplateInstance.prototype.update = function (values) {
        var valueIndex = 0;
        for (var _i = 0, _a = this._parts; _i < _a.length; _i++) {
            var part = _a[_i];
            if (!part) {
                valueIndex++;
            }
            else if (part.size === undefined) {
                part.setValue(values[valueIndex]);
                valueIndex++;
            }
            else {
                part.setValue(values, valueIndex);
                valueIndex += part.size;
            }
        }
    };
    TemplateInstance.prototype._clone = function () {
        // Clone the node, rather than importing it, to keep the fragment in the
        // template's document. This leaves the fragment inert so custom elements
        // won't upgrade until after the main document adopts the node.
        var fragment = this.template.element.content.cloneNode(true);
        var parts = this.template.parts;
        if (parts.length > 0) {
            // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be
            // null
            var walker = document.createTreeWalker(fragment, 133 /* NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT |
                   NodeFilter.SHOW_TEXT */, null, false);
            var index = -1;
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                var partActive = exports.isTemplatePartActive(part);
                // An inactive part has no coresponding Template node.
                if (partActive) {
                    while (index < part.index) {
                        index++;
                        walker.nextNode();
                    }
                }
                this._parts.push(partActive ? this._partCallback(this, part, walker.currentNode) : undefined);
            }
        }
        return fragment;
    };
    return TemplateInstance;
}());
exports.TemplateInstance = TemplateInstance;
/**
 * Reparents nodes, starting from `startNode` (inclusive) to `endNode`
 * (exclusive), into another container (could be the same container), before
 * `beforeNode`. If `beforeNode` is null, it appends the nodes to the
 * container.
 */
exports.reparentNodes = function (container, start, end, before) {
    if (end === void 0) { end = null; }
    if (before === void 0) { before = null; }
    var node = start;
    while (node !== end) {
        var n = node.nextSibling;
        container.insertBefore(node, before);
        node = n;
    }
};
/**
 * Removes nodes, starting from `startNode` (inclusive) to `endNode`
 * (exclusive), from `container`.
 */
exports.removeNodes = function (container, startNode, endNode) {
    if (endNode === void 0) { endNode = null; }
    var node = startNode;
    while (node !== endNode) {
        var n = node.nextSibling;
        container.removeChild(node);
        node = n;
    }
};
