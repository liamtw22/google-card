import "https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js";

function __decorate(decorators, target, key, desc) {
  var d, c = arguments.length, r = c < 3 ? target : null === desc ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
  if ("object" == typeof Reflect && "function" == typeof Reflect.decorate) r = Reflect.decorate(decorators, target, key, desc); else for (var i = decorators.length - 1; i >= 0; i--) (d = decorators[i]) && (r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r);
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}

"function" == typeof SuppressedError && SuppressedError;

const t$2 = globalThis, e$2 = t$2.ShadowRoot && (void 0 === t$2.ShadyCSS || t$2.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, s$2 = Symbol(), o$4 = new WeakMap;

let n$3 = class n {
  constructor(t, e, o) {
    if (this._$cssResult$ = !0, o !== s$2) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const s = this.t;
    if (e$2 && void 0 === t) {
      const e = void 0 !== s && 1 === s.length;
      e && (t = o$4.get(s)), void 0 === t && ((this.o = t = new CSSStyleSheet).replaceSync(this.cssText), 
      e && o$4.set(s, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};

const i$3 = (t, ...e) => {
  const o = 1 === t.length ? t[0] : e.reduce((e, s, o) => e + (t => {
    if (!0 === t._$cssResult$) return t.cssText;
    if ("number" == typeof t) return t;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + t[o + 1], t[0]);
  return new n$3(o, t, s$2);
}, c$2 = e$2 ? t => t : t => t instanceof CSSStyleSheet ? (t => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return (t => new n$3("string" == typeof t ? t : t + "", void 0, s$2))(e);
})(t) : t, {is: i$2, defineProperty: e$1, getOwnPropertyDescriptor: h$1, getOwnPropertyNames: r$3, getOwnPropertySymbols: o$3, getPrototypeOf: n$2} = Object, a$1 = globalThis, c$1 = a$1.trustedTypes, l$1 = c$1 ? c$1.emptyScript : "", p$1 = a$1.reactiveElementPolyfillSupport, d$1 = (t, s) => t, u$1 = {
  toAttribute(t, s) {
    switch (s) {
     case Boolean:
      t = t ? l$1 : null;
      break;

     case Object:
     case Array:
      t = null == t ? t : JSON.stringify(t);
    }
    return t;
  },
  fromAttribute(t, s) {
    let i = t;
    switch (s) {
     case Boolean:
      i = null !== t;
      break;

     case Number:
      i = null === t ? null : Number(t);
      break;

     case Object:
     case Array:
      try {
        i = JSON.parse(t);
      } catch (t) {
        i = null;
      }
    }
    return i;
  }
}, f$1 = (t, s) => !i$2(t, s), b$1 = {
  attribute: !0,
  type: String,
  converter: u$1,
  reflect: !1,
  useDefault: !1,
  hasChanged: f$1
};

Symbol.metadata ??= Symbol("metadata"), a$1.litPropertyMetadata ??= new WeakMap;

let y$1 = class y extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ??= []).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [ ...this._$Eh.keys() ];
  }
  static createProperty(t, s = b$1) {
    if (s.state && (s.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((s = Object.create(s)).wrapped = !0), 
    this.elementProperties.set(t, s), !s.noAccessor) {
      const i = Symbol(), h = this.getPropertyDescriptor(t, i, s);
      void 0 !== h && e$1(this.prototype, t, h);
    }
  }
  static getPropertyDescriptor(t, s, i) {
    const {get: e, set: r} = h$1(this.prototype, t) ?? {
      get() {
        return this[s];
      },
      set(t) {
        this[s] = t;
      }
    };
    return {
      get: e,
      set(s) {
        const h = e?.call(this);
        r?.call(this, s), this.requestUpdate(t, h, i);
      },
      configurable: !0,
      enumerable: !0
    };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? b$1;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d$1("elementProperties"))) return;
    const t = n$2(this);
    t.finalize(), void 0 !== t.l && (this.l = [ ...t.l ]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d$1("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(d$1("properties"))) {
      const t = this.properties, s = [ ...r$3(t), ...o$3(t) ];
      for (const i of s) this.createProperty(i, t[i]);
    }
    const t = this[Symbol.metadata];
    if (null !== t) {
      const s = litPropertyMetadata.get(t);
      if (void 0 !== s) for (const [t, i] of s) this.elementProperties.set(t, i);
    }
    this._$Eh = new Map;
    for (const [t, s] of this.elementProperties) {
      const i = this._$Eu(t, s);
      void 0 !== i && this._$Eh.set(i, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s) {
    const i = [];
    if (Array.isArray(s)) {
      const e = new Set(s.flat(1 / 0).reverse());
      for (const s of e) i.unshift(c$2(s));
    } else void 0 !== s && i.push(c$2(s));
    return i;
  }
  static _$Eu(t, s) {
    const i = s.attribute;
    return !1 === i ? void 0 : "string" == typeof i ? i : "string" == typeof t ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, 
    this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise(t => this.enableUpdating = t), this._$AL = new Map, this._$E_(), 
    this.requestUpdate(), this.constructor.l?.forEach(t => t(this));
  }
  addController(t) {
    (this._$EO ??= new Set).add(t), void 0 !== this.renderRoot && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = new Map, s = this.constructor.elementProperties;
    for (const i of s.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ((s, o) => {
      if (e$2) s.adoptedStyleSheets = o.map(t => t instanceof CSSStyleSheet ? t : t.styleSheet); else for (const e of o) {
        const o = document.createElement("style"), n = t$2.litNonce;
        void 0 !== n && o.setAttribute("nonce", n), o.textContent = e.cssText, s.appendChild(o);
      }
    })(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach(t => t.hostConnected?.());
  }
  enableUpdating(t) {}
  disconnectedCallback() {
    this._$EO?.forEach(t => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, s, i) {
    this._$AK(t, i);
  }
  _$ET(t, s) {
    const i = this.constructor.elementProperties.get(t), e = this.constructor._$Eu(t, i);
    if (void 0 !== e && !0 === i.reflect) {
      const h = (void 0 !== i.converter?.toAttribute ? i.converter : u$1).toAttribute(s, i.type);
      this._$Em = t, null == h ? this.removeAttribute(e) : this.setAttribute(e, h), this._$Em = null;
    }
  }
  _$AK(t, s) {
    const i = this.constructor, e = i._$Eh.get(t);
    if (void 0 !== e && this._$Em !== e) {
      const t = i.getPropertyOptions(e), h = "function" == typeof t.converter ? {
        fromAttribute: t.converter
      } : void 0 !== t.converter?.fromAttribute ? t.converter : u$1;
      this._$Em = e;
      const r = h.fromAttribute(s, t.type);
      this[e] = r ?? this._$Ej?.get(e) ?? r, this._$Em = null;
    }
  }
  requestUpdate(t, s, i, e = !1, h) {
    if (void 0 !== t) {
      const r = this.constructor;
      if (!1 === e && (h = this[t]), i ??= r.getPropertyOptions(t), !((i.hasChanged ?? f$1)(h, s) || i.useDefault && i.reflect && h === this._$Ej?.get(t) && !this.hasAttribute(r._$Eu(t, i)))) return;
      this.C(t, s, i);
    }
    !1 === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t, s, {useDefault: i, reflect: e, wrapped: h}, r) {
    i && !(this._$Ej ??= new Map).has(t) && (this._$Ej.set(t, r ?? s ?? this[t]), !0 !== h || void 0 !== r) || (this._$AL.has(t) || (this.hasUpdated || i || (s = void 0), 
    this._$AL.set(t, s)), !0 === e && this._$Em !== t && (this._$Eq ??= new Set).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
    }
    const t = this.scheduleUpdate();
    return null != t && await t, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t, s] of this._$Ep) this[t] = s;
        this._$Ep = void 0;
      }
      const t = this.constructor.elementProperties;
      if (t.size > 0) for (const [s, i] of t) {
        const {wrapped: t} = i, e = this[s];
        !0 !== t || this._$AL.has(s) || void 0 === e || this.C(s, void 0, i, e);
      }
    }
    let t = !1;
    const s = this._$AL;
    try {
      t = this.shouldUpdate(s), t ? (this.willUpdate(s), this._$EO?.forEach(t => t.hostUpdate?.()), 
      this.update(s)) : this._$EM();
    } catch (s) {
      throw t = !1, this._$EM(), s;
    }
    t && this._$AE(s);
  }
  willUpdate(t) {}
  _$AE(t) {
    this._$EO?.forEach(t => t.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, 
    this.firstUpdated(t)), this.updated(t);
  }
  _$EM() {
    this._$AL = new Map, this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq &&= this._$Eq.forEach(t => this._$ET(t, this[t])), this._$EM();
  }
  updated(t) {}
  firstUpdated(t) {}
};

y$1.elementStyles = [], y$1.shadowRootOptions = {
  mode: "open"
}, y$1[d$1("elementProperties")] = new Map, y$1[d$1("finalized")] = new Map, p$1?.({
  ReactiveElement: y$1
}), (a$1.reactiveElementVersions ??= []).push("2.1.2");

const t$1 = globalThis, i$1 = t => t, s$1 = t$1.trustedTypes, e = s$1 ? s$1.createPolicy("lit-html", {
  createHTML: t => t
}) : void 0, h = "$lit$", o$2 = `lit$${Math.random().toFixed(9).slice(2)}$`, n$1 = "?" + o$2, r$2 = `<${n$1}>`, l = document, c = () => l.createComment(""), a = t => null === t || "object" != typeof t && "function" != typeof t, u = Array.isArray, f = "[ \t\n\f\r]", v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, _ = /-->/g, m = />/g, p = RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), g = /'/g, $ = /"/g, y = /^(?:script|style|textarea|title)$/i, b = (t => (i, ...s) => ({
  _$litType$: t,
  strings: i,
  values: s
}))(1), E = Symbol.for("lit-noChange"), A = Symbol.for("lit-nothing"), C = new WeakMap, P = l.createTreeWalker(l, 129);

