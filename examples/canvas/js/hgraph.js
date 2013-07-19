/**
 * @overview A canvas drawing engine for hGraph
 * @copyright Involution Studios 2013 <http://goinvo.com>
 * @license Apache 2.0
 * @author Danny Hadley <danny@goinvo.com>
 * @version 1.0 
 */
(function hGraph( global ) {

var 
  /** @namespace hGraph */
  hGraph = { },
    
  d3 = { },
  
  // private (h) variables
  hRootElement = false,
  hGraphInstances = { },
  hResizeCallbacks = [ ];

/* Copyright (c) 2013, Michael Bostock
 * All rights reserved.
 *   
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *    
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 *   
 * Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * The name Michael Bostock may not be used to endorse or promote products
 * derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
d3.scale = {};

function d3_scaleExtent(domain) {
  var start = domain[0], stop = domain[domain.length - 1];
  return start < stop ? [start, stop] : [stop, start];
}

function d3_scaleRange(scale) {
  return scale.rangeExtent ? scale.rangeExtent() : d3_scaleExtent(scale.range());
}
d3.range = function(start, stop, step) {
  if (arguments.length < 3) {
    step = 1;
    if (arguments.length < 2) {
      stop = start;
      start = 0;
    }
  }
  if ((stop - start) / step === Infinity) throw new Error("infinite range");
  var range = [],
       k = d3_range_integerScale(Math.abs(step)),
       i = -1,
       j;
  start *= k, stop *= k, step *= k;
  if (step < 0) while ((j = start + step * ++i) > stop) range.push(j / k);
  else while ((j = start + step * ++i) < stop) range.push(j / k);
  return range;
};

function d3_range_integerScale(x) {
  var k = 1;
  while (x * k % 1) k *= 10;
  return k;
}
// Copies a variable number of methods from source to target.
d3.rebind = function(target, source) {
  var i = 1, n = arguments.length, method;
  while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
  return target;
};

// Method is assumed to be a standard D3 getter-setter:
// If passed with no arguments, gets the value.
// If passed with arguments, sets the value and returns the target.
function d3_rebind(target, source, method) {
  return function() {
    var value = method.apply(source, arguments);
    return value === source ? target : value;
  };
}
function d3_Color() {}

d3_Color.prototype.toString = function() {
  return this.rgb() + "";
};
function d3_class(ctor, properties) {
  try {
    for (var key in properties) {
      Object.defineProperty(ctor.prototype, key, {
        value: properties[key],
        enumerable: false
      });
    }
  } catch (e) {
    ctor.prototype = properties;
  }
}

d3.map = function(object) {
  var map = new d3_Map;
  for (var key in object) map.set(key, object[key]);
  return map;
};

function d3_Map() {}

d3_class(d3_Map, {
  has: function(key) {
    return d3_map_prefix + key in this;
  },
  get: function(key) {
    return this[d3_map_prefix + key];
  },
  set: function(key, value) {
    return this[d3_map_prefix + key] = value;
  },
  remove: function(key) {
    key = d3_map_prefix + key;
    return key in this && delete this[key];
  },
  keys: function() {
    var keys = [];
    this.forEach(function(key) { keys.push(key); });
    return keys;
  },
  values: function() {
    var values = [];
    this.forEach(function(key, value) { values.push(value); });
    return values;
  },
  entries: function() {
    var entries = [];
    this.forEach(function(key, value) { entries.push({key: key, value: value}); });
    return entries;
  },
  forEach: function(f) {
    for (var key in this) {
      if (key.charCodeAt(0) === d3_map_prefixCode) {
        f.call(this, key.substring(1), this[key]);
      }
    }
  }
});

var d3_map_prefix = "\0", // prevent collision with built-ins
    d3_map_prefixCode = d3_map_prefix.charCodeAt(0);

d3.hsl = function(h, s, l) {
  return arguments.length === 1
      ? (h instanceof d3_Hsl ? d3_hsl(h.h, h.s, h.l)
      : d3_rgb_parse("" + h, d3_rgb_hsl, d3_hsl))
      : d3_hsl(+h, +s, +l);
};

function d3_hsl(h, s, l) {
  return new d3_Hsl(h, s, l);
}

function d3_Hsl(h, s, l) {
  this.h = h;
  this.s = s;
  this.l = l;
}

var d3_hslPrototype = d3_Hsl.prototype = new d3_Color;

d3_hslPrototype.brighter = function(k) {
  k = Math.pow(0.7, arguments.length ? k : 1);
  return d3_hsl(this.h, this.s, this.l / k);
};

d3_hslPrototype.darker = function(k) {
  k = Math.pow(0.7, arguments.length ? k : 1);
  return d3_hsl(this.h, this.s, k * this.l);
};

d3_hslPrototype.rgb = function() {
  return d3_hsl_rgb(this.h, this.s, this.l);
};

function d3_hsl_rgb(h, s, l) {
  var m1,
      m2;

  /* Some simple corrections for h, s and l. */
  h = isNaN(h) ? 0 : (h %= 360) < 0 ? h + 360 : h;
  s = isNaN(s) ? 0 : s < 0 ? 0 : s > 1 ? 1 : s;
  l = l < 0 ? 0 : l > 1 ? 1 : l;

  /* From FvD 13.37, CSS Color Module Level 3 */
  m2 = l <= .5 ? l * (1 + s) : l + s - l * s;
  m1 = 2 * l - m2;

  function v(h) {
    if (h > 360) h -= 360;
    else if (h < 0) h += 360;
    if (h < 60) return m1 + (m2 - m1) * h / 60;
    if (h < 180) return m2;
    if (h < 240) return m1 + (m2 - m1) * (240 - h) / 60;
    return m1;
  }

  function vv(h) {
    return Math.round(v(h) * 255);
  }

  return d3_rgb(vv(h + 120), vv(h), vv(h - 120));
}
var π = Math.PI,
    ε = 1e-6,
    ε2 = ε * ε,
    d3_radians = π / 180,
    d3_degrees = 180 / π;

function d3_sgn(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
}

function d3_acos(x) {
  return x > 1 ? 0 : x < -1 ? π : Math.acos(x);
}

function d3_asin(x) {
  return x > 1 ? π / 2 : x < -1 ? -π / 2 : Math.asin(x);
}

function d3_sinh(x) {
  return (Math.exp(x) - Math.exp(-x)) / 2;
}

function d3_cosh(x) {
  return (Math.exp(x) + Math.exp(-x)) / 2;
}

function d3_haversin(x) {
  return (x = Math.sin(x / 2)) * x;
}

d3.hcl = function(h, c, l) {
  return arguments.length === 1
      ? (h instanceof d3_Hcl ? d3_hcl(h.h, h.c, h.l)
      : (h instanceof d3_Lab ? d3_lab_hcl(h.l, h.a, h.b)
      : d3_lab_hcl((h = d3_rgb_lab((h = d3.rgb(h)).r, h.g, h.b)).l, h.a, h.b)))
      : d3_hcl(+h, +c, +l);
};

function d3_hcl(h, c, l) {
  return new d3_Hcl(h, c, l);
}

function d3_Hcl(h, c, l) {
  this.h = h;
  this.c = c;
  this.l = l;
}

var d3_hclPrototype = d3_Hcl.prototype = new d3_Color;

d3_hclPrototype.brighter = function(k) {
  return d3_hcl(this.h, this.c, Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)));
};

d3_hclPrototype.darker = function(k) {
  return d3_hcl(this.h, this.c, Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)));
};

d3_hclPrototype.rgb = function() {
  return d3_hcl_lab(this.h, this.c, this.l).rgb();
};

function d3_hcl_lab(h, c, l) {
  if (isNaN(h)) h = 0;
  if (isNaN(c)) c = 0;
  return d3_lab(l, Math.cos(h *= d3_radians) * c, Math.sin(h) * c);
}

d3.lab = function(l, a, b) {
  return arguments.length === 1
      ? (l instanceof d3_Lab ? d3_lab(l.l, l.a, l.b)
      : (l instanceof d3_Hcl ? d3_hcl_lab(l.l, l.c, l.h)
      : d3_rgb_lab((l = d3.rgb(l)).r, l.g, l.b)))
      : d3_lab(+l, +a, +b);
};

function d3_lab(l, a, b) {
  return new d3_Lab(l, a, b);
}

function d3_Lab(l, a, b) {
  this.l = l;
  this.a = a;
  this.b = b;
}

// Corresponds roughly to RGB brighter/darker
var d3_lab_K = 18;

// D65 standard referent
var d3_lab_X = 0.950470,
    d3_lab_Y = 1,
    d3_lab_Z = 1.088830;

var d3_labPrototype = d3_Lab.prototype = new d3_Color;

d3_labPrototype.brighter = function(k) {
  return d3_lab(Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
};

d3_labPrototype.darker = function(k) {
  return d3_lab(Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
};

d3_labPrototype.rgb = function() {
  return d3_lab_rgb(this.l, this.a, this.b);
};

function d3_lab_rgb(l, a, b) {
  var y = (l + 16) / 116,
      x = y + a / 500,
      z = y - b / 200;
  x = d3_lab_xyz(x) * d3_lab_X;
  y = d3_lab_xyz(y) * d3_lab_Y;
  z = d3_lab_xyz(z) * d3_lab_Z;
  return d3_rgb(
    d3_xyz_rgb( 3.2404542 * x - 1.5371385 * y - 0.4985314 * z),
    d3_xyz_rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z),
    d3_xyz_rgb( 0.0556434 * x - 0.2040259 * y + 1.0572252 * z)
  );
}

function d3_lab_hcl(l, a, b) {
  return l > 0
      ? d3_hcl(Math.atan2(b, a) * d3_degrees, Math.sqrt(a * a + b * b), l)
      : d3_hcl(NaN, NaN, l);
}

function d3_lab_xyz(x) {
  return x > 0.206893034 ? x * x * x : (x - 4 / 29) / 7.787037;
}
function d3_xyz_lab(x) {
  return x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787037 * x + 4 / 29;
}

function d3_xyz_rgb(r) {
  return Math.round(255 * (r <= 0.00304 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - 0.055));
}

d3.rgb = function(r, g, b) {
  return arguments.length === 1
      ? (r instanceof d3_Rgb ? d3_rgb(r.r, r.g, r.b)
      : d3_rgb_parse("" + r, d3_rgb, d3_hsl_rgb))
      : d3_rgb(~~r, ~~g, ~~b);
};

function d3_rgb(r, g, b) {
  return new d3_Rgb(r, g, b);
}

function d3_Rgb(r, g, b) {
  this.r = r;
  this.g = g;
  this.b = b;
}

var d3_rgbPrototype = d3_Rgb.prototype = new d3_Color;

d3_rgbPrototype.brighter = function(k) {
  k = Math.pow(0.7, arguments.length ? k : 1);
  var r = this.r,
      g = this.g,
      b = this.b,
      i = 30;
  if (!r && !g && !b) return d3_rgb(i, i, i);
  if (r && r < i) r = i;
  if (g && g < i) g = i;
  if (b && b < i) b = i;
  return d3_rgb(
      Math.min(255, Math.floor(r / k)),
      Math.min(255, Math.floor(g / k)),
      Math.min(255, Math.floor(b / k)));
};

d3_rgbPrototype.darker = function(k) {
  k = Math.pow(0.7, arguments.length ? k : 1);
  return d3_rgb(
      Math.floor(k * this.r),
      Math.floor(k * this.g),
      Math.floor(k * this.b));
};

d3_rgbPrototype.hsl = function() {
  return d3_rgb_hsl(this.r, this.g, this.b);
};

d3_rgbPrototype.toString = function() {
  return "#" + d3_rgb_hex(this.r) + d3_rgb_hex(this.g) + d3_rgb_hex(this.b);
};

function d3_rgb_hex(v) {
  return v < 0x10
      ? "0" + Math.max(0, v).toString(16)
      : Math.min(255, v).toString(16);
}

function d3_rgb_parse(format, rgb, hsl) {
  var r = 0, // red channel; int in [0, 255]
      g = 0, // green channel; int in [0, 255]
      b = 0, // blue channel; int in [0, 255]
      m1, // CSS color specification match
      m2, // CSS color specification type (e.g., rgb)
      name;

  /* Handle hsl, rgb. */
  m1 = /([a-z]+)\((.*)\)/i.exec(format);
  if (m1) {
    m2 = m1[2].split(",");
    switch (m1[1]) {
      case "hsl": {
        return hsl(
          parseFloat(m2[0]), // degrees
          parseFloat(m2[1]) / 100, // percentage
          parseFloat(m2[2]) / 100 // percentage
        );
      }
      case "rgb": {
        return rgb(
          d3_rgb_parseNumber(m2[0]),
          d3_rgb_parseNumber(m2[1]),
          d3_rgb_parseNumber(m2[2])
        );
      }
    }
  }

  /* Named colors. */
  if (name = d3_rgb_names.get(format)) return rgb(name.r, name.g, name.b);

  /* Hexadecimal colors: #rgb and #rrggbb. */
  if (format != null && format.charAt(0) === "#") {
    if (format.length === 4) {
      r = format.charAt(1); r += r;
      g = format.charAt(2); g += g;
      b = format.charAt(3); b += b;
    } else if (format.length === 7) {
      r = format.substring(1, 3);
      g = format.substring(3, 5);
      b = format.substring(5, 7);
    }
    r = parseInt(r, 16);
    g = parseInt(g, 16);
    b = parseInt(b, 16);
  }

  return rgb(r, g, b);
}

function d3_rgb_hsl(r, g, b) {
  var min = Math.min(r /= 255, g /= 255, b /= 255),
      max = Math.max(r, g, b),
      d = max - min,
      h,
      s,
      l = (max + min) / 2;
  if (d) {
    s = l < .5 ? d / (max + min) : d / (2 - max - min);
    if (r == max) h = (g - b) / d + (g < b ? 6 : 0);
    else if (g == max) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  } else {
    h = NaN;
    s = l > 0 && l < 1 ? 0 : h;
  }
  return d3_hsl(h, s, l);
}

function d3_rgb_lab(r, g, b) {
  r = d3_rgb_xyz(r);
  g = d3_rgb_xyz(g);
  b = d3_rgb_xyz(b);
  var x = d3_xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / d3_lab_X),
      y = d3_xyz_lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / d3_lab_Y),
      z = d3_xyz_lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / d3_lab_Z);
  return d3_lab(116 * y - 16, 500 * (x - y), 200 * (y - z));
}

