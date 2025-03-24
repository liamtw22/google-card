import { css as css$1, LitElement as LitElement$1, html as html$1 } from "https://cdn.jsdelivr.net/gh/lit/dist@2.4.0/all/lit-element.js?module";

const isCEPolyfill = "undefined" != typeof window && null != window.customElements && void 0 !== window.customElements.polyfillWrapFlushCallback, removeNodes = (container, start, end = null) => {
  for (;start !== end; ) {
    const n = start.nextSibling;
    container.removeChild(start), start = n;
  }
}, marker = `{{lit-${String(Math.random()).slice(2)}}}`, nodeMarker = `\x3c!--${marker}--\x3e`, markerRegex = new RegExp(`${marker}|${nodeMarker}`);

class Template {
  constructor(result, element) {
    this.parts = [], this.element = element;
    const nodesToRemove = [], stack = [], walker = document.createTreeWalker(element.content, 133, null, !1);
    let lastPartIndex = 0, index = -1, partIndex = 0;
    const {strings: strings, values: {length: length}} = result;
    for (;partIndex < length; ) {
      const node = walker.nextNode();
      if (null !== node) {
        if (index++, 1 === node.nodeType) {
          if (node.hasAttributes()) {
            const attributes = node.attributes, {length: length} = attributes;
            let count = 0;
            for (let i = 0; i < length; i++) endsWith(attributes[i].name, "$lit$") && count++;
            for (;count-- > 0; ) {
              const stringForPart = strings[partIndex], name = lastAttributeNameRegex.exec(stringForPart)[2], attributeLookupName = name.toLowerCase() + "$lit$", attributeValue = node.getAttribute(attributeLookupName);
              node.removeAttribute(attributeLookupName);
              const statics = attributeValue.split(markerRegex);
              this.parts.push({
                type: "attribute",
                index: index,
                name: name,
                strings: statics
              }), partIndex += statics.length - 1;
            }
          }
          "TEMPLATE" === node.tagName && (stack.push(node), walker.currentNode = node.content);
        } else if (3 === node.nodeType) {
          const data = node.data;
          if (data.indexOf(marker) >= 0) {
            const parent = node.parentNode, strings = data.split(markerRegex), lastIndex = strings.length - 1;
            for (let i = 0; i < lastIndex; i++) {
              let insert, s = strings[i];
              if ("" === s) insert = createMarker(); else {
                const match = lastAttributeNameRegex.exec(s);
                null !== match && endsWith(match[2], "$lit$") && (s = s.slice(0, match.index) + match[1] + match[2].slice(0, -5) + match[3]), 
                insert = document.createTextNode(s);
              }
              parent.insertBefore(insert, node), this.parts.push({
                type: "node",
                index: ++index
              });
            }
            "" === strings[lastIndex] ? (parent.insertBefore(createMarker(), node), nodesToRemove.push(node)) : node.data = strings[lastIndex], 
            partIndex += lastIndex;
          }
        } else if (8 === node.nodeType) if (node.data === marker) {
          const parent = node.parentNode;
          null !== node.previousSibling && index !== lastPartIndex || (index++, parent.insertBefore(createMarker(), node)), 
          lastPartIndex = index, this.parts.push({
            type: "node",
            index: index
          }), null === node.nextSibling ? node.data = "" : (nodesToRemove.push(node), index--), 
          partIndex++;
        } else {
          let i = -1;
          for (;-1 !== (i = node.data.indexOf(marker, i + 1)); ) this.parts.push({
            type: "node",
            index: -1
          }), partIndex++;
        }
      } else walker.currentNode = stack.pop();
    }
    for (const n of nodesToRemove) n.parentNode.removeChild(n);
  }
}

const endsWith = (str, suffix) => {
  const index = str.length - suffix.length;
  return index >= 0 && str.slice(index) === suffix;
}, isTemplatePartActive = part => -1 !== part.index, createMarker = () => document.createComment(""), lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

function removeNodesFromTemplate(template, nodesToRemove) {
  const {element: {content: content}, parts: parts} = template, walker = document.createTreeWalker(content, 133, null, !1);
  let partIndex = nextActiveIndexInTemplateParts(parts), part = parts[partIndex], nodeIndex = -1, removeCount = 0;
  const nodesToRemoveInTemplate = [];
  let currentRemovingNode = null;
  for (;walker.nextNode(); ) {
    nodeIndex++;
    const node = walker.currentNode;
    for (node.previousSibling === currentRemovingNode && (currentRemovingNode = null), 
    nodesToRemove.has(node) && (nodesToRemoveInTemplate.push(node), null === currentRemovingNode && (currentRemovingNode = node)), 
    null !== currentRemovingNode && removeCount++; void 0 !== part && part.index === nodeIndex; ) part.index = null !== currentRemovingNode ? -1 : part.index - removeCount, 
    partIndex = nextActiveIndexInTemplateParts(parts, partIndex), part = parts[partIndex];
  }
  nodesToRemoveInTemplate.forEach((n => n.parentNode.removeChild(n)));
}

const countNodes = node => {
  let count = 11 === node.nodeType ? 0 : 1;
  const walker = document.createTreeWalker(node, 133, null, !1);
  for (;walker.nextNode(); ) count++;
  return count;
}, nextActiveIndexInTemplateParts = (parts, startIndex = -1) => {
  for (let i = startIndex + 1; i < parts.length; i++) {
    const part = parts[i];
    if (isTemplatePartActive(part)) return i;
  }
  return -1;
};

const directives = new WeakMap, isDirective = o => "function" == typeof o && directives.has(o), noChange = {}, nothing = {};

class TemplateInstance {
  constructor(template, processor, options) {
    this.__parts = [], this.template = template, this.processor = processor, this.options = options;
  }
  update(values) {
    let i = 0;
    for (const part of this.__parts) void 0 !== part && part.setValue(values[i]), i++;
    for (const part of this.__parts) void 0 !== part && part.commit();
  }
  _clone() {
    const fragment = isCEPolyfill ? this.template.element.content.cloneNode(!0) : document.importNode(this.template.element.content, !0), stack = [], parts = this.template.parts, walker = document.createTreeWalker(fragment, 133, null, !1);
    let part, partIndex = 0, nodeIndex = 0, node = walker.nextNode();
    for (;partIndex < parts.length; ) if (part = parts[partIndex], isTemplatePartActive(part)) {
      for (;nodeIndex < part.index; ) nodeIndex++, "TEMPLATE" === node.nodeName && (stack.push(node), 
      walker.currentNode = node.content), null === (node = walker.nextNode()) && (walker.currentNode = stack.pop(), 
      node = walker.nextNode());
      if ("node" === part.type) {
        const part = this.processor.handleTextExpression(this.options);
        part.insertAfterNode(node.previousSibling), this.__parts.push(part);
      } else this.__parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
      partIndex++;
    } else this.__parts.push(void 0), partIndex++;
    return isCEPolyfill && (document.adoptNode(fragment), customElements.upgrade(fragment)), 
    fragment;
  }
}

const policy = window.trustedTypes && trustedTypes.createPolicy("lit-html", {
  createHTML: s => s
}), commentMarker = ` ${marker} `;

class TemplateResult {
  constructor(strings, values, type, processor) {
    this.strings = strings, this.values = values, this.type = type, this.processor = processor;
  }
  getHTML() {
    const l = this.strings.length - 1;
    let html = "", isCommentBinding = !1;
    for (let i = 0; i < l; i++) {
      const s = this.strings[i], commentOpen = s.lastIndexOf("\x3c!--");
      isCommentBinding = (commentOpen > -1 || isCommentBinding) && -1 === s.indexOf("--\x3e", commentOpen + 1);
      const attributeMatch = lastAttributeNameRegex.exec(s);
      html += null === attributeMatch ? s + (isCommentBinding ? commentMarker : nodeMarker) : s.substr(0, attributeMatch.index) + attributeMatch[1] + attributeMatch[2] + "$lit$" + attributeMatch[3] + marker;
    }
    return html += this.strings[l], html;
  }
  getTemplateElement() {
    const template = document.createElement("template");
    let value = this.getHTML();
    return void 0 !== policy && (value = policy.createHTML(value)), template.innerHTML = value, 
    template;
  }
}

const isPrimitive = value => null === value || !("object" == typeof value || "function" == typeof value), isIterable = value => Array.isArray(value) || !(!value || !value[Symbol.iterator]);

class AttributeCommitter {
  constructor(element, name, strings) {
    this.dirty = !0, this.element = element, this.name = name, this.strings = strings, 
    this.parts = [];
    for (let i = 0; i < strings.length - 1; i++) this.parts[i] = this._createPart();
  }
  _createPart() {
    return new AttributePart(this);
  }
  _getValue() {
    const strings = this.strings, l = strings.length - 1, parts = this.parts;
    if (1 === l && "" === strings[0] && "" === strings[1]) {
      const v = parts[0].value;
      if ("symbol" == typeof v) return String(v);
      if ("string" == typeof v || !isIterable(v)) return v;
    }
    let text = "";
    for (let i = 0; i < l; i++) {
      text += strings[i];
      const part = parts[i];
      if (void 0 !== part) {
        const v = part.value;
        if (isPrimitive(v) || !isIterable(v)) text += "string" == typeof v ? v : String(v); else for (const t of v) text += "string" == typeof t ? t : String(t);
      }
    }
    return text += strings[l], text;
  }
  commit() {
    this.dirty && (this.dirty = !1, this.element.setAttribute(this.name, this._getValue()));
  }
}

class AttributePart {
  constructor(committer) {
    this.value = void 0, this.committer = committer;
  }
  setValue(value) {
    value === noChange || isPrimitive(value) && value === this.value || (this.value = value, 
    isDirective(value) || (this.committer.dirty = !0));
  }
  commit() {
    for (;isDirective(this.value); ) {
      const directive = this.value;
      this.value = noChange, directive(this);
    }
    this.value !== noChange && this.committer.commit();
  }
}

class NodePart {
  constructor(options) {
    this.value = void 0, this.__pendingValue = void 0, this.options = options;
  }
  appendInto(container) {
    this.startNode = container.appendChild(createMarker()), this.endNode = container.appendChild(createMarker());
  }
  insertAfterNode(ref) {
    this.startNode = ref, this.endNode = ref.nextSibling;
  }
  appendIntoPart(part) {
    part.__insert(this.startNode = createMarker()), part.__insert(this.endNode = createMarker());
  }
  insertAfterPart(ref) {
    ref.__insert(this.startNode = createMarker()), this.endNode = ref.endNode, ref.endNode = this.startNode;
  }
  setValue(value) {
    this.__pendingValue = value;
  }
  commit() {
    if (null === this.startNode.parentNode) return;
    for (;isDirective(this.__pendingValue); ) {
      const directive = this.__pendingValue;
      this.__pendingValue = noChange, directive(this);
    }
    const value = this.__pendingValue;
    value !== noChange && (isPrimitive(value) ? value !== this.value && this.__commitText(value) : value instanceof TemplateResult ? this.__commitTemplateResult(value) : value instanceof Node ? this.__commitNode(value) : isIterable(value) ? this.__commitIterable(value) : value === nothing ? (this.value = nothing, 
    this.clear()) : this.__commitText(value));
  }
  __insert(node) {
    this.endNode.parentNode.insertBefore(node, this.endNode);
  }
  __commitNode(value) {
    this.value !== value && (this.clear(), this.__insert(value), this.value = value);
  }
  __commitText(value) {
    const node = this.startNode.nextSibling, valueAsString = "string" == typeof (value = null == value ? "" : value) ? value : String(value);
    node === this.endNode.previousSibling && 3 === node.nodeType ? node.data = valueAsString : this.__commitNode(document.createTextNode(valueAsString)), 
    this.value = value;
  }
  __commitTemplateResult(value) {
    const template = this.options.templateFactory(value);
    if (this.value instanceof TemplateInstance && this.value.template === template) this.value.update(value.values); else {
      const instance = new TemplateInstance(template, value.processor, this.options), fragment = instance._clone();
      instance.update(value.values), this.__commitNode(fragment), this.value = instance;
    }
  }
  __commitIterable(value) {
    Array.isArray(this.value) || (this.value = [], this.clear());
    const itemParts = this.value;
    let itemPart, partIndex = 0;
    for (const item of value) itemPart = itemParts[partIndex], void 0 === itemPart && (itemPart = new NodePart(this.options), 
    itemParts.push(itemPart), 0 === partIndex ? itemPart.appendIntoPart(this) : itemPart.insertAfterPart(itemParts[partIndex - 1])), 
    itemPart.setValue(item), itemPart.commit(), partIndex++;
    partIndex < itemParts.length && (itemParts.length = partIndex, this.clear(itemPart && itemPart.endNode));
  }
  clear(startNode = this.startNode) {
    removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
  }
}