function V(t, i) {
  if (!u(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e ? e.createHTML(i) : i;
}

const N = (t, i) => {
  const s = t.length - 1, e = [];
  let n, l = 2 === i ? "<svg>" : 3 === i ? "<math>" : "", c = v;
  for (let i = 0; i < s; i++) {
    const s = t[i];
    let a, u, d = -1, f = 0;
    for (;f < s.length && (c.lastIndex = f, u = c.exec(s), null !== u); ) f = c.lastIndex, 
    c === v ? "!--" === u[1] ? c = _ : void 0 !== u[1] ? c = m : void 0 !== u[2] ? (y.test(u[2]) && (n = RegExp("</" + u[2], "g")), 
    c = p) : void 0 !== u[3] && (c = p) : c === p ? ">" === u[0] ? (c = n ?? v, d = -1) : void 0 === u[1] ? d = -2 : (d = c.lastIndex - u[2].length, 
    a = u[1], c = void 0 === u[3] ? p : '"' === u[3] ? $ : g) : c === $ || c === g ? c = p : c === _ || c === m ? c = v : (c = p, 
    n = void 0);
    const x = c === p && t[i + 1].startsWith("/>") ? " " : "";
    l += c === v ? s + r$2 : d >= 0 ? (e.push(a), s.slice(0, d) + h + s.slice(d) + o$2 + x) : s + o$2 + (-2 === d ? i : x);
  }
  return [ V(t, l + (t[s] || "<?>") + (2 === i ? "</svg>" : 3 === i ? "</math>" : "")), e ];
};

class S {
  constructor({strings: t, _$litType$: i}, e) {
    let r;
    this.parts = [];
    let l = 0, a = 0;
    const u = t.length - 1, d = this.parts, [f, v] = N(t, i);
    if (this.el = S.createElement(f, e), P.currentNode = this.el.content, 2 === i || 3 === i) {
      const t = this.el.content.firstChild;
      t.replaceWith(...t.childNodes);
    }
    for (;null !== (r = P.nextNode()) && d.length < u; ) {
      if (1 === r.nodeType) {
        if (r.hasAttributes()) for (const t of r.getAttributeNames()) if (t.endsWith(h)) {
          const i = v[a++], s = r.getAttribute(t).split(o$2), e = /([.?@])?(.*)/.exec(i);
          d.push({
            type: 1,
            index: l,
            name: e[2],
            strings: s,
            ctor: "." === e[1] ? I : "?" === e[1] ? L : "@" === e[1] ? z : H
          }), r.removeAttribute(t);
        } else t.startsWith(o$2) && (d.push({
          type: 6,
          index: l
        }), r.removeAttribute(t));
        if (y.test(r.tagName)) {
          const t = r.textContent.split(o$2), i = t.length - 1;
          if (i > 0) {
            r.textContent = s$1 ? s$1.emptyScript : "";
            for (let s = 0; s < i; s++) r.append(t[s], c()), P.nextNode(), d.push({
              type: 2,
              index: ++l
            });
            r.append(t[i], c());
          }
        }
      } else if (8 === r.nodeType) if (r.data === n$1) d.push({
        type: 2,
        index: l
      }); else {
        let t = -1;
        for (;-1 !== (t = r.data.indexOf(o$2, t + 1)); ) d.push({
          type: 7,
          index: l
        }), t += o$2.length - 1;
      }
      l++;
    }
  }
  static createElement(t, i) {
    const s = l.createElement("template");
    return s.innerHTML = t, s;
  }
}

function M(t, i, s = t, e) {
  if (i === E) return i;
  let h = void 0 !== e ? s._$Co?.[e] : s._$Cl;
  const o = a(i) ? void 0 : i._$litDirective$;
  return h?.constructor !== o && (h?._$AO?.(!1), void 0 === o ? h = void 0 : (h = new o(t), 
  h._$AT(t, s, e)), void 0 !== e ? (s._$Co ??= [])[e] = h : s._$Cl = h), void 0 !== h && (i = M(t, h._$AS(t, i.values), h, e)), 
  i;
}

class R {
  constructor(t, i) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = i;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const {el: {content: i}, parts: s} = this._$AD, e = (t?.creationScope ?? l).importNode(i, !0);
    P.currentNode = e;
    let h = P.nextNode(), o = 0, n = 0, r = s[0];
    for (;void 0 !== r; ) {
      if (o === r.index) {
        let i;
        2 === r.type ? i = new k(h, h.nextSibling, this, t) : 1 === r.type ? i = new r.ctor(h, r.name, r.strings, this, t) : 6 === r.type && (i = new Z(h, this, t)), 
        this._$AV.push(i), r = s[++n];
      }
      o !== r?.index && (h = P.nextNode(), o++);
    }
    return P.currentNode = l, e;
  }
  p(t) {
    let i = 0;
    for (const s of this._$AV) void 0 !== s && (void 0 !== s.strings ? (s._$AI(t, s, i), 
    i += s.strings.length - 2) : s._$AI(t[i])), i++;
  }
}

class k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, i, s, e) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t, this._$AB = i, 
    this._$AM = s, this.options = e, this._$Cv = e?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const i = this._$AM;
    return void 0 !== i && 11 === t?.nodeType && (t = i.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, i = this) {
    t = M(this, t, i), a(t) ? t === A || null == t || "" === t ? (this._$AH !== A && this._$AR(), 
    this._$AH = A) : t !== this._$AH && t !== E && this._(t) : void 0 !== t._$litType$ ? this.$(t) : void 0 !== t.nodeType ? this.T(t) : (t => u(t) || "function" == typeof t?.[Symbol.iterator])(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== A && a(this._$AH) ? this._$AA.nextSibling.data = t : this.T(l.createTextNode(t)), 
    this._$AH = t;
  }
  $(t) {
    const {values: i, _$litType$: s} = t, e = "number" == typeof s ? this._$AC(t) : (void 0 === s.el && (s.el = S.createElement(V(s.h, s.h[0]), this.options)), 
    s);
    if (this._$AH?._$AD === e) this._$AH.p(i); else {
      const t = new R(e, this), s = t.u(this.options);
      t.p(i), this.T(s), this._$AH = t;
    }
  }
  _$AC(t) {
    let i = C.get(t.strings);
    return void 0 === i && C.set(t.strings, i = new S(t)), i;
  }
  k(t) {
    u(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let s, e = 0;
    for (const h of t) e === i.length ? i.push(s = new k(this.O(c()), this.O(c()), this, this.options)) : s = i[e], 
    s._$AI(h), e++;
    e < i.length && (this._$AR(s && s._$AB.nextSibling, e), i.length = e);
  }
  _$AR(t = this._$AA.nextSibling, s) {
    for (this._$AP?.(!1, !0, s); t !== this._$AB; ) {
      const s = i$1(t).nextSibling;
      i$1(t).remove(), t = s;
    }
  }
  setConnected(t) {
    void 0 === this._$AM && (this._$Cv = t, this._$AP?.(t));
  }
}

class H {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, i, s, e, h) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t, this.name = i, 
    this._$AM = e, this.options = h, s.length > 2 || "" !== s[0] || "" !== s[1] ? (this._$AH = Array(s.length - 1).fill(new String), 
    this.strings = s) : this._$AH = A;
  }
  _$AI(t, i = this, s, e) {
    const h = this.strings;
    let o = !1;
    if (void 0 === h) t = M(this, t, i, 0), o = !a(t) || t !== this._$AH && t !== E, 
    o && (this._$AH = t); else {
      const e = t;
      let n, r;
      for (t = h[0], n = 0; n < h.length - 1; n++) r = M(this, e[s + n], i, n), r === E && (r = this._$AH[n]), 
      o ||= !a(r) || r !== this._$AH[n], r === A ? t = A : t !== A && (t += (r ?? "") + h[n + 1]), 
      this._$AH[n] = r;
    }
    o && !e && this.j(t);
  }
  j(t) {
    t === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}

class I extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === A ? void 0 : t;
  }
}

class L extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== A);
  }
}

class z extends H {
  constructor(t, i, s, e, h) {
    super(t, i, s, e, h), this.type = 5;
  }
  _$AI(t, i = this) {
    if ((t = M(this, t, i, 0) ?? A) === E) return;
    const s = this._$AH, e = t === A && s !== A || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, h = t !== A && (s === A || e);
    e && this.element.removeEventListener(this.name, this, s), h && this.element.addEventListener(this.name, this, t), 
    this._$AH = t;
  }
  handleEvent(t) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}

class Z {
  constructor(t, i, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    M(this, t);
  }
}

const B = t$1.litHtmlPolyfillSupport;

B?.(S, k), (t$1.litHtmlVersions ??= []).push("3.3.2");

const s = globalThis;

class i extends y$1 {
  constructor() {
    super(...arguments), this.renderOptions = {
      host: this
    }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t.firstChild, t;
  }
  update(t) {
    const r = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), 
    this._$Do = ((t, i, s) => {
      const e = s?.renderBefore ?? i;
      let h = e._$litPart$;
      if (void 0 === h) {
        const t = s?.renderBefore ?? null;
        e._$litPart$ = h = new k(i.insertBefore(c(), t), t, void 0, s ?? {});
      }
      return h._$AI(t), h;
    })(r, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return E;
  }
}