function d3_rgb_xyz(r) {
  return (r /= 255) <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
}

function d3_rgb_parseNumber(c) { // either integer or percentage
  var f = parseFloat(c);
  return c.charAt(c.length - 1) === "%" ? Math.round(f * 2.55) : f;
}

var d3_rgb_names = d3.map({
  aliceblue: "#f0f8ff",
  antiquewhite: "#faebd7",
  aqua: "#00ffff",
  aquamarine: "#7fffd4",
  azure: "#f0ffff",
  beige: "#f5f5dc",
  bisque: "#ffe4c4",
  black: "#000000",
  blanchedalmond: "#ffebcd",
  blue: "#0000ff",
  blueviolet: "#8a2be2",
  brown: "#a52a2a",
  burlywood: "#deb887",
  cadetblue: "#5f9ea0",
  chartreuse: "#7fff00",
  chocolate: "#d2691e",
  coral: "#ff7f50",
  cornflowerblue: "#6495ed",
  cornsilk: "#fff8dc",
  crimson: "#dc143c",
  cyan: "#00ffff",
  darkblue: "#00008b",
  darkcyan: "#008b8b",
  darkgoldenrod: "#b8860b",
  darkgray: "#a9a9a9",
  darkgreen: "#006400",
  darkgrey: "#a9a9a9",
  darkkhaki: "#bdb76b",
  darkmagenta: "#8b008b",
  darkolivegreen: "#556b2f",
  darkorange: "#ff8c00",
  darkorchid: "#9932cc",
  darkred: "#8b0000",
  darksalmon: "#e9967a",
  darkseagreen: "#8fbc8f",
  darkslateblue: "#483d8b",
  darkslategray: "#2f4f4f",
  darkslategrey: "#2f4f4f",
  darkturquoise: "#00ced1",
  darkviolet: "#9400d3",
  deeppink: "#ff1493",
  deepskyblue: "#00bfff",
  dimgray: "#696969",
  dimgrey: "#696969",
  dodgerblue: "#1e90ff",
  firebrick: "#b22222",
  floralwhite: "#fffaf0",
  forestgreen: "#228b22",
  fuchsia: "#ff00ff",
  gainsboro: "#dcdcdc",
  ghostwhite: "#f8f8ff",
  gold: "#ffd700",
  goldenrod: "#daa520",
  gray: "#808080",
  green: "#008000",
  greenyellow: "#adff2f",
  grey: "#808080",
  honeydew: "#f0fff0",
  hotpink: "#ff69b4",
  indianred: "#cd5c5c",
  indigo: "#4b0082",
  ivory: "#fffff0",
  khaki: "#f0e68c",
  lavender: "#e6e6fa",
  lavenderblush: "#fff0f5",
  lawngreen: "#7cfc00",
  lemonchiffon: "#fffacd",
  lightblue: "#add8e6",
  lightcoral: "#f08080",
  lightcyan: "#e0ffff",
  lightgoldenrodyellow: "#fafad2",
  lightgray: "#d3d3d3",
  lightgreen: "#90ee90",
  lightgrey: "#d3d3d3",
  lightpink: "#ffb6c1",
  lightsalmon: "#ffa07a",
  lightseagreen: "#20b2aa",
  lightskyblue: "#87cefa",
  lightslategray: "#778899",
  lightslategrey: "#778899",
  lightsteelblue: "#b0c4de",
  lightyellow: "#ffffe0",
  lime: "#00ff00",
  limegreen: "#32cd32",
  linen: "#faf0e6",
  magenta: "#ff00ff",
  maroon: "#800000",
  mediumaquamarine: "#66cdaa",
  mediumblue: "#0000cd",
  mediumorchid: "#ba55d3",
  mediumpurple: "#9370db",
  mediumseagreen: "#3cb371",
  mediumslateblue: "#7b68ee",
  mediumspringgreen: "#00fa9a",
  mediumturquoise: "#48d1cc",
  mediumvioletred: "#c71585",
  midnightblue: "#191970",
  mintcream: "#f5fffa",
  mistyrose: "#ffe4e1",
  moccasin: "#ffe4b5",
  navajowhite: "#ffdead",
  navy: "#000080",
  oldlace: "#fdf5e6",
  olive: "#808000",
  olivedrab: "#6b8e23",
  orange: "#ffa500",
  orangered: "#ff4500",
  orchid: "#da70d6",
  palegoldenrod: "#eee8aa",
  palegreen: "#98fb98",
  paleturquoise: "#afeeee",
  palevioletred: "#db7093",
  papayawhip: "#ffefd5",
  peachpuff: "#ffdab9",
  peru: "#cd853f",
  pink: "#ffc0cb",
  plum: "#dda0dd",
  powderblue: "#b0e0e6",
  purple: "#800080",
  red: "#ff0000",
  rosybrown: "#bc8f8f",
  royalblue: "#4169e1",
  saddlebrown: "#8b4513",
  salmon: "#fa8072",
  sandybrown: "#f4a460",
  seagreen: "#2e8b57",
  seashell: "#fff5ee",
  sienna: "#a0522d",
  silver: "#c0c0c0",
  skyblue: "#87ceeb",
  slateblue: "#6a5acd",
  slategray: "#708090",
  slategrey: "#708090",
  snow: "#fffafa",
  springgreen: "#00ff7f",
  steelblue: "#4682b4",
  tan: "#d2b48c",
  teal: "#008080",
  thistle: "#d8bfd8",
  tomato: "#ff6347",
  turquoise: "#40e0d0",
  violet: "#ee82ee",
  wheat: "#f5deb3",
  white: "#ffffff",
  whitesmoke: "#f5f5f5",
  yellow: "#ffff00",
  yellowgreen: "#9acd32"
});

d3_rgb_names.forEach(function(key, value) {
  d3_rgb_names.set(key, d3_rgb_parse(value, d3_rgb, d3_hsl_rgb));
});

d3.interpolateRgb = d3_interpolateRgb;

function d3_interpolateRgb(a, b) {
  a = d3.rgb(a);
  b = d3.rgb(b);
  var ar = a.r,
      ag = a.g,
      ab = a.b,
      br = b.r - ar,
      bg = b.g - ag,
      bb = b.b - ab;
  return function(t) {
    return "#"
        + d3_rgb_hex(Math.round(ar + br * t))
        + d3_rgb_hex(Math.round(ag + bg * t))
        + d3_rgb_hex(Math.round(ab + bb * t));
  };
}
var d3_document = document,
    d3_documentElement = d3_document.documentElement,
    d3_window = window;
var d3_nsPrefix = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: "http://www.w3.org/1999/xhtml",
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};

d3.ns = {
  prefix: d3_nsPrefix,
  qualify: function(name) {
    var i = name.indexOf(":"),
        prefix = name;
    if (i >= 0) {
      prefix = name.substring(0, i);
      name = name.substring(i + 1);
    }
    return d3_nsPrefix.hasOwnProperty(prefix)
        ? {space: d3_nsPrefix[prefix], local: name}
        : name;
  }
};

d3.transform = function(string) {
  var g = d3_document.createElementNS(d3.ns.prefix.svg, "g");
  return (d3.transform = function(string) {
    if (string != null) {
      g.setAttribute("transform", string);
      var t = g.transform.baseVal.consolidate();
    }
    return new d3_transform(t ? t.matrix : d3_transformIdentity);
  })(string);
};

// Compute x-scale and normalize the first row.
// Compute shear and make second row orthogonal to first.
// Compute y-scale and normalize the second row.
// Finally, compute the rotation.
function d3_transform(m) {
  var r0 = [m.a, m.b],
      r1 = [m.c, m.d],
      kx = d3_transformNormalize(r0),
      kz = d3_transformDot(r0, r1),
      ky = d3_transformNormalize(d3_transformCombine(r1, r0, -kz)) || 0;
  if (r0[0] * r1[1] < r1[0] * r0[1]) {
    r0[0] *= -1;
    r0[1] *= -1;
    kx *= -1;
    kz *= -1;
  }
  this.rotate = (kx ? Math.atan2(r0[1], r0[0]) : Math.atan2(-r1[0], r1[1])) * d3_degrees;
  this.translate = [m.e, m.f];
  this.scale = [kx, ky];
  this.skew = ky ? Math.atan2(kz, ky) * d3_degrees : 0;
};

d3_transform.prototype.toString = function() {
  return "translate(" + this.translate
      + ")rotate(" + this.rotate
      + ")skewX(" + this.skew
      + ")scale(" + this.scale
      + ")";
};

function d3_transformDot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}

function d3_transformNormalize(a) {
  var k = Math.sqrt(d3_transformDot(a, a));
  if (k) {
    a[0] /= k;
    a[1] /= k;
  }
  return k;
}

function d3_transformCombine(a, b, k) {
  a[0] += k * b[0];
  a[1] += k * b[1];
  return a;
}

var d3_transformIdentity = {a: 1, b: 0, c: 0, d: 1, e: 0, f: 0};
d3.interpolateNumber = d3_interpolateNumber;

function d3_interpolateNumber(a, b) {
  b -= a = +a;
  return function(t) { return a + b * t; };
}

d3.interpolateTransform = d3_interpolateTransform;

function d3_interpolateTransform(a, b) {
  var s = [], // string constants and placeholders
      q = [], // number interpolators
      n,
      A = d3.transform(a),
      B = d3.transform(b),
      ta = A.translate,
      tb = B.translate,
      ra = A.rotate,
      rb = B.rotate,
      wa = A.skew,
      wb = B.skew,
      ka = A.scale,
      kb = B.scale;

  if (ta[0] != tb[0] || ta[1] != tb[1]) {
    s.push("translate(", null, ",", null, ")");
    q.push({i: 1, x: d3_interpolateNumber(ta[0], tb[0])}, {i: 3, x: d3_interpolateNumber(ta[1], tb[1])});
  } else if (tb[0] || tb[1]) {
    s.push("translate(" + tb + ")");
  } else {
    s.push("");
  }

  if (ra != rb) {
    if (ra - rb > 180) rb += 360; else if (rb - ra > 180) ra += 360; // shortest path
    q.push({i: s.push(s.pop() + "rotate(", null, ")") - 2, x: d3_interpolateNumber(ra, rb)});
  } else if (rb) {
    s.push(s.pop() + "rotate(" + rb + ")");
  }

  if (wa != wb) {
    q.push({i: s.push(s.pop() + "skewX(", null, ")") - 2, x: d3_interpolateNumber(wa, wb)});
  } else if (wb) {
    s.push(s.pop() + "skewX(" + wb + ")");
  }

  if (ka[0] != kb[0] || ka[1] != kb[1]) {
    n = s.push(s.pop() + "scale(", null, ",", null, ")");
    q.push({i: n - 4, x: d3_interpolateNumber(ka[0], kb[0])}, {i: n - 2, x: d3_interpolateNumber(ka[1], kb[1])});
  } else if (kb[0] != 1 || kb[1] != 1) {
    s.push(s.pop() + "scale(" + kb + ")");
  }

  n = q.length;
  return function(t) {
    var i = -1, o;
    while (++i < n) s[(o = q[i]).i] = o.x(t);
    return s.join("");
  };
}

d3.interpolateObject = d3_interpolateObject;

function d3_interpolateObject(a, b) {
  var i = {},
      c = {},
      k;
  for (k in a) {
    if (k in b) {
      i[k] = d3_interpolateByName(k)(a[k], b[k]);
    } else {
      c[k] = a[k];
    }
  }
  for (k in b) {
    if (!(k in a)) {
      c[k] = b[k];
    }
  }
  return function(t) {
    for (k in i) c[k] = i[k](t);
    return c;
  };
}

d3.interpolateArray = d3_interpolateArray;

function d3_interpolateArray(a, b) {
  var x = [],
      c = [],
      na = a.length,
      nb = b.length,
      n0 = Math.min(a.length, b.length),
      i;
  for (i = 0; i < n0; ++i) x.push(d3_interpolate(a[i], b[i]));
  for (; i < na; ++i) c[i] = a[i];
  for (; i < nb; ++i) c[i] = b[i];
  return function(t) {
    for (i = 0; i < n0; ++i) c[i] = x[i](t);
    return c;
  };
}

d3.interpolateString = d3_interpolateString;