class BooleanAttributePart {
  constructor(element, name, strings) {
    if (this.value = void 0, this.__pendingValue = void 0, 2 !== strings.length || "" !== strings[0] || "" !== strings[1]) throw new Error("Boolean attributes can only contain a single expression");
    this.element = element, this.name = name, this.strings = strings;
  }
  setValue(value) {
    this.__pendingValue = value;
  }
  commit() {
    for (;isDirective(this.__pendingValue); ) {
      const directive = this.__pendingValue;
      this.__pendingValue = noChange, directive(this);
    }
    if (this.__pendingValue === noChange) return;
    const value = !!this.__pendingValue;
    this.value !== value && (value ? this.element.setAttribute(this.name, "") : this.element.removeAttribute(this.name), 
    this.value = value), this.__pendingValue = noChange;
  }
}

class PropertyCommitter extends AttributeCommitter {
  constructor(element, name, strings) {
    super(element, name, strings), this.single = 2 === strings.length && "" === strings[0] && "" === strings[1];
  }
  _createPart() {
    return new PropertyPart(this);
  }
  _getValue() {
    return this.single ? this.parts[0].value : super._getValue();
  }
  commit() {
    this.dirty && (this.dirty = !1, this.element[this.name] = this._getValue());
  }
}

class PropertyPart extends AttributePart {}

let eventOptionsSupported = !1;

(() => {
  try {
    const options = {
      get capture() {
        return eventOptionsSupported = !0, !1;
      }
    };
    window.addEventListener("test", options, options), window.removeEventListener("test", options, options);
  } catch (_e) {}
})();

class EventPart {
  constructor(element, eventName, eventContext) {
    this.value = void 0, this.__pendingValue = void 0, this.element = element, this.eventName = eventName, 
    this.eventContext = eventContext, this.__boundHandleEvent = e => this.handleEvent(e);
  }
  setValue(value) {
    this.__pendingValue = value;
  }
  commit() {
    for (;isDirective(this.__pendingValue); ) {
      const directive = this.__pendingValue;
      this.__pendingValue = noChange, directive(this);
    }
    if (this.__pendingValue === noChange) return;
    const newListener = this.__pendingValue, oldListener = this.value, shouldRemoveListener = null == newListener || null != oldListener && (newListener.capture !== oldListener.capture || newListener.once !== oldListener.once || newListener.passive !== oldListener.passive), shouldAddListener = null != newListener && (null == oldListener || shouldRemoveListener);
    shouldRemoveListener && this.element.removeEventListener(this.eventName, this.__boundHandleEvent, this.__options), 
    shouldAddListener && (this.__options = getOptions(newListener), this.element.addEventListener(this.eventName, this.__boundHandleEvent, this.__options)), 
    this.value = newListener, this.__pendingValue = noChange;
  }
  handleEvent(event) {
    "function" == typeof this.value ? this.value.call(this.eventContext || this.element, event) : this.value.handleEvent(event);
  }
}

const getOptions = o => o && (eventOptionsSupported ? {
  capture: o.capture,
  passive: o.passive,
  once: o.once
} : o.capture);

function templateFactory(result) {
  let templateCache = templateCaches.get(result.type);
  void 0 === templateCache && (templateCache = {
    stringsArray: new WeakMap,
    keyString: new Map
  }, templateCaches.set(result.type, templateCache));
  let template = templateCache.stringsArray.get(result.strings);
  if (void 0 !== template) return template;
  const key = result.strings.join(marker);
  return template = templateCache.keyString.get(key), void 0 === template && (template = new Template(result, result.getTemplateElement()), 
  templateCache.keyString.set(key, template)), templateCache.stringsArray.set(result.strings, template), 
  template;
}

const templateCaches = new Map, parts = new WeakMap;

const defaultTemplateProcessor = new class DefaultTemplateProcessor {
  handleAttributeExpressions(element, name, strings, options) {
    const prefix = name[0];
    if ("." === prefix) {
      return new PropertyCommitter(element, name.slice(1), strings).parts;
    }
    if ("@" === prefix) return [ new EventPart(element, name.slice(1), options.eventContext) ];
    if ("?" === prefix) return [ new BooleanAttributePart(element, name.slice(1), strings) ];
    return new AttributeCommitter(element, name, strings).parts;
  }
  handleTextExpression(options) {
    return new NodePart(options);
  }
};

"undefined" != typeof window && (window.litHtmlVersions || (window.litHtmlVersions = [])).push("1.4.1");

const html = (strings, ...values) => new TemplateResult(strings, values, "html", defaultTemplateProcessor), getTemplateCacheKey = (type, scopeName) => `${type}--${scopeName}`;

let compatibleShadyCSSVersion = !0;

void 0 === window.ShadyCSS ? compatibleShadyCSSVersion = !1 : void 0 === window.ShadyCSS.prepareTemplateDom && (console.warn("Incompatible ShadyCSS version detected. Please update to at least @webcomponents/webcomponentsjs@2.0.2 and @webcomponents/shadycss@1.3.1."), 
compatibleShadyCSSVersion = !1);

const shadyTemplateFactory = scopeName => result => {
  const cacheKey = getTemplateCacheKey(result.type, scopeName);
  let templateCache = templateCaches.get(cacheKey);
  void 0 === templateCache && (templateCache = {
    stringsArray: new WeakMap,
    keyString: new Map
  }, templateCaches.set(cacheKey, templateCache));
  let template = templateCache.stringsArray.get(result.strings);
  if (void 0 !== template) return template;
  const key = result.strings.join(marker);
  if (template = templateCache.keyString.get(key), void 0 === template) {
    const element = result.getTemplateElement();
    compatibleShadyCSSVersion && window.ShadyCSS.prepareTemplateDom(element, scopeName), 
    template = new Template(result, element), templateCache.keyString.set(key, template);
  }
  return templateCache.stringsArray.set(result.strings, template), template;
}, TEMPLATE_TYPES = [ "html", "svg" ], shadyRenderSet = new Set, prepareTemplateStyles = (scopeName, renderedDOM, template) => {
  shadyRenderSet.add(scopeName);
  const templateElement = template ? template.element : document.createElement("template"), styles = renderedDOM.querySelectorAll("style"), {length: length} = styles;
  if (0 === length) return void window.ShadyCSS.prepareTemplateStyles(templateElement, scopeName);
  const condensedStyle = document.createElement("style");
  for (let i = 0; i < length; i++) {
    const style = styles[i];
    style.parentNode.removeChild(style), condensedStyle.textContent += style.textContent;
  }
  (scopeName => {
    TEMPLATE_TYPES.forEach((type => {
      const templates = templateCaches.get(getTemplateCacheKey(type, scopeName));
      void 0 !== templates && templates.keyString.forEach((template => {
        const {element: {content: content}} = template, styles = new Set;
        Array.from(content.querySelectorAll("style")).forEach((s => {
          styles.add(s);
        })), removeNodesFromTemplate(template, styles);
      }));
    }));
  })(scopeName);
  const content = templateElement.content;
  template ? function insertNodeIntoTemplate(template, node, refNode = null) {
    const {element: {content: content}, parts: parts} = template;
    if (null == refNode) return void content.appendChild(node);
    const walker = document.createTreeWalker(content, 133, null, !1);
    let partIndex = nextActiveIndexInTemplateParts(parts), insertCount = 0, walkerIndex = -1;
    for (;walker.nextNode(); ) for (walkerIndex++, walker.currentNode === refNode && (insertCount = countNodes(node), 
    refNode.parentNode.insertBefore(node, refNode)); -1 !== partIndex && parts[partIndex].index === walkerIndex; ) {
      if (insertCount > 0) {
        for (;-1 !== partIndex; ) parts[partIndex].index += insertCount, partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
        return;
      }
      partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
    }
  }(template, condensedStyle, content.firstChild) : content.insertBefore(condensedStyle, content.firstChild), 
  window.ShadyCSS.prepareTemplateStyles(templateElement, scopeName);
  const style = content.querySelector("style");
  if (window.ShadyCSS.nativeShadow && null !== style) renderedDOM.insertBefore(style.cloneNode(!0), renderedDOM.firstChild); else if (template) {
    content.insertBefore(condensedStyle, content.firstChild);
    const removes = new Set;
    removes.add(condensedStyle), removeNodesFromTemplate(template, removes);
  }
};

window.JSCompiler_renameProperty = (prop, _obj) => prop;

const defaultConverter = {
  toAttribute(value, type) {
    switch (type) {
     case Boolean:
      return value ? "" : null;

     case Object:
     case Array:
      return null == value ? value : JSON.stringify(value);
    }
    return value;
  },
  fromAttribute(value, type) {
    switch (type) {
     case Boolean:
      return null !== value;

     case Number:
      return null === value ? null : Number(value);

     case Object:
     case Array:
      return JSON.parse(value);
    }
    return value;
  }
}, notEqual = (value, old) => old !== value && (old == old || value == value), defaultPropertyDeclaration = {
  attribute: !0,
  type: String,
  converter: defaultConverter,
  reflect: !1,
  hasChanged: notEqual
};