i._$litElement$ = !0, i.finalized = !0, s.litElementHydrateSupport?.({
  LitElement: i
});

const o$1 = s.litElementPolyfillSupport;

o$1?.({
  LitElement: i
}), (s.litElementVersions ??= []).push("4.2.2");

const t = t => (e, o) => {
  void 0 !== o ? o.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
}, o = {
  attribute: !0,
  type: String,
  converter: u$1,
  reflect: !1,
  hasChanged: f$1
}, r$1 = (t = o, e, r) => {
  const {kind: n, metadata: i} = r;
  let s = globalThis.litPropertyMetadata.get(i);
  if (void 0 === s && globalThis.litPropertyMetadata.set(i, s = new Map), "setter" === n && ((t = Object.create(t)).wrapped = !0), 
  s.set(r.name, t), "accessor" === n) {
    const {name: o} = r;
    return {
      set(r) {
        const n = e.get.call(this);
        e.set.call(this, r), this.requestUpdate(o, n, t, !0, r);
      },
      init(e) {
        return void 0 !== e && this.C(o, void 0, t, e), e;
      }
    };
  }
  if ("setter" === n) {
    const {name: o} = r;
    return function(r) {
      const n = this[o];
      e.call(this, r), this.requestUpdate(o, n, t, !0, r);
    };
  }
  throw Error("Unsupported decorator location: " + n);
};

function n(t) {
  return (e, o) => "object" == typeof o ? r$1(t, e, o) : ((t, e, o) => {
    const r = e.hasOwnProperty(o);
    return e.constructor.createProperty(o, t), r ? Object.getOwnPropertyDescriptor(e, o) : void 0;
  })(t, e, o);
}

function r(r) {
  return n({
    ...r,
    state: !0,
    attribute: !1
  });
}

const sharedStyles = i$3`
  :host {
    --crossfade-time: 3s;
    --overlay-height: 120px;
    --theme-transition: background-color 0.3s ease, color 0.3s ease;
    --theme-background: #ffffff;
    --theme-text: #333333;
    --overlay-background: rgba(255, 255, 255, 0.95);
    --control-text-color: #333333;
    --brightness-dot-color: #d1d1d1;
    --brightness-dot-active: #333333;
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

  :host([data-theme='dark']) {
    --theme-background: #121212;
    --theme-text: #ffffff;
    --overlay-background: rgba(32, 33, 36, 0.95);
    --control-text-color: #ffffff;
    --brightness-dot-color: #5f6368;
    --brightness-dot-active: #ffffff;
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

  .debug-info {
    position: fixed;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: #00ff00;
    padding: 15px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    max-width: 400px;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 9999;
  }

  .debug-info h2 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #00ffff;
  }

  .debug-info h3 {
    margin: 10px 0 5px 0;
    font-size: 12px;
    color: #ffff00;
  }

  .debug-info p {
    margin: 5px 0;
  }

  .debug-info pre {
    margin: 5px 0;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 200px;
    overflow-y: auto;
  }

  .debug-info strong {
    color: #00ffff;
  }
`, editorStyles = i$3`
  .form-container {
    padding: 16px;
  }

  .card {
    margin-bottom: 16px;
    background: var(--card-background-color, var(--ha-card-background));
    border-radius: var(--ha-card-border-radius, 4px);
    box-shadow: var(
      --ha-card-box-shadow,
      0 2px 2px 0 rgba(0, 0, 0, 0.14),
      0 1px 5px 0 rgba(0, 0, 0, 0.12),
      0 3px 1px -2px rgba(0, 0, 0, 0.2)
    );
    color: var(--primary-text-color);
    padding: 16px;
  }

  .card-header {
    font-family: var(--ha-card-header-font-family, inherit);
    font-size: var(--ha-card-header-font-size, 24px);
    font-weight: 400;
    color: var(--ha-card-header-color, --primary-text-color);
    padding: 4px 0 12px;
    line-height: 1.2;
  }

  .card-section {
    margin-bottom: 16px;
  }

  .section-header {
    font-size: 18px;
    font-weight: 500;
    color: var(--primary-text-color);
    margin-bottom: 8px;
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
    padding-bottom: 4px;
  }

  .row {
    display: flex;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  .input-group {
    padding: 8px 0;
    box-sizing: border-box;
    flex: 1 0 200px;
    max-width: 100%;
    margin-right: 16px;
  }

  .input-group:last-child {
    margin-right: 0;
  }

  .input-group.full-width {
    flex: 1 0 100%;
    max-width: 100%;
  }

  .input-label {
    display: block;
    margin-bottom: 4px;
    font-weight: 500;
  }

  .input-desc {
    font-size: 12px;
    color: var(--secondary-text-color);
    margin-top: 4px;
  }

  .switch-group {
    padding: 8px 16px 8px 0;
    box-sizing: border-box;
  }

  ha-textfield,
  ha-select {
    width: 100%;
  }

  ha-formfield {
    display: flex;
    align-items: center;
  }

  ha-switch {
    --mdc-theme-secondary: var(--switch-checked-color, var(--primary-color));
  }
`, DEFAULT_CONFIG = {
  image_url: "",
  display_time: 15,
  crossfade_time: 3,
  image_fit: "contain",
  image_list_update_interval: 3600,
  image_order: "sorted",
  show_debug: !1,
  sensor_update_delay: 500,
  device_name: "",
  show_date: !0,
  show_time: !0,
  show_weather: !0,
  show_aqi: !0,
  weather_entity: "",
  aqi_entity: "",
  light_sensor_entity: "",
  brightness_sensor_entity: "",
  brightness_control_entity: ""
}, IMAGE_SOURCE_PATTERNS = {
  MEDIA_SOURCE: /^media-source:\/\//,
  UNSPLASH_API: /^https:\/\/api\.unsplash/,
  IMMICH_API: /^immich\+/,
  PICSUM: /picsum\.photos/
};