function d3_interpolateString(a, b) {
  var m, // current match
      i, // current index
      j, // current index (for coalescing)
      s0 = 0, // start index of current string prefix
      s1 = 0, // end index of current string prefix
      s = [], // string constants and placeholders
      q = [], // number interpolators
      n, // q.length
      o;

  // Coerce inputs to strings.
  a = a + "", b = b + "";

  // Reset our regular expression!
  d3_interpolate_number.lastIndex = 0;

  // Find all numbers in b.
  for (i = 0; m = d3_interpolate_number.exec(b); ++i) {
    if (m.index) s.push(b.substring(s0, s1 = m.index));
    q.push({i: s.length, x: m[0]});
    s.push(null);
    s0 = d3_interpolate_number.lastIndex;
  }
  if (s0 < b.length) s.push(b.substring(s0));

  // Find all numbers in a.
  for (i = 0, n = q.length; (m = d3_interpolate_number.exec(a)) && i < n; ++i) {
    o = q[i];
    if (o.x == m[0]) { // The numbers match, so coalesce.
      if (o.i) {
        if (s[o.i + 1] == null) { // This match is followed by another number.
          s[o.i - 1] += o.x;
          s.splice(o.i, 1);
          for (j = i + 1; j < n; ++j) q[j].i--;
        } else { // This match is followed by a string, so coalesce twice.
          s[o.i - 1] += o.x + s[o.i + 1];
          s.splice(o.i, 2);
          for (j = i + 1; j < n; ++j) q[j].i -= 2;
        }
      } else {
          if (s[o.i + 1] == null) { // This match is followed by another number.
          s[o.i] = o.x;
        } else { // This match is followed by a string, so coalesce twice.
          s[o.i] = o.x + s[o.i + 1];
          s.splice(o.i + 1, 1);
          for (j = i + 1; j < n; ++j) q[j].i--;
        }
      }
      q.splice(i, 1);
      n--;
      i--;
    } else {
      o.x = d3_interpolateNumber(parseFloat(m[0]), parseFloat(o.x));
    }
  }

  // Remove any numbers in b not found in a.
  while (i < n) {
    o = q.pop();
    if (s[o.i + 1] == null) { // This match is followed by another number.
      s[o.i] = o.x;
    } else { // This match is followed by a string, so coalesce twice.
      s[o.i] = o.x + s[o.i + 1];
      s.splice(o.i + 1, 1);
    }
    n--;
  }

  // Special optimization for only a single match.
  if (s.length === 1) {
    return s[0] == null
        ? (o = q[0].x, function(t) { return o(t) + ""; })
        : function() { return b; };
  }

  // Otherwise, interpolate each of the numbers and rejoin the string.
  return function(t) {
    for (i = 0; i < n; ++i) s[(o = q[i]).i] = o.x(t);
    return s.join("");
  };
}

var d3_interpolate_number = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;

d3.interpolate = d3_interpolate;

function d3_interpolate(a, b) {
  var i = d3.interpolators.length, f;
  while (--i >= 0 && !(f = d3.interpolators[i](a, b)));
  return f;
}

function d3_interpolateByName(name) {
  return name == "transform"
      ? d3_interpolateTransform
      : d3_interpolate;
}

