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
var modify_template_js_1 = require("./modify-template.js");
var lit_html_js_2 = require("../lit-html.js");
exports.html = lit_html_js_2.html;
exports.svg = lit_html_js_2.svg;
exports.TemplateResult = lit_html_js_2.TemplateResult;
// Get a key to lookup in `templateCaches`.
var getTemplateCacheKey = function (type, scopeName) {
    return type + "--" + scopeName;
};
/**
 * Template factory which scopes template DOM using ShadyCSS.
 * @param scopeName {string}
 */
var shadyTemplateFactory = function (scopeName) {
    return function (result) {
        var cacheKey = getTemplateCacheKey(result.type, scopeName);
        var templateCache = lit_html_js_1.templateCaches.get(cacheKey);
        if (templateCache === undefined) {
            templateCache = new Map();
            lit_html_js_1.templateCaches.set(cacheKey, templateCache);
        }
        var template = templateCache.get(result.strings);
        if (template === undefined) {
            var element = result.getTemplateElement();
            if (typeof window.ShadyCSS === 'object') {
                window.ShadyCSS.prepareTemplateDom(element, scopeName);
            }
            template = new lit_html_js_1.Template(result, element);
            templateCache.set(result.strings, template);
        }
        return template;
    };
};
var TEMPLATE_TYPES = ['html', 'svg'];
/**
 * Removes all style elements from Templates for the given scopeName.
 */
function removeStylesFromLitTemplates(scopeName) {
    TEMPLATE_TYPES.forEach(function (type) {
        var templates = lit_html_js_1.templateCaches.get(getTemplateCacheKey(type, scopeName));
        if (templates !== undefined) {
            templates.forEach(function (template) {
                var content = template.element.content;
                var styles = content.querySelectorAll('style');
                modify_template_js_1.removeNodesFromTemplate(template, new Set(Array.from(styles)));
            });
        }
    });
}
var shadyRenderSet = new Set();
/**
 * For the given scope name, ensures that ShadyCSS style scoping is performed.
 * This is done just once per scope name so the fragment and template cannot
 * be modified.
 * (1) extracts styles from the rendered fragment and hands them to ShadyCSS
 * to be scoped and appended to the document
 * (2) removes style elements from all lit-html Templates for this scope name.
 *
 * Note, <style> elements can only be placed into templates for the
 * initial rendering of the scope. If <style> elements are included in templates
 * dynamically rendered to the scope (after the first scope render), they will
 * not be scoped and the <style> will be left in the template and rendered output.
 */
var ensureStylesScoped = function (fragment, template, scopeName) {
    // only scope element template once per scope name
    if (!shadyRenderSet.has(scopeName)) {
        shadyRenderSet.add(scopeName);
        var styleTemplate_1 = document.createElement('template');
        Array.from(fragment.querySelectorAll('style')).forEach(function (s) {
            styleTemplate_1.content.appendChild(s);
        });
        window.ShadyCSS.prepareTemplateStyles(styleTemplate_1, scopeName);
        // Fix templates: note the expectation here is that the given `fragment`
        // has been generated from the given `template` which contains
        // the set of templates rendered into this scope.
        // It is only from this set of initial templates from which styles
        // will be scoped and removed.
        removeStylesFromLitTemplates(scopeName);
        // ApplyShim case
        if (window.ShadyCSS.nativeShadow) {
            var style = styleTemplate_1.content.querySelector('style');
            if (style !== null) {
                // Insert style into rendered fragment
                fragment.insertBefore(style, fragment.firstChild);
                // Insert into lit-template (for subsequent renders)
                modify_template_js_1.insertNodeIntoTemplate(template, style.cloneNode(true), template.element.content.firstChild);
            }
        }
    }
};
// NOTE: We're copying code from lit-html's `render` method here.
// We're doing this explicitly because the API for rendering templates is likely
// to change in the near term.
function render(result, container, scopeName) {
    var templateFactory = shadyTemplateFactory(scopeName);
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
        new lit_html_js_1.TemplateInstance(template, result.partCallback, templateFactory);
    container.__templateInstance = instance;
    var fragment = instance._clone();
    instance.update(result.values);
    var host = container instanceof ShadowRoot ?
        container.host :
        undefined;
    // If there's a shadow host, do ShadyCSS scoping...
    if (host !== undefined && typeof window.ShadyCSS === 'object') {
        ensureStylesScoped(fragment, template, scopeName);
        window.ShadyCSS.styleElement(host);
    }
    lit_html_js_1.removeNodes(container, container.firstChild);
    container.appendChild(fragment);
}
exports.render = render;