class UpdatingElement extends HTMLElement {
  constructor() {
    super(), this.initialize();
  }
  static get observedAttributes() {
    this.finalize();
    const attributes = [];
    return this._classProperties.forEach(((v, p) => {
      const attr = this._attributeNameForProperty(p, v);
      void 0 !== attr && (this._attributeToPropertyMap.set(attr, p), attributes.push(attr));
    })), attributes;
  }
  static _ensureClassProperties() {
    if (!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties", this))) {
      this._classProperties = new Map;
      const superProperties = Object.getPrototypeOf(this)._classProperties;
      void 0 !== superProperties && superProperties.forEach(((v, k) => this._classProperties.set(k, v)));
    }
  }
  static createProperty(name, options = defaultPropertyDeclaration) {
    if (this._ensureClassProperties(), this._classProperties.set(name, options), options.noAccessor || this.prototype.hasOwnProperty(name)) return;
    const key = "symbol" == typeof name ? Symbol() : `__${name}`, descriptor = this.getPropertyDescriptor(name, key, options);
    void 0 !== descriptor && Object.defineProperty(this.prototype, name, descriptor);
  }
  static getPropertyDescriptor(name, key, options) {
    return {
      get() {
        return this[key];
      },
      set(value) {
        const oldValue = this[name];
        this[key] = value, this.requestUpdateInternal(name, oldValue, options);
      },
      configurable: !0,
      enumerable: !0
    };
  }
  static getPropertyOptions(name) {
    return this._classProperties && this._classProperties.get(name) || defaultPropertyDeclaration;
  }
  static finalize() {
    const superCtor = Object.getPrototypeOf(this);
    if (superCtor.hasOwnProperty("finalized") || superCtor.finalize(), this.finalized = !0, 
    this._ensureClassProperties(), this._attributeToPropertyMap = new Map, this.hasOwnProperty(JSCompiler_renameProperty("properties", this))) {
      const props = this.properties, propKeys = [ ...Object.getOwnPropertyNames(props), ..."function" == typeof Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(props) : [] ];
      for (const p of propKeys) this.createProperty(p, props[p]);
    }
  }
  static _attributeNameForProperty(name, options) {
    const attribute = options.attribute;
    return !1 === attribute ? void 0 : "string" == typeof attribute ? attribute : "string" == typeof name ? name.toLowerCase() : void 0;
  }
  static _valueHasChanged(value, old, hasChanged = notEqual) {
    return hasChanged(value, old);
  }
  static _propertyValueFromAttribute(value, options) {
    const type = options.type, converter = options.converter || defaultConverter, fromAttribute = "function" == typeof converter ? converter : converter.fromAttribute;
    return fromAttribute ? fromAttribute(value, type) : value;
  }
  static _propertyValueToAttribute(value, options) {
    if (void 0 === options.reflect) return;
    const type = options.type, converter = options.converter;
    return (converter && converter.toAttribute || defaultConverter.toAttribute)(value, type);
  }
  initialize() {
    this._updateState = 0, this._updatePromise = new Promise((res => this._enableUpdatingResolver = res)), 
    this._changedProperties = new Map, this._saveInstanceProperties(), this.requestUpdateInternal();
  }
  _saveInstanceProperties() {
    this.constructor._classProperties.forEach(((_v, p) => {
      if (this.hasOwnProperty(p)) {
        const value = this[p];
        delete this[p], this._instanceProperties || (this._instanceProperties = new Map), 
        this._instanceProperties.set(p, value);
      }
    }));
  }
  _applyInstanceProperties() {
    this._instanceProperties.forEach(((v, p) => this[p] = v)), this._instanceProperties = void 0;
  }
  connectedCallback() {
    this.enableUpdating();
  }
  enableUpdating() {
    void 0 !== this._enableUpdatingResolver && (this._enableUpdatingResolver(), this._enableUpdatingResolver = void 0);
  }
  disconnectedCallback() {}
  attributeChangedCallback(name, old, value) {
    old !== value && this._attributeToProperty(name, value);
  }
  _propertyToAttribute(name, value, options = defaultPropertyDeclaration) {
    const ctor = this.constructor, attr = ctor._attributeNameForProperty(name, options);
    if (void 0 !== attr) {
      const attrValue = ctor._propertyValueToAttribute(value, options);
      if (void 0 === attrValue) return;
      this._updateState = 8 | this._updateState, null == attrValue ? this.removeAttribute(attr) : this.setAttribute(attr, attrValue), 
      this._updateState = -9 & this._updateState;
    }
  }
  _attributeToProperty(name, value) {
    if (8 & this._updateState) return;
    const ctor = this.constructor, propName = ctor._attributeToPropertyMap.get(name);
    if (void 0 !== propName) {
      const options = ctor.getPropertyOptions(propName);
      this._updateState = 16 | this._updateState, this[propName] = ctor._propertyValueFromAttribute(value, options), 
      this._updateState = -17 & this._updateState;
    }
  }
  requestUpdateInternal(name, oldValue, options) {
    let shouldRequestUpdate = !0;
    if (void 0 !== name) {
      const ctor = this.constructor;
      options = options || ctor.getPropertyOptions(name), ctor._valueHasChanged(this[name], oldValue, options.hasChanged) ? (this._changedProperties.has(name) || this._changedProperties.set(name, oldValue), 
      !0 !== options.reflect || 16 & this._updateState || (void 0 === this._reflectingProperties && (this._reflectingProperties = new Map), 
      this._reflectingProperties.set(name, options))) : shouldRequestUpdate = !1;
    }
    !this._hasRequestedUpdate && shouldRequestUpdate && (this._updatePromise = this._enqueueUpdate());
  }
  requestUpdate(name, oldValue) {
    return this.requestUpdateInternal(name, oldValue), this.updateComplete;
  }
  async _enqueueUpdate() {
    this._updateState = 4 | this._updateState;
    try {
      await this._updatePromise;
    } catch (e) {}
    const result = this.performUpdate();
    return null != result && await result, !this._hasRequestedUpdate;
  }
  get _hasRequestedUpdate() {
    return 4 & this._updateState;
  }
  get hasUpdated() {
    return 1 & this._updateState;
  }
  performUpdate() {
    if (!this._hasRequestedUpdate) return;
    this._instanceProperties && this._applyInstanceProperties();
    let shouldUpdate = !1;
    const changedProperties = this._changedProperties;
    try {
      shouldUpdate = this.shouldUpdate(changedProperties), shouldUpdate ? this.update(changedProperties) : this._markUpdated();
    } catch (e) {
      throw shouldUpdate = !1, this._markUpdated(), e;
    }
    shouldUpdate && (1 & this._updateState || (this._updateState = 1 | this._updateState, 
    this.firstUpdated(changedProperties)), this.updated(changedProperties));
  }
  _markUpdated() {
    this._changedProperties = new Map, this._updateState = -5 & this._updateState;
  }
  get updateComplete() {
    return this._getUpdateComplete();
  }
  _getUpdateComplete() {
    return this._updatePromise;
  }
  shouldUpdate(_changedProperties) {
    return !0;
  }
  update(_changedProperties) {
    void 0 !== this._reflectingProperties && this._reflectingProperties.size > 0 && (this._reflectingProperties.forEach(((v, k) => this._propertyToAttribute(k, this[k], v))), 
    this._reflectingProperties = void 0), this._markUpdated();
  }
  updated(_changedProperties) {}
  firstUpdated(_changedProperties) {}
}

UpdatingElement.finalized = !0;