d3.interpolators = [
  function(a, b) {
    var t = typeof b;
    return (t === "string" ? (d3_rgb_names.has(b) || /^(#|rgb\(|hsl\()/.test(b) ? d3_interpolateRgb : d3_interpolateString)
        : b instanceof d3_Color ? d3_interpolateRgb
        : t === "object" ? (Array.isArray(b) ? d3_interpolateArray : d3_interpolateObject)
        : d3_interpolateNumber)(a, b);
  }
];
d3.interpolateRound = d3_interpolateRound;

function d3_interpolateRound(a, b) {
  b -= a;
  return function(t) { return Math.round(a + b * t); };
}
function d3_uninterpolateNumber(a, b) {
  b = b - (a = +a) ? 1 / (b - a) : 0;
  return function(x) { return (x - a) * b; };
}

function d3_uninterpolateClamp(a, b) {
  b = b - (a = +a) ? 1 / (b - a) : 0;
  return function(x) { return Math.max(0, Math.min(1, (x - a) * b)); };
}
function d3_identity(d) {
  return d;
}
var d3_format_decimalPoint = ".",
    d3_format_thousandsSeparator = ",",
    d3_format_grouping = [3, 3];


var d3_formatPrefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"].map(d3_formatPrefix);

d3.formatPrefix = function(value, precision) {
  var i = 0;
  if (value) {
    if (value < 0) value *= -1;
    if (precision) value = d3.round(value, d3_format_precision(value, precision));
    i = 1 + Math.floor(1e-12 + Math.log(value) / Math.LN10);
    i = Math.max(-24, Math.min(24, Math.floor((i <= 0 ? i + 1 : i - 1) / 3) * 3));
  }
  return d3_formatPrefixes[8 + i / 3];
};

function d3_formatPrefix(d, i) {
  var k = Math.pow(10, Math.abs(8 - i) * 3);
  return {
    scale: i > 8 ? function(d) { return d / k; } : function(d) { return d * k; },
    symbol: d
  };
}
d3.round = function(x, n) {
  return n
      ? Math.round(x * (n = Math.pow(10, n))) / n
      : Math.round(x);
};

d3.format = function(specifier) {
  var match = d3_format_re.exec(specifier),
      fill = match[1] || " ",
      align = match[2] || ">",
      sign = match[3] || "",
      basePrefix = match[4] || "",
      zfill = match[5],
      width = +match[6],
      comma = match[7],
      precision = match[8],
      type = match[9],
      scale = 1,
      suffix = "",
      integer = false;

  if (precision) precision = +precision.substring(1);

  if (zfill || fill === "0" && align === "=") {
    zfill = fill = "0";
    align = "=";
    if (comma) width -= Math.floor((width - 1) / 4);
  }

  switch (type) {
    case "n": comma = true; type = "g"; break;
    case "%": scale = 100; suffix = "%"; type = "f"; break;
    case "p": scale = 100; suffix = "%"; type = "r"; break;
    case "b":
    case "o":
    case "x":
    case "X": if (basePrefix) basePrefix = "0" + type.toLowerCase();
    case "c":
    case "d": integer = true; precision = 0; break;
    case "s": scale = -1; type = "r"; break;
  }

  if (basePrefix === "#") basePrefix = "";

  // If no precision is specified for r, fallback to general notation.
  if (type == "r" && !precision) type = "g";

  // Ensure that the requested precision is in the supported range.
  if (precision != null) {
    if (type == "g") precision = Math.max(1, Math.min(21, precision));
    else if (type == "e" || type == "f") precision = Math.max(0, Math.min(20, precision));
  }

  type = d3_format_types.get(type) || d3_format_typeDefault;

  var zcomma = zfill && comma;

  return function(value) {

    // Return the empty string for floats formatted as ints.
    if (integer && (value % 1)) return "";

    // Convert negative to positive, and record the sign prefix.
    var negative = value < 0 || value === 0 && 1 / value < 0 ? (value = -value, "-") : sign;

    // Apply the scale, computing it from the value's exponent for si format.
    if (scale < 0) {
      var prefix = d3.formatPrefix(value, precision);
      value = prefix.scale(value);
      suffix = prefix.symbol;
    } else {
      value *= scale;
    }

    // Convert to the desired precision.
    value = type(value, precision);

     // If the fill character is not "0", grouping is applied before padding.
    if (!zfill && comma) value = d3_format_group(value);

    var length = basePrefix.length + value.length + (zcomma ? 0 : negative.length),
        padding = length < width ? new Array(length = width - length + 1).join(fill) : "";

    // If the fill character is "0", grouping is applied after padding.
    if (zcomma) value = d3_format_group(padding + value);

    if (d3_format_decimalPoint) value.replace(".", d3_format_decimalPoint);

    negative += basePrefix;

    return (align === "<" ? negative + value + padding
          : align === ">" ? padding + negative + value
          : align === "^" ? padding.substring(0, length >>= 1) + negative + value + padding.substring(length)
          : negative + (zcomma ? value : padding + value)) + suffix;
  };
};

// [[fill]align][sign][#][0][width][,][.precision][type]
var d3_format_re = /(?:([^{])?([<>=^]))?([+\- ])?(#)?(0)?(\d+)?(,)?(\.-?\d+)?([a-z%])?/i;

var d3_format_types = d3.map({
  b: function(x) { return x.toString(2); },
  c: function(x) { return String.fromCharCode(x); },
  o: function(x) { return x.toString(8); },
  x: function(x) { return x.toString(16); },
  X: function(x) { return x.toString(16).toUpperCase(); },
  g: function(x, p) { return x.toPrecision(p); },
  e: function(x, p) { return x.toExponential(p); },
  f: function(x, p) { return x.toFixed(p); },
  r: function(x, p) { return (x = d3.round(x, d3_format_precision(x, p))).toFixed(Math.max(0, Math.min(20, d3_format_precision(x * (1 + 1e-15), p)))); }
});

function d3_format_precision(x, p) {
  return p - (x ? Math.ceil(Math.log(x) / Math.LN10) : 1);
}

function d3_format_typeDefault(x) {
  return x + "";
}

// Apply comma grouping for thousands.
var d3_format_group = d3_identity;
if (d3_format_grouping) {
  var d3_format_groupingLength = d3_format_grouping.length;
  d3_format_group = function(value) {
    var i = value.lastIndexOf("."),
        f = i >= 0 ? "." + value.substring(i + 1) : (i = value.length, ""),
        t = [],
        j = 0,
        g = d3_format_grouping[0];
    while (i > 0 && g > 0) {
      t.push(value.substring(i -= g, i + g));
      g = d3_format_grouping[j = (j + 1) % d3_format_groupingLength];
    }
    return t.reverse().join(d3_format_thousandsSeparator || "") + f;
  };
}
function d3_scale_bilinear(domain, range, uninterpolate, interpolate) {
  var u = uninterpolate(domain[0], domain[1]),
      i = interpolate(range[0], range[1]);
  return function(x) {
    return i(u(x));
  };
}
function d3_scale_nice(domain, nice) {
  var i0 = 0,
      i1 = domain.length - 1,
      x0 = domain[i0],
      x1 = domain[i1],
      dx;

  if (x1 < x0) {
    dx = i0, i0 = i1, i1 = dx;
    dx = x0, x0 = x1, x1 = dx;
  }

  domain[i0] = nice.floor(x0);
  domain[i1] = nice.ceil(x1);
  return domain;
}

function d3_scale_niceStep(step) {
  return step ? {
    floor: function(x) { return Math.floor(x / step) * step; },
    ceil: function(x) { return Math.ceil(x / step) * step; }
  } : d3_scale_niceIdentity;
}

var d3_scale_niceIdentity = {
  floor: d3_identity,
  ceil: d3_identity
};
d3.bisector = function(f) {
  return {
    left: function(a, x, lo, hi) {
      if (arguments.length < 3) lo = 0;
      if (arguments.length < 4) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (f.call(a, a[mid], mid) < x) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    },
    right: function(a, x, lo, hi) {
      if (arguments.length < 3) lo = 0;
      if (arguments.length < 4) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (x < f.call(a, a[mid], mid)) hi = mid;
        else lo = mid + 1;
      }
      return lo;
    }
  };
};

var d3_bisector = d3.bisector(function(d) { return d; });
d3.bisectLeft = d3_bisector.left;
d3.bisect = d3.bisectRight = d3_bisector.right;

function d3_scale_polylinear(domain, range, uninterpolate, interpolate) {
  var u = [],
      i = [],
      j = 0,
      k = Math.min(domain.length, range.length) - 1;

  // Handle descending domains.
  if (domain[k] < domain[0]) {
    domain = domain.slice().reverse();
    range = range.slice().reverse();
  }

  while (++j <= k) {
    u.push(uninterpolate(domain[j - 1], domain[j]));
    i.push(interpolate(range[j - 1], range[j]));
  }

  return function(x) {
    var j = d3.bisect(domain, x, 1, k) - 1;
    return i[j](u[j](x));
  };
}

d3.scale.linear = function() {
  return d3_scale_linear([0, 1], [0, 1], d3_interpolate, false);
};

function d3_scale_linear(domain, range, interpolate, clamp) {
  var output,
      input;

  function rescale() {
    var linear = Math.min(domain.length, range.length) > 2 ? d3_scale_polylinear : d3_scale_bilinear,
        uninterpolate = clamp ? d3_uninterpolateClamp : d3_uninterpolateNumber;
    output = linear(domain, range, uninterpolate, interpolate);
    input = linear(range, domain, uninterpolate, d3_interpolate);
    return scale;
  }

  function scale(x) {
    return output(x);
  }

  // Note: requires range is coercible to number!
  scale.invert = function(y) {
    return input(y);
  };

  scale.domain = function(x) {
    if (!arguments.length) return domain;
    domain = x.map(Number);
    return rescale();
  };

  scale.range = function(x) {
    if (!arguments.length) return range;
    range = x;
    return rescale();
  };

  scale.rangeRound = function(x) {
    return scale.range(x).interpolate(d3_interpolateRound);
  };

  scale.clamp = function(x) {
    if (!arguments.length) return clamp;
    clamp = x;
    return rescale();
  };

  scale.interpolate = function(x) {
    if (!arguments.length) return interpolate;
    interpolate = x;
    return rescale();
  };

  scale.ticks = function(m) {
    return d3_scale_linearTicks(domain, m);
  };

  scale.tickFormat = function(m, format) {
    return d3_scale_linearTickFormat(domain, m, format);
  };

  scale.nice = function(m) {
    d3_scale_linearNice(domain, m);
    return rescale();
  };

  scale.copy = function() {
    return d3_scale_linear(domain, range, interpolate, clamp);
  };

  return rescale();
}

function d3_scale_linearRebind(scale, linear) {
  return d3.rebind(scale, linear, "range", "rangeRound", "interpolate", "clamp");
}

function d3_scale_linearNice(domain, m) {
  return d3_scale_nice(domain, d3_scale_niceStep(m
      ? d3_scale_linearTickRange(domain, m)[2]
      : d3_scale_linearNiceStep(domain)));
}

function d3_scale_linearNiceStep(domain) {
  var extent = d3_scaleExtent(domain),
      span = extent[1] - extent[0];
  return Math.pow(10, Math.round(Math.log(span) / Math.LN10) - 1);
}

function d3_scale_linearTickRange(domain, m) {
  var extent = d3_scaleExtent(domain),
      span = extent[1] - extent[0],
      step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10)),
      err = m / span * step;

  // Filter ticks to get closer to the desired count.
  if (err <= .15) step *= 10;
  else if (err <= .35) step *= 5;
  else if (err <= .75) step *= 2;

  // Round start and stop values to step interval.
  extent[0] = Math.ceil(extent[0] / step) * step;
  extent[1] = Math.floor(extent[1] / step) * step + step * .5; // inclusive
  extent[2] = step;
  return extent;
}

function d3_scale_linearTicks(domain, m) {
  return d3.range.apply(d3, d3_scale_linearTickRange(domain, m));
}

function d3_scale_linearTickFormat(domain, m, format) {
  var precision = -Math.floor(Math.log(d3_scale_linearTickRange(domain, m)[2]) / Math.LN10 + .01);
  return d3.format(format
      ? format.replace(d3_format_re, function(a, b, c, d, e, f, g, h, i, j) { return [b, c, d, e, f, g, h, i || "." + (precision - (j === "%") * 2), j].join(""); })
      : ",." + precision + "f");
}

d3.scale.log = function() {
  return d3_scale_log(d3.scale.linear().domain([0, Math.LN10]), 10, d3_scale_logp, d3_scale_powp, [1, 10]);
};

function d3_scale_log(linear, base, log, pow, domain) {

  function scale(x) {
    return linear(log(x));
  }

  scale.invert = function(x) {
    return pow(linear.invert(x));
  };

  scale.domain = function(x) {
    if (!arguments.length) return domain;
    if (x[0] < 0) log = d3_scale_logn, pow = d3_scale_pown;
    else log = d3_scale_logp, pow = d3_scale_powp;
    linear.domain((domain = x.map(Number)).map(log));
    return scale;
  };

  scale.base = function(_) {
    if (!arguments.length) return base;
    base = +_;
    return scale;
  };

  scale.nice = function() {

    function floor(x) {
      return Math.pow(base, Math.floor(Math.log(x) / Math.log(base)));
    }

    function ceil(x) {
      return Math.pow(base, Math.ceil(Math.log(x) / Math.log(base)));
    }

    linear.domain(d3_scale_nice(domain, log === d3_scale_logp
        ? {floor: floor, ceil: ceil}
        : {floor: function(x) { return -ceil(-x); }, ceil: function(x) { return -floor(-x); }}).map(log));

    return scale;
  };

  scale.ticks = function() {
    var extent = d3_scaleExtent(linear.domain()),
        ticks = [];
    if (extent.every(isFinite)) {
      var b = Math.log(base),
          i = Math.floor(extent[0] / b),
          j = Math.ceil(extent[1] / b),
          u = pow(extent[0]),
          v = pow(extent[1]),
          n = base % 1 ? 2 : base;
      if (log === d3_scale_logn) {
        ticks.push(-Math.pow(base, -i));
        for (; i++ < j;) for (var k = n - 1; k > 0; k--) ticks.push(-Math.pow(base, -i) * k);
      } else {
        for (; i < j; i++) for (var k = 1; k < n; k++) ticks.push(Math.pow(base, i) * k);
        ticks.push(Math.pow(base, i));
      }
      for (i = 0; ticks[i] < u; i++) {} // strip small values
      for (j = ticks.length; ticks[j - 1] > v; j--) {} // strip big values
      ticks = ticks.slice(i, j);
    }
    return ticks;
  };

  scale.tickFormat = function(n, format) {
    if (!arguments.length) return d3_scale_logFormat;
    if (arguments.length < 2) format = d3_scale_logFormat;
    else if (typeof format !== "function") format = d3.format(format);
    var b = Math.log(base),
        k = Math.max(.1, n / scale.ticks().length),
        f = log === d3_scale_logn ? (e = -1e-12, Math.floor) : (e = 1e-12, Math.ceil),
        e;
    return function(d) {
      return d / pow(b * f(log(d) / b + e)) <= k ? format(d) : "";
    };
  };

  scale.copy = function() {
    return d3_scale_log(linear.copy(), base, log, pow, domain);
  };

  return d3_scale_linearRebind(scale, linear);
}

var d3_scale_logFormat = d3.format(".0e");

function d3_scale_logp(x) {
  return Math.log(x < 0 ? 0 : x);
}

function d3_scale_powp(x) {
  return Math.exp(x);
}

function d3_scale_logn(x) {
  return -Math.log(x > 0 ? 0 : -x);
}

function d3_scale_pown(x) {
  return -Math.exp(-x);
}

d3.scale.pow = function() {
  return d3_scale_pow(d3.scale.linear(), 1, [0, 1]);
};

function d3_scale_pow(linear, exponent, domain) {
  var powp = d3_scale_powPow(exponent),
      powb = d3_scale_powPow(1 / exponent);

  function scale(x) {
    return linear(powp(x));
  }

  scale.invert = function(x) {
    return powb(linear.invert(x));
  };

  scale.domain = function(x) {
    if (!arguments.length) return domain;
    linear.domain((domain = x.map(Number)).map(powp));
    return scale;
  };

  scale.ticks = function(m) {
    return d3_scale_linearTicks(domain, m);
  };

  scale.tickFormat = function(m, format) {
    return d3_scale_linearTickFormat(domain, m, format);
  };

  scale.nice = function(m) {
    return scale.domain(d3_scale_linearNice(domain, m));
  };

  scale.exponent = function(x) {
    if (!arguments.length) return exponent;
    powp = d3_scale_powPow(exponent = x);
    powb = d3_scale_powPow(1 / exponent);
    linear.domain(domain.map(powp));
    return scale;
  };

  scale.copy = function() {
    return d3_scale_pow(linear.copy(), exponent, domain);
  };

  return d3_scale_linearRebind(scale, linear);
}

function d3_scale_powPow(e) {
  return function(x) {
    return x < 0 ? -Math.pow(-x, e) : Math.pow(x, e);
  };
}

d3.scale.sqrt = function() {
  return d3.scale.pow().exponent(.5);
};

d3.scale.ordinal = function() {
  return d3_scale_ordinal([], {t: "range", a: [[]]});
};

function d3_scale_ordinal(domain, ranger) {
  var index,
      range,
      rangeBand;

  function scale(x) {
    return range[((index.get(x) || index.set(x, domain.push(x))) - 1) % range.length];
  }

  function steps(start, step) {
    return d3.range(domain.length).map(function(i) { return start + step * i; });
  }

  scale.domain = function(x) {
    if (!arguments.length) return domain;
    domain = [];
    index = new d3_Map;
    var i = -1, n = x.length, xi;
    while (++i < n) if (!index.has(xi = x[i])) index.set(xi, domain.push(xi));
    return scale[ranger.t].apply(scale, ranger.a);
  };

  scale.range = function(x) {
    if (!arguments.length) return range;
    range = x;
    rangeBand = 0;
    ranger = {t: "range", a: arguments};
    return scale;
  };

  scale.rangePoints = function(x, padding) {
    if (arguments.length < 2) padding = 0;
    var start = x[0],
        stop = x[1],
        step = (stop - start) / (Math.max(1, domain.length - 1) + padding);
    range = steps(domain.length < 2 ? (start + stop) / 2 : start + step * padding / 2, step);
    rangeBand = 0;
    ranger = {t: "rangePoints", a: arguments};
    return scale;
  };

  scale.rangeBands = function(x, padding, outerPadding) {
    if (arguments.length < 2) padding = 0;
    if (arguments.length < 3) outerPadding = padding;
    var reverse = x[1] < x[0],
        start = x[reverse - 0],
        stop = x[1 - reverse],
        step = (stop - start) / (domain.length - padding + 2 * outerPadding);
    range = steps(start + step * outerPadding, step);
    if (reverse) range.reverse();
    rangeBand = step * (1 - padding);
    ranger = {t: "rangeBands", a: arguments};
    return scale;
  };

  scale.rangeRoundBands = function(x, padding, outerPadding) {
    if (arguments.length < 2) padding = 0;
    if (arguments.length < 3) outerPadding = padding;
    var reverse = x[1] < x[0],
        start = x[reverse - 0],
        stop = x[1 - reverse],
        step = Math.floor((stop - start) / (domain.length - padding + 2 * outerPadding)),
        error = stop - start - (domain.length - padding) * step;
    range = steps(start + Math.round(error / 2), step);
    if (reverse) range.reverse();
    rangeBand = Math.round(step * (1 - padding));
    ranger = {t: "rangeRoundBands", a: arguments};
    return scale;
  };

  scale.rangeBand = function() {
    return rangeBand;
  };

  scale.rangeExtent = function() {
    return d3_scaleExtent(ranger.a[0]);
  };

  scale.copy = function() {
    return d3_scale_ordinal(domain, ranger);
  };

  return scale.domain(domain);
}

/*
 * This product includes color specifications and designs developed by Cynthia
 * Brewer (http://colorbrewer.org/). See lib/colorbrewer for more information.
 */

d3.scale.category10 = function() {
  return d3.scale.ordinal().range(d3_category10);
};

d3.scale.category20 = function() {
  return d3.scale.ordinal().range(d3_category20);
};

d3.scale.category20b = function() {
  return d3.scale.ordinal().range(d3_category20b);
};

d3.scale.category20c = function() {
  return d3.scale.ordinal().range(d3_category20c);
};

var d3_category10 = [
  "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
  "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"
];

var d3_category20 = [
  "#1f77b4", "#aec7e8",
  "#ff7f0e", "#ffbb78",
  "#2ca02c", "#98df8a",
  "#d62728", "#ff9896",
  "#9467bd", "#c5b0d5",
  "#8c564b", "#c49c94",
  "#e377c2", "#f7b6d2",
  "#7f7f7f", "#c7c7c7",
  "#bcbd22", "#dbdb8d",
  "#17becf", "#9edae5"
];

var d3_category20b = [
  "#393b79", "#5254a3", "#6b6ecf", "#9c9ede",
  "#637939", "#8ca252", "#b5cf6b", "#cedb9c",
  "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94",
  "#843c39", "#ad494a", "#d6616b", "#e7969c",
  "#7b4173", "#a55194", "#ce6dbd", "#de9ed6"
];

var d3_category20c = [
  "#3182bd", "#6baed6", "#9ecae1", "#c6dbef",
  "#e6550d", "#fd8d3c", "#fdae6b", "#fdd0a2",
  "#31a354", "#74c476", "#a1d99b", "#c7e9c0",
  "#756bb1", "#9e9ac8", "#bcbddc", "#dadaeb",
  "#636363", "#969696", "#bdbdbd", "#d9d9d9"
];
d3.ascending = function(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
};
// R-7 per <http://en.wikipedia.org/wiki/Quantile>
d3.quantile = function(values, p) {
  var H = (values.length - 1) * p + 1,
      h = Math.floor(H),
      v = +values[h - 1],
      e = H - h;
  return e ? v + e * (values[h] - v) : v;
};

d3.scale.quantile = function() {
  return d3_scale_quantile([], []);
};

function d3_scale_quantile(domain, range) {
  var thresholds;

  function rescale() {
    var k = 0,
        q = range.length;
    thresholds = [];
    while (++k < q) thresholds[k - 1] = d3.quantile(domain, k / q);
    return scale;
  }

  function scale(x) {
    if (isNaN(x = +x)) return NaN;
    return range[d3.bisect(thresholds, x)];
  }

  scale.domain = function(x) {
    if (!arguments.length) return domain;
    domain = x.filter(function(d) { return !isNaN(d); }).sort(d3.ascending);
    return rescale();
  };

  scale.range = function(x) {
    if (!arguments.length) return range;
    range = x;
    return rescale();
  };

  scale.quantiles = function() {
    return thresholds;
  };

  scale.copy = function() {
    return d3_scale_quantile(domain, range); // copy on write!
  };

  return rescale();
}

d3.scale.quantize = function() {
  return d3_scale_quantize(0, 1, [0, 1]);
};

function d3_scale_quantize(x0, x1, range) {
  var kx, i;

  function scale(x) {
    return range[Math.max(0, Math.min(i, Math.floor(kx * (x - x0))))];
  }

  function rescale() {
    kx = range.length / (x1 - x0);
    i = range.length - 1;
    return scale;
  }

  scale.domain = function(x) {
    if (!arguments.length) return [x0, x1];
    x0 = +x[0];
    x1 = +x[x.length - 1];
    return rescale();
  };

  scale.range = function(x) {
    if (!arguments.length) return range;
    range = x;
    return rescale();
  };

  scale.copy = function() {
    return d3_scale_quantize(x0, x1, range); // copy on write
  };

  scale.invertExtent = function(y) {
    y = range.indexOf(y);
    y = y < 0 ? NaN : y / kx + x0;
    return [y, y + 1 / kx];
  };

  return rescale();
}

d3.scale.threshold = function() {
  return d3_scale_threshold([.5], [0, 1]);
};

function d3_scale_threshold(domain, range) {

  function scale(x) {
    return range[d3.bisect(domain, x)];
  }

  scale.domain = function(_) {
    if (!arguments.length) return domain;
    domain = _;
    return scale;
  };

  scale.range = function(_) {
    if (!arguments.length) return range;
    range = _;
    return scale;
  };

  scale.invertExtent = function(y) {
    y = range.indexOf(y);
    return [domain[y - 1], domain[y]];
  };

  scale.copy = function() {
    return d3_scale_threshold(domain, range);
  };

  return scale;
};

d3.scale.identity = function() {
  return d3_scale_identity([0, 1]);
};

function d3_scale_identity(domain) {

  function identity(x) { return +x; }

  identity.invert = identity;

  identity.domain = identity.range = function(x) {
    if (!arguments.length) return domain;
    domain = x.map(identity);
    return identity;
  };

  identity.ticks = function(m) {
    return d3_scale_linearTicks(domain, m);
  };

  identity.tickFormat = function(m, format) {
    return d3_scale_linearTickFormat(domain, m, format);
  };

  identity.copy = function() {
    return d3_scale_identity(domain);
  };

  return identity;
}

var d3_array = d3_arraySlice; // conversion for NodeLists

function d3_arrayCopy(pseudoarray) {
  var i = -1, n = pseudoarray.length, array = [];
  while (++i < n) array.push(pseudoarray[i]);
  return array;
}

function d3_arraySlice(pseudoarray) {
  return Array.prototype.slice.call(pseudoarray);
}

try {
  d3_array(d3_documentElement.childNodes)[0].nodeType;
} catch(e) {
  d3_array = d3_arrayCopy;
}

var d3_arraySubclass = [].__proto__?

// Until ECMAScript supports array subclassing, prototype injection works well.
function(array, prototype) {
  array.__proto__ = prototype;
}:

// And if your browser doesn't support __proto__, we'll use direct extension.
function(array, prototype) {
  for (var property in prototype) array[property] = prototype[property];
};

function d3_vendorSymbol(object, name) {
  if (name in object) return name;
  name = name.charAt(0).toUpperCase() + name.substring(1);
  for (var i = 0, n = d3_vendorPrefixes.length; i < n; ++i) {
    var prefixName = d3_vendorPrefixes[i] + name;
    if (prefixName in object) return prefixName;
  }
}

var d3_vendorPrefixes = ["webkit", "ms", "moz", "Moz", "o", "O"];

function d3_selection(groups) {
  d3_arraySubclass(groups, d3_selectionPrototype);
  return groups;
}

var d3_select = function(s, n) { return n.querySelector(s); },
    d3_selectAll = function(s, n) { return n.querySelectorAll(s); },
    d3_selectMatcher = d3_documentElement[d3_vendorSymbol(d3_documentElement, "matchesSelector")],
    d3_selectMatches = function(n, s) { return d3_selectMatcher.call(n, s); };

// Prefer Sizzle, if available.
if (typeof Sizzle === "function") {
  d3_select = function(s, n) { return Sizzle(s, n)[0] || null; };
  d3_selectAll = function(s, n) { return Sizzle.uniqueSort(Sizzle(s, n)); };
  d3_selectMatches = Sizzle.matchesSelector;
}

d3.selection = function() {
  return d3_selectionRoot;
};

var d3_selectionPrototype = d3.selection.prototype = [];


d3_selectionPrototype.select = function(selector) {
  var subgroups = [],
      subgroup,
      subnode,
      group,
      node;

  if (typeof selector !== "function") selector = d3_selection_selector(selector);

  for (var j = -1, m = this.length; ++j < m;) {
    subgroups.push(subgroup = []);
    subgroup.parentNode = (group = this[j]).parentNode;
    for (var i = -1, n = group.length; ++i < n;) {
      if (node = group[i]) {
        subgroup.push(subnode = selector.call(node, node.__data__, i));
        if (subnode && "__data__" in node) subnode.__data__ = node.__data__;
      } else {
        subgroup.push(null);
      }
    }
  }

  return d3_selection(subgroups);
};

function d3_selection_selector(selector) {
  return function() {
    return d3_select(selector, this);
  };
}

d3_selectionPrototype.selectAll = function(selector) {
  var subgroups = [],
      subgroup,
      node;

  if (typeof selector !== "function") selector = d3_selection_selectorAll(selector);

  for (var j = -1, m = this.length; ++j < m;) {
    for (var group = this[j], i = -1, n = group.length; ++i < n;) {
      if (node = group[i]) {
        subgroups.push(subgroup = d3_array(selector.call(node, node.__data__, i)));
        subgroup.parentNode = node;
      }
    }
  }

  return d3_selection(subgroups);
};

function d3_selection_selectorAll(selector) {
  return function() {
    return d3_selectAll(selector, this);
  };
}

d3_selectionPrototype.attr = function(name, value) {
  if (arguments.length < 2) {

    // For attr(string), return the attribute value for the first node.
    if (typeof name === "string") {
      var node = this.node();
      name = d3.ns.qualify(name);
      return name.local
          ? node.getAttributeNS(name.space, name.local)
          : node.getAttribute(name);
    }

    // For attr(object), the object specifies the names and values of the
    // attributes to set or remove. The values may be functions that are
    // evaluated for each element.
    for (value in name) this.each(d3_selection_attr(value, name[value]));
    return this;
  }

  return this.each(d3_selection_attr(name, value));
};

function d3_selection_attr(name, value) {
  name = d3.ns.qualify(name);

  // For attr(string, null), remove the attribute with the specified name.
  function attrNull() {
    this.removeAttribute(name);
  }
  function attrNullNS() {
    this.removeAttributeNS(name.space, name.local);
  }

  // For attr(string, string), set the attribute with the specified name.
  function attrConstant() {
    this.setAttribute(name, value);
  }
  function attrConstantNS() {
    this.setAttributeNS(name.space, name.local, value);
  }

  // For attr(string, function), evaluate the function for each element, and set
  // or remove the attribute as appropriate.
  function attrFunction() {
    var x = value.apply(this, arguments);
    if (x == null) this.removeAttribute(name);
    else this.setAttribute(name, x);
  }
  function attrFunctionNS() {
    var x = value.apply(this, arguments);
    if (x == null) this.removeAttributeNS(name.space, name.local);
    else this.setAttributeNS(name.space, name.local, x);
  }

  return value == null
      ? (name.local ? attrNullNS : attrNull) : (typeof value === "function"
      ? (name.local ? attrFunctionNS : attrFunction)
      : (name.local ? attrConstantNS : attrConstant));
}
function d3_collapse(s) {
  return s.trim().replace(/\s+/g, " ");
}
d3.requote = function(s) {
  return s.replace(d3_requote_re, "\\$&");
};

var d3_requote_re = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;

d3_selectionPrototype.classed = function(name, value) {
  if (arguments.length < 2) {

    // For classed(string), return true only if the first node has the specified
    // class or classes. Note that even if the browser supports DOMTokenList, it
    // probably doesn't support it on SVG elements (which can be animated).
    if (typeof name === "string") {
      var node = this.node(),
          n = (name = name.trim().split(/^|\s+/g)).length,
          i = -1;
      if (value = node.classList) {
        while (++i < n) if (!value.contains(name[i])) return false;
      } else {
        value = node.getAttribute("class");
        while (++i < n) if (!d3_selection_classedRe(name[i]).test(value)) return false;
      }
      return true;
    }

    // For classed(object), the object specifies the names of classes to add or
    // remove. The values may be functions that are evaluated for each element.
    for (value in name) this.each(d3_selection_classed(value, name[value]));
    return this;
  }

  // Otherwise, both a name and a value are specified, and are handled as below.
  return this.each(d3_selection_classed(name, value));
};

function d3_selection_classedRe(name) {
  return new RegExp("(?:^|\\s+)" + d3.requote(name) + "(?:\\s+|$)", "g");
}

// Multiple class names are allowed (e.g., "foo bar").
function d3_selection_classed(name, value) {
  name = name.trim().split(/\s+/).map(d3_selection_classedName);
  var n = name.length;

  function classedConstant() {
    var i = -1;
    while (++i < n) name[i](this, value);
  }

  // When the value is a function, the function is still evaluated only once per
  // element even if there are multiple class names.
  function classedFunction() {
    var i = -1, x = value.apply(this, arguments);
    while (++i < n) name[i](this, x);
  }

  return typeof value === "function"
      ? classedFunction
      : classedConstant;
}

function d3_selection_classedName(name) {
  var re = d3_selection_classedRe(name);
  return function(node, value) {
    if (c = node.classList) return value ? c.add(name) : c.remove(name);
    var c = node.getAttribute("class") || "";
    if (value) {
      re.lastIndex = 0;
      if (!re.test(c)) node.setAttribute("class", d3_collapse(c + " " + name));
    } else {
      node.setAttribute("class", d3_collapse(c.replace(re, " ")));
    }
  };
}

d3_selectionPrototype.style = function(name, value, priority) {
  var n = arguments.length;
  if (n < 3) {

    // For style(object) or style(object, string), the object specifies the
    // names and values of the attributes to set or remove. The values may be
    // functions that are evaluated for each element. The optional string
    // specifies the priority.
    if (typeof name !== "string") {
      if (n < 2) value = "";
      for (priority in name) this.each(d3_selection_style(priority, name[priority], value));
      return this;
    }

    // For style(string), return the computed style value for the first node.
    if (n < 2) return d3_window.getComputedStyle(this.node(), null).getPropertyValue(name);

    // For style(string, string) or style(string, function), use the default
    // priority. The priority is ignored for style(string, null).
    priority = "";
  }

  // Otherwise, a name, value and priority are specified, and handled as below.
  return this.each(d3_selection_style(name, value, priority));
};

function d3_selection_style(name, value, priority) {

  // For style(name, null) or style(name, null, priority), remove the style
  // property with the specified name. The priority is ignored.
  function styleNull() {
    this.style.removeProperty(name);
  }

  // For style(name, string) or style(name, string, priority), set the style
  // property with the specified name, using the specified priority.
  function styleConstant() {
    this.style.setProperty(name, value, priority);
  }

  // For style(name, function) or style(name, function, priority), evaluate the
  // function for each element, and set or remove the style property as
  // appropriate. When setting, use the specified priority.
  function styleFunction() {
    var x = value.apply(this, arguments);
    if (x == null) this.style.removeProperty(name);
    else this.style.setProperty(name, x, priority);
  }

  return value == null
      ? styleNull : (typeof value === "function"
      ? styleFunction : styleConstant);
}

d3_selectionPrototype.property = function(name, value) {
  if (arguments.length < 2) {

    // For property(string), return the property value for the first node.
    if (typeof name === "string") return this.node()[name];

    // For property(object), the object specifies the names and values of the
    // properties to set or remove. The values may be functions that are
    // evaluated for each element.
    for (value in name) this.each(d3_selection_property(value, name[value]));
    return this;
  }

  // Otherwise, both a name and a value are specified, and are handled as below.
  return this.each(d3_selection_property(name, value));
};

function d3_selection_property(name, value) {

  // For property(name, null), remove the property with the specified name.
  function propertyNull() {
    delete this[name];
  }

  // For property(name, string), set the property with the specified name.
  function propertyConstant() {
    this[name] = value;
  }

  // For property(name, function), evaluate the function for each element, and
  // set or remove the property as appropriate.
  function propertyFunction() {
    var x = value.apply(this, arguments);
    if (x == null) delete this[name];
    else this[name] = x;
  }

  return value == null
      ? propertyNull : (typeof value === "function"
      ? propertyFunction : propertyConstant);
}

d3_selectionPrototype.text = function(value) {
  return arguments.length
      ? this.each(typeof value === "function"
      ? function() { var v = value.apply(this, arguments); this.textContent = v == null ? "" : v; } : value == null
      ? function() { this.textContent = ""; }
      : function() { this.textContent = value; })
      : this.node().textContent;
};

d3_selectionPrototype.html = function(value) {
  return arguments.length
      ? this.each(typeof value === "function"
      ? function() { var v = value.apply(this, arguments); this.innerHTML = v == null ? "" : v; } : value == null
      ? function() { this.innerHTML = ""; }
      : function() { this.innerHTML = value; })
      : this.node().innerHTML;
};

// TODO append(node)?
// TODO append(function)?
d3_selectionPrototype.append = function(name) {
  name = d3.ns.qualify(name);

  function append() {
    return this.appendChild(d3_document.createElementNS(this.namespaceURI, name));
  }

  function appendNS() {
    return this.appendChild(d3_document.createElementNS(name.space, name.local));
  }

  return this.select(name.local ? appendNS : append);
};

d3_selectionPrototype.insert = function(name, before) {
  name = d3.ns.qualify(name);

  if (typeof before !== "function") before = d3_selection_selector(before);

  function insert(d, i) {
    return this.insertBefore(
        d3_document.createElementNS(this.namespaceURI, name),
        before.call(this, d, i));
  }

  function insertNS(d, i) {
    return this.insertBefore(
        d3_document.createElementNS(name.space, name.local),
        before.call(this, d, i));
  }

  return this.select(name.local ? insertNS : insert);
};

// TODO remove(selector)?
// TODO remove(node)?
// TODO remove(function)?
d3_selectionPrototype.remove = function() {
  return this.each(function() {
    var parent = this.parentNode;
    if (parent) parent.removeChild(this);
  });
};

d3_selectionPrototype.data = function(value, key) {
  var i = -1,
      n = this.length,
      group,
      node;

  // If no value is specified, return the first value.
  if (!arguments.length) {
    value = new Array(n = (group = this[0]).length);
    while (++i < n) {
      if (node = group[i]) {
        value[i] = node.__data__;
      }
    }
    return value;
  }

  function bind(group, groupData) {
    var i,
        n = group.length,
        m = groupData.length,
        n0 = Math.min(n, m),
        updateNodes = new Array(m),
        enterNodes = new Array(m),
        exitNodes = new Array(n),
        node,
        nodeData;

    if (key) {
      var nodeByKeyValue = new d3_Map,
          dataByKeyValue = new d3_Map,
          keyValues = [],
          keyValue;

      for (i = -1; ++i < n;) {
        keyValue = key.call(node = group[i], node.__data__, i);
        if (nodeByKeyValue.has(keyValue)) {
          exitNodes[i] = node; // duplicate selection key
        } else {
          nodeByKeyValue.set(keyValue, node);
        }
        keyValues.push(keyValue);
      }

      for (i = -1; ++i < m;) {
        keyValue = key.call(groupData, nodeData = groupData[i], i);
        if (node = nodeByKeyValue.get(keyValue)) {
          updateNodes[i] = node;
          node.__data__ = nodeData;
        } else if (!dataByKeyValue.has(keyValue)) { // no duplicate data key
          enterNodes[i] = d3_selection_dataNode(nodeData);
        }
        dataByKeyValue.set(keyValue, nodeData);
        nodeByKeyValue.remove(keyValue);
      }

      for (i = -1; ++i < n;) {
        if (nodeByKeyValue.has(keyValues[i])) {
          exitNodes[i] = group[i];
        }
      }
    } else {
      for (i = -1; ++i < n0;) {
        node = group[i];
        nodeData = groupData[i];
        if (node) {
          node.__data__ = nodeData;
          updateNodes[i] = node;
        } else {
          enterNodes[i] = d3_selection_dataNode(nodeData);
        }
      }
      for (; i < m; ++i) {
        enterNodes[i] = d3_selection_dataNode(groupData[i]);
      }
      for (; i < n; ++i) {
        exitNodes[i] = group[i];
      }
    }

    enterNodes.update
        = updateNodes;

    enterNodes.parentNode
        = updateNodes.parentNode
        = exitNodes.parentNode
        = group.parentNode;

    enter.push(enterNodes);
    update.push(updateNodes);
    exit.push(exitNodes);
  }

  var enter = d3_selection_enter([]),
      update = d3_selection([]),
      exit = d3_selection([]);

  if (typeof value === "function") {
    while (++i < n) {
      bind(group = this[i], value.call(group, group.parentNode.__data__, i));
    }
  } else {
    while (++i < n) {
      bind(group = this[i], value);
    }
  }

  update.enter = function() { return enter; };
  update.exit = function() { return exit; };
  return update;
};

function d3_selection_dataNode(data) {
  return {__data__: data};
}

d3_selectionPrototype.datum = function(value) {
  return arguments.length
      ? this.property("__data__", value)
      : this.property("__data__");
};

d3_selectionPrototype.filter = function(filter) {
  var subgroups = [],
      subgroup,
      group,
      node;

  if (typeof filter !== "function") filter = d3_selection_filter(filter);

  for (var j = 0, m = this.length; j < m; j++) {
    subgroups.push(subgroup = []);
    subgroup.parentNode = (group = this[j]).parentNode;
    for (var i = 0, n = group.length; i < n; i++) {
      if ((node = group[i]) && filter.call(node, node.__data__, i)) {
        subgroup.push(node);
      }
    }
  }

  return d3_selection(subgroups);
};

function d3_selection_filter(selector) {
  return function() {
    return d3_selectMatches(this, selector);
  };
}

d3_selectionPrototype.order = function() {
  for (var j = -1, m = this.length; ++j < m;) {
    for (var group = this[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
      if (node = group[i]) {
        if (next && next !== node.nextSibling) next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }
  return this;
};

d3_selectionPrototype.sort = function(comparator) {
  comparator = d3_selection_sortComparator.apply(this, arguments);
  for (var j = -1, m = this.length; ++j < m;) this[j].sort(comparator);
  return this.order();
};

function d3_selection_sortComparator(comparator) {
  if (!arguments.length) comparator = d3.ascending;
  return function(a, b) {
    return (!a - !b) || comparator(a.__data__, b.__data__);
  };
}
function d3_noop() {}

d3.dispatch = function() {
  var dispatch = new d3_dispatch,
      i = -1,
      n = arguments.length;
  while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
  return dispatch;
};

function d3_dispatch() {}

d3_dispatch.prototype.on = function(type, listener) {
  var i = type.indexOf("."),
      name = "";

  // Extract optional namespace, e.g., "click.foo"
  if (i >= 0) {
    name = type.substring(i + 1);
    type = type.substring(0, i);
  }

  if (type) return arguments.length < 2
      ? this[type].on(name)
      : this[type].on(name, listener);

  if (arguments.length === 2) {
    if (listener == null) for (type in this) {
      if (this.hasOwnProperty(type)) this[type].on(name, null);
    }
    return this;
  }
};

function d3_dispatch_event(dispatch) {
  var listeners = [],
      listenerByName = new d3_Map;

  function event() {
    var z = listeners, // defensive reference
        i = -1,
        n = z.length,
        l;
    while (++i < n) if (l = z[i].on) l.apply(this, arguments);
    return dispatch;
  }

  event.on = function(name, listener) {
    var l = listenerByName.get(name),
        i;

    // return the current listener, if any
    if (arguments.length < 2) return l && l.on;

    // remove the old listener, if any (with copy-on-write)
    if (l) {
      l.on = null;
      listeners = listeners.slice(0, i = listeners.indexOf(l)).concat(listeners.slice(i + 1));
      listenerByName.remove(name);
    }

    // add the new listener, if any
    if (listener) listeners.push(listenerByName.set(name, {on: listener}));

    return dispatch;
  };

  return event;
}

d3.event = null;

function d3_eventCancel() {
  d3.event.stopPropagation();
  d3.event.preventDefault();
}

function d3_eventSource() {
  var e = d3.event, s;
  while (s = e.sourceEvent) e = s;
  return e;
}

// Registers an event listener for the specified target that cancels the next
// event for the specified type, but only if it occurs immediately. This is
// useful to disambiguate dragging from clicking.
function d3_eventSuppress(target, type) {
  function off() { target.on(type, null); }
  target.on(type, function() { d3_eventCancel(); off(); }, true);
  setTimeout(off, 0); // clear the handler if it doesn't fire
}

// Like d3.dispatch, but for custom events abstracting native UI events. These
// events have a target component (such as a brush), a target element (such as
// the svg:g element containing the brush) and the standard arguments `d` (the
// target element's data) and `i` (the selection index of the target element).
function d3_eventDispatch(target) {
  var dispatch = new d3_dispatch,
      i = 0,
      n = arguments.length;

  while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);

  // Creates a dispatch context for the specified `thiz` (typically, the target
  // DOM element that received the source event) and `argumentz` (typically, the
  // data `d` and index `i` of the target element). The returned function can be
  // used to dispatch an event to any registered listeners; the function takes a
  // single argument as input, being the event to dispatch. The event must have
  // a "type" attribute which corresponds to a type registered in the
  // constructor. This context will automatically populate the "sourceEvent" and
  // "target" attributes of the event, as well as setting the `d3.event` global
  // for the duration of the notification.
  dispatch.of = function(thiz, argumentz) {
    return function(e1) {
      try {
        var e0 =
        e1.sourceEvent = d3.event;
        e1.target = target;
        d3.event = e1;
        dispatch[e1.type].apply(thiz, argumentz);
      } finally {
        d3.event = e0;
      }
    };
  };

  return dispatch;
}

d3_selectionPrototype.on = function(type, listener, capture) {
  var n = arguments.length;
  if (n < 3) {

    // For on(object) or on(object, boolean), the object specifies the event
    // types and listeners to add or remove. The optional boolean specifies
    // whether the listener captures events.
    if (typeof type !== "string") {
      if (n < 2) listener = false;
      for (capture in type) this.each(d3_selection_on(capture, type[capture], listener));
      return this;
    }

    // For on(string), return the listener for the first node.
    if (n < 2) return (n = this.node()["__on" + type]) && n._;

    // For on(string, function), use the default capture.
    capture = false;
  }

  // Otherwise, a type, listener and capture are specified, and handled as below.
  return this.each(d3_selection_on(type, listener, capture));
};

function d3_selection_on(type, listener, capture) {
  var name = "__on" + type,
      i = type.indexOf("."),
      wrap = d3_selection_onListener;

  if (i > 0) type = type.substring(0, i);
  var filter = d3_selection_onFilters.get(type);
  if (filter) type = filter, wrap = d3_selection_onFilter;

  function onRemove() {
    var l = this[name];
    if (l) {
      this.removeEventListener(type, l, l.$);
      delete this[name];
    }
  }

  function onAdd() {
    var l = wrap(listener, d3_array(arguments));
    onRemove.call(this);
    this.addEventListener(type, this[name] = l, l.$ = capture);
    l._ = listener;
  }

  function removeAll() {
    var re = new RegExp("^__on([^.]+)" + d3.requote(type) + "$"),
        match;
    for (var name in this) {
      if (match = name.match(re)) {
        var l = this[name];
        this.removeEventListener(match[1], l, l.$);
        delete this[name];
      }
    }
  }

  return i
      ? listener ? onAdd : onRemove
      : listener ? d3_noop : removeAll;
}

var d3_selection_onFilters = d3.map({
  mouseenter: "mouseover",
  mouseleave: "mouseout"
});

d3_selection_onFilters.forEach(function(k) {
  if ("on" + k in d3_document) d3_selection_onFilters.remove(k);
});

function d3_selection_onListener(listener, argumentz) {
  return function(e) {
    var o = d3.event; // Events can be reentrant (e.g., focus).
    d3.event = e;
    argumentz[0] = this.__data__;
    try {
      listener.apply(this, argumentz);
    } finally {
      d3.event = o;
    }
  };
}

function d3_selection_onFilter(listener, argumentz) {
  var l = d3_selection_onListener(listener, argumentz);
  return function(e) {
    var target = this, related = e.relatedTarget;
    if (!related || (related !== target && !(related.compareDocumentPosition(target) & 8))) {
      l.call(target, e);
    }
  };
}

d3_selectionPrototype.each = function(callback) {
  return d3_selection_each(this, function(node, i, j) {
    callback.call(node, node.__data__, i, j);
  });
};

function d3_selection_each(groups, callback) {
  for (var j = 0, m = groups.length; j < m; j++) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; i++) {
      if (node = group[i]) callback(node, i, j);
    }
  }
  return groups;
}

d3_selectionPrototype.call = function(callback) {
  var args = d3_array(arguments);
  callback.apply(args[0] = this, args);
  return this;
};

d3_selectionPrototype.empty = function() {
  return !this.node();
};

d3_selectionPrototype.node = function() {
  for (var j = 0, m = this.length; j < m; j++) {
    for (var group = this[j], i = 0, n = group.length; i < n; i++) {
      var node = group[i];
      if (node) return node;
    }
  }
  return null;
};

d3_selectionPrototype.size = function() {
  var n = 0;
  this.each(function() { ++n; });
  return n;
};

function d3_selection_enter(selection) {
  d3_arraySubclass(selection, d3_selection_enterPrototype);
  return selection;
}

var d3_selection_enterPrototype = [];

d3.selection.enter = d3_selection_enter;
d3.selection.enter.prototype = d3_selection_enterPrototype;

d3_selection_enterPrototype.append = d3_selectionPrototype.append;
d3_selection_enterPrototype.insert = d3_selectionPrototype.insert;
d3_selection_enterPrototype.empty = d3_selectionPrototype.empty;
d3_selection_enterPrototype.node = d3_selectionPrototype.node;
d3_selection_enterPrototype.call = d3_selectionPrototype.call;
d3_selection_enterPrototype.size = d3_selectionPrototype.size;


d3_selection_enterPrototype.select = function(selector) {
  var subgroups = [],
      subgroup,
      subnode,
      upgroup,
      group,
      node;

  for (var j = -1, m = this.length; ++j < m;) {
    upgroup = (group = this[j]).update;
    subgroups.push(subgroup = []);
    subgroup.parentNode = group.parentNode;
    for (var i = -1, n = group.length; ++i < n;) {
      if (node = group[i]) {
        subgroup.push(upgroup[i] = subnode = selector.call(group.parentNode, node.__data__, i));
        subnode.__data__ = node.__data__;
      } else {
        subgroup.push(null);
      }
    }
  }

  return d3_selection(subgroups);
};

d3_selectionPrototype.transition = function() {
  var id = d3_transitionInheritId || ++d3_transitionId,
      subgroups = [],
      subgroup,
      node,
      transition = Object.create(d3_transitionInherit);

  transition.time = Date.now();

  for (var j = -1, m = this.length; ++j < m;) {
    subgroups.push(subgroup = []);
    for (var group = this[j], i = -1, n = group.length; ++i < n;) {
      if (node = group[i]) d3_transitionNode(node, i, id, transition);
      subgroup.push(node);
    }
  }

  return d3_transition(subgroups, id);
};

// TODO fast singleton implementation?
d3.select = function(node) {
  var group = [typeof node === "string" ? d3_select(node, d3_document) : node];
  group.parentNode = d3_documentElement;
  return d3_selection([group]);
};

d3.selectAll = function(nodes) {
  var group = d3_array(typeof nodes === "string" ? d3_selectAll(nodes, d3_document) : nodes);
  group.parentNode = d3_documentElement;
  return d3_selection([group]);
};

var d3_selectionRoot = d3.select(d3_documentElement);
HGRAPH_WIDTH = 960;
HGRAPH_HEIGHT = 720;
HGRAPH_RANGE_MINIMUM = 60;
HGRAPH_RANGE_MAXIMUM = 240;
HGRAPH_POINT_RADIUS = 10;
HGRAPH_SUBPOINT_RADIUS = 8;
HGRAPH_CANVAS_TEXTALIGN = 'center';
HGRAPH_CANVAS_TEXT = '24px Arial';
HGRAPH_POINT_COLOR_HEALTHY = '#616363';
HGRAPH_POINT_COLOR_UNHEALTHY = '#e1604f';
HGRAPH_APP_BOOTSTRAPS = ['[data-hgraph-app]','[hgraph-app]'];
HGRAPH_GRAPH_BOOTSTRAPS = ['[data-hgraph-graph]','[hgraph-graph]'];
HGRAPH_PAYLOAD_TRIGGERS = ['[data-hgraph-payload]','[hgraph-payload]'];
HGRAPH_RING_FILL_COLOR = '#97be8c';
HGRAPH_INNER_RADIUS = 100;
HGRAPH_OUTER_RADIUS = 100;
// hGraph.Error
// a generic error class that handles any errors
hGraph.Error = function( message ) {
    return new Error( message );  
};
// math functions
var ceil = Math.ceil;
var floor = Math.floor;
var abs = Math.abs;
var toInt = function( num ) { return parseInt( num, 10 ); };
var toFloat = function( num ) { return parseFloat( num ); };
var toRad = function( ang ) { return ang * ( Math.PI / 180 ); };

// array shortcuts
var slice = [ ].slice;
var push = [ ].push;
var splice = [ ].splice;

// obj shortcuts
var hasOwn = { }.hasOwnProperty;
var toStr = { }.toString;

// type-related functions
var type = (function( ) { 
    
    var types = [ "", true, 12, /^$/, [ ], function(){ }, { }, null ],
        str, results = { };
        
    while( types.length > 0 ) { 
        str = toStr.call( types.pop( ) );
        results[str] = str.replace(/^\[object\s(.*)\]$/,"$1").toLowerCase( );
    }
    
    return (function( thing ) {
        return results[ toStr.call( thing ) ];  
    });
    
})( );

var isArr = function( thing ) { return type(thing) === "array"; };
var isObj = function( thing ) { return type(thing) === "object"; };
var isStr = function( thing ) { return type(thing) === "string"; };
var isFn = function( thing ) { return type(thing) === "function"; };
var isDef = function( thing ){ return type(thing) !== undefined; };
var isUndef = function( thing ) { return !isDef( thing ); };

// createUID
// returns a new unique identifier string to be used in hashes
// @returns {string} a unique identifier that is useable on the client-side
var createUID = (function( ) {
    var uid = 0;
    return (function( ) {
        return "uid-" + (++uid);
    });
})( );


// inject
// creates a function that calls the function being passed in as the first 
// parameter with references to the specific objects that are passed in as the second
// @param {function} the function that will be used
// @param [array] the parameters that should be used in the new function
// @param {self} the context (if any) to use when calling 'apply' on the function
// @returns {function} a new function that calls the parameter function with the appropriate params and context
var inject = function( fn, params, self ) {

    if( !isArr( params ) || !isFn( fn ) )
        return function( ) { };
    
    var context = self ? self : { };
    
    return function( ) {
        if( arguments.length > 0 )
            return fn.apply( context, params.concat( slice.call( arguments, 0 ) ) );
            
        fn.apply( context, params );
    };
    
};

// forEach
// iterates over an object or array, calling the iterator function with 
// the context and key,value pair of the current element in the iteration
// @param {object|array} the array/object that is going to be looped over
// @param {function} the function to loop over
// @param {context} what the 'this' should be while looping
var forEach = function(obj, iterator, context) {
    var key;
    if (obj) {
        if( isFn(obj) ) {
            for (key in obj) {
                if (key != 'prototype' && key != 'length' && key != 'name' && obj.hasOwnProperty(key)) {
                    iterator.call(context, obj[key], key);
                }
            }
        } else if (obj.forEach && obj.forEach !== forEach) {
            obj.forEach(iterator, context);
    	} else if (isArr(obj)) {
    	    for (key = 0; key < obj.length; key++) { 
    	        iterator.call(context, obj[key], key);
            }
        } else {
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    iterator.call(context, obj[key], key);
                }
            }
        }
    }
    return obj;
};