let BackgroundRotator = class BackgroundRotator extends i {
  constructor() {
    super(...arguments), this.screenWidth = 0, this.screenHeight = 0, this.showDebugInfo = !1, 
    this._currentImageIndex = -1, this._imageList = [], this._imageA = "", this._imageB = "", 
    this._activeImage = "A", this._preloadedImage = "", this._error = null, this._isTransitioning = !1, 
    this._debugInfo = {};
  }
  connectedCallback() {
    super.connectedCallback(), this._startImageRotation(), this._startImageListUpdates();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._clearTimers();
  }
  _clearTimers() {
    this._imageUpdateInterval && clearInterval(this._imageUpdateInterval), this._imageListUpdateInterval && clearInterval(this._imageListUpdateInterval);
  }
  _startImageListUpdates() {
    this._updateImageList(), this._imageListUpdateInterval = window.setInterval(() => {
      this._updateImageList();
    }, 1e3 * (this.config.image_list_update_interval ?? 3600));
  }
  _startImageRotation() {
    this._updateImage(), this._imageUpdateInterval = window.setInterval(() => {
      this._updateImage();
    }, 1e3 * (this.config.display_time ?? 15));
  }
  _getImageSourceType() {
    const {image_url: image_url} = this.config;
    return IMAGE_SOURCE_PATTERNS.MEDIA_SOURCE.test(image_url) ? "media-source" : IMAGE_SOURCE_PATTERNS.UNSPLASH_API.test(image_url) ? "unsplash-api" : IMAGE_SOURCE_PATTERNS.IMMICH_API.test(image_url) ? "immich-api" : IMAGE_SOURCE_PATTERNS.PICSUM.test(image_url) ? "picsum" : "url";
  }
  _getImageUrl() {
    const timestamp_ms = Date.now(), timestamp = Math.floor(timestamp_ms / 1e3);
    return this.config.image_url.replace(/\${width}/g, String(this.screenWidth)).replace(/\${height}/g, String(this.screenHeight)).replace(/\${timestamp_ms}/g, String(timestamp_ms)).replace(/\${timestamp}/g, String(timestamp));
  }
  async _updateImageList() {
    if (!this.screenWidth || !this.screenHeight) return this._error = "Screen dimensions not set", 
    void this.requestUpdate();
    try {
      const newImageList = await this._fetchImageList();
      this._imageList = "random" === this.config.image_order ? newImageList.sort(() => .5 - Math.random()) : newImageList.sort(), 
      -1 === this._currentImageIndex && this._imageList.length > 0 && (this._imageA = await this._preloadImage(this._imageList[0]), 
      this._currentImageIndex = 0), this._error = null, this._debugInfo.imageList = this._imageList;
    } catch (error) {
      this._error = `Error updating image list: ${error.message}`;
    }
    this.requestUpdate();
  }
  async _fetchImageList() {
    switch (this._getImageSourceType()) {
     case "media-source":
      return this._getImagesFromMediaSource();

     case "unsplash-api":
      return this._getImagesFromUnsplashAPI();

     case "immich-api":
      return this._getImagesFromImmichAPI();

     default:
      return [ this._getImageUrl() ];
    }
  }
  async _getImagesFromMediaSource() {
    if (!this.hass) return [];
    try {
      const mediaContentId = this.config.image_url.replace(/^media-source:\/\//, ""), result = await this.hass.callWS({
        type: "media_source/browse_media",
        media_content_id: mediaContentId
      });
      return this._extractImagesFromMediaSource(result);
    } catch (error) {
      return console.error("Error fetching media source images:", error), this._error = `Media source error: ${error.message}`, 
      [];
    }
  }
  _extractImagesFromMediaSource(item) {
    const images = [];
    if ("image" === item.media_class && item.media_content_id && images.push(`/media-source/local${item.media_content_id.replace(/^media-source:\/\/media_source\/local/, "")}`), 
    item.children) for (const child of item.children) images.push(...this._extractImagesFromMediaSource(child));
    return images;
  }
  async _getImagesFromUnsplashAPI() {
    try {
      const response = await fetch(this.config.image_url);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      return Array.isArray(data) ? data.map(img => img.urls?.raw ?? "").filter(Boolean) : [ data.urls?.raw ?? this.config.image_url ];
    } catch (error) {
      return console.error("Error fetching Unsplash images:", error), [ this._getImageUrl() ];
    }
  }
  async _getImagesFromImmichAPI() {
    try {
      const url = this.config.image_url.replace(/^immich\+/, ""), response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      return Array.isArray(data) ? data.map(img => img.thumbnailUrl ?? "").filter(Boolean) : [];
    } catch (error) {
      return console.error("Error fetching Immich images:", error), [];
    }
  }
  _preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image;
      img.onload = () => resolve(url), img.onerror = () => reject(new Error(`Failed to load image: ${url}`)), 
      img.src = url;
    });
  }
  async _updateImage() {
    if (0 !== this._imageList.length && !this._isTransitioning) try {
      const nextIndex = (this._currentImageIndex + 1) % this._imageList.length, nextImageUrl = this._imageList[nextIndex], preloadedUrl = await this._preloadImage(nextImageUrl);
      this._isTransitioning = !0, this._preloadedImage = preloadedUrl, "A" === this._activeImage ? (this._imageB = preloadedUrl, 
      this._activeImage = "B") : (this._imageA = preloadedUrl, this._activeImage = "A"), 
      this._currentImageIndex = nextIndex;
      const crossfadeTime = 1e3 * (this.config.crossfade_time ?? 3) + 50;
      setTimeout(() => {
        this._isTransitioning = !1, this.requestUpdate();
      }, crossfadeTime), this.requestUpdate();
    } catch (error) {
      console.error("Error updating image:", error), this._error = `Image load error: ${error.message}`;
    }
  }
  render() {
    const imageFit = this.config.image_fit ?? "contain";
    return b`
      <div class="background-container">
        <div
          class="background-image"
          style="
            background-image: url('${this._imageA}');
            background-size: ${imageFit};
            opacity: ${"A" === this._activeImage ? 1 : 0};
          "
        ></div>
        <div
          class="background-image"
          style="
            background-image: url('${this._imageB}');
            background-size: ${imageFit};
            opacity: ${"B" === this._activeImage ? 1 : 0};
          "
        ></div>
      </div>
      ${this._error ? b`<div class="error">${this._error}</div>` : A}
      ${this.showDebugInfo ? this._renderDebugInfo() : A}
    `;
  }
  _renderDebugInfo() {
    return b`
      <div class="debug-info">
        <h2>Background Rotator Debug Info</h2>
        <p><strong>Screen Width:</strong> ${this.screenWidth}</p>
        <p><strong>Screen Height:</strong> ${this.screenHeight}</p>
        <p><strong>Device Pixel Ratio:</strong> ${window.devicePixelRatio || 1}</p>
        <p><strong>Image A:</strong> ${this._imageA}</p>
        <p><strong>Image B:</strong> ${this._imageB}</p>
        <p><strong>Active Image:</strong> ${this._activeImage}</p>
        <p><strong>Preloaded Image:</strong> ${this._preloadedImage}</p>
        <p><strong>Is Transitioning:</strong> ${this._isTransitioning}</p>
        <p><strong>Current Image Index:</strong> ${this._currentImageIndex}</p>
        <p><strong>Error:</strong> ${this._error ?? "None"}</p>
        <h3>Image List:</h3>
        <pre>${JSON.stringify(this._imageList, null, 2)}</pre>
        <h3>Config:</h3>
        <pre>${JSON.stringify(this.config, null, 2)}</pre>
      </div>
    `;
  }
};

BackgroundRotator.styles = [ sharedStyles, i$3`
      .background-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
      }

      .background-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-position: center;
        background-repeat: no-repeat;
        transition: opacity var(--crossfade-time) ease;
      }
    ` ], __decorate([ n({
  attribute: !1
}) ], BackgroundRotator.prototype, "hass", void 0), __decorate([ n({
  attribute: !1
}) ], BackgroundRotator.prototype, "config", void 0), __decorate([ n({
  type: Number
}) ], BackgroundRotator.prototype, "screenWidth", void 0), __decorate([ n({
  type: Number
}) ], BackgroundRotator.prototype, "screenHeight", void 0), __decorate([ n({
  type: Boolean
}) ], BackgroundRotator.prototype, "showDebugInfo", void 0), __decorate([ r() ], BackgroundRotator.prototype, "_currentImageIndex", void 0), 
__decorate([ r() ], BackgroundRotator.prototype, "_imageList", void 0), __decorate([ r() ], BackgroundRotator.prototype, "_imageA", void 0), 
__decorate([ r() ], BackgroundRotator.prototype, "_imageB", void 0), __decorate([ r() ], BackgroundRotator.prototype, "_activeImage", void 0), 
__decorate([ r() ], BackgroundRotator.prototype, "_preloadedImage", void 0), __decorate([ r() ], BackgroundRotator.prototype, "_error", void 0), 
__decorate([ r() ], BackgroundRotator.prototype, "_isTransitioning", void 0), BackgroundRotator = __decorate([ t("background-rotator") ], BackgroundRotator);

const WEATHER_ICONS = {
  "clear-night": "clear-night",
  cloudy: "cloudy",
  exceptional: "exceptional",
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
  "windy-variant": "wind"
}, AQI_THRESHOLDS = [ {
  max: 50,
  color: "#00e400",
  label: "Good"
}, {
  max: 100,
  color: "#ffff00",
  label: "Moderate"
}, {
  max: 150,
  color: "#f47c06",
  label: "Unhealthy for Sensitive Groups"
}, {
  max: 200,
  color: "#c43828",
  label: "Unhealthy"
}, {
  max: 300,
  color: "#ab1457",
  label: "Very Unhealthy"
}, {
  max: 1 / 0,
  color: "#83104c",
  label: "Hazardous"
} ];

let WeatherClock = class WeatherClock extends i {
  constructor() {
    super(...arguments), this._date = "", this._time = "", this._temperature = "", this._weatherIcon = "clear-day", 
    this._aqi = null, this._error = null;
  }
  connectedCallback() {
    super.connectedCallback(), this._updateTime(), this._timeUpdateInterval = window.setInterval(() => {
      this._updateTime();
    }, 1e3);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._timeUpdateInterval && clearInterval(this._timeUpdateInterval);
  }
  updated(changedProperties) {
    changedProperties.has("hass") && this.hass && (this._updateWeather(), this._updateAqi());
  }
  _updateTime() {
    const now = new Date;
    this._date = now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric"
    }), this._time = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: !0
    }).replace(/\s?(AM|PM)$/i, ""), this.requestUpdate();
  }
  _updateWeather() {
    if (!this.hass || !this.config.weather_entity) return;
    const weatherState = this.hass.states[this.config.weather_entity];
    if (!weatherState) return void (this._error = `Weather entity not found: ${this.config.weather_entity}`);
    const attrs = weatherState.attributes, temp = attrs.temperature, unit = attrs.temperature_unit || "°";
    void 0 !== temp && (this._temperature = `${Math.round(temp)}${unit}`);
    const condition = weatherState.state;
    this._weatherIcon = WEATHER_ICONS[condition] || "clear-day", this._error = null;
  }
  _updateAqi() {
    if (!this.hass || !this.config.aqi_entity) return void (this._aqi = null);
    const aqiState = this.hass.states[this.config.aqi_entity];
    if (!aqiState) return void (this._aqi = null);
    const aqiValue = parseFloat(aqiState.state);
    isNaN(aqiValue) ? this._aqi = null : this._aqi = String(Math.round(aqiValue));
  }
  _getAqiColor(aqi) {
    if (!aqi) return "transparent";
    const aqiNum = parseFloat(aqi);
    if (isNaN(aqiNum)) return "transparent";
    for (const threshold of AQI_THRESHOLDS) if (aqiNum <= threshold.max) return threshold.color;
    return AQI_THRESHOLDS[AQI_THRESHOLDS.length - 1].color;
  }
  render() {
    const hasValidAqi = null !== this._aqi && !1 !== this.config.show_aqi && !isNaN(parseFloat(this._aqi));
    return b`
      <div class="weather-component">
        <div class="top-row">
          <div class="left-column">
            ${!1 !== this.config.show_date ? b`<div class="date">${this._date}</div>` : A}
            ${!1 !== this.config.show_time ? b`<div class="time">${this._time}</div>` : A}
          </div>

          ${!1 !== this.config.show_weather ? b`
                <div class="weather-section">
                  <div class="weather-info">
                    <img
                      src="https://basmilius.github.io/weather-icons/production/fill/all/${this._weatherIcon}.svg"
                      class="weather-icon"
                      alt="Weather icon"
                      @error=${this._handleIconError}
                    />
                    <span class="temperature">${this._temperature}</span>
                  </div>
                  ${hasValidAqi ? b`
                        <div class="aqi" style="background-color: ${this._getAqiColor(this._aqi)}">
                          ${this._aqi} AQI
                        </div>
                      ` : A}
                </div>
              ` : A}
        </div>
        ${this._error ? b`<div class="error">${this._error}</div>` : A}
      </div>
    `;
  }
  _handleIconError(e) {
    const img = e.target;
    img.src = "https://cdn.jsdelivr.net/gh/basmilius/weather-icons@master/production/fill/all/not-available.svg", 
    img.onerror = null;
  }
};