const supportsAdoptingStyleSheets = window.ShadowRoot && (void 0 === window.ShadyCSS || window.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, constructionToken = Symbol();

class CSSResult {
  constructor(cssText, safeToken) {
    if (safeToken !== constructionToken) throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = cssText;
  }
  get styleSheet() {
    return void 0 === this._styleSheet && (supportsAdoptingStyleSheets ? (this._styleSheet = new CSSStyleSheet, 
    this._styleSheet.replaceSync(this.cssText)) : this._styleSheet = null), this._styleSheet;
  }
  toString() {
    return this.cssText;
  }
}

const css = (strings, ...values) => {
  const cssText = values.reduce(((acc, v, idx) => acc + (value => {
    if (value instanceof CSSResult) return value.cssText;
    if ("number" == typeof value) return value;
    throw new Error(`Value passed to 'css' function must be a 'css' function result: ${value}. Use 'unsafeCSS' to pass non-literal values, but\n            take care to ensure page security.`);
  })(v) + strings[idx + 1]), strings[0]);
  return new CSSResult(cssText, constructionToken);
};

(window.litElementVersions || (window.litElementVersions = [])).push("2.4.0");

const renderNotImplemented = {};

class LitElement extends UpdatingElement {
  static getStyles() {
    return this.styles;
  }
  static _getUniqueStyles() {
    if (this.hasOwnProperty(JSCompiler_renameProperty("_styles", this))) return;
    const userStyles = this.getStyles();
    if (Array.isArray(userStyles)) {
      const addStyles = (styles, set) => styles.reduceRight(((set, s) => Array.isArray(s) ? addStyles(s, set) : (set.add(s), 
      set)), set), set = addStyles(userStyles, new Set), styles = [];
      set.forEach((v => styles.unshift(v))), this._styles = styles;
    } else this._styles = void 0 === userStyles ? [] : [ userStyles ];
    this._styles = this._styles.map((s => {
      if (s instanceof CSSStyleSheet && !supportsAdoptingStyleSheets) {
        const cssText = Array.prototype.slice.call(s.cssRules).reduce(((css, rule) => css + rule.cssText), "");
        return new CSSResult(String(cssText), constructionToken);
      }
      return s;
    }));
  }
  initialize() {
    super.initialize(), this.constructor._getUniqueStyles(), this.renderRoot = this.createRenderRoot(), 
    window.ShadowRoot && this.renderRoot instanceof window.ShadowRoot && this.adoptStyles();
  }
  createRenderRoot() {
    return this.attachShadow({
      mode: "open"
    });
  }
  adoptStyles() {
    const styles = this.constructor._styles;
    0 !== styles.length && (void 0 === window.ShadyCSS || window.ShadyCSS.nativeShadow ? supportsAdoptingStyleSheets ? this.renderRoot.adoptedStyleSheets = styles.map((s => s instanceof CSSStyleSheet ? s : s.styleSheet)) : this._needsShimAdoptedStyleSheets = !0 : window.ShadyCSS.ScopingShim.prepareAdoptedCssText(styles.map((s => s.cssText)), this.localName));
  }
  connectedCallback() {
    super.connectedCallback(), this.hasUpdated && void 0 !== window.ShadyCSS && window.ShadyCSS.styleElement(this);
  }
  update(changedProperties) {
    const templateResult = this.render();
    super.update(changedProperties), templateResult !== renderNotImplemented && this.constructor.render(templateResult, this.renderRoot, {
      scopeName: this.localName,
      eventContext: this
    }), this._needsShimAdoptedStyleSheets && (this._needsShimAdoptedStyleSheets = !1, 
    this.constructor._styles.forEach((s => {
      const style = document.createElement("style");
      style.textContent = s.cssText, this.renderRoot.appendChild(style);
    })));
  }
  render() {
    return renderNotImplemented;
  }
}

LitElement.finalized = !0, LitElement.render = (result, container, options) => {
  if (!options || "object" != typeof options || !options.scopeName) throw new Error("The `scopeName` option is required.");
  const scopeName = options.scopeName, hasRendered = parts.has(container), needsScoping = compatibleShadyCSSVersion && 11 === container.nodeType && !!container.host, firstScopeRender = needsScoping && !shadyRenderSet.has(scopeName), renderContainer = firstScopeRender ? document.createDocumentFragment() : container;
  if (((result, container, options) => {
    let part = parts.get(container);
    void 0 === part && (removeNodes(container, container.firstChild), parts.set(container, part = new NodePart(Object.assign({
      templateFactory: templateFactory
    }, options))), part.appendInto(container)), part.setValue(result), part.commit();
  })(result, renderContainer, Object.assign({
    templateFactory: shadyTemplateFactory(scopeName)
  }, options)), firstScopeRender) {
    const part = parts.get(renderContainer);
    parts.delete(renderContainer);
    const template = part.value instanceof TemplateInstance ? part.value.template : void 0;
    prepareTemplateStyles(scopeName, renderContainer, template), removeNodes(container, container.firstChild), 
    container.appendChild(renderContainer), parts.set(container, part);
  }
  !hasRendered && needsScoping && window.ShadyCSS.styleElement(container.host);
};

const DEFAULT_CONFIG = {
  image_url: "",
  display_time: 15,
  crossfade_time: 3,
  image_fit: "contain",
  image_list_update_interval: 3600,
  image_order: "sorted",
  show_debug: !1,
  sensor_update_delay: 500,
  device_name: "mobile_app_liam_s_room_display",
  show_date: !0,
  show_time: !0,
  show_weather: !0,
  show_aqi: !0,
  weather_entity: "weather.forecast_home",
  aqi_entity: "sensor.air_quality_index",
  light_sensor_entity: "sensor.liam_room_display_light_sensor",
  brightness_sensor_entity: "sensor.liam_room_display_brightness_sensor"
}, IMAGE_SOURCE_TYPES_MEDIA_SOURCE = "media-source", IMAGE_SOURCE_TYPES_UNSPLASH_API = "unsplash-api", IMAGE_SOURCE_TYPES_IMMICH_API = "immich-api", IMAGE_SOURCE_TYPES_PICSUM = "picsum", IMAGE_SOURCE_TYPES_URL = "url", sharedStyles = css$1`
  :host {
    --crossfade-time: 3s;
    --overlay-height: 120px;
    --theme-transition: background-color 0.3s ease, color 0.3s ease;
    --theme-background: #ffffff;
    --theme-text: #333333;
    --overlay-background: rgba(255, 255, 255, 0.95);
    --control-text-color: #333;
    --brightness-dot-color: #d1d1d1;
    --brightness-dot-active: #333;
    --background-blur: 10px;

    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
    font-family: 'Product Sans Regular', sans-serif;
    font-weight: 400;
    transition: var(--theme-transition);
  }

  html[data-theme='dark'],
  :host([data-theme='dark']) {
    --theme-background: #121212;
    --theme-text: #ffffff;
    --overlay-background: rgba(32, 33, 36, 0.95);
    --control-text-color: #fff;
    --brightness-dot-color: #5f6368;
    --brightness-dot-active: #fff;
  }

  .error {
    position: fixed;
    bottom: 10px;
    left: 10px;
    background-color: rgba(255, 0, 0, 0.7);
    color: white;
    padding: 10px 15px;
    border-radius: 5px;
    font-size: 14px;
    z-index: 1000;
    max-width: 90%;
    word-wrap: break-word;
  }
`;

customElements.define("background-rotator", class BackgroundRotator extends LitElement$1 {
  static get properties() {
    return {
      hass: {
        type: Object
      },
      config: {
        type: Object
      },
      screenWidth: {
        type: Number
      },
      screenHeight: {
        type: Number
      },
      currentImageIndex: {
        type: Number
      },
      imageList: {
        type: Array
      },
      imageA: {
        type: String
      },
      imageB: {
        type: String
      },
      activeImage: {
        type: String
      },
      isTransitioning: {
        type: Boolean
      },
      error: {
        type: String
      }
    };
  }
  static get styles() {
    return [ sharedStyles, css$1`
        .background-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: black;
        }

        .background-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: contain;
          background-position: center;
          background-repeat: no-repeat;
          transition: opacity var(--crossfade-time) ease-in-out;
        }
      ` ];
  }
  constructor() {
    super(), this.currentImageIndex = -1, this.imageList = [], this.imageA = "", this.imageB = "", 
    this.activeImage = "A", this.preloadedImage = "", this.isTransitioning = !1, this.error = null;
  }
  connectedCallback() {
    super.connectedCallback(), this.updateImageList().then((() => {
      this.startImageRotation();
    }));
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.imageUpdateInterval && clearInterval(this.imageUpdateInterval), 
    this.imageListUpdateInterval && clearInterval(this.imageListUpdateInterval);
  }
  startImageRotation() {
    setTimeout((() => this.updateImage()), 500), this.imageUpdateInterval = setInterval((() => {
      this.updateImage();
    }), 1e3 * Math.max(5, this.config?.display_time || 15)), this.imageListUpdateInterval = setInterval((() => {
      this.updateImageList();
    }), 1e3 * Math.max(60, this.config?.image_list_update_interval || 3600));
  }
  getImageSourceType() {
    if (!this.config?.image_url) return IMAGE_SOURCE_TYPES_URL;
    const {image_url: image_url} = this.config;
    return image_url.startsWith("media-source://") ? IMAGE_SOURCE_TYPES_MEDIA_SOURCE : image_url.startsWith("https://api.unsplash") ? IMAGE_SOURCE_TYPES_UNSPLASH_API : image_url.startsWith("immich+") ? IMAGE_SOURCE_TYPES_IMMICH_API : image_url.includes("picsum.photos") ? IMAGE_SOURCE_TYPES_PICSUM : IMAGE_SOURCE_TYPES_URL;
  }
  getImageUrl() {
    if (!this.config?.image_url) return "";
    const timestamp_ms = Date.now(), timestamp = Math.floor(timestamp_ms / 1e3), width = this.screenWidth || 1280, height = this.screenHeight || 720;
    return this.config.image_url.replace(/\${width}/g, width).replace(/\${height}/g, height).replace(/\${timestamp_ms}/g, timestamp_ms).replace(/\${timestamp}/g, timestamp);
  }
  async updateImageList() {
    if (!this.screenWidth || !this.screenHeight) return this.error = "Screen dimensions not set", 
    void this.requestUpdate();
    try {
      const newImageList = await this.fetchImageList();
      if (!Array.isArray(newImageList) || 0 === newImageList.length) throw new Error("No valid images found");
      if (this.imageList = "random" === this.config?.image_order ? this.shuffleArray([ ...newImageList ]) : [ ...newImageList ].sort(), 
      -1 === this.currentImageIndex && this.imageList.length > 0) try {
        this.imageA = await this.preloadImage(this.imageList[0]), this.currentImageIndex = 0, 
        this.error = null;
      } catch (error) {
        this.error = `Error loading initial image: ${error.message}`;
      }
      return this.requestUpdate(), this.imageList;
    } catch (error) {
      return this.error = `Error updating image list: ${error.message}`, this.requestUpdate(), 
      [];
    }
  }
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [ array[j], array[i] ];
    }
    return array;
  }
  async fetchImageList() {
    switch (this.getImageSourceType()) {
     case IMAGE_SOURCE_TYPES_MEDIA_SOURCE:
      return this.getImagesFromMediaSource();

     case IMAGE_SOURCE_TYPES_UNSPLASH_API:
      return this.getImagesFromUnsplashAPI();

     case IMAGE_SOURCE_TYPES_IMMICH_API:
      return this.getImagesFromImmichAPI();

     case IMAGE_SOURCE_TYPES_PICSUM:
      return Array.from({
        length: 10
      }, (() => this.getImageUrl()));

     default:
      {
        const url = this.getImageUrl();
        return url ? [ url ] : [];
      }
    }
  }
  async getImagesFromMediaSource() {
    if (!this.hass) return [ this.getImageUrl() ];
    try {
      const mediaContentId = this.config.image_url.replace(/^media-source:\/\//, ""), result = await this.hass.callWS({
        type: "media_source/browse_media",
        media_content_id: mediaContentId
      });
      if (!result || !Array.isArray(result.children)) throw new Error("Invalid response from media source");
      return result.children.filter((child => "image" === child.media_class)).map((child => child.media_content_id));
    } catch (error) {
      console.error("Error fetching images from media source:", error);
      const fallback = this.getImageUrl();
      return fallback ? [ fallback ] : [];
    }
  }
  async getImagesFromUnsplashAPI() {
    try {
      const response = await fetch(`${this.config.image_url}&count=30`);
      if (!response.ok) throw new Error(`Unsplash API returned status ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid response from Unsplash API");
      return data.map((image => image.urls.regular));
    } catch (error) {
      console.error("Error fetching images from Unsplash API:", error);
      const fallback = this.getImageUrl();
      return fallback ? [ fallback ] : [];
    }
  }
  async getImagesFromImmichAPI() {
    try {
      if (!this.config.immich_api_key) throw new Error("Immich API key not configured");
      const apiUrl = this.config.image_url.replace(/^immich\+/, ""), response = await fetch(`${apiUrl}/albums`, {
        headers: {
          "x-api-key": this.config.immich_api_key
        }
      });
      if (!response.ok) throw new Error(`Immich API returned status ${response.status}`);
      const albums = await response.json();
      if (!Array.isArray(albums)) throw new Error("Invalid response from Immich API");
      const imagePromises = albums.map((async album => {
        const albumResponse = await fetch(`${apiUrl}/albums/${album.id}`, {
          headers: {
            "x-api-key": this.config.immich_api_key
          }
        });
        if (!albumResponse.ok) throw new Error(`Immich API album fetch returned status ${albumResponse.status}`);
        const albumData = await albumResponse.json();
        return albumData && Array.isArray(albumData.assets) ? albumData.assets.filter((asset => "IMAGE" === asset.type)).map((asset => `${apiUrl}/assets/${asset.id}/original`)) : [];
      }));
      return (await Promise.all(imagePromises)).flat();
    } catch (error) {
      console.error("Error fetching images from Immich API:", error);
      const fallback = this.getImageUrl();
      return fallback ? [ fallback ] : [];
    }
  }
  async preloadImage(url) {
    if (!url) throw new Error("Invalid image URL");
    return new Promise(((resolve, reject) => {
      const img = new Image, timeout = setTimeout((() => {
        reject(new Error(`Image load timeout: ${url}`));
      }), 3e4);
      img.onload = () => {
        clearTimeout(timeout), resolve(url);
      }, img.onerror = () => {
        clearTimeout(timeout), reject(new Error(`Failed to load image: ${url}`));
      }, img.src = url;
    }));
  }
  async updateImage() {
    if (!this.isTransitioning && 0 !== this.imageList.length) try {
      const nextImageIndex = (this.currentImageIndex + 1) % this.imageList.length;
      let nextImage;
      nextImage = this.getImageSourceType() === IMAGE_SOURCE_TYPES_PICSUM ? this.getImageUrl() : this.imageList[nextImageIndex], 
      nextImage = await this.preloadImage(nextImage), this.currentImageIndex = nextImageIndex, 
      this.isTransitioning = !0, "A" === this.activeImage ? this.imageB = nextImage : this.imageA = nextImage, 
      this.requestUpdate(), await new Promise((resolve => setTimeout(resolve, 50))), this.activeImage = "A" === this.activeImage ? "B" : "A", 
      this.requestUpdate();
      const transitionTime = 1e3 * (this.config?.crossfade_time || 3) + 50;
      await new Promise((resolve => setTimeout(resolve, transitionTime))), this.isTransitioning = !1;
    } catch (error) {
      console.error("Error updating image:", error), this.isTransitioning = !1;
    }
  }
  render() {
    const imageAOpacity = "A" === this.activeImage ? 1 : 0, imageBOpacity = "B" === this.activeImage ? 1 : 0, imageFit = this.config?.image_fit || "contain";
    return html$1`
      <div class="background-container">
        <div
          class="background-image"
          style="background-image: url('${this.imageA}'); 
                 opacity: ${imageAOpacity};
                 background-size: ${imageFit};"
        ></div>
        <div
          class="background-image"
          style="background-image: url('${this.imageB}'); 
                 opacity: ${imageBOpacity};
                 background-size: ${imageFit};"
        ></div>
      </div>
      ${this.error ? html$1`<div class="error">${this.error}</div>` : ""}
    `;
  }
});

customElements.define("google-controls", class Controls extends LitElement$1 {
  static get properties() {
    return {
      hass: {
        type: Object
      },
      config: {
        type: Object
      },
      showOverlay: {
        type: Boolean
      },
      isOverlayVisible: {
        type: Boolean
      },
      isOverlayTransitioning: {
        type: Boolean
      },
      showBrightnessCard: {
        type: Boolean
      },
      isBrightnessCardVisible: {
        type: Boolean
      },
      isBrightnessCardTransitioning: {
        type: Boolean
      },
      brightness: {
        type: Number
      },
      visualBrightness: {
        type: Number
      },
      isAdjustingBrightness: {
        type: Boolean
      },
      isDraggingBrightness: {
        type: Boolean
      }
    };
  }
  static get styles() {
    return [ sharedStyles, css$1`
        .controls-container {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          pointer-events: none;
          z-index: 1000;
          touch-action: none;
        }

        .overlay {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: var(--overlay-height);
          background-color: var(--overlay-background);
          -webkit-backdrop-filter: blur(var(--background-blur));
          backdrop-filter: blur(var(--background-blur));
          color: var(--control-text-color);
          box-sizing: border-box;
          transform: translateY(calc(100% + 20px));
          opacity: 0;
          transition: none;
          z-index: 1001;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
          pointer-events: auto;
          touch-action: none;
          will-change: transform, opacity;
        }

        .overlay.transitioning {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
            opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .overlay.show {
          transform: translateY(0);
          opacity: 1;
        }

        .icon-container {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          pointer-events: auto;
        }

        .icon-row {
          display: flex;
          justify-content: space-evenly; /* Ensures icons are spaced evenly */
          align-items: center;
          width: 95%;
          pointer-events: auto;
        }

        .icon-button {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--control-text-color);
          padding: 10px;
          border-radius: 50%;
          transition: background-color 0.2s ease, transform 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
          touch-action: none;
          width: 60px;
          height: 60px;
          outline: none;
          -webkit-tap-highlight-color: transparent;
        }

        .icon-button:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }

        .icon-button:active {
          background-color: rgba(0, 0, 0, 0.2);
          transform: scale(0.95);
        }

        .brightness-card {
          position: fixed;
          bottom: 20px;
          left: 20px;
          right: 20px;
          height: 70px;
          background-color: var(--overlay-background);
          -webkit-backdrop-filter: blur(var(--background-blur));
          backdrop-filter: blur(var(--background-blur));
          color: var(--control-text-color);
          border-radius: 20px;
          padding: 40px 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          z-index: 1002;
          transform: translateY(calc(100% + 20px));
          opacity: 0;
          transition: none;
          pointer-events: auto;
          touch-action: none;
          will-change: transform, opacity;
        }

        .brightness-card.transitioning {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
            opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .brightness-card.show {
          transform: translateY(0);
          opacity: 1;
        }

        .brightness-control {
          display: flex;
          align-items: center;
          width: 100%;
          pointer-events: auto;
          height: 100%;
        }

        .brightness-dots-container {
          flex-grow: 1;
          margin-right: 10px;
          padding: 0 10px;
          pointer-events: auto;
        }

        .brightness-dots {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 30px;
          pointer-events: auto;
          touch-action: none;
          padding: 10px 0;
        }

        .brightness-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: var(--brightness-dot-color);
          transition: background-color 0.2s ease, transform 0.2s ease;
          cursor: pointer;
          pointer-events: auto;
        }

        .brightness-dot:hover {
          transform: scale(1.2);
        }

        .brightness-dot.active {
          background-color: var(--brightness-dot-active);
        }

        .brightness-value {
          min-width: 60px;
          text-align: right;
          font-size: 40px;
          color: var(--control-text-color);
          font-weight: 300;
          margin-right: 20px;
          pointer-events: none;
          font-family: 'Rubik', sans-serif;
        }

        iconify-icon {
          font-size: 50px;
          width: 50px;
          height: 50px;
          display: block;
          color: var(--control-text-color);
          pointer-events: none;
        }

        /* iOS specific adjustments */
        @supports (-webkit-touch-callout: none) {
          .controls-container {
            padding-bottom: env(safe-area-inset-bottom, 0);
          }

          .overlay {
            padding-bottom: env(safe-area-inset-bottom, 0);
            height: calc(var(--overlay-height) + env(safe-area-inset-bottom, 0));
          }

          .brightness-card {
            padding-bottom: calc(40px + env(safe-area-inset-bottom, 0));
            margin-bottom: env(safe-area-inset-bottom, 0);
          }
        }

        /* PWA standalone mode adjustments */
        @media (display-mode: standalone) {
          .controls-container {
            padding-bottom: env(safe-area-inset-bottom, 0);
          }

          .overlay {
            padding-bottom: env(safe-area-inset-bottom, 0);
            height: calc(var(--overlay-height) + env(safe-area-inset-bottom, 0));
          }

          .brightness-card {
            padding-bottom: calc(40px + env(safe-area-inset-bottom, 0));
            margin-bottom: env(safe-area-inset-bottom, 0);
          }
        }
      ` ];
  }
  constructor() {
    super(), this.showOverlay = !1, this.isOverlayVisible = !1, this.isOverlayTransitioning = !1, 
    this.showBrightnessCard = !1, this.isBrightnessCardVisible = !1, this.isBrightnessCardTransitioning = !1, 
    this.brightness = 128, this.visualBrightness = 128, this.isAdjustingBrightness = !1, 
    this.longPressTimer = null, this.isDraggingBrightness = !1, this.handleBrightnessChange = this.handleBrightnessChange.bind(this), 
    this.handleBrightnessDragStart = this.handleBrightnessDragStart.bind(this), this.handleBrightnessDrag = this.handleBrightnessDrag.bind(this), 
    this.handleBrightnessDragEnd = this.handleBrightnessDragEnd.bind(this), this.handleSettingsIconTouchStart = this.handleSettingsIconTouchStart.bind(this), 
    this.handleSettingsIconTouchEnd = this.handleSettingsIconTouchEnd.bind(this);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.longPressTimer && clearTimeout(this.longPressTimer), 
    this.removeBrightnessDragListeners();
  }
  updated(changedProperties) {
    changedProperties.has("brightness") && !this.isAdjustingBrightness && (this.visualBrightness = this.brightness);
  }
  handleBrightnessChange(e) {
    e.stopPropagation();
    const clickedDot = e.target.closest(".brightness-dot");
    if (!clickedDot) return;
    const newBrightness = parseInt(clickedDot.dataset.value);
    this.updateBrightnessValue(25.5 * newBrightness);
  }
  handleBrightnessDragStart(e) {
    e.stopPropagation(), this.isDraggingBrightness = !0, document.addEventListener("mousemove", this.handleBrightnessDrag), 
    document.addEventListener("mouseup", this.handleBrightnessDragEnd), document.addEventListener("touchmove", this.handleBrightnessDrag, {
      passive: !1
    }), document.addEventListener("touchend", this.handleBrightnessDragEnd), this.handleBrightnessDrag(e);
  }
  handleBrightnessDrag(e) {
    if (e.preventDefault(), e.stopPropagation(), !this.isDraggingBrightness) return;
    const container = this.shadowRoot.querySelector(".brightness-dots");
    if (!container) return;
    const rect = container.getBoundingClientRect(), clientX = e.type.includes("touch") ? e.touches[0]?.clientX || e.changedTouches[0]?.clientX : e.clientX;
    if (void 0 === clientX) return;
    const relativeX = Math.max(0, Math.min(clientX - rect.left, rect.width)), newValue = Math.round(relativeX / rect.width * 10), cappedValue = Math.max(1, Math.min(10, newValue));
    this.updateBrightnessValue(25.5 * cappedValue);
  }
  handleBrightnessDragEnd(e) {
    e && (e.preventDefault(), e.stopPropagation()), this.isDraggingBrightness = !1, 
    this.removeBrightnessDragListeners();
  }
  removeBrightnessDragListeners() {
    document.removeEventListener("mousemove", this.handleBrightnessDrag), document.removeEventListener("mouseup", this.handleBrightnessDragEnd), 
    document.removeEventListener("touchmove", this.handleBrightnessDrag), document.removeEventListener("touchend", this.handleBrightnessDragEnd);
  }
  updateBrightnessValue(value) {
    this.visualBrightness = value, this.dispatchEvent(new CustomEvent("brightnessChange", {
      detail: Math.max(1, Math.min(255, Math.round(value))),
      bubbles: !0,
      composed: !0
    }));
  }
  getBrightnessDisplayValue() {
    return Math.round(this.visualBrightness / 25.5);
  }
  toggleBrightnessCard(e) {
    e && e.stopPropagation(), this.dispatchEvent(new CustomEvent("brightnessCardToggle", {
      detail: !this.showBrightnessCard,
      bubbles: !0,
      composed: !0
    }));
  }
  handleSettingsIconTouchStart(e) {
    e.stopPropagation(), this.longPressTimer && clearTimeout(this.longPressTimer), this.longPressTimer = setTimeout((() => {
      this.dispatchEvent(new CustomEvent("debugToggle", {
        bubbles: !0,
        composed: !0
      })), this.longPressTimer = null;
    }), 1e3);
  }
  handleSettingsIconTouchEnd(e) {
    e.stopPropagation(), this.longPressTimer && (clearTimeout(this.longPressTimer), 
    this.longPressTimer = null);
  }
  handleOverlayToggle(shouldShow) {
    this.dispatchEvent(new CustomEvent("overlayToggle", {
      detail: shouldShow,
      bubbles: !0,
      composed: !0
    }));
  }
  renderBrightnessCard() {
    const brightnessDisplayValue = this.getBrightnessDisplayValue();
    return html$1`
      <div
        class="brightness-card ${this.isBrightnessCardVisible ? "show" : ""} ${this.isBrightnessCardTransitioning ? "transitioning" : ""}"
        @click="${e => e.stopPropagation()}"
      >
        <div class="brightness-control">
          <div class="brightness-dots-container">
            <div
              class="brightness-dots"
              @click="${this.handleBrightnessChange}"
              @mousedown="${this.handleBrightnessDragStart}"
              @touchstart="${this.handleBrightnessDragStart}"
            >
              ${[ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ].map((value => html$1`
                  <div
                    class="brightness-dot ${value <= brightnessDisplayValue ? "active" : ""}"
                    data-value="${value}"
                  ></div>
                `))}
            </div>
          </div>
          <span class="brightness-value">${brightnessDisplayValue}</span>
        </div>
      </div>
    `;
  }
  renderOverlay() {
    return html$1`
      <div
        class="overlay ${this.isOverlayVisible ? "show" : ""} ${this.isOverlayTransitioning ? "transitioning" : ""}"
        @click="${e => e.stopPropagation()}"
      >
        <div class="icon-container">
          <div class="icon-row">
            <button class="icon-button" @click="${e => this.toggleBrightnessCard(e)}">
              <iconify-icon icon="material-symbols-light:sunny-outline-rounded"></iconify-icon>
            </button>
            <button class="icon-button">
              <iconify-icon icon="material-symbols-light:volume-up-outline-rounded"></iconify-icon>
            </button>
            <button class="icon-button">
              <iconify-icon
                icon="material-symbols-light:do-not-disturb-on-outline-rounded"
              ></iconify-icon>
            </button>
            <button class="icon-button">
              <iconify-icon icon="material-symbols-light:alarm-add-outline-rounded"></iconify-icon>
            </button>
            <button
              class="icon-button"
              @touchstart="${this.handleSettingsIconTouchStart}"
              @touchend="${this.handleSettingsIconTouchEnd}"
              @touchcancel="${this.handleSettingsIconTouchEnd}"
              @mousedown="${this.handleSettingsIconTouchStart}"
              @mouseup="${this.handleSettingsIconTouchEnd}"
              @mouseleave="${this.handleSettingsIconTouchEnd}"
            >
              <iconify-icon icon="material-symbols-light:settings-outline-rounded"></iconify-icon>
            </button>
          </div>
        </div>
      </div>
    `;
  }
  render() {
    return html$1`
      <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
      <div class="controls-container" @touchstart="${e => e.stopPropagation()}">
        ${this.showOverlay ? this.renderOverlay() : ""}
        ${this.showBrightnessCard ? this.renderBrightnessCard() : ""}
      </div>
    `;
  }
});

customElements.define("night-mode", class NightMode extends LitElement$1 {
  static get properties() {
    return {
      hass: {
        type: Object
      },
      config: {
        type: Object
      },
      currentTime: {
        type: String
      },
      brightness: {
        type: Number
      },
      isInNightMode: {
        type: Boolean
      },
      previousBrightness: {
        type: Number
      },
      isTransitioning: {
        type: Boolean
      },
      error: {
        type: String
      },
      nightModeSource: {
        type: String
      }
    };
  }
  static get styles() {
    return [ sharedStyles, css$1`
        .night-mode {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: black;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 5;
          cursor: pointer;
        }

        .night-time {
          color: white;
          font-size: 35vw;
          font-weight: 400;
          font-family: 'Product Sans Regular', sans-serif;
        }

        .tap-hint {
          position: fixed;
          bottom: 40px;
          left: 0;
          right: 0;
          color: rgba(255, 255, 255, 0.6);
          font-size: 16px;
          text-align: center;
          font-family: 'Rubik', sans-serif;
          font-weight: 300;
          animation: pulse 3s infinite;
        }

        @keyframes pulse {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            opacity: 0.3;
          }
        }
      ` ];
  }
  constructor() {
    super(), this.currentTime = "", this.brightness = 1, this.isInNightMode = !1, this.previousBrightness = 1, 
    this.isTransitioning = !1, this.error = null, this.nightModeSource = null, this.timeUpdateInterval = null, 
    this.sensorCheckInterval = null, this.sensorCheckedTime = 0;
  }
  connectedCallback() {
    super.connectedCallback(), this.updateTime(), this.startTimeUpdates(), this.isInNightMode && this.enterNightMode(), 
    this.sensorCheckInterval = setInterval((() => {
      this.checkLightSensor();
    }), 3e4);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.timeUpdateInterval && clearInterval(this.timeUpdateInterval), 
    this.sensorCheckInterval && clearInterval(this.sensorCheckInterval);
  }
  startTimeUpdates() {
    this.timeUpdateInterval = setInterval((() => {
      this.updateTime();
    }), 1e3);
  }
  updateTime() {
    const now = new Date;
    this.currentTime = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: !0
    }).replace(/\s?[AP]M/, "");
  }
  async enterNightMode() {
    if (!this.isInNightMode || this.isTransitioning) {
      this.isTransitioning = !0;
      try {
        this.brightness > 1 && (this.previousBrightness = this.brightness), await this.toggleAutoBrightness(!1), 
        await new Promise((resolve => setTimeout(resolve, 100))), await this.setBrightness(1), 
        await new Promise((resolve => setTimeout(resolve, 100))), await this.toggleAutoBrightness(!0), 
        this.isInNightMode = !0, this.error = null;
      } catch (error) {
        this.error = `Error entering night mode: ${error.message}`;
      } finally {
        this.isTransitioning = !1, this.requestUpdate();
      }
    }
  }
  async exitNightMode() {
    if (this.isInNightMode && !this.isTransitioning) {
      this.isTransitioning = !0;
      try {
        await this.toggleAutoBrightness(!1), await new Promise((resolve => setTimeout(resolve, 100)));
        const targetBrightness = this.previousBrightness && this.previousBrightness > 1 ? this.previousBrightness : 128;
        await this.setBrightness(targetBrightness), this.isInNightMode = !1, this.error = null, 
        this.dispatchEvent(new CustomEvent("nightModeExit", {
          bubbles: !0,
          composed: !0
        }));
      } catch (error) {
        this.error = `Error exiting night mode: ${error.message}`;
      } finally {
        this.isTransitioning = !1, this.requestUpdate();
      }
    }
  }
  async setBrightness(value) {
    if (!this.hass || !this.config) return;
    const brightness = Math.max(1, Math.min(255, Math.round(value))), deviceName = this.config.device_name || "mobile_app_liam_s_room_display";
    await this.hass.callService("notify", deviceName, {
      message: "command_screen_brightness_level",
      data: {
        command: brightness
      }
    }), await this.hass.callService("notify", deviceName, {
      message: "command_update_sensors"
    }), await new Promise((resolve => setTimeout(resolve, this.config.sensor_update_delay || 500))), 
    this.brightness = brightness, this.requestUpdate();
  }
  async toggleAutoBrightness(enabled) {
    if (!this.hass || !this.config) return;
    const deviceName = this.config.device_name || "mobile_app_liam_s_room_display";
    await this.hass.callService("notify", deviceName, {
      message: "command_auto_screen_brightness",
      data: {
        command: enabled ? "turn_on" : "turn_off"
      }
    });
  }
  updated(changedProperties) {
    if (changedProperties.has("hass") && this.hass) {
      Date.now() - this.sensorCheckedTime > 5e3 && this.checkLightSensor();
    }
  }
  checkLightSensor() {
    if (!this.hass || !this.config) return;
    this.sensorCheckedTime = Date.now();
    const lightSensorEntity = this.config.light_sensor_entity || "sensor.liam_room_display_light_sensor", lightSensor = this.hass.states[lightSensorEntity];
    if (lightSensor && "unavailable" !== lightSensor.state && "unknown" !== lightSensor.state) try {
      const shouldBeInNightMode = 0 === parseInt(lightSensor.state);
      if (this.isInNightMode && "manual" === this.nightModeSource) return;
      shouldBeInNightMode && !this.isInNightMode ? (this.enterNightMode(), this.nightModeSource = "sensor") : !shouldBeInNightMode && this.isInNightMode && "sensor" === this.nightModeSource && (this.exitNightMode(), 
      this.nightModeSource = null);
    } catch (error) {}
  }
  render() {
    return html$1`
      <div class="night-mode" @click="${this.handleNightModeTap}">
        <div class="night-time">${this.currentTime}</div>
        ${this.error ? html$1`<div class="error">${this.error}</div>` : ""}
        ${"manual" === this.nightModeSource ? html$1` <div class="tap-hint">Tap anywhere to exit night mode</div> ` : ""}
      </div>
    `;
  }
  handleNightModeTap() {
    this.isInNightMode && "manual" === this.nightModeSource && (this.exitNightMode(), 
    this.dispatchEvent(new CustomEvent("nightModeExit", {
      bubbles: !0,
      composed: !0
    })));
  }
});

customElements.define("weather-clock", class WeatherClock extends LitElement$1 {
  static get properties() {
    return {
      hass: {
        type: Object
      },
      config: {
        type: Object
      },
      date: {
        type: String
      },
      time: {
        type: String
      },
      temperature: {
        type: String
      },
      weatherIcon: {
        type: String
      },
      aqi: {
        type: String
      },
      weatherEntity: {
        type: String
      },
      aqiEntity: {
        type: String
      },
      error: {
        type: String
      }
    };
  }
  static get styles() {
    return [ sharedStyles, css$1`
        .weather-component {
          position: fixed;
          bottom: 30px;
          left: 40px;
          display: flex;
          justify-content: start;
          align-items: center;
          color: white;
          font-family: 'Product Sans Regular', sans-serif;
          width: 100%;
          max-width: 400px;
        }

        .left-column {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .right-column {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          margin-left: auto;
          margin-right: 40px;
        }

        .date {
          font-size: 25px;
          margin-bottom: 5px;
          font-weight: 400;
          margin-left: 20px; /* Added left padding */
          text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
        }

        .time {
          font-size: 90px;
          line-height: 1;
          font-weight: 500;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        .weather-info {
          display: flex;
          align-items: center;
          margin-top: 10px;
          font-weight: 500;
          margin-right: 40px;
        }

        .weather-icon {
          width: 50px;
          height: 50px;
        }

        .temperature {
          font-size: 35px;
          font-weight: 500;
          text-shadow: 0 2px 3px rgba(0, 0, 0, 0.5);
          padding-top: 2px;
        }

        .aqi {
          font-size: 20px;
          padding: 7px 15px 5px 15px;
          border-radius: 6px;
          font-weight: 500;
          margin-left: 30px;
          align-self: flex-end;
          min-width: 60px;
          text-align: center;
        }
      ` ];
  }
  constructor() {
    super(), this.date = "", this.time = "", this.temperature = "--°", this.weatherIcon = "not-available", 
    this.aqi = "--", this.weatherEntity = "", this.aqiEntity = "", this.error = null, 
    this.updateTimer = null;
  }
  connectedCallback() {
    super.connectedCallback(), this.updateWeather(), this.scheduleNextMinuteUpdate();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.updateTimer && clearTimeout(this.updateTimer);
  }
  scheduleNextMinuteUpdate() {
    const now = new Date, delay = 1e3 * (60 - now.getSeconds()) + (1e3 - now.getMilliseconds());
    this.updateTimer = setTimeout((() => {
      this.updateWeather(), this.scheduleNextMinuteUpdate();
    }), delay);
  }
  updateWeather() {
    const now = new Date;
    this.updateDateTime(now), this.updateWeatherData(), this.requestUpdate();
  }
  updateDateTime(now) {
    this.date = now.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    }), this.time = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: !0
    }).replace(/\s?[AP]M/, "");
  }
  updated(changedProperties) {
    changedProperties.has("hass") && this.hass && this.updateWeatherData(), changedProperties.has("config") && this.config && (this.weatherEntity = this.config.weather_entity || "weather.forecast_home", 
    this.aqiEntity = this.config.aqi_entity || "sensor.air_quality_index");
  }
  updateWeatherData() {
    if (this.hass) try {
      if (this.weatherEntity && this.hass.states[this.weatherEntity]) {
        const weatherEntity = this.hass.states[this.weatherEntity];
        weatherEntity && weatherEntity.attributes && void 0 !== weatherEntity.attributes.temperature ? (this.temperature = `${Math.round(weatherEntity.attributes.temperature)}°`, 
        this.weatherIcon = this.getWeatherIcon(weatherEntity.state)) : (this.temperature = "--°", 
        this.weatherIcon = "not-available");
      } else this.temperature = "--°", this.weatherIcon = "not-available";
      if (this.aqiEntity && this.hass.states[this.aqiEntity]) {
        const aqiEntity = this.hass.states[this.aqiEntity];
        aqiEntity && aqiEntity.state && "unknown" !== aqiEntity.state && "unavailable" !== aqiEntity.state ? this.aqi = aqiEntity.state : this.aqi = "--";
      } else this.aqi = "--";
      this.error = null;
    } catch (error) {
      console.error("Error updating weather data:", error), this.error = `Error: ${error.message}`;
    }
  }
  getWeatherIcon(state) {
    return {
      "clear-night": "clear-night",
      cloudy: "cloudy",
      fog: "fog",
      hail: "hail",
      lightning: "thunderstorms",
      "lightning-rainy": "thunderstorms-rain",
      partlycloudy: "partly-cloudy-day",
      pouring: "rain",
      rainy: "drizzle",
      snowy: "snow",
      "snowy-rainy": "sleet",
      sunny: "clear-day",
      windy: "wind",
      "windy-variant": "wind",
      exceptional: "not-available",
      overcast: "overcast-day",
      "partly-cloudy": "partly-cloudy-day",
      "partly-cloudy-night": "partly-cloudy-night",
      clear: "clear-day",
      thunderstorm: "thunderstorms",
      storm: "thunderstorms",
      rain: "rain",
      snow: "snow",
      mist: "fog",
      dust: "dust",
      smoke: "smoke",
      drizzle: "drizzle",
      "light-rain": "drizzle"
    }[state] || "not-available";
  }
  getAqiColor(aqi) {
    const aqiNum = parseInt(aqi);
    return isNaN(aqiNum) ? "#999999" : aqiNum <= 50 ? "#68a03a" : aqiNum <= 100 ? "#f9bf33" : aqiNum <= 150 ? "#f47c06" : aqiNum <= 200 ? "#c43828" : aqiNum <= 300 ? "#ab1457" : "#83104c";
  }
  render() {
    const hasValidAqi = this.aqi && "--" !== this.aqi && !1 !== this.config.show_aqi;
    return html$1`
      <div class="weather-component">
        <div class="left-column">
          ${!1 !== this.config.show_date ? html$1`<div class="date">${this.date}</div>` : ""}
          ${!1 !== this.config.show_time ? html$1`<div class="time">${this.time}</div>` : ""}
        </div>
        <div class="right-column">
          ${!1 !== this.config.show_weather ? html$1`
                <div class="weather-info">
                  <img
                    src="https://basmilius.github.io/weather-icons/production/fill/all/${this.weatherIcon}.svg"
                    class="weather-icon"
                    alt="Weather icon"
                    onerror="this.src='https://cdn.jsdelivr.net/gh/basmilius/weather-icons@master/production/fill/all/not-available.svg'; if(this.src.includes('not-available')) this.onerror=null;"
                  />
                  <span class="temperature">${this.temperature}</span>
                </div>
              ` : ""}
          ${hasValidAqi ? html$1`
                <div class="aqi" style="background-color: ${this.getAqiColor(this.aqi)}">
                  ${this.aqi} AQI
                </div>
              ` : ""}
        </div>
        ${this.error ? html$1`<div class="error">${this.error}</div>` : ""}
      </div>
    `;
  }
});

class GoogleCard extends LitElement {
  static get properties() {
    return {
      hass: {
        type: Object
      },
      config: {
        type: Object
      },
      screenWidth: {
        type: Number
      },
      screenHeight: {
        type: Number
      },
      showDebugInfo: {
        type: Boolean
      },
      showOverlay: {
        type: Boolean
      },
      isOverlayVisible: {
        type: Boolean
      },
      isOverlayTransitioning: {
        type: Boolean
      },
      brightness: {
        type: Number
      },
      visualBrightness: {
        type: Number
      },
      showBrightnessCard: {
        type: Boolean
      },
      isBrightnessCardVisible: {
        type: Boolean
      },
      isBrightnessCardTransitioning: {
        type: Boolean
      },
      isNightMode: {
        type: Boolean
      },
      currentTime: {
        type: String
      },
      isInNightMode: {
        type: Boolean
      },
      previousBrightness: {
        type: Number
      },
      isAdjustingBrightness: {
        type: Boolean
      },
      lastBrightnessUpdateTime: {
        type: Number
      },
      touchStartY: {
        type: Number
      },
      touchStartX: {
        type: Number
      },
      touchStartTime: {
        type: Number
      },
      isDarkMode: {
        type: Boolean
      }
    };
  }
  static get styles() {
    return [ sharedStyles, css`
        :host {
          display: block;
          width: 100%;
          height: 100%;
          position: fixed;
          top: 0;
          left: 0;
          overflow: hidden;
        }

        .touch-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          touch-action: none;
        }

        .content-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }
      ` ];
  }
  constructor() {
    super(), this.initializeProperties(), this.boundUpdateScreenSize = this.updateScreenSize.bind(this), 
    this.brightnessUpdateQueue = [], this.isProcessingBrightnessUpdate = !1, this.isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches, 
    this.themeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)"), this.boundHandleThemeChange = this.handleThemeChange.bind(this), 
    this.handleBrightnessCardToggle = this.handleBrightnessCardToggle.bind(this), this.handleBrightnessChange = this.handleBrightnessChange.bind(this), 
    this.handleDebugToggle = this.handleDebugToggle.bind(this), this.handleNightModeExit = this.handleNightModeExit.bind(this);
  }
  initializeProperties() {
    this.showDebugInfo = !1, this.showOverlay = !1, this.isOverlayVisible = !1, this.isOverlayTransitioning = !1, 
    this.isNightMode = !1, this.showBrightnessCard = !1, this.isBrightnessCardVisible = !1, 
    this.isBrightnessCardTransitioning = !1, this.brightness = DEFAULT_CONFIG.brightness || 128, 
    this.visualBrightness = this.brightness, this.previousBrightness = this.brightness, 
    this.isInNightMode = !1, this.isAdjustingBrightness = !1, this.lastBrightnessUpdateTime = 0, 
    this.touchStartY = 0, this.touchStartX = 0, this.touchStartTime = 0, this.overlayDismissTimer = null, 
    this.brightnessCardDismissTimer = null, this.brightnessStabilizeTimer = null, this.timeUpdateInterval = null, 
    this.nightModeSource = null, this.updateScreenSize(), this.updateTime();
  }
  static getConfigElement() {
    return document.createElement("google-card-editor");
  }
  static getStubConfig() {
    return {
      image_url: "https://source.unsplash.com/random",
      display_time: 15,
      crossfade_time: 3,
      image_fit: "contain",
      show_date: !0,
      show_time: !0,
      show_weather: !0,
      show_aqi: !0,
      weather_entity: "weather.forecast_home",
      aqi_entity: "sensor.air_quality_index",
      device_name: "mobile_app_device",
      light_sensor_entity: "sensor.light_sensor",
      brightness_sensor_entity: "sensor.brightness_sensor"
    };
  }
  setConfig(config) {
    if (!config.image_url) throw new Error("You need to define an image_url");
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      sensor_update_delay: config.sensor_update_delay || DEFAULT_CONFIG.sensor_update_delay
    }, this.showDebugInfo = this.config.show_debug, this.updateCssVariables();
  }
  updateCssVariables() {
    this.config && (this.style.setProperty("--crossfade-time", `${this.config.crossfade_time || 3}s`), 
    this.style.setProperty("--theme-transition", "background-color 0.3s ease, color 0.3s ease"), 
    this.style.setProperty("--theme-background", this.isDarkMode ? "#121212" : "#ffffff"), 
    this.style.setProperty("--theme-text", this.isDarkMode ? "#ffffff" : "#333333"), 
    document.documentElement.style.setProperty("--theme-transition", "background-color 0.3s ease, color 0.3s ease"), 
    document.documentElement.style.setProperty("--theme-background", this.isDarkMode ? "#121212" : "#ffffff"), 
    document.documentElement.style.setProperty("--theme-text", this.isDarkMode ? "#ffffff" : "#333333"));
  }
  handleThemeChange(e) {
    const newIsDarkMode = e.matches;
    this.isDarkMode !== newIsDarkMode && (this.isDarkMode = newIsDarkMode, this.updateCssVariables(), 
    this.refreshComponents(), this.requestUpdate());
  }
  refreshComponents() {
    document.documentElement.setAttribute("data-theme", this.isDarkMode ? "dark" : "light");
    const backgroundRotator = this.shadowRoot.querySelector("background-rotator"), weatherClock = this.shadowRoot.querySelector("weather-clock"), controls = this.shadowRoot.querySelector("google-controls");
    backgroundRotator && backgroundRotator.requestUpdate(), weatherClock && weatherClock.requestUpdate(), 
    controls && controls.requestUpdate();
  }
  connectedCallback() {
    super.connectedCallback(), this.startTimeUpdates(), setTimeout((() => this.updateNightMode()), 1e3), 
    window.addEventListener("resize", this.boundUpdateScreenSize), this.themeMediaQuery.addEventListener("change", this.boundHandleThemeChange), 
    document.documentElement.setAttribute("data-theme", this.isDarkMode ? "dark" : "light"), 
    setTimeout((() => {
      this.updateCssVariables(), this.refreshComponents();
    }), 100);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.clearAllTimers(), window.removeEventListener("resize", this.boundUpdateScreenSize), 
    this.themeMediaQuery.removeEventListener("change", this.boundHandleThemeChange);
    const touchContainer = this.shadowRoot?.querySelector(".touch-container");
    touchContainer && (touchContainer.removeEventListener("touchstart", this.handleTouchStart), 
    touchContainer.removeEventListener("touchmove", this.handleTouchMove), touchContainer.removeEventListener("touchend", this.handleTouchEnd));
  }
  firstUpdated() {
    super.firstUpdated();
    const touchContainer = this.shadowRoot.querySelector(".touch-container");
    touchContainer && (touchContainer.addEventListener("touchstart", this.handleTouchStart.bind(this), {
      passive: !0
    }), touchContainer.addEventListener("touchmove", this.handleTouchMove.bind(this), {
      passive: !1
    }), touchContainer.addEventListener("touchend", this.handleTouchEnd.bind(this), {
      passive: !0
    }));
  }
  clearAllTimers() {
    this.overlayDismissTimer && clearTimeout(this.overlayDismissTimer), this.brightnessCardDismissTimer && clearTimeout(this.brightnessCardDismissTimer), 
    this.brightnessStabilizeTimer && clearTimeout(this.brightnessStabilizeTimer), this.timeUpdateInterval && clearInterval(this.timeUpdateInterval);
  }
  updateScreenSize() {
    const pixelRatio = window.devicePixelRatio || 1;
    this.screenWidth = Math.round(window.innerWidth * pixelRatio), this.screenHeight = Math.round(window.innerHeight * pixelRatio), 
    this.requestUpdate();
  }
  startTimeUpdates() {
    this.updateTime(), this.timeUpdateInterval = setInterval((() => {
      this.updateTime();
    }), 1e3);
  }
  updateTime() {
    const now = new Date;
    this.currentTime = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: !0
    }).replace(/\s?[AP]M/, "");
  }
  handleTouchStart(event) {
    1 === event.touches.length && (this.touchStartY = event.touches[0].clientY, this.touchStartX = event.touches[0].clientX, 
    this.touchStartTime = Date.now());
  }
  handleTouchMove(event) {
    1 === event.touches.length && (this.showBrightnessCard || this.showOverlay) && event.preventDefault();
  }
  handleTouchEnd(event) {
    if (1 === event.changedTouches.length) {
      const deltaY = this.touchStartY - event.changedTouches[0].clientY, deltaX = this.touchStartX - event.changedTouches[0].clientX, deltaTime = Date.now() - this.touchStartTime, velocityY = Math.abs(deltaY) / deltaTime, velocityX = Math.abs(deltaX) / deltaTime;
      if (this.isNightMode && "manual" === this.nightModeSource && Math.abs(deltaX) < 50 && Math.abs(deltaY) < 50) return void this.handleNightModeTransition(!1);
      Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && velocityX > .2 && this.touchStartX < .2 * window.innerWidth && deltaX < 0 ? this.isNightMode || this.handleNightModeTransition(!0, "manual") : Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50 && velocityY > .2 && (deltaY > 0 && !this.showBrightnessCard && !this.showOverlay ? this.handleOverlayToggle(!0) : deltaY < 0 && (this.showBrightnessCard ? this.dismissBrightnessCard() : this.showOverlay && this.dismissOverlay()));
    }
  }
  handleOverlayToggle(shouldShow = !0) {
    shouldShow && !this.showOverlay ? (this.showOverlay = !0, this.isOverlayTransitioning = !0, 
    requestAnimationFrame((() => {
      requestAnimationFrame((() => {
        this.isOverlayVisible = !0, this.startOverlayDismissTimer(), this.requestUpdate(), 
        setTimeout((() => {
          this.isOverlayTransitioning = !1, this.requestUpdate();
        }), 300);
      }));
    }))) : !shouldShow && this.showOverlay && this.dismissOverlay();
  }
  startOverlayDismissTimer() {
    this.overlayDismissTimer && clearTimeout(this.overlayDismissTimer), this.overlayDismissTimer = setTimeout((() => {
      this.dismissOverlay();
    }), 1e4);
  }
  startBrightnessCardDismissTimer() {
    this.brightnessCardDismissTimer && clearTimeout(this.brightnessCardDismissTimer), 
    this.brightnessCardDismissTimer = setTimeout((() => {
      this.dismissBrightnessCard();
    }), 1e4);
  }
  dismissOverlay() {
    this.isOverlayTransitioning || (this.isOverlayTransitioning = !0, this.isOverlayVisible = !1, 
    this.overlayDismissTimer && clearTimeout(this.overlayDismissTimer), requestAnimationFrame((() => {
      this.requestUpdate(), setTimeout((() => {
        this.showOverlay = !1, this.isOverlayTransitioning = !1, this.requestUpdate();
      }), 300);
    })));
  }
  dismissBrightnessCard() {
    this.isBrightnessCardTransitioning || (this.isBrightnessCardTransitioning = !0, 
    this.isBrightnessCardVisible = !1, this.brightnessCardDismissTimer && clearTimeout(this.brightnessCardDismissTimer), 
    requestAnimationFrame((() => {
      this.requestUpdate(), setTimeout((() => {
        this.showBrightnessCard = !1, this.isBrightnessCardTransitioning = !1, this.requestUpdate();
      }), 300);
    })));
  }
  async updateBrightnessValue(value) {
    this.isAdjustingBrightness = !0, this.visualBrightness = Math.max(1, Math.min(255, Math.round(value))), 
    this.brightnessUpdateQueue.push(value), this.isProcessingBrightnessUpdate || this.processBrightnessUpdateQueue(), 
    this.brightnessStabilizeTimer && clearTimeout(this.brightnessStabilizeTimer), this.brightnessStabilizeTimer = setTimeout((() => {
      this.isAdjustingBrightness = !1, this.requestUpdate();
    }), 2e3);
  }
  async processBrightnessUpdateQueue() {
    if (0 === this.brightnessUpdateQueue.length) return void (this.isProcessingBrightnessUpdate = !1);
    this.isProcessingBrightnessUpdate = !0;
    const lastValue = this.brightnessUpdateQueue[this.brightnessUpdateQueue.length - 1];
    this.brightnessUpdateQueue = [];
    try {
      await this.setBrightness(lastValue), this.lastBrightnessUpdateTime = Date.now();
    } catch (error) {
      this.visualBrightness = this.brightness;
    }
    setTimeout((() => this.processBrightnessUpdateQueue()), 250);
  }
  async setBrightness(value) {
    if (!this.hass) return;
    const brightness = Math.max(1, Math.min(255, Math.round(value))), deviceName = this.config.device_name || "mobile_app_liam_s_room_display";
    await this.hass.callService("notify", deviceName, {
      message: "command_screen_brightness_level",
      data: {
        command: brightness
      }
    }), await this.hass.callService("notify", deviceName, {
      message: "command_update_sensors"
    }), await new Promise((resolve => setTimeout(resolve, this.config.sensor_update_delay))), 
    this.brightness = brightness, this.isNightMode || (this.previousBrightness = brightness);
  }
  async handleNightModeTransition(newNightMode, source = "sensor") {
    if (newNightMode !== this.isInNightMode || this.nightModeSource !== source) try {
      newNightMode ? (await this.enterNightMode(), this.nightModeSource = source) : (await this.exitNightMode(), 
      this.nightModeSource = null), this.isInNightMode = newNightMode, this.isNightMode = newNightMode;
      const nightModeComponent = this.shadowRoot.querySelector("night-mode");
      nightModeComponent && (nightModeComponent.isInNightMode = newNightMode, nightModeComponent.previousBrightness = this.previousBrightness, 
      nightModeComponent.nightModeSource = this.nightModeSource), this.requestUpdate();
    } catch (error) {
      this.isInNightMode = !newNightMode, this.isNightMode = !newNightMode, this.requestUpdate();
    }
  }
  async enterNightMode() {
    !this.isInNightMode && this.brightness > 1 && (this.previousBrightness = this.brightness);
    const deviceName = this.config.device_name || "mobile_app_liam_s_room_display";
    try {
      await this.hass.callService("notify", deviceName, {
        message: "command_auto_screen_brightness",
        data: {
          command: "turn_off"
        }
      }), await new Promise((resolve => setTimeout(resolve, 200))), await this.setBrightness(1), 
      await new Promise((resolve => setTimeout(resolve, 200))), await this.hass.callService("notify", deviceName, {
        message: "command_auto_screen_brightness",
        data: {
          command: "turn_on"
        }
      });
    } catch (error) {
      throw console.error("Error entering night mode:", error), error;
    }
  }
  async exitNightMode() {
    const deviceName = this.config.device_name || "mobile_app_liam_s_room_display";
    try {
      await this.hass.callService("notify", deviceName, {
        message: "command_auto_screen_brightness",
        data: {
          command: "turn_off"
        }
      }), await new Promise((resolve => setTimeout(resolve, 200)));
      const restoreBrightness = this.previousBrightness && this.previousBrightness > 1 ? this.previousBrightness : 128;
      await this.setBrightness(restoreBrightness);
    } catch (error) {
      throw console.error("Error exiting night mode:", error), error;
    }
  }
  handleBrightnessCardToggle(event) {
    const shouldShow = event.detail;
    shouldShow && !this.showBrightnessCard ? (this.showOverlay && (this.isOverlayVisible = !1, 
    this.showOverlay = !1, this.isOverlayTransitioning = !1, this.overlayDismissTimer && clearTimeout(this.overlayDismissTimer)), 
    this.showBrightnessCard = !0, this.isBrightnessCardTransitioning = !0, requestAnimationFrame((() => {
      this.isBrightnessCardVisible = !0, this.startBrightnessCardDismissTimer(), this.requestUpdate(), 
      setTimeout((() => {
        this.isBrightnessCardTransitioning = !1, this.requestUpdate();
      }), 300);
    }))) : !shouldShow && this.showBrightnessCard && this.dismissBrightnessCard();
  }
  handleBrightnessChange(event) {
    this.updateBrightnessValue(event.detail), this.startBrightnessCardDismissTimer();
  }
  handleDebugToggle() {
    this.showDebugInfo = !this.showDebugInfo, this.requestUpdate();
  }
  handleNightModeExit() {
    this.isNightMode = !1, this.requestUpdate();
  }
  updateNightMode() {
    if (!this.hass) return;
    const lightSensorEntity = this.config.light_sensor_entity || "sensor.liam_room_display_light_sensor", lightSensor = this.hass.states[lightSensorEntity];
    if (!lightSensor) return;
    const sensorState = lightSensor.state;
    if ("unavailable" === sensorState || "unknown" === sensorState) return;
    const shouldBeInNightMode = 0 === parseInt(sensorState);
    this.isInNightMode && "manual" === this.nightModeSource || shouldBeInNightMode !== this.isInNightMode && this.handleNightModeTransition(shouldBeInNightMode, "sensor");
  }
  updated(changedProperties) {
    if (changedProperties.has("hass") && this.hass && !this.isAdjustingBrightness) {
      Date.now() - this.lastBrightnessUpdateTime > 2e3 && this.updateNightMode();
    }
  }
  render() {
    const mainContent = this.isNightMode ? html`
          <night-mode
            .currentTime=${this.currentTime}
            .hass=${this.hass}
            .config=${this.config}
            .brightness=${this.brightness}
            .previousBrightness=${this.previousBrightness}
            .isInNightMode=${this.isInNightMode}
            .nightModeSource=${this.nightModeSource}
            @nightModeExit=${this.handleNightModeExit}
          ></night-mode>
        ` : html`
          <background-rotator
            .hass=${this.hass}
            .config=${this.config}
            .screenWidth=${this.screenWidth}
            .screenHeight=${this.screenHeight}
          ></background-rotator>

          <weather-clock .hass=${this.hass} .config=${this.config}></weather-clock>

          <google-controls
            .hass=${this.hass}
            .config=${this.config}
            .showOverlay=${this.showOverlay}
            .isOverlayVisible=${this.isOverlayVisible}
            .isOverlayTransitioning=${this.isOverlayTransitioning}
            .showBrightnessCard=${this.showBrightnessCard}
            .isBrightnessCardVisible=${this.isBrightnessCardVisible}
            .isBrightnessCardTransitioning=${this.isBrightnessCardTransitioning}
            .brightness=${this.brightness}
            .visualBrightness=${this.visualBrightness}
            .isAdjustingBrightness=${this.isAdjustingBrightness}
            @overlayToggle=${this.handleOverlayToggle}
            @brightnessCardToggle=${this.handleBrightnessCardToggle}
            @brightnessChange=${this.handleBrightnessChange}
            @debugToggle=${this.handleDebugToggle}
          ></google-controls>
        `;
    return html`
      <!-- Import all required fonts -->
      <link
        href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600&display=swap"
        rel="stylesheet"
        crossorigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Product+Sans:wght@400;500&display=swap"
        rel="stylesheet"
        crossorigin="anonymous"
      />

      <!-- Fallback font style for Product Sans -->
      <style>
        @font-face {
          font-family: 'Product Sans Regular';
          src: local('Product Sans'), local('Product Sans Regular'), local('ProductSans-Regular'),
            url(https://fonts.gstatic.com/s/productsans/v5/HYvgU2fE2nRJvZ5JFAumwegdm0LZdjqr5-oayXSOefg.woff2)
              format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
      </style>

      <div class="touch-container">
        <div class="content-wrapper">${mainContent}</div>
      </div>
    `;
  }
}

customElements.define("google-card", GoogleCard), window.customCards = window.customCards || [], 
window.customCards.push({
  type: "google-card",
  name: "Google Card",
  description: "A card that mimics Google's UI for photo frame displays",
  preview: !0
});

export { GoogleCard };
//# sourceMappingURL=google-card.js.map