// extend
// using a list of objects passed in as parameters, this function will
// copy those object's properties onto the first parametered object.
// @param {object} the object being copied onto
// @param [object,object] a list of objects to copy information to the destination
var extend = function( dest ) {
    
    if( !isObj( dest ) || arguments.length < 2 )
        return dest;
    
    forEach( splice.call( arguments, 1 ), function( obj ){
        forEach( obj, function( value, key ){
    	    dest[key] = value;
        });
    });

}


// a hash of parse functions used to aggregate all data into a a common format
var Parsers = { };

// Parsers.string
// used when the data being sent into the parse call is a string
// @param {string} the string to be converted to valid json/object format
// @returns {object} a formatted data object
Parsers.string = function( blob ) {
    // attempt to turn the string into json
    var json;
    try { 
        json = JSON.parse( blob );
    } catch( e ) {
        // throw an hgraph error if the call fails
        throw hGraph.Erorr('unable to parse the data string');
    }
    return Parsers['object']( json );
}; 

// Parsers.object
// called when the data being sent into the parse call is an object
// @param {object} the object that is to be checked for proper data information
// @param {object} a formatted data object
Parsers.object = function( blob ) {
    blob.formatted = true;
    return blob;
};


hGraph.Data = function( ) { };
// Data.parse
// for the time being, the state of the data API is volitile, which means not
// having a pre-defined payload data 
// @param {object} an information blob that will be turned into useable data
hGraph.Data.Parse = function( blob ) {
    var formatted = false;
    
    if( isStr( blob ) )
        formatted = Parsers['string']( blob );
    else if( isObj( blob ) )
        formatted = Parsers['object']( blob );
    else 
        return false;

    return formatted;
};
// hGraph.graph
// the graph class that is used to create every graph on the page
// with their canvas (as long as they have the 'hgraph-graph' trigger attribute)
hGraph.Graph = (function( config ){ 

function InternalResize( locals ) {
    var transform = locals.GetComponent( 'transform' ); 
    // update the width and height of the transform object
    transform.size.width = window.innerWidth;
    transform.size.height = window.innerHeight;
    // update the half-width and half-height position
    transform.position.x = transform.size.width * 0.5;
    transform.position.y = transform.size.height * 0.5;
    // update the size of the canvas
    d3.select( locals['canvas'] )
        .attr({ width : 2046, height : transform.size.height });
    // do an update after finished resizing
    return this.invokeQueue.push( inject( InternalUpdate, [ locals ], this ) ) && this.ExecuteQueue( );
};

function InternalDraw( locals ) {
    if( !this.ready )
        return false;
    var transform = locals.GetComponent( 'transform' ); 
    locals.device.clearRect( 0, 0, transform.size.width, transform.size.height );
    // loop through all components and draw them
    var components = locals['components'], name;
    for( name in components )
        components[name].Draw( );
};

function InternalUpdate( locals ) {
    if( !this.ready )
        return false;

    var transform = locals.GetComponent('transform');
    // update the scale
    var minRange = HGRAPH_RANGE_MINIMUM * transform.scale,
        maxRange = HGRAPH_RANGE_MAXIMUM * transform.scale;       
    locals.scoreScale.range([ minRange, maxRange ]);
    // loop through all components and update them
    var components = locals['components'], name;
    for( name in components )
        components[name].Update( );
    
    return this.invokeQueue.push( inject( InternalDraw, [ locals ], this ) ) && this.ExecuteQueue( );
};

function InternalMouseMove( locals ) {
    if( !this.ready )
        return false;
    
    // get the event from d3
    var evt = d3.event;
    // use the first touch event if they exist
    if( evt['touches'] )
        evt = evt['touches'][0];

    locals['mouse'].currentPositon.x = evt.pageX - locals['container'].offsetLeft;
    locals['mouse'].currentPositon.y = evt.pageY - locals['container'].offsetTop;

    var dx = locals['mouse'].currentPositon.x - locals['mouse'].lastPosition.x,
        dy = locals['mouse'].currentPositon.y - locals['mouse'].lastPosition.y;

    if( locals['mouse'].isDown ) {
        locals['mouse'].hasDragged = true;
        var transform = locals.GetComponent('transform');
        transform.scale += dy / 1000;
        if( transform.scale < 0.5 ) transform.scale = 0.5;
        transform.rotation += dx;
    }

    locals['mouse'].lastPosition.x = locals['mouse'].currentPositon.x;
    locals['mouse'].lastPosition.y = locals['mouse'].currentPositon.y;

    evt.preventDefault && evt.preventDefault( );

    // mouse move is an event where we need to update, add it to the queue and execute
    return this.invokeQueue.push( inject( InternalUpdate, [ locals ], this ) ) && this.ExecuteQueue( );
};

function InternalMouseUp( locals ) {
    if( !this.ready )
        return false;

    var evt = d3.event;

    locals['mouse'].isDown = false;
    
    setTimeout(function( ) { 
        locals['mouse'].hasDragged = false;
    }, 30 );

    return evt.preventDefault && evt.preventDefault( );
};

function InternalMouseDown( locals ) {
    if( !this.ready )
        return false;

    var evt = d3.event;

    if( evt['touches'] )
        evt = evt['touches'][0];

    locals['mouse'].lastPosition.x = evt.pageX - locals['container'].offsetLeft;
    locals['mouse'].lastPosition.y = evt.pageY - locals['container'].offsetTop;
    locals['mouse'].isDown = true;

    return evt.preventDefault && evt.preventDefault( );
};

function InternalZoom( locals ) {    
    var transform = locals.GetComponent('transform');

    // increate the scale (zooming in)
    transform.scale = ( this.zoomed ) ? 0.5 : 2.0;
    transform.position.x = ( this.zoomed ) ? transform.size.width / 2.0 : 0.0;

    this.zoomed = !this.zoomed;

    // execute the new stack
    return this.invokeQueue.push( inject( InternalUpdate, [ locals ], this ) ) && this.ExecuteQueue( );
};

function InternalClick( locals ) {
    var evt = d3.event,
        clickX = evt.pageX - locals['container'].offsetLeft,
        clickY = evt.pageY - locals['container'].offsetTop,
        pointManager = locals.GetComponent('pointManager');
    
    // don't execute clicks if there has been a drag
    if( locals['mouse'].hasDragged )
        return;
    
    if( pointManager.CheckClick( clickX, clickY ) )
        return this.invokeQueue.push( inject( InternalZoom, [ locals ], this ) ) && this.ExecuteQueue( );
};

function InternalInitialize( locals ) {
    if( !this.ready )
        return false;

    // add points to the point manager
    var pointManager = locals.GetComponent('pointManager'),
        healthPoints = locals['payload'].points;
        
    for( var i = 0; i < healthPoints.length; i++ )
        healthPoints[i] = pointManager.AddPoint( healthPoints[i] );
    
    // loop through all components and initialize them
    var components = locals['components'], name;
    for( name in components )
        components[name].Initialize( locals );
    
    // set default graph text properties
    locals['device'].font = HGRAPH_CANVAS_TEXT;
    locals['device'].textAlign = HGRAPH_CANVAS_TEXTALIGN;
    
    return this.invokeQueue.push( inject( InternalUpdate, [ locals ], this ) ) && this.ExecuteQueue( );
};

function Graph( config ) {
    // while the graph is being prepared, it is not ready
    this.ready = false;
    
    // if no configuration was passed in for this graph, end    
    if( !config )
        return false;
    
    var // local references
        _uid = config.uid || createUID( ),
        _container = config.container,
        _canvas = document.createElement('canvas'),
        _device = _canvas.getContext('2d'),
        _mouse = { 
            currentPositon : {
                x : 0, 
                y : 0
            },
            lastPosition : {
                x : 0,
                y : 0
            },
            isDown : false,
            hasDragged : false,
        },
        _components = { };
        
    try { 
        // add the canvas to the container
    	_container.appendChild( _canvas );
    } catch( e ) {
        this.ready = false;
        throw hGraph.Error('unable to insert a graph canvas into the specified container');
    }
    
    // add the components that will make up this graph
    _components['transform'] = new hGraph.Graph.Transform( );
    _components['ring'] = new hGraph.Graph.Ring( );
    _components['web'] = new hGraph.Graph.Web( );
    _components['pointManager'] = new hGraph.Graph.PointManager( );
    
    // save all of those locals into a local object to be injected
    var locals = {
        uid : _uid,
        container : _container,
        canvas : _canvas,
        device : _device,
        mouse : _mouse,
        components : _components,
        scoreScale : d3.scale.linear( )
                        .domain([0,100])
                        .range([ HGRAPH_RANGE_MINIMUM, HGRAPH_RANGE_MAXIMUM ])
    };
    
    // GetComponent
    // a helper function that will return a component in the local component list based on a name
    // @param {string} the name of the component in the hash
    // @returns {object} a component that was created in the ComponentFactory
    locals.GetComponent = function( name ) {
        if( !this.components[name] )
            throw hGraph.Error('that component does not exist');
            
        return this.components[name];
    };
    
    var MouseMove = inject( InternalMouseMove, [ locals ], this ),
        MouseDown = inject( InternalMouseDown, [ locals ], this ),
        MouseUp = inject( InternalMouseUp, [ locals ], this ),
        CheckClick = inject( InternalClick, [ locals ], this ),
        Resize = inject( InternalResize, [ locals ], this );
            
    d3.select( _canvas )
        .attr( 'hgraph-layer', 'data' )
        .on( 'mousemove', MouseMove )
        .on( 'mousedown', MouseDown )
        .on( 'mouseup', MouseUp )
        .on( 'click', CheckClick )
        .attr({ 
            width : 2046,
            height : _components['transform'].size.height, 
        });
    
    d3.select( document )
        .on( 'mouseup', MouseUp )
        .on( 'touchstart', MouseDown )
        .on( 'touchend', MouseUp )
        .on( 'touchmove', MouseMove );
    
    locals['device'].scale( 2.0, 2.0 );
    
    hResizeCallbacks.push( Resize );    
    
    // attempt to access payload data
    var payload = false;
    d3.select( _container ).select( HGRAPH_PAYLOAD_TRIGGERS.join(',') ).each(function( ) {
        if( this.value )
            payload = hGraph.Data.Parse( this.value );
    });
    
    if( !payload || !payload.formatted || !payload.points )
        throw hGraph.Error('no payload information found for the graph');
    
    // if the payload object exists, it must be okay (save it)
    locals['payload'] = payload;

    // flag the graph as being ready for initialization
    this.ready = true;
    this.zoomed = false;
    
    // the invoke queue starts with initialization 
    this.invokeQueue = [ Resize, inject( InternalInitialize, [ locals ], this ) ];
};

Graph.prototype = {
        
    constructor : Graph,    
    
    Initialize : function( ) {
        if( this.ready )
            this.ExecuteQueue( );
    },
    
    ExecuteQueue : function( ) {
        var fn;
        while( fn = this.invokeQueue.pop( ) )
            if( isFn( fn ) ) { fn( ); }
    }
    
};

return Graph;

})( );