WeatherClock.styles = [ sharedStyles, i$3`
      .weather-component {
        position: absolute;
        bottom: 40px;
        left: 40px;
        z-index: 2;
        pointer-events: none;
      }

      .top-row {
        display: flex;
        justify-content: flex-start;
        align-items: flex-end;
        gap: 30px;
      }

      .left-column {
        display: flex;
        flex-direction: column;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
      }

      .date {
        font-size: 24px;
        color: white;
        font-weight: 400;
      }

      .time {
        font-size: 100px;
        color: white;
        font-weight: 400;
        line-height: 1;
        margin-top: -5px;
      }

      .weather-section {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .weather-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .weather-icon {
        width: 64px;
        height: 64px;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
      }

      .temperature {
        font-size: 48px;
        color: white;
        font-weight: 400;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
      }

      .aqi {
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 14px;
        font-weight: 500;
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }
    ` ], __decorate([ n({
  attribute: !1
}) ], WeatherClock.prototype, "hass", void 0), __decorate([ n({
  attribute: !1
}) ], WeatherClock.prototype, "config", void 0), __decorate([ r() ], WeatherClock.prototype, "_date", void 0), 
__decorate([ r() ], WeatherClock.prototype, "_time", void 0), __decorate([ r() ], WeatherClock.prototype, "_temperature", void 0), 
__decorate([ r() ], WeatherClock.prototype, "_weatherIcon", void 0), __decorate([ r() ], WeatherClock.prototype, "_aqi", void 0), 
__decorate([ r() ], WeatherClock.prototype, "_error", void 0), WeatherClock = __decorate([ t("weather-clock") ], WeatherClock);

let Controls = class Controls extends i {
  constructor() {
    super(...arguments), this.showOverlay = !1, this.isOverlayVisible = !1, this.isOverlayTransitioning = !1, 
    this.showBrightnessCard = !1, this.isBrightnessCardVisible = !1, this.isBrightnessCardTransitioning = !1, 
    this.brightness = 128, this.visualBrightness = 128, this.isAdjustingBrightness = !1, 
    this._hasUserSetBrightness = !1;
  }
  _handleSettingsLongPressStart() {
    this._longPressTimer = window.setTimeout(() => {
      this.dispatchEvent(new CustomEvent("debugToggle", {
        detail: !0,
        bubbles: !0,
        composed: !0
      }));
    }, 1e3);
  }
  _handleSettingsLongPressEnd() {
    this._longPressTimer && (clearTimeout(this._longPressTimer), this._longPressTimer = void 0);
  }
  _handleBrightnessInteraction(e) {
    const rect = e.currentTarget.getBoundingClientRect(), clientX = e instanceof TouchEvent ? e.touches[0]?.clientX || e.changedTouches[0]?.clientX : e.clientX;
    if (void 0 === clientX) return;
    const percentage = Math.max(0, Math.min(clientX - rect.left, rect.width)) / rect.width, dotValue = Math.round(10 * percentage), newBrightness = Math.round(25.5 * dotValue);
    this._userSetBrightness = newBrightness, this._hasUserSetBrightness = !0, this._updateBrightnessValue(newBrightness);
  }
  _updateBrightnessValue(value) {
    const brightness = Math.max(1, Math.min(255, Math.round(value)));
    this.visualBrightness = brightness, this.hass && this.config.brightness_control_entity && this.hass.callService("number", "set_value", {
      entity_id: this.config.brightness_control_entity,
      value: brightness
    }).catch(err => {
      console.error("Error updating brightness:", err);
    }), this.dispatchEvent(new CustomEvent("brightnessChange", {
      detail: brightness,
      bubbles: !0,
      composed: !0
    })), this.dispatchEvent(new CustomEvent("brightnessChangeComplete", {
      detail: brightness,
      bubbles: !0,
      composed: !0
    })), this.requestUpdate();
  }
  _getBrightnessDisplayValue() {
    return Math.round(this.visualBrightness / 25.5);
  }
  _toggleBrightnessCard(e) {
    e && e.stopPropagation(), this.dispatchEvent(new CustomEvent("brightnessCardToggle", {
      detail: !this.showBrightnessCard,
      bubbles: !0,
      composed: !0
    }));
  }
  render() {
    return b`
      <div class="controls-container">
        ${this.showOverlay ? this._renderOverlay() : A}
        ${this.showBrightnessCard ? this._renderBrightnessCard() : A}
      </div>
    `;
  }
  _renderOverlay() {
    const overlayClasses = [ "overlay", this.isOverlayTransitioning ? "transitioning" : "", this.isOverlayVisible ? "visible" : "" ].filter(Boolean).join(" ");
    return b`
      <div class="${overlayClasses}">
        <div class="overlay-content">
          <div
            class="control-item"
            @click=${this._toggleBrightnessCard}
            @touchstart=${this._toggleBrightnessCard}
          >
            <iconify-icon
              class="control-icon"
              icon="mdi:brightness-6"
            ></iconify-icon>
            <span class="control-label">Brightness</span>
          </div>
          <div
            class="control-item"
            @mousedown=${this._handleSettingsLongPressStart}
            @mouseup=${this._handleSettingsLongPressEnd}
            @mouseleave=${this._handleSettingsLongPressEnd}
            @touchstart=${this._handleSettingsLongPressStart}
            @touchend=${this._handleSettingsLongPressEnd}
            @touchcancel=${this._handleSettingsLongPressEnd}
          >
            <iconify-icon
              class="control-icon"
              icon="mdi:cog"
            ></iconify-icon>
            <span class="control-label">Settings</span>
          </div>
        </div>
      </div>
    `;
  }
  _renderBrightnessCard() {
    const brightnessClasses = [ "brightness-card", this.isBrightnessCardTransitioning ? "transitioning" : "", this.isBrightnessCardVisible ? "visible" : "" ].filter(Boolean).join(" "), displayValue = this._getBrightnessDisplayValue();
    return b`
      <div class="${brightnessClasses}">
        <div class="brightness-header">
          <iconify-icon
            class="brightness-icon"
            icon="mdi:brightness-6"
          ></iconify-icon>
          <span class="brightness-title">Display Brightness</span>
        </div>
        <div
          class="brightness-dots"
          @click=${this._handleBrightnessInteraction}
          @touchstart=${this._handleBrightnessInteraction}
          @touchmove=${this._handleBrightnessInteraction}
        >
          ${Array.from({
      length: 11
    }, (_, i) => b`
              <div class="brightness-dot ${i <= displayValue ? "active" : ""}"></div>
            `)}
        </div>
        <div class="brightness-value">${displayValue}/10</div>
      </div>
    `;
  }
};

Controls.styles = [ sharedStyles, i$3`
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
        pointer-events: auto;
        touch-action: none;
      }

      .overlay.transitioning {
        transition: transform 0.3s ease-out, opacity 0.3s ease-out;
      }

      .overlay.visible {
        transform: translateY(0);
        opacity: 1;
      }

      .overlay-content {
        display: flex;
        justify-content: space-around;
        align-items: center;
        height: 100%;
        padding: 0 20px;
      }

      .control-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 10px;
        border-radius: 12px;
        transition: background-color 0.2s ease;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
      }

      .control-item:active {
        background-color: rgba(0, 0, 0, 0.1);
      }

      .control-icon {
        width: 32px;
        height: 32px;
        color: var(--control-text-color);
      }

      .control-label {
        font-size: 12px;
        color: var(--control-text-color);
      }

      .brightness-card {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(calc(100% + 40px));
        width: 90%;
        max-width: 400px;
        background-color: var(--overlay-background);
        -webkit-backdrop-filter: blur(var(--background-blur));
        backdrop-filter: blur(var(--background-blur));
        border-radius: 20px;
        padding: 24px;
        box-sizing: border-box;
        opacity: 0;
        transition: none;
        z-index: 1002;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        pointer-events: auto;
        touch-action: none;
      }

      .brightness-card.transitioning {
        transition: transform 0.3s ease-out, opacity 0.3s ease-out;
      }

      .brightness-card.visible {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }

      .brightness-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
      }

      .brightness-icon {
        width: 24px;
        height: 24px;
        color: var(--control-text-color);
      }

      .brightness-title {
        font-size: 18px;
        font-weight: 500;
        color: var(--control-text-color);
      }

      .brightness-dots {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        touch-action: none;
        cursor: pointer;
      }

      .brightness-dot {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: var(--brightness-dot-color);
        transition: background-color 0.2s ease, transform 0.1s ease;
      }

      .brightness-dot.active {
        background-color: var(--brightness-dot-active);
      }

      .brightness-dot:active {
        transform: scale(1.2);
      }

      .brightness-value {
        text-align: center;
        margin-top: 12px;
        font-size: 14px;
        color: var(--control-text-color);
        opacity: 0.7;
      }
    ` ], __decorate([ n({
  attribute: !1
}) ], Controls.prototype, "hass", void 0), __decorate([ n({
  attribute: !1
}) ], Controls.prototype, "config", void 0), __decorate([ n({
  type: Boolean
}) ], Controls.prototype, "showOverlay", void 0), __decorate([ n({
  type: Boolean
}) ], Controls.prototype, "isOverlayVisible", void 0), __decorate([ n({
  type: Boolean
}) ], Controls.prototype, "isOverlayTransitioning", void 0), __decorate([ n({
  type: Boolean
}) ], Controls.prototype, "showBrightnessCard", void 0), __decorate([ n({
  type: Boolean
}) ], Controls.prototype, "isBrightnessCardVisible", void 0), __decorate([ n({
  type: Boolean
}) ], Controls.prototype, "isBrightnessCardTransitioning", void 0), __decorate([ n({
  type: Number
}) ], Controls.prototype, "brightness", void 0), __decorate([ n({
  type: Number
}) ], Controls.prototype, "visualBrightness", void 0), __decorate([ n({
  type: Boolean
}) ], Controls.prototype, "isAdjustingBrightness", void 0), __decorate([ r() ], Controls.prototype, "_longPressTimer", void 0), 
__decorate([ r() ], Controls.prototype, "_userSetBrightness", void 0), __decorate([ r() ], Controls.prototype, "_hasUserSetBrightness", void 0), 
Controls = __decorate([ t("google-controls") ], Controls);

