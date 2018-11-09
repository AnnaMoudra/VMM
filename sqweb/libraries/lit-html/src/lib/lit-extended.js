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
var lit_html_js_1 = require("../lit-html.js");
var lit_html_js_2 = require("../lit-html.js");
exports.render = lit_html_js_2.render;
/**
 * Interprets a template literal as a lit-extended HTML template.
 */
exports.html = function (strings) {
    var values = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        values[_i - 1] = arguments[_i];
    }
    return new lit_html_js_1.TemplateResult(strings, values, 'html', exports.extendedPartCallback);
};
/**
 * Interprets a template literal as a lit-extended SVG template.
 */
exports.svg = function (strings) {
    var values = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        values[_i - 1] = arguments[_i];
    }
    return new lit_html_js_1.SVGTemplateResult(strings, values, 'svg', exports.extendedPartCallback);
};
/**
 * A PartCallback which allows templates to set properties and declarative
 * event handlers.
 *
 * Properties are set by default, instead of attributes. Attribute names in
 * lit-html templates preserve case, so properties are case sensitive. If an
 * expression takes up an entire attribute value, then the property is set to
 * that value. If an expression is interpolated with a string or other
 * expressions then the property is set to the string result of the
 * interpolation.
 *
 * To set an attribute instead of a property, append a `$` suffix to the
 * attribute name.
 *
 * Example:
 *
 *     html`<button class$="primary">Buy Now</button>`
 *
 * To set an event handler, prefix the attribute name with `on-`:
 *
 * Example:
 *
 *     html`<button on-click=${(e)=> this.onClickHandler(e)}>Buy Now</button>`
 *
 */
exports.extendedPartCallback = function (instance, templatePart, node) {
    if (templatePart.type === 'attribute') {
        if (templatePart.rawName.substr(0, 3) === 'on-') {
            var eventName = templatePart.rawName.slice(3);
            return new EventPart(instance, node, eventName);
        }
        var lastChar = templatePart.name.substr(templatePart.name.length - 1);
        if (lastChar === '$') {
            var name_1 = templatePart.name.slice(0, -1);
            return new lit_html_js_1.AttributePart(instance, node, name_1, templatePart.strings);
        }
        if (lastChar === '?') {
            var name_2 = templatePart.name.slice(0, -1);
            return new BooleanAttributePart(instance, node, name_2, templatePart.strings);
        }
        return new PropertyPart(instance, node, templatePart.rawName, templatePart.strings);
    }
    return lit_html_js_1.defaultPartCallback(instance, templatePart, node);
};
/**
 * Implements a boolean attribute, roughly as defined in the HTML
 * specification.
 *
 * If the value is truthy, then the attribute is present with a value of
 * ''. If the value is falsey, the attribute is removed.
 */
var BooleanAttributePart = /** @class */ (function (_super) {
    __extends(BooleanAttributePart, _super);
    function BooleanAttributePart() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BooleanAttributePart.prototype.setValue = function (values, startIndex) {
        var s = this.strings;
        if (s.length === 2 && s[0] === '' && s[1] === '') {
            var value = lit_html_js_1.getValue(this, values[startIndex]);
            if (value === lit_html_js_1.noChange) {
                return;
            }
            if (value) {
                this.element.setAttribute(this.name, '');
            }
            else {
                this.element.removeAttribute(this.name);
            }
        }
        else {
            throw new Error('boolean attributes can only contain a single expression');
        }
    };
    return BooleanAttributePart;
}(lit_html_js_1.AttributePart));
exports.BooleanAttributePart = BooleanAttributePart;
var PropertyPart = /** @class */ (function (_super) {
    __extends(PropertyPart, _super);
    function PropertyPart() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PropertyPart.prototype.setValue = function (values, startIndex) {
        var s = this.strings;
        var value;
        if (this._equalToPreviousValues(values, startIndex)) {
            return;
        }
        if (s.length === 2 && s[0] === '' && s[1] === '') {
            // An expression that occupies the whole attribute value will leave
            // leading and trailing empty strings.
            value = lit_html_js_1.getValue(this, values[startIndex]);
        }
        else {
            // Interpolation, so interpolate
            value = this._interpolate(values, startIndex);
        }
        if (value !== lit_html_js_1.noChange) {
            this.element[this.name] = value;
        }
        this._previousValues = values;
    };
    return PropertyPart;
}(lit_html_js_1.AttributePart));
exports.PropertyPart = PropertyPart;
var EventPart = /** @class */ (function () {
    function EventPart(instance, element, eventName) {
        this.instance = instance;
        this.element = element;
        this.eventName = eventName;
    }
    EventPart.prototype.setValue = function (value) {
        var listener = lit_html_js_1.getValue(this, value);
        if (listener === this._listener) {
            return;
        }
        if (listener == null) {
            this.element.removeEventListener(this.eventName, this);
        }
        else if (this._listener == null) {
            this.element.addEventListener(this.eventName, this);
        }
        this._listener = listener;
    };
    EventPart.prototype.handleEvent = function (event) {
        if (typeof this._listener === 'function') {
            this._listener.call(this.element, event);
        }
        else if (typeof this._listener.handleEvent === 'function') {
            this._listener.handleEvent(event);
        }
    };
    return EventPart;
}());
exports.EventPart = EventPart;