// hGraph.Graph.ComponentFacory
// creates a constructor that will have a prototype with the 
// properies modified by the factory function being passed as 
// the parameter
hGraph.Graph.ComponentFacory = function( factory ) {
    // create the public scope object 
    var proto = { };
        
    // allow the factory function to change the public scope (by reference) 
    factory( proto );
    
    // create the constructor for this component
    var Component = (function( fn ) {
        // the returned function is used as the constuctor for all component
        // instances. it handles calling the constructor specific to the component
        // defined by the factory function, and setting up all important stuff
        return function( ) {
            fn.apply( this, splice.call( arguments, 0 ) );
        };
    })( hasOwn.call( factory, 'constructor') ? factory['constructor'] : function( ) { } );
    
    Component.prototype = {
        
        Initialize : function( locals ) {
            // all components are not ready till proven otherwise
            this.ready = false;            
            // save a reference to the local variables on this object
            this.locals = locals || false;
            // do not move forward if there is no locals information in this component
            if( !this.locals || !this.locals['uid'] )
                throw new hGraph.Error('the component was unable to initialize with the information provided');
            // call the post initialize method for any component-specific initialization
            return this.PostInitialize( );
        },
        
        // placeholder functions that are overridden during extension
        Draw : function( ) { },
        Update : function( ) { },
        PostInitialize : function( ) { }
        
    };
    
    // extend the component's prototype with the modified scope 
    extend( Component.prototype, proto );
    
    // return the constructor to be used
    return Component;
};