let NightMode = class NightMode extends i {
  constructor() {
    super(...arguments), this.currentTime = "", this.brightness = 0, this.isInNightMode = !1, 
    this.previousBrightness = 128, this.nightModeSource = null, this._isTransitioning = !1, 
    this._error = null, this._animationActive = !1;
  }
  connectedCallback() {
    super.connectedCallback(), this._updateTime(), this._timeUpdateInterval = window.setInterval(() => {
      this._updateTime();
    }, 1e3), this._animationActive = !0, setTimeout(() => {
      this._animationActive = !1;
    }, 300);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._timeUpdateInterval && clearInterval(this._timeUpdateInterval);
  }
  _updateTime() {
    const now = new Date;
    this.currentTime = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: !0
    }).replace(/\s?(AM|PM)$/i, ""), this.requestUpdate();
  }
  _handleTap() {
    this.dispatchEvent(new CustomEvent("nightModeExit", {
      bubbles: !0,
      composed: !0
    }));
  }
  render() {
    const nightModeClasses = [ "night-mode", this._animationActive ? "animate-entry" : "" ].filter(Boolean).join(" ");
    return b`
      <div
        class="${nightModeClasses}"
        @click=${this._handleTap}
        @touchstart=${this._handleTap}
      >
        <div class="night-time">${this.currentTime}</div>
        <div class="night-hint">Tap to wake</div>
      </div>
    `;
  }
};

NightMode.styles = [ sharedStyles, i$3`
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
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .night-mode.animate-entry {
        animation: slideInFromLeft 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }

      @keyframes slideInFromLeft {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(0);
        }
      }

      .night-time {
        color: white;
        font-size: 35vw;
        font-weight: 400;
        font-family: 'Product Sans Regular', sans-serif;
      }

      .night-hint {
        position: absolute;
        bottom: 40px;
        color: rgba(255, 255, 255, 0.3);
        font-size: 14px;
        font-weight: 400;
      }
    ` ], __decorate([ n({
  attribute: !1
}) ], NightMode.prototype, "hass", void 0), __decorate([ n({
  attribute: !1
}) ], NightMode.prototype, "config", void 0), __decorate([ n({
  type: String
}) ], NightMode.prototype, "currentTime", void 0), __decorate([ n({
  type: Number
}) ], NightMode.prototype, "brightness", void 0), __decorate([ n({
  type: Boolean
}) ], NightMode.prototype, "isInNightMode", void 0), __decorate([ n({
  type: Number
}) ], NightMode.prototype, "previousBrightness", void 0), __decorate([ n({
  type: String
}) ], NightMode.prototype, "nightModeSource", void 0), __decorate([ r() ], NightMode.prototype, "_isTransitioning", void 0), 
__decorate([ r() ], NightMode.prototype, "_error", void 0), __decorate([ r() ], NightMode.prototype, "_animationActive", void 0), 
NightMode = __decorate([ t("night-mode") ], NightMode);

function getConfigForm() {
  return {
    schema: [ {
      type: "expandable",
      name: "image_settings",
      title: "Image Settings",
      icon: "mdi:image",
      schema: [ {
        name: "image_url",
        required: !0,
        selector: {
          text: {
            type: "url"
          }
        }
      }, {
        type: "grid",
        name: "",
        schema: [ {
          name: "display_time",
          selector: {
            number: {
              min: 1,
              max: 300,
              step: 1,
              mode: "box",
              unit_of_measurement: "seconds"
            }
          }
        }, {
          name: "crossfade_time",
          selector: {
            number: {
              min: 0,
              max: 30,
              step: .5,
              mode: "box",
              unit_of_measurement: "seconds"
            }
          }
        } ]
      }, {
        type: "grid",
        name: "",
        schema: [ {
          name: "image_fit",
          selector: {
            select: {
              options: [ {
                value: "contain",
                label: "Contain"
              }, {
                value: "cover",
                label: "Cover"
              }, {
                value: "fill",
                label: "Fill"
              }, {
                value: "none",
                label: "None"
              }, {
                value: "scale-down",
                label: "Scale Down"
              } ],
              mode: "dropdown"
            }
          }
        }, {
          name: "image_order",
          selector: {
            select: {
              options: [ {
                value: "sorted",
                label: "Sorted"
              }, {
                value: "random",
                label: "Random"
              } ],
              mode: "dropdown"
            }
          }
        } ]
      }, {
        name: "image_list_update_interval",
        selector: {
          number: {
            min: 60,
            max: 86400,
            step: 60,
            mode: "box",
            unit_of_measurement: "seconds"
          }
        }
      } ]
    }, {
      type: "expandable",
      name: "display_settings",
      title: "Display Settings",
      icon: "mdi:monitor",
      schema: [ {
        type: "grid",
        name: "",
        schema: [ {
          name: "show_date",
          selector: {
            boolean: {}
          }
        }, {
          name: "show_time",
          selector: {
            boolean: {}
          }
        } ]
      }, {
        type: "grid",
        name: "",
        schema: [ {
          name: "show_weather",
          selector: {
            boolean: {}
          }
        }, {
          name: "show_aqi",
          selector: {
            boolean: {}
          }
        } ]
      } ]
    }, {
      type: "expandable",
      name: "entity_settings",
      title: "Entity Configuration",
      icon: "mdi:home-assistant",
      schema: [ {
        name: "weather_entity",
        selector: {
          entity: {
            domain: "weather"
          }
        }
      }, {
        name: "aqi_entity",
        selector: {
          entity: {
            domain: "sensor",
            device_class: "aqi"
          }
        }
      }, {
        name: "light_sensor_entity",
        selector: {
          entity: {
            domain: "sensor",
            device_class: "illuminance"
          }
        }
      }, {
        name: "brightness_sensor_entity",
        selector: {
          entity: {
            domain: "sensor"
          }
        }
      }, {
        name: "brightness_control_entity",
        selector: {
          entity: {
            domain: [ "number", "input_number" ]
          }
        }
      } ]
    }, {
      type: "expandable",
      name: "device_settings",
      title: "Device Settings",
      icon: "mdi:tablet",
      schema: [ {
        name: "device_name",
        selector: {
          text: {}
        }
      }, {
        name: "sensor_update_delay",
        selector: {
          number: {
            min: 100,
            max: 5e3,
            step: 100,
            mode: "box",
            unit_of_measurement: "ms"
          }
        }
      } ]
    }, {
      type: "expandable",
      name: "debug_settings",
      title: "Debug Settings",
      icon: "mdi:bug",
      schema: [ {
        name: "show_debug",
        selector: {
          boolean: {}
        }
      } ]
    } ],
    computeLabel: schema => ({
      image_url: "Image URL",
      display_time: "Display Time",
      crossfade_time: "Crossfade Time",
      image_fit: "Image Fit",
      image_order: "Image Order",
      image_list_update_interval: "Image List Update Interval",
      show_date: "Show Date",
      show_time: "Show Time",
      show_weather: "Show Weather",
      show_aqi: "Show AQI",
      weather_entity: "Weather Entity",
      aqi_entity: "AQI Entity",
      light_sensor_entity: "Light Sensor Entity",
      brightness_sensor_entity: "Brightness Sensor Entity",
      brightness_control_entity: "Brightness Control Entity",
      device_name: "Device Name",
      sensor_update_delay: "Sensor Update Delay",
      show_debug: "Show Debug Info"
    }[schema.name] ?? void 0),
    computeHelper: schema => ({
      image_url: "URL or media source path for images. Supports: direct URL, media-source://, Unsplash API, Immich API, Picsum",
      display_time: "How long each image is displayed before transitioning",
      crossfade_time: "Duration of the crossfade animation between images",
      image_fit: "How images are fitted within the display area",
      image_order: "Order in which images are displayed",
      image_list_update_interval: "How often to refresh the image list from the source",
      weather_entity: "Weather entity to display temperature and conditions",
      aqi_entity: "Air quality index sensor entity",
      light_sensor_entity: "Light sensor used for automatic night mode detection",
      brightness_sensor_entity: "Sensor showing current display brightness",
      brightness_control_entity: "Entity to control display brightness (number or input_number)",
      device_name: "Device identifier for notifications (e.g., mobile_app_device_name)",
      sensor_update_delay: "Delay before reading sensor values after changes",
      show_debug: "Enable to show debug information overlay (also accessible via long-press on settings icon)"
    }[schema.name] ?? void 0),
    assertConfig: config => {
      const cfg = config;
      if (void 0 !== cfg.display_time && (cfg.display_time < 1 || cfg.display_time > 300)) throw new Error("Display time must be between 1 and 300 seconds");
      if (void 0 !== cfg.crossfade_time && (cfg.crossfade_time < 0 || cfg.crossfade_time > 30)) throw new Error("Crossfade time must be between 0 and 30 seconds");
    }
  };
}

let GoogleCardEditor = class GoogleCardEditor extends i {
  setConfig(config) {
    this._config = {
      ...DEFAULT_CONFIG,
      ...config
    };
  }
  _validate(key, value) {
    switch (key) {
     case "display_time":
     case "crossfade_time":
      return Math.max(1, parseInt(String(value)) || DEFAULT_CONFIG[key]);

     case "image_list_update_interval":
      return Math.max(60, parseInt(String(value)) || DEFAULT_CONFIG[key]);

     default:
      return value;
    }
  }
  _valueChanged(ev) {
    if (!this._config || !this.hass) return;
    const target = ev.target, key = target.configValue;
    if (!key) return;
    let value;
    if (value = "checkbox" === target.type || "HA-SWITCH" === target.tagName ? target.checked : "number" === target.type || [ "display_time", "crossfade_time", "image_list_update_interval", "sensor_update_delay" ].includes(key) ? this._validate(key, target.value) : target.value, 
    "" === value || void 0 === value) {
      const newConfig = {
        ...this._config
      };
      delete newConfig[key], this._config = newConfig;
    } else this._config = {
      ...this._config,
      [key]: value
    };
    ((node, type, detail = {}, options = {}) => {
      const event = new CustomEvent(type, {
        bubbles: options.bubbles ?? !0,
        cancelable: options.cancelable ?? !1,
        composed: options.composed ?? !0,
        detail: detail
      });
      node.dispatchEvent(event);
    })(this, "config-changed", {
      config: this._config
    });
  }
  render() {
    return this.hass && this._config ? b`
      <div class="form-container">
        <div class="card">
          <div class="card-header">Google Card Configuration</div>
          <p class="input-desc">
            This card uses the built-in Home Assistant form editor.
            If you see this message, the form editor is loading...
          </p>
        </div>
      </div>
    ` : b`<div>Loading...</div>`;
  }
};

GoogleCardEditor.styles = editorStyles, GoogleCardEditor.getConfigForm = getConfigForm, 
__decorate([ n({
  attribute: !1
}) ], GoogleCardEditor.prototype, "hass", void 0), __decorate([ r() ], GoogleCardEditor.prototype, "_config", void 0), 
GoogleCardEditor = __decorate([ t("google-card-editor") ], GoogleCardEditor);

let GoogleCard = class GoogleCard extends i {
  static async getConfigElement() {
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
      weather_entity: "",
      aqi_entity: "",
      device_name: "",
      light_sensor_entity: "",
      brightness_sensor_entity: "",
      brightness_control_entity: ""
    };
  }
  constructor() {
    super(), this._screenWidth = 0, this._screenHeight = 0, this._showDebugInfo = !1, 
    this._showOverlay = !1, this._isOverlayVisible = !1, this._isOverlayTransitioning = !1, 
    this._brightness = 128, this._visualBrightness = 128, this._showBrightnessCard = !1, 
    this._isBrightnessCardVisible = !1, this._isBrightnessCardTransitioning = !1, this._isNightMode = !1, 
    this._currentTime = "", this._isInNightMode = !1, this._previousBrightness = 128, 
    this._isAdjustingBrightness = !1, this._lastBrightnessUpdateTime = 0, this._touchStartY = 0, 
    this._touchStartX = 0, this._touchStartTime = 0, this._isDarkMode = !1, this._editMode = !1, 
    this._nightModeSource = null, this._boundUpdateScreenSize = this._updateScreenSize.bind(this), 
    this._isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches, this._themeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)"), 
    this._boundHandleThemeChange = this._handleThemeChange.bind(this);
  }
  connectedCallback() {
    super.connectedCallback(), this._updateScreenSize(), this._updateTime(), window.addEventListener("resize", this._boundUpdateScreenSize), 
    this._themeMediaQuery?.addEventListener("change", this._boundHandleThemeChange), 
    this._timeUpdateInterval = window.setInterval(() => {
      this._updateTime();
    }, 1e3);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), window.removeEventListener("resize", this._boundUpdateScreenSize), 
    this._themeMediaQuery?.removeEventListener("change", this._boundHandleThemeChange), 
    this._clearTimers();
  }
  _clearTimers() {
    this._overlayDismissTimer && clearTimeout(this._overlayDismissTimer), this._brightnessCardDismissTimer && clearTimeout(this._brightnessCardDismissTimer), 
    this._brightnessStabilizeTimer && clearTimeout(this._brightnessStabilizeTimer), 
    this._timeUpdateInterval && clearInterval(this._timeUpdateInterval), this._nightModeReactivationTimer && clearTimeout(this._nightModeReactivationTimer);
  }
  setConfig(config) {
    if (!config.image_url) throw new Error("Image URL required");
    this._config = {
      ...DEFAULT_CONFIG,
      ...config
    }, this._showDebugInfo = this._config.show_debug ?? !1, this._updateCssVariables();
  }
  getCardSize() {
    return 1;
  }
  getGridOptions() {
    return {
      rows: "full",
      columns: "full"
    };
  }
  _updateScreenSize() {
    this._screenWidth = window.innerWidth, this._screenHeight = window.innerHeight;
  }
  _updateTime() {
    const now = new Date;
    this._currentTime = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: !0
    }).replace(/\s?(AM|PM)$/i, "");
  }
  _handleThemeChange() {
    this._isDarkMode = this._themeMediaQuery?.matches ?? !1, this._updateCssVariables(), 
    this.requestUpdate();
  }
  _updateCssVariables() {
    this._config && (this.style.setProperty("--crossfade-time", `${this._config.crossfade_time ?? 3}s`), 
    this.style.setProperty("--theme-transition", "background-color 0.3s ease, color 0.3s ease"), 
    this.style.setProperty("--theme-background", this._isDarkMode ? "#121212" : "#ffffff"), 
    this.style.setProperty("--theme-text", this._isDarkMode ? "#ffffff" : "#333333"), 
    this.setAttribute("data-theme", this._isDarkMode ? "dark" : "light"));
  }
  _inEditor() {
    return this._editMode || "HUI-CARD-PREVIEW" === this.parentElement?.tagName || this.parentElement?.classList.contains("element-preview") || this.getRootNode() instanceof ShadowRoot && "HUI-CARD-PREVIEW" === this.getRootNode().host?.tagName;
  }
  _handleTouchStart(e) {
    if (this._isNightMode) return;
    const touch = e.touches[0];
    this._touchStartY = touch.clientY, this._touchStartX = touch.clientX, this._touchStartTime = Date.now();
  }
  _handleTouchEnd(e) {
    if (this._isNightMode) return;
    const touch = e.changedTouches[0], deltaY = this._touchStartY - touch.clientY, deltaX = touch.clientX - this._touchStartX, deltaTime = Date.now() - this._touchStartTime;
    deltaY > 50 && Math.abs(deltaX) < 50 && deltaTime < 300 && this._showControlOverlay(), 
    deltaY < -50 && Math.abs(deltaX) < 50 && deltaTime < 300 && this._hideControlOverlay();
  }
  _showControlOverlay() {
    this._showBrightnessCard ? this._dismissBrightnessCard() : this._showOverlay ? this._startOverlayDismissTimer() : (this._showOverlay = !0, 
    this._isOverlayTransitioning = !0, requestAnimationFrame(() => {
      this._isOverlayVisible = !0, this._startOverlayDismissTimer(), this.requestUpdate(), 
      setTimeout(() => {
        this._isOverlayTransitioning = !1, this.requestUpdate();
      }, 300);
    }));
  }
  _hideControlOverlay() {
    this._showOverlay && (this._isOverlayTransitioning = !0, this._isOverlayVisible = !1, 
    setTimeout(() => {
      this._showOverlay = !1, this._isOverlayTransitioning = !1, this.requestUpdate();
    }, 300));
  }
  _startOverlayDismissTimer() {
    this._overlayDismissTimer && clearTimeout(this._overlayDismissTimer), this._overlayDismissTimer = window.setTimeout(() => {
      this._hideControlOverlay();
    }, 1e4);
  }
  _dismissBrightnessCard() {
    this._isBrightnessCardTransitioning = !0, this._isBrightnessCardVisible = !1, setTimeout(() => {
      this._showBrightnessCard = !1, this._isBrightnessCardTransitioning = !1, this.requestUpdate();
    }, 300);
  }
  _startBrightnessCardDismissTimer() {
    this._brightnessCardDismissTimer && clearTimeout(this._brightnessCardDismissTimer), 
    this._brightnessCardDismissTimer = window.setTimeout(() => {
      this._dismissBrightnessCard();
    }, 1e4);
  }
  _handleBrightnessCardToggle(event) {
    const shouldShow = event.detail;
    shouldShow && !this._showBrightnessCard ? (this._showOverlay && (this._isOverlayVisible = !1, 
    this._showOverlay = !1, this._isOverlayTransitioning = !1, this._overlayDismissTimer && clearTimeout(this._overlayDismissTimer)), 
    this._showBrightnessCard = !0, this._isBrightnessCardTransitioning = !0, requestAnimationFrame(() => {
      this._isBrightnessCardVisible = !0, this._startBrightnessCardDismissTimer(), this.requestUpdate(), 
      setTimeout(() => {
        this._isBrightnessCardTransitioning = !1, this.requestUpdate();
      }, 300);
    })) : !shouldShow && this._showBrightnessCard && this._dismissBrightnessCard();
  }
  _handleBrightnessChange(event) {
    const newBrightness = event.detail;
    this._isAdjustingBrightness = !0, this._visualBrightness = newBrightness, this._lastBrightnessUpdateTime = Date.now(), 
    this._startBrightnessCardDismissTimer(), this._brightnessStabilizeTimer && clearTimeout(this._brightnessStabilizeTimer), 
    this._brightnessStabilizeTimer = window.setTimeout(() => {
      this._isAdjustingBrightness = !1, this.requestUpdate();
    }, 2e3), this.requestUpdate();
  }
  _handleBrightnessChangeComplete(event) {
    const newBrightness = event.detail;
    this._brightness = newBrightness, !this._isNightMode && newBrightness > 0 && (this._previousBrightness = newBrightness);
  }
  _handleDebugToggle() {
    this._showDebugInfo = !this._showDebugInfo, this.requestUpdate();
  }
  _handleNightModeExit() {
    this._handleNightModeTransition(!1, "manual");
  }
  _updateNightMode() {
    if (!this.hass || !this._config?.light_sensor_entity) return;
    const lightSensorState = this.hass.states[this._config.light_sensor_entity];
    if (!lightSensorState) return;
    const lightLevel = parseFloat(lightSensorState.state);
    if (isNaN(lightLevel)) return;
    const shouldBeInNightMode = lightLevel <= 1;
    lightLevel <= 10 !== this._isDarkMode && (this._isDarkMode = lightLevel <= 10, this.setAttribute("data-theme", this._isDarkMode ? "dark" : "light"), 
    this._updateCssVariables(), this.requestUpdate()), this._isInNightMode && "manual" === this._nightModeSource || shouldBeInNightMode !== this._isInNightMode && this._handleNightModeTransition(shouldBeInNightMode, "sensor");
  }
  async _handleNightModeTransition(newNightMode, source = "sensor") {
    if (newNightMode !== this._isInNightMode || this._nightModeSource !== source) try {
      const brightnessEntity = this._config?.brightness_control_entity;
      if (!brightnessEntity || !this.hass) return;
      if (newNightMode) {
        if (!this._isInNightMode && this.hass.states[brightnessEntity]) {
          const currentValue = parseFloat(this.hass.states[brightnessEntity].state);
          currentValue > 0 && (this._previousBrightness = currentValue);
        }
        await this.hass.callService("number", "set_value", {
          entity_id: brightnessEntity,
          value: 0
        }), this._nightModeSource = source;
      } else {
        const restoreBrightness = this._previousBrightness > 0 ? this._previousBrightness : 128;
        await this.hass.callService("number", "set_value", {
          entity_id: brightnessEntity,
          value: restoreBrightness
        }), this._nightModeSource = null;
      }
      this._isInNightMode = newNightMode, this._isNightMode = newNightMode, this.requestUpdate();
    } catch (error) {
      this._isInNightMode = !newNightMode, this._isNightMode = !newNightMode, this.requestUpdate();
    }
  }
  updated(changedProperties) {
    if (changedProperties.has("hass") && this.hass && !this._isAdjustingBrightness && !this._inEditor()) {
      const brightnessEntity = this._config?.brightness_control_entity;
      if (brightnessEntity && this.hass.states[brightnessEntity]) {
        const newBrightness = parseFloat(this.hass.states[brightnessEntity].state);
        this._brightness !== newBrightness && (this._brightness = newBrightness, this._visualBrightness = newBrightness, 
        !this._isNightMode && newBrightness > 0 && (this._previousBrightness = newBrightness), 
        this.requestUpdate());
      }
      Date.now() - this._lastBrightnessUpdateTime > 2e3 && this._updateNightMode();
    }
    (changedProperties.has("_isDarkMode") || changedProperties.has("hass")) && this._updateCssVariables();
  }
  render() {
    return this._config ? this._inEditor() ? b`
        <div class="editor-placeholder">
          <h3>Google Card</h3>
          <p>This card displays rotating background images with weather information.</p>
          <p><strong>Image URL:</strong> ${this._config.image_url}</p>
        </div>
      ` : b`
      <div
        class="touch-container"
        @touchstart=${this._handleTouchStart}
        @touchend=${this._handleTouchEnd}
      >
        <div class="content-wrapper">
          ${this._isNightMode ? b`
                <night-mode
                  .hass=${this.hass}
                  .config=${this._config}
                  .currentTime=${this._currentTime}
                  .brightness=${this._brightness}
                  .isInNightMode=${this._isInNightMode}
                  .previousBrightness=${this._previousBrightness}
                  .nightModeSource=${this._nightModeSource}
                  @nightModeExit=${this._handleNightModeExit}
                ></night-mode>
              ` : b`
                <background-rotator
                  .hass=${this.hass}
                  .config=${this._config}
                  .screenWidth=${this._screenWidth}
                  .screenHeight=${this._screenHeight}
                  .showDebugInfo=${this._showDebugInfo}
                ></background-rotator>

                <weather-clock
                  .hass=${this.hass}
                  .config=${this._config}
                ></weather-clock>

                <google-controls
                  .hass=${this.hass}
                  .config=${this._config}
                  .showOverlay=${this._showOverlay}
                  .isOverlayVisible=${this._isOverlayVisible}
                  .isOverlayTransitioning=${this._isOverlayTransitioning}
                  .showBrightnessCard=${this._showBrightnessCard}
                  .isBrightnessCardVisible=${this._isBrightnessCardVisible}
                  .isBrightnessCardTransitioning=${this._isBrightnessCardTransitioning}
                  .brightness=${this._brightness}
                  .visualBrightness=${this._visualBrightness}
                  .isAdjustingBrightness=${this._isAdjustingBrightness}
                  @brightnessCardToggle=${this._handleBrightnessCardToggle}
                  @brightnessChange=${this._handleBrightnessChange}
                  @brightnessChangeComplete=${this._handleBrightnessChangeComplete}
                  @debugToggle=${this._handleDebugToggle}
                ></google-controls>
              `}
        </div>
      </div>
    ` : b`<div class="error">No configuration found</div>`;
  }
};