// hGraph.Graph.Transform
// the transform component

// TransformFactory
function TransformFactory( proto ) {
    
    proto.Move = function( dx, dy ) {
        this.position.x += dx;
        this.position.y += dy;
    };
    
};

// TransformFactory (constructor)
TransformFactory['constructor'] = function( ) {
    // initialize everything with starting values
    this.size = { width : HGRAPH_WIDTH, height : HGRAPH_HEIGHT };
    this.position = { x : ( this.size.width * 0.5 ), y : ( this.size.height * 0.5 ) };
    this.scale = 1;
    this.rotation = 0;
};

// create the constructor from the component factory
hGraph.Graph.Transform = hGraph.Graph.ComponentFacory( TransformFactory );

// hGraph.Graph.PointManager

// PointManagerFactory
function PointManagerFactory( proto ) {
    
    function CalculatePointIncrement( ) {
        var amt = this.points.length,
            inc = ( this.maxDegree - this.minDegree ) / amt;
        return inc;
    };
    
    proto.CheckClick = function( mx, my ) {
        for( var i = 0; i < this.points.length; i++ )
            if( this.points[i].CheckBoundingBox( mx, my ) ) return true;
    };
    
    proto.Update = function( ) { 
        var transform = this.locals.GetComponent('transform');
        this.opacity = ( this.subFlag ) ? abs( 0.5 - transform.scale ) : 1.0;
        this.drawFlag = this.opacity > 0 ? true : false;
        // loop through the points, updating them
        for( var i = 0; i < this.points.length; i++ )
            this.points[i].Update( );
    };
    
    proto.Draw = function( ) {
        // loop through the points, drawing them
        for( var i = 0; i < this.points.length; i++ )
            this.points[i].Draw( );
    };
        
    proto.AddPoint = function( data ) { 
        // create the point
        var point = new hGraph.Graph.Point( data );
        
        // make sure the point knows what his index is
        point.index = this.points.length;
        
        // expose this manager to the point so it will be able to calc it's degree
        point.manager = this;
        
        // if this is a sub-point list, make this dot smaller
        if( this.subFlag )
            point.radius = HGRAPH_SUBPOINT_RADIUS;
            
        // add the point to the manager's 'points' array
        this.points.push( point );
        
        // return the point for local storage
        return point;
    };
    
    proto.PostInitialize = function( ) { 
        // update the manager's 'pointIncrement' property
        this.pointIncrement = CalculatePointIncrement.call( this );
        
        // initialize the points with the local variable hash
        for( var i = 0; i < this.points.length; i++ )
        	this.points[i].Initialize( this.locals );  
    };

};