GoogleCard.styles = [ sharedStyles, i$3`
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

      .editor-placeholder {
        padding: 16px;
        font-family: var(--primary-font-family, Roboto);
        font-size: 14px;
        color: var(--primary-text-color);
        background: var(--card-background-color, #fff);
        border-radius: var(--ha-card-border-radius, 4px);
        box-shadow: var(--ha-card-box-shadow, 0 2px 2px 0 rgba(0, 0, 0, 0.14));
        margin: 8px;
      }
    ` ], GoogleCard.getConfigForm = getConfigForm, __decorate([ n({
  attribute: !1
}) ], GoogleCard.prototype, "hass", void 0), __decorate([ r() ], GoogleCard.prototype, "_config", void 0), 
__decorate([ r() ], GoogleCard.prototype, "_screenWidth", void 0), __decorate([ r() ], GoogleCard.prototype, "_screenHeight", void 0), 
__decorate([ r() ], GoogleCard.prototype, "_showDebugInfo", void 0), __decorate([ r() ], GoogleCard.prototype, "_showOverlay", void 0), 
__decorate([ r() ], GoogleCard.prototype, "_isOverlayVisible", void 0), __decorate([ r() ], GoogleCard.prototype, "_isOverlayTransitioning", void 0), 
__decorate([ r() ], GoogleCard.prototype, "_brightness", void 0), __decorate([ r() ], GoogleCard.prototype, "_visualBrightness", void 0), 
__decorate([ r() ], GoogleCard.prototype, "_showBrightnessCard", void 0), __decorate([ r() ], GoogleCard.prototype, "_isBrightnessCardVisible", void 0), 
__decorate([ r() ], GoogleCard.prototype, "_isBrightnessCardTransitioning", void 0), 
__decorate([ r() ], GoogleCard.prototype, "_isNightMode", void 0), __decorate([ r() ], GoogleCard.prototype, "_currentTime", void 0), 
__decorate([ r() ], GoogleCard.prototype, "_isInNightMode", void 0), __decorate([ r() ], GoogleCard.prototype, "_previousBrightness", void 0), 
__decorate([ r() ], GoogleCard.prototype, "_isAdjustingBrightness", void 0), __decorate([ r() ], GoogleCard.prototype, "_lastBrightnessUpdateTime", void 0), 
__decorate([ r() ], GoogleCard.prototype, "_touchStartY", void 0), __decorate([ r() ], GoogleCard.prototype, "_touchStartX", void 0), 
__decorate([ r() ], GoogleCard.prototype, "_touchStartTime", void 0), __decorate([ r() ], GoogleCard.prototype, "_isDarkMode", void 0), 
__decorate([ r() ], GoogleCard.prototype, "_editMode", void 0), GoogleCard = __decorate([ t("google-card") ], GoogleCard), 
window.customCards = window.customCards || [], window.customCards.push({
  type: "google-card",
  name: "Google Card",
  description: "A card that mimics Google's UI for photo frame displays",
  preview: !0,
  documentationURL: "https://github.com/liamtw22/google-card"
});

export { GoogleCard };
//# sourceMappingURL=google-card.js.map