// PointManagerFactory (constructor)
PointManagerFactory['constructor'] = function( subManagerFlag ) {
    // initialize everything to 0
    this.points = [ ];
    this.pointIncrement = 0;
    this.minDegree = 0;
    this.maxDegree = 360;
    this.subFlag = ( subManagerFlag === true ) ? true : false;
    this.drawFlag = true;
};

// create the constructor from the component factory
hGraph.Graph.PointManager = hGraph.Graph.ComponentFacory( PointManagerFactory );

// hGraph.Graph.Ring
// one of the drawable components of the hGraph.Graph class.

// RingFactory
function RingFactory( proto ) {
    
    proto.Draw = function( ) {
        // get the graph's transform and device components
        var transform = this.locals.GetComponent('transform'),
            device = this.locals.device,
            scoreScale = this.locals.scoreScale;
        
        device.globalAlpha = 1.0;
        // draw the outer circle first
        device.beginPath( );
        device.arc( transform.position.x, transform.position.y, scoreScale(66), 0, Math.PI * 20 );
        device.fillStyle = HGRAPH_RING_FILL_COLOR;
        device.fill( );
        
        // draw the outer circle first
        device.beginPath( );
        device.arc( transform.position.x, transform.position.y, scoreScale(33), 0, Math.PI * 20 );
        device.fillStyle = "#fff";
        device.fill( );
        
    };

};

RingFactory['constructor'] = function( ) {
    this.innerRadius = HGRAPH_INNER_RADIUS;  
    this.outerRadius = HGRAPH_OUTER_RADIUS;
};

// create the Ring constructor from the component factory
hGraph.Graph.Ring = hGraph.Graph.ComponentFacory( RingFactory );

// hGraph.Graph.PointText
// points 

// PointFactory
function PointTextFactory( proto ) {
    
    function GetFullText( ) {
        var str = this.name;
        if( this.value && this.value !== "")
            str += " " + this.value;  
        if( this.units && this.units !== "")
            str += " (" + this.units + ")";
        return str;
    };
    
    function GetShortText( ) {
        return this.name;  
    };
    
    proto.Update = function( rotation ) {
        var graphTransform = this.locals.GetComponent('transform'),
            scoreScale = this.locals.scoreScale,
            dist;
        
        // get the distance the point is away
        dist = scoreScale( 110 );
        
        // update the transform of this point
        this.transform.position.x = Math.cos( toRad( rotation ) ) * dist;
        this.transform.position.y = Math.sin( toRad( rotation ) ) * dist;
                                    
        this.text = graphTransform.scale > 1.5 
                        ? GetFullText.call( this )
                        : GetShortText.call( this );
    };
    
    proto.Draw = function( ) {
        var device = this.locals['device'],
            graphTransform = this.locals.GetComponent('transform');
        
        if( this.transform.position.x > 40 * graphTransform.scale ) 
            device.textAlign = 'start';
        else if( this.transform.position.x < -(40 * graphTransform.scale) )
            device.textAlign = 'end';
        else
            device.textAlign = 'center';
        
        var xpos = graphTransform.position.x + this.transform.position.x,
            ypos = graphTransform.position.y + this.transform.position.y;
            
        device.fillText( this.text, xpos, ypos );
    };
      
};

PointTextFactory['constructor'] = function( config ) {
    if( !config )
        return false;
        
    this.name  = config['name'];    
    this.units = config['units'];
    this.value = config['value'];
    this.healthyRange = config['healthyRange']; 
    this.text = this.name;
    
    this.transform = new hGraph.Graph.Transform( );   
};

// create the constructor from the component factory
hGraph.Graph.PointText = hGraph.Graph.ComponentFacory( PointTextFactory );

// hGraph.Graph.Point
// points 

// PointFactory
function PointFactory( proto ) {

    proto.Update = function( ) {    
        var graphTransform = this.locals.GetComponent('transform'),
            graphWeb = this.locals.GetComponent('web'),
            scoreScale = this.locals.scoreScale,
            dist;
        
        // get the distance the point is away
        dist = scoreScale( this.score );
        
        // update the transform of this point
        this.transform.position.x = graphTransform.position.x + 
                                    Math.cos( toRad( this.transform.rotation + graphTransform.rotation ) ) *
                                    dist;
        this.transform.position.y = graphTransform.position.y + 
                                    Math.sin( toRad( this.transform.rotation + graphTransform.rotation ) ) *
                                    dist;
        
        // the point color will be updated
        this.pointColor = ( this.score < 66 && this.score > 33 ) 
                                ? HGRAPH_POINT_COLOR_HEALTHY
                                : HGRAPH_POINT_COLOR_UNHEALTHY;
        
        // add this point to the graph's web path if it needs to be drawn
        if( this.manager.drawFlag === true )
            graphWeb.AddPoint( this.transform );
        
        // update any children this point may have
        this.subManager.Update( );   
        // udpate the point's text
        this.text.Update( this.transform.rotation + graphTransform.rotation );
    };
    
    proto.Draw = function( ) {         
        var device = this.locals['device'];
        // set opacity based on point manager
        device.globalAlpha = this.manager.opacity;
        // draw the circle
        device.beginPath( );
        device.arc( this.transform.position.x, this.transform.position.y, this.radius, 0, Math.PI * 20 );
        device.fillStyle = this.pointColor;
        device.fill( );
        // draw the text for this point
        this.text.Draw( );
        // draw any sub points
        if( this.subManager.points.length > 0 )
        	this.subManager.Draw( );
    };
    
    proto.CheckBoundingBox = function( mx, my ) {
        var graphTransform = this.locals.GetComponent('transform'),
            distX = mx - this.transform.position.x,
            distY = my - this.transform.position.y,
            distA = ( distX * distX ) + ( distY * distY ),
            ownClick = distA < ( this.radius * this.radius ),
            childClick = this.subManager.CheckClick( mx, my );
            
        return ownClick || childClick;
    };
    
    proto.PostInitialize = function( ) {
        var manager = this.manager,
            dependencies = this.dependencies,
            subData, subPoint;
        
        // loop through the dependencies data and addd points into the sub manager
        while( subData = dependencies.pop( ) )
            subPoint = this.subManager.AddPoint( subData );
        
        // calculate the sub-manager's rotational degree information
        var start = manager.pointIncrement * this.index,
            end = start + manager.pointIncrement,
            subSpace = end - start,
            subInc = subSpace / ( this.subManager.points.length + 2 );
        // save the degree information
        this.subManager.minDegree = start + subInc;
        this.subManager.maxDegree = end - subInc;
        // initialize the sub manager, which initializes sub points
        this.subManager.Initialize( this.locals );
        this.text.Initialize( this.locals );
        // update this point's rotation value
        this.transform.rotation = ( this.manager.pointIncrement * this.index ) + this.manager.minDegree;
    };
          
};

PointFactory['constructor'] = function( config ) {  
    if( !config || !isObj( config ) )
        throw hGraph.Error('not enough information provided to create point');
    this.radius = HGRAPH_POINT_RADIUS;
    // grab values from the configuration
    this.score = toInt( config['score'] );
    // every point has a tranform to use
    this.transform = new hGraph.Graph.Transform( );
    // create the text from the configuration
    this.text = new hGraph.Graph.PointText( config );
    // create a sub manager in case of dependent points
    this.subManager = new hGraph.Graph.PointManager( true );
    // save an array of the dependent points
    this.dependencies = config.dependencies || [ ];    
    this.pointColor = "#333";
};

// create the constructor from the component factory
hGraph.Graph.Point = hGraph.Graph.ComponentFacory( PointFactory );

function WebFactory( proto ) {
    
    proto.Draw = function( ) {
        var device = this.locals['device'],
            point;
        
        device.globalAlpha = "0.1";
        device.fillStyle = '#000';
        device.beginPath( );
        // loop through points, adding their location to the current path
        while( point = this.path.pop( ) )
            device.lineTo( point.position.x, point.position.y );
            
        device.fill( );
        device.globalAlpha = "1.0";
    };
        
    proto.AddPoint = function( transform ) {
        this.path.push( transform );
    };
    
};

WebFactory['constructor'] = function( ) {
    this.path = [ ];  
};

// create the constructor from the component factory
hGraph.Graph.Web = hGraph.Graph.ComponentFacory( WebFactory );

/** 
 * @private
 * @function hWindowResize
 * @description callback for window resizing. loops through an array of resizing functions, calling them
 */
function hWindowResize( ) { 
  forEach( hResizeCallbacks, function( fn )  {
    return isFn( fn ) && fn( ); 
  });
};

/** 
 * @private
 * @function hCreateGraph
 * @description creates a graph instance with a container
 * @param {Object} container The container to append the graph rendering context into
 */
function hCreateGraph( container ){
  var uid = createUID( );
  hGraphInstances[uid] = new hGraph.Graph({ uid : uid, container : container });
};

/** 
 * @private
 * @function hGraphInit
 * @description initializes all instances of 'hGraph-graph' flagged elements
 */
function hGraphInit( ) {
  d3.select( HGRAPH_GRAPH_BOOTSTRAPS.join(',') ).each(function( ){
      hCreateGraph( this );
  });
  
  for( var uid in hGraphInstances )
      hGraphInstances[uid].Initialize( );
};

/** 
 * @private
 * @function hGraphBootStrap
 * @description called on document ready 
 */
function hGraphBootStrap( ) {
  // an array of matches
  var matches = [ ];
  d3.select( HGRAPH_APP_BOOTSTRAPS.join(',') ).each(function( ){
      matches.push( this );
  });
  // do not proceed if more than one 
  if( matches.length > 1 )
      throw new hGraph.Error('Too many root elements found on the page');
      
  hRootElement = matches[0];
  
  // if the 'hgraph-app' attribute was found, we can initialize
  if( hRootElement )
      return hGraphInit( );
};

d3.select( document )
  .on( 'DOMContentLoaded', hGraphBootStrap )
  .on('touchmove', function( ) {  
    d3.event.preventDefault && d3.event.preventDefault( );
  });
  
d3.selectAll( "html" )
  .on('touchmove', function( ) {  
    d3.event.preventDefault && d3.event.preventDefault( );
  });

d3.selectAll( "body" )
  .on('touchmove', function( ) {  
    d3.event.preventDefault && d3.event.preventDefault( );
  });
  

d3.select( window ).on( 'resize', hWindowResize );

// expose hGraph to the window
global.hGraph = hGraph;

})( window );
