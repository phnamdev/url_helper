// For decode purpose
    var N = N || function(a, b) {
        var c = {},
            d = c.lib = {},
            e = function() {},
            f = d.Base = {
                extend: function(a) {
                    e.prototype = this;
                    var b = new e;
                    return a && b.mixIn(a), b.hasOwnProperty("init") || (b.init = function() {
                        b.$super.init.apply(this, arguments)
                    }), b.init.prototype = b, b.$super = this, b
                },
                create: function() {
                    var a = this.extend();
                    return a.init.apply(a, arguments), a
                },
                init: function() {},
                mixIn: function(a) {
                    for (var b in a) a.hasOwnProperty(b) && (this[b] = a[b]);
                    a.hasOwnProperty("toString") && (this.toString = a.toString)
                },
                clone: function() {
                    return this.init.prototype.extend(this)
                }
            },
            g = d.WordArray = f.extend({
                init: function(a, c) {
                    a = this.words = a || [], this.sigBytes = c != b ? c : 4 * a.length
                },
                toString: function(a) {
                    return (a || i).stringify(this)
                },
                concat: function(a) {
                    var b = this.words,
                        c = a.words,
                        d = this.sigBytes;
                    if (a = a.sigBytes, this.clamp(), d % 4)
                        for (var e = 0; a > e; e++) b[d + e >>> 2] |= (c[e >>> 2] >>> 24 - 8 * (e % 4) & 255) << 24 - 8 * ((d + e) % 4);
                    else if (65535 < c.length)
                        for (e = 0; a > e; e += 4) b[d + e >>> 2] = c[e >>> 2];
                    else b.push.apply(b, c);
                    return this.sigBytes += a, this
                },
                clamp: function() {
                    var b = this.words,
                        c = this.sigBytes;
                    b[c >>> 2] &= 4294967295 << 32 - 8 * (c % 4), b.length = a.ceil(c / 4)
                },
                clone: function() {
                    var a = f.clone.call(this);
                    return a.words = this.words.slice(0), a
                },
                random: function(b) {
                    for (var c = [], d = 0; b > d; d += 4) c.push(4294967296 * a.random() | 0);
                    return new g.init(c, b)
                }
            }),
            h = c.enc = {},
            i = h.Hex = {
                stringify: function(a) {
                    var b = a.words;
                    a = a.sigBytes;
                    for (var c = [], d = 0; a > d; d++) {
                        var e = b[d >>> 2] >>> 24 - 8 * (d % 4) & 255;
                        c.push((e >>> 4).toString(16)), c.push((15 & e).toString(16))
                    }
                    return c.join("")
                },
                parse: function(a) {
                    for (var b = a.length, c = [], d = 0; b > d; d += 2) c[d >>> 3] |= parseInt(a.substr(d, 2), 16) << 24 - 4 * (d % 8);
                    return new g.init(c, b / 2)
                }
            },
            j = h.Latin1 = {
                stringify: function(a) {
                    var b = a.words;
                    a = a.sigBytes;
                    for (var c = [], d = 0; a > d; d++) c.push(String.fromCharCode(b[d >>> 2] >>> 24 - 8 * (d % 4) & 255));
                    return c.join("")
                },
                parse: function(a) {
                    for (var b = a.length, c = [], d = 0; b > d; d++) c[d >>> 2] |= (255 & a.charCodeAt(d)) << 24 - 8 * (d % 4);
                    return new g.init(c, b)
                }
            },
            k = h.Utf8 = {
                stringify: function(a) {
                    try {
                        return decodeURIComponent(escape(j.stringify(a)))
                    } catch (b) {
                        throw Error("Malformed UTF-8 data")
                    }
                },
                parse: function(a) {
                    return j.parse(unescape(encodeURIComponent(a)))
                }
            },
            l = d.BufferedBlockAlgorithm = f.extend({
                reset: function() {
                    this._data = new g.init, this._nDataBytes = 0
                },
                _append: function(a) {
                    "string" == typeof a && (a = k.parse(a)), this._data.concat(a), this._nDataBytes += a.sigBytes
                },
                _process: function(b) {
                    var c = this._data,
                        d = c.words,
                        e = c.sigBytes,
                        f = this.blockSize,
                        h = e / (4 * f),
                        h = b ? a.ceil(h) : a.max((0 | h) - this._minBufferSize, 0);
                    if (b = h * f, e = a.min(4 * b, e), b) {
                        for (var i = 0; b > i; i += f) this._doProcessBlock(d, i);
                        i = d.splice(0, b), c.sigBytes -= e
                    }
                    return new g.init(i, e)
                },
                clone: function() {
                    var a = f.clone.call(this);
                    return a._data = this._data.clone(), a
                },
                _minBufferSize: 0
            });
        d.Hasher = l.extend({
            cfg: f.extend(),
            init: function(a) {
                this.cfg = this.cfg.extend(a), this.reset()
            },
            reset: function() {
                l.reset.call(this), this._doReset()
            },
            update: function(a) {
                return this._append(a), this._process(), this
            },
            finalize: function(a) {
                return a && this._append(a), this._doFinalize()
            },
            blockSize: 16,
            _createHelper: function(a) {
                return function(b, c) {
                    return new a.init(c).finalize(b)
                }
            },
            _createHmacHelper: function(a) {
                return function(b, c) {
                    return new m.HMAC.init(a, c).finalize(b)
                }
            }
        });
        var m = c.algo = {};
        return c
    }(Math);
    ! function() {
        var a = N,
            b = a.lib.WordArray;
        a.enc.Base64 = {
            stringify: function(a) {
                var b = a.words,
                    c = a.sigBytes,
                    d = this._map;
                a.clamp(), a = [];
                for (var e = 0; c > e; e += 3)
                    for (var f = (b[e >>> 2] >>> 24 - 8 * (e % 4) & 255) << 16 | (b[e + 1 >>> 2] >>> 24 - 8 * ((e + 1) % 4) & 255) << 8 | b[e + 2 >>> 2] >>> 24 - 8 * ((e + 2) % 4) & 255, g = 0; 4 > g && c > e + .75 * g; g++) a.push(d.charAt(f >>> 6 * (3 - g) & 63));
                if (b = d.charAt(64))
                    for (; a.length % 4;) a.push(b);
                return a.join("")
            },
            parse: function(a) {
                var c = a.length,
                    d = this._map,
                    e = d.charAt(64);
                e && (e = a.indexOf(e), -1 != e && (c = e));
                for (var e = [], f = 0, g = 0; c > g; g++)
                    if (g % 4) {
                        var h = d.indexOf(a.charAt(g - 1)) << 2 * (g % 4),
                            i = d.indexOf(a.charAt(g)) >>> 6 - 2 * (g % 4);
                        e[f >>> 2] |= (h | i) << 24 - 8 * (f % 4), f++
                    }
                return b.create(e, f)
            },
            _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
        }
    }(),
    function(a) {
        function b(a, b, c, d, e, f, g) {
            return a = a + (b & c | ~b & d) + e + g, (a << f | a >>> 32 - f) + b
        }

        function c(a, b, c, d, e, f, g) {
            return a = a + (b & d | c & ~d) + e + g, (a << f | a >>> 32 - f) + b
        }

        function d(a, b, c, d, e, f, g) {
            return a = a + (b ^ c ^ d) + e + g, (a << f | a >>> 32 - f) + b
        }

        function e(a, b, c, d, e, f, g) {
            return a = a + (c ^ (b | ~d)) + e + g, (a << f | a >>> 32 - f) + b
        }
        for (var f = N, g = f.lib, h = g.WordArray, i = g.Hasher, g = f.algo, j = [], k = 0; 64 > k; k++) j[k] = 4294967296 * a.abs(a.sin(k + 1)) | 0;
        g = g.MD5 = i.extend({
            _doReset: function() {
                this._hash = new h.init([1732584193, 4023233417, 2562383102, 271733878])
            },
            _doProcessBlock: function(a, f) {
                for (var g = 0; 16 > g; g++) {
                    var h = f + g,
                        i = a[h];
                    a[h] = 16711935 & (i << 8 | i >>> 24) | 4278255360 & (i << 24 | i >>> 8)
                }
                var g = this._hash.words,
                    h = a[f + 0],
                    i = a[f + 1],
                    k = a[f + 2],
                    l = a[f + 3],
                    m = a[f + 4],
                    n = a[f + 5],
                    o = a[f + 6],
                    p = a[f + 7],
                    q = a[f + 8],
                    r = a[f + 9],
                    s = a[f + 10],
                    t = a[f + 11],
                    u = a[f + 12],
                    v = a[f + 13],
                    w = a[f + 14],
                    x = a[f + 15],
                    y = g[0],
                    z = g[1],
                    A = g[2],
                    B = g[3],
                    y = b(y, z, A, B, h, 7, j[0]),
                    B = b(B, y, z, A, i, 12, j[1]),
                    A = b(A, B, y, z, k, 17, j[2]),
                    z = b(z, A, B, y, l, 22, j[3]),
                    y = b(y, z, A, B, m, 7, j[4]),
                    B = b(B, y, z, A, n, 12, j[5]),
                    A = b(A, B, y, z, o, 17, j[6]),
                    z = b(z, A, B, y, p, 22, j[7]),
                    y = b(y, z, A, B, q, 7, j[8]),
                    B = b(B, y, z, A, r, 12, j[9]),
                    A = b(A, B, y, z, s, 17, j[10]),
                    z = b(z, A, B, y, t, 22, j[11]),
                    y = b(y, z, A, B, u, 7, j[12]),
                    B = b(B, y, z, A, v, 12, j[13]),
                    A = b(A, B, y, z, w, 17, j[14]),
                    z = b(z, A, B, y, x, 22, j[15]),
                    y = c(y, z, A, B, i, 5, j[16]),
                    B = c(B, y, z, A, o, 9, j[17]),
                    A = c(A, B, y, z, t, 14, j[18]),
                    z = c(z, A, B, y, h, 20, j[19]),
                    y = c(y, z, A, B, n, 5, j[20]),
                    B = c(B, y, z, A, s, 9, j[21]),
                    A = c(A, B, y, z, x, 14, j[22]),
                    z = c(z, A, B, y, m, 20, j[23]),
                    y = c(y, z, A, B, r, 5, j[24]),
                    B = c(B, y, z, A, w, 9, j[25]),
                    A = c(A, B, y, z, l, 14, j[26]),
                    z = c(z, A, B, y, q, 20, j[27]),
                    y = c(y, z, A, B, v, 5, j[28]),
                    B = c(B, y, z, A, k, 9, j[29]),
                    A = c(A, B, y, z, p, 14, j[30]),
                    z = c(z, A, B, y, u, 20, j[31]),
                    y = d(y, z, A, B, n, 4, j[32]),
                    B = d(B, y, z, A, q, 11, j[33]),
                    A = d(A, B, y, z, t, 16, j[34]),
                    z = d(z, A, B, y, w, 23, j[35]),
                    y = d(y, z, A, B, i, 4, j[36]),
                    B = d(B, y, z, A, m, 11, j[37]),
                    A = d(A, B, y, z, p, 16, j[38]),
                    z = d(z, A, B, y, s, 23, j[39]),
                    y = d(y, z, A, B, v, 4, j[40]),
                    B = d(B, y, z, A, h, 11, j[41]),
                    A = d(A, B, y, z, l, 16, j[42]),
                    z = d(z, A, B, y, o, 23, j[43]),
                    y = d(y, z, A, B, r, 4, j[44]),
                    B = d(B, y, z, A, u, 11, j[45]),
                    A = d(A, B, y, z, x, 16, j[46]),
                    z = d(z, A, B, y, k, 23, j[47]),
                    y = e(y, z, A, B, h, 6, j[48]),
                    B = e(B, y, z, A, p, 10, j[49]),
                    A = e(A, B, y, z, w, 15, j[50]),
                    z = e(z, A, B, y, n, 21, j[51]),
                    y = e(y, z, A, B, u, 6, j[52]),
                    B = e(B, y, z, A, l, 10, j[53]),
                    A = e(A, B, y, z, s, 15, j[54]),
                    z = e(z, A, B, y, i, 21, j[55]),
                    y = e(y, z, A, B, q, 6, j[56]),
                    B = e(B, y, z, A, x, 10, j[57]),
                    A = e(A, B, y, z, o, 15, j[58]),
                    z = e(z, A, B, y, v, 21, j[59]),
                    y = e(y, z, A, B, m, 6, j[60]),
                    B = e(B, y, z, A, t, 10, j[61]),
                    A = e(A, B, y, z, k, 15, j[62]),
                    z = e(z, A, B, y, r, 21, j[63]);
                g[0] = g[0] + y | 0, g[1] = g[1] + z | 0, g[2] = g[2] + A | 0, g[3] = g[3] + B | 0
            },
            _doFinalize: function() {
                var b = this._data,
                    c = b.words,
                    d = 8 * this._nDataBytes,
                    e = 8 * b.sigBytes;
                c[e >>> 5] |= 128 << 24 - e % 32;
                var f = a.floor(d / 4294967296);
                for (c[(e + 64 >>> 9 << 4) + 15] = 16711935 & (f << 8 | f >>> 24) | 4278255360 & (f << 24 | f >>> 8), c[(e + 64 >>> 9 << 4) + 14] = 16711935 & (d << 8 | d >>> 24) | 4278255360 & (d << 24 | d >>> 8), b.sigBytes = 4 * (c.length + 1), this._process(), b = this._hash, c = b.words, d = 0; 4 > d; d++) e = c[d], c[d] = 16711935 & (e << 8 | e >>> 24) | 4278255360 & (e << 24 | e >>> 8);
                return b
            },
            clone: function() {
                var a = i.clone.call(this);
                return a._hash = this._hash.clone(), a
            }
        }), f.MD5 = i._createHelper(g), f.HmacMD5 = i._createHmacHelper(g)
    }(Math),
    function() {
        var a = N,
            b = a.lib,
            c = b.Base,
            d = b.WordArray,
            b = a.algo,
            e = b.EvpKDF = c.extend({
                cfg: c.extend({
                    keySize: 4,
                    hasher: b.MD5,
                    iterations: 1
                }),
                init: function(a) {
                    this.cfg = this.cfg.extend(a)
                },
                compute: function(a, b) {
                    for (var c = this.cfg, e = c.hasher.create(), f = d.create(), g = f.words, h = c.keySize, c = c.iterations; g.length < h;) {
                        i && e.update(i);
                        var i = e.update(a).finalize(b);
                        e.reset();
                        for (var j = 1; c > j; j++) i = e.finalize(i), e.reset();
                        f.concat(i)
                    }
                    return f.sigBytes = 4 * h, f
                }
            });
        a.EvpKDF = function(a, b, c) {
            return e.create(c).compute(a, b)
        }
    }(), N.lib.Cipher || function(a) {
            var b = N,
                c = b.lib,
                d = c.Base,
                e = c.WordArray,
                f = c.BufferedBlockAlgorithm,
                g = b.enc.Base64,
                h = b.algo.EvpKDF,
                i = c.Cipher = f.extend({
                    cfg: d.extend(),
                    createEncryptor: function(a, b) {
                        return this.create(this._ENC_XFORM_MODE, a, b)
                    },
                    createDecryptor: function(a, b) {
                        return this.create(this._DEC_XFORM_MODE, a, b)
                    },
                    init: function(a, b, c) {
                        this.cfg = this.cfg.extend(c), this._xformMode = a, this._key = b, this.reset()
                    },
                    reset: function() {
                        f.reset.call(this), this._doReset()
                    },
                    process: function(a) {
                        return this._append(a), this._process()
                    },
                    finalize: function(a) {
                        return a && this._append(a), this._doFinalize()
                    },
                    keySize: 4,
                    ivSize: 4,
                    _ENC_XFORM_MODE: 1,
                    _DEC_XFORM_MODE: 2,
                    _createHelper: function(a) {
                        return {
                            encrypt: function(b, c, d) {
                                return ("string" == typeof c ? o : n).encrypt(a, b, c, d)
                            },
                            decrypt: function(b, c, d) {
                                return ("string" == typeof c ? o : n).decrypt(a, b, c, d)
                            }
                        }
                    }
                });
            c.StreamCipher = i.extend({
                _doFinalize: function() {
                    return this._process(!0)
                },
                blockSize: 1
            });
            var j = b.mode = {},
                k = function(b, c, d) {
                    var e = this._iv;
                    e ? this._iv = a : e = this._prevBlock;
                    for (var f = 0; d > f; f++) b[c + f] ^= e[f]
                },
                l = (c.BlockCipherMode = d.extend({
                    createEncryptor: function(a, b) {
                        return this.Encryptor.create(a, b)
                    },
                    createDecryptor: function(a, b) {
                        return this.Decryptor.create(a, b)
                    },
                    init: function(a, b) {
                        this._cipher = a, this._iv = b
                    }
                })).extend();
            l.Encryptor = l.extend({
                processBlock: function(a, b) {
                    var c = this._cipher,
                        d = c.blockSize;
                    k.call(this, a, b, d), c.encryptBlock(a, b), this._prevBlock = a.slice(b, b + d)
                }
            }), l.Decryptor = l.extend({
                processBlock: function(a, b) {
                    var c = this._cipher,
                        d = c.blockSize,
                        e = a.slice(b, b + d);
                    c.decryptBlock(a, b), k.call(this, a, b, d), this._prevBlock = e
                }
            }), j = j.CBC = l, l = (b.pad = {}).Pkcs7 = {
                pad: function(a, b) {
                    for (var c = 4 * b, c = c - a.sigBytes % c, d = c << 24 | c << 16 | c << 8 | c, f = [], g = 0; c > g; g += 4) f.push(d);
                    c = e.create(f, c), a.concat(c)
                },
                unpad: function(a) {
                    a.sigBytes -= 255 & a.words[a.sigBytes - 1 >>> 2]
                }
            }, c.BlockCipher = i.extend({
                cfg: i.cfg.extend({
                    mode: j,
                    padding: l
                }),
                reset: function() {
                    i.reset.call(this);
                    var a = this.cfg,
                        b = a.iv,
                        a = a.mode;
                    if (this._xformMode == this._ENC_XFORM_MODE) var c = a.createEncryptor;
                    else c = a.createDecryptor, this._minBufferSize = 1;
                    this._mode = c.call(a, this, b && b.words)
                },
                _doProcessBlock: function(a, b) {
                    this._mode.processBlock(a, b)
                },
                _doFinalize: function() {
                    var a = this.cfg.padding;
                    if (this._xformMode == this._ENC_XFORM_MODE) {
                        a.pad(this._data, this.blockSize);
                        var b = this._process(!0)
                    } else b = this._process(!0), a.unpad(b);
                    return b
                },
                blockSize: 4
            });
            var m = c.CipherParams = d.extend({
                    init: function(a) {
                        this.mixIn(a)
                    },
                    toString: function(a) {
                        return (a || this.formatter).stringify(this)
                    }
                }),
                j = (b.format = {}).OpenSSL = {
                    stringify: function(a) {
                        var b = a.ciphertext;
                        return a = a.salt, (a ? e.create([1398893684, 1701076831]).concat(a).concat(b) : b).toString(g)
                    },
                    parse: function(a) {
                        a = g.parse(a);
                        var b = a.words;
                        if (1398893684 == b[0] && 1701076831 == b[1]) {
                            var c = e.create(b.slice(2, 4));
                            b.splice(0, 4), a.sigBytes -= 16
                        }
                        return m.create({
                            ciphertext: a,
                            salt: c
                        })
                    }
                },
                n = c.SerializableCipher = d.extend({
                    cfg: d.extend({
                        format: j
                    }),
                    encrypt: function(a, b, c, d) {
                        d = this.cfg.extend(d);
                        var e = a.createEncryptor(c, d);
                        return b = e.finalize(b), e = e.cfg, m.create({
                            ciphertext: b,
                            key: c,
                            iv: e.iv,
                            algorithm: a,
                            mode: e.mode,
                            padding: e.padding,
                            blockSize: a.blockSize,
                            formatter: d.format
                        })
                    },
                    decrypt: function(a, b, c, d) {
                        return d = this.cfg.extend(d), b = this._parse(b, d.format), a.createDecryptor(c, d).finalize(b.ciphertext)
                    },
                    _parse: function(a, b) {
                        return "string" == typeof a ? b.parse(a, this) : a
                    }
                }),
                b = (b.kdf = {}).OpenSSL = {
                    execute: function(a, b, c, d) {
                        return d || (d = e.random(8)), a = h.create({
                            keySize: b + c
                        }).compute(a, d), c = e.create(a.words.slice(b), 4 * c), a.sigBytes = 4 * b, m.create({
                            key: a,
                            iv: c,
                            salt: d
                        })
                    }
                },
                o = c.PasswordBasedCipher = n.extend({
                    cfg: n.cfg.extend({
                        kdf: b
                    }),
                    encrypt: function(a, b, c, d) {
                        return d = this.cfg.extend(d), c = d.kdf.execute(c, a.keySize, a.ivSize), d.iv = c.iv, a = n.encrypt.call(this, a, b, c.key, d), a.mixIn(c), a
                    },
                    decrypt: function(a, b, c, d) {
                        return d = this.cfg.extend(d), b = this._parse(b, d.format), c = d.kdf.execute(c, a.keySize, a.ivSize, b.salt), d.iv = c.iv, n.decrypt.call(this, a, b, c.key, d)
                    }
                })
        }(),
        function() {
            for (var a = N, b = a.lib.BlockCipher, c = a.algo, d = [], e = [], f = [], g = [], h = [], i = [], j = [], k = [], l = [], m = [], n = [], o = 0; 256 > o; o++) n[o] = 128 > o ? o << 1 : o << 1 ^ 283;
            for (var p = 0, q = 0, o = 0; 256 > o; o++) {
                var r = q ^ q << 1 ^ q << 2 ^ q << 3 ^ q << 4,
                    r = r >>> 8 ^ 255 & r ^ 99;
                d[p] = r, e[r] = p;
                var s = n[p],
                    t = n[s],
                    u = n[t],
                    v = 257 * n[r] ^ 16843008 * r;
                f[p] = v << 24 | v >>> 8, g[p] = v << 16 | v >>> 16, h[p] = v << 8 | v >>> 24, i[p] = v, v = 16843009 * u ^ 65537 * t ^ 257 * s ^ 16843008 * p, j[r] = v << 24 | v >>> 8, k[r] = v << 16 | v >>> 16, l[r] = v << 8 | v >>> 24, m[r] = v, p ? (p = s ^ n[n[n[u ^ s]]], q ^= n[n[q]]) : p = q = 1
            }
            var w = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
                c = c.AES = b.extend({
                    _doReset: function() {
                        for (var a = this._key, b = a.words, c = a.sigBytes / 4, a = 4 * ((this._nRounds = c + 6) + 1), e = this._keySchedule = [], f = 0; a > f; f++)
                            if (c > f) e[f] = b[f];
                            else {
                                var g = e[f - 1];
                                f % c ? c > 6 && 4 == f % c && (g = d[g >>> 24] << 24 | d[g >>> 16 & 255] << 16 | d[g >>> 8 & 255] << 8 | d[255 & g]) : (g = g << 8 | g >>> 24, g = d[g >>> 24] << 24 | d[g >>> 16 & 255] << 16 | d[g >>> 8 & 255] << 8 | d[255 & g], g ^= w[f / c | 0] << 24), e[f] = e[f - c] ^ g
                            }
                        for (b = this._invKeySchedule = [], c = 0; a > c; c++) f = a - c, g = c % 4 ? e[f] : e[f - 4], b[c] = 4 > c || 4 >= f ? g : j[d[g >>> 24]] ^ k[d[g >>> 16 & 255]] ^ l[d[g >>> 8 & 255]] ^ m[d[255 & g]]
                    },
                    encryptBlock: function(a, b) {
                        this._doCryptBlock(a, b, this._keySchedule, f, g, h, i, d)
                    },
                    decryptBlock: function(a, b) {
                        var c = a[b + 1];
                        a[b + 1] = a[b + 3], a[b + 3] = c, this._doCryptBlock(a, b, this._invKeySchedule, j, k, l, m, e), c = a[b + 1], a[b + 1] = a[b + 3], a[b + 3] = c
                    },
                    _doCryptBlock: function(a, b, c, d, e, f, g, h) {
                        for (var i = this._nRounds, j = a[b] ^ c[0], k = a[b + 1] ^ c[1], l = a[b + 2] ^ c[2], m = a[b + 3] ^ c[3], n = 4, o = 1; i > o; o++) var p = d[j >>> 24] ^ e[k >>> 16 & 255] ^ f[l >>> 8 & 255] ^ g[255 & m] ^ c[n++],
                            q = d[k >>> 24] ^ e[l >>> 16 & 255] ^ f[m >>> 8 & 255] ^ g[255 & j] ^ c[n++],
                            r = d[l >>> 24] ^ e[m >>> 16 & 255] ^ f[j >>> 8 & 255] ^ g[255 & k] ^ c[n++],
                            m = d[m >>> 24] ^ e[j >>> 16 & 255] ^ f[k >>> 8 & 255] ^ g[255 & l] ^ c[n++],
                            j = p,
                            k = q,
                            l = r;
                        p = (h[j >>> 24] << 24 | h[k >>> 16 & 255] << 16 | h[l >>> 8 & 255] << 8 | h[255 & m]) ^ c[n++], q = (h[k >>> 24] << 24 | h[l >>> 16 & 255] << 16 | h[m >>> 8 & 255] << 8 | h[255 & j]) ^ c[n++], r = (h[l >>> 24] << 24 | h[m >>> 16 & 255] << 16 | h[j >>> 8 & 255] << 8 | h[255 & k]) ^ c[n++], m = (h[m >>> 24] << 24 | h[j >>> 16 & 255] << 16 | h[k >>> 8 & 255] << 8 | h[255 & l]) ^ c[n++], a[b] = p, a[b + 1] = q, a[b + 2] = r, a[b + 3] = m
                    },
                    keySize: 8
                });
            a.AES = b._createHelper(c)
        }(), N.pad.NoPadding = {
            pad: function() {},
            unpad: function() {}
        };

var Media_type = [
  "VIDEO_TYPE",
  "AUDIO_TYPE",
  "HD_VIDEO",
  "HLS_TYPE"
];

// Clean storage for this url
// chrome.extension.sendMessage({msg: 'MSG_RESET_STORAGE_FOR_URL'}, function(res){});

(function() {
  // Base
  // =============================================================================
  function NormalizeFileName(filename) {
    var s = filename;
    s = s.replace(/(\>|\<|\&|\:|\*|\?|\\|\/)/g, '');
    s = s.replace(/\"/g, ' ');
    s = s.replace(/\'/g, ' ');
    s = s.replace(/\|/g, '-');
    s = s.replace(/'  '/g, ' ');

    return s;
  }

  // extended
  // =============================================================================
  function extended(child, parent) {
    var child_prototype = child.prototype;
    var F = function() {};
    F.prototype = parent.prototype;
    child.prototype = new F();

    for (var prop in child_prototype) {
      if (!child_prototype.hasOwnProperty(prop))
        continue;
      var getter = child_prototype.__lookupGetter__(prop);
      var setter = child_prototype.__lookupSetter__(prop);
      if (getter || setter) {
        if (getter)
          child.prototype.__defineGetter__(prop, getter);
        if (setter)
          child.prototype.__defineSetter__(prop, setter);
      } else
        child.prototype[prop] = child_prototype[prop];
    }
    child.prototype.constructor = child;
    child.superclass = parent.prototype;
  }

  function delegate(that, thatMethod, args) {
    return function() {
      if (args == undefined)
        return thatMethod.apply(that, arguments);
      else {
        for (var i = 0; i < arguments.length; i++)
          args.push(arguments[i])
        return thatMethod.apply(that, args);
      }
    }
  }

  //MediaProvider interface
  //==============================================================================
  var MediaProviderInterface = function() {
    this.id = "";
    this.MEDIA_QUERY = "";
    this._urls = [];
    this.xhr = null;
    this.org_id = '';
    this.org_url = '';
    this.retryEvent = 0;
  };

  MediaProviderInterface.prototype = {
    constructor: MediaProviderInterface,

    _getMediaFromXmlUrl: function(url, cfunc) {
      throw 'Method - must be overrided';
    },

    getMediaCount: function() {
      return this._urls.length
    },

    getMedia: function(cfunc) {
      throw 'Method - must be overrided';
    },

    processRequest: function(t) {
      throw 'Method - must be overrided';
    },

    getPlaylist: function(t) {
      throw 'Method - must be overrided';
    },

    processXMLResponse: function() {}
  }

  // Voi cac truong hop don gian, bat link ngay trong cac lien ket
  // =============================================================================
  var CommonProvider = function() {
    CommonProvider.superclass.constructor.apply(this, arguments);
    this.id = "common";
    this.MEDIA_QUERY = '[href], [src]';
  };

  CommonProvider.prototype = {
    ext: {
      audio: ["mp3", "flac", "m4a", "wma", "ogg", "wav", "aif", "mid"],
      video: ["mp4", "mpeg4", "mpg", "mpeg", "m4v", "avi", "divx", "mov",
        "wmv", "movie", "asf", "webm", "flv", "3gp"
      ]
    },
    EXTENSION_RE: /\.([^/.]*)$/i,
    FILENAME_RE: /([^/]+)$/i,

    getMediaCount: function() {
      return this._urls.length;
    },

    getMedia: function(callback) {
      var ext, title, links = [];
      for (var i in this._urls) {
        ext = this._urls[i].substr(this._urls[i].lastIndexOf('.') + 1,
          this._urls[i].length);
        for (var j in this.ext.audio) {
          if (this.ext.audio[j].indexOf(ext.toLowerCase()) != -1) {
            title = this._urls[i].substr(0,
              this._urls[i].lastIndexOf('.'));
            title = title.substr(title.lastIndexOf('\/') + 1,
              title.length);

            links.push({
              url: this._urls[i],
              mime: ext,
              title: NormalizeFileName(title),
              quality: undefined,
              len: undefined,
              resolution: undefined,
              media_type: Media_type[1],
            });
            break;
          }
        }
      }

      callback({
        org_id: this.org_id,
        org_url: this.org_url,
        links: links
      });
    },

    processRequest: function(t) {
      var tags = document.querySelectorAll(this.MEDIA_QUERY);
      this._urls = [];
      for (var i = 0; i < tags.length; i++) {
        var link = (tags[i].getAttribute('href') || tags[i].getAttribute('src'));
        link += "";
        this._urls.push(link);
      }

      return tags != null;
    },

    parseUrl: function(link) {
      var a = document.createElement("a");
      a.setAttribute("href", link);
      var t = (a.pathname.match(this.FILENAME_RE) || [])[1] || "",
        ext = (t.match(this.EXTENSION_RE) || [])[1] || "",
        filename = t.replace(this.EXTENSION_RE, "");
      return {
        url: link,
        filename: filename,
        ext: ext
      }
    }

  };
  extended(CommonProvider, MediaProviderInterface);

  /////////////////// Common Google Video embeded //////////////////////////////
  var GoogleVideoProvider = function() {
    GoogleVideoProvider.superclass.constructor.apply(this, arguments);
    this.id = 'GGUSERDATA';
    this.org_id = null,
    this.MEDIA_QUERY = 'video[src*="googleusercontent.com"]';
  };
  GoogleVideoProvider.prototype = {
    getMedia: function() {
      if (this._urls.length == 0)
        return;

      var ext = 'mp4', title, links = [];
      for (var i in this._urls) {
        title = this.parseUrl(this._urls[i]).filename;
        if (title.indexOf(ext) == -1)
            title += "." + ext;
        links.push({
          url: this._urls[i],
          mime: ext,
          title: NormalizeFileName(title),
          quality: undefined,
          len: undefined,
          resolution: undefined,
          media_type: "VIDEO_TYPE",
        });
      }

      chrome.extension.sendMessage({
        msg: "ON_RESPONSE_EVENT_URLS",
        response: {
          org_id: this.org_id,
          org_url: location.href,
          links: links
        }
      });
    }
  };
  extended(GoogleVideoProvider, CommonProvider);


  // http://chiasenhac.com
  // =============================================================================
  var csn_link = [];
  var csn_length = 0;
  var chiasenhac = function() {
    chiasenhac.superclass.constructor.apply(this, arguments);
    this.id = "chiasenhac";
    this.MEDIA_QUERY = 'a[href^="http://chiasenhac.vn/mp3/"], a[href^="http://chiasenhac.vn/hd/video/"]';
    this.multiple_link = false;
  };

  chiasenhac.prototype = {
    MEDIA_PATTERN: 'a[href *= "chiasenhac.com/downloads"]',

    //Note: make 'preflight ' request to server to pass Cross-Origin restriction
    _getMediaFromXmlUrl: function(xhr, url, cfunc) {
      //Call in closure manner to reuse xhr request
      xhr.onload = (function(x) {
        return function() {
          cfunc(x);
        }
      })(xhr); //cfunc;
      xhr.open('GET', url, true);
      xhr.setRequestHeader('X-PINGOTHER', 'test');
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.setRequestHeader("Content-type", "text/html; charset=ISO-8859-1");
      xhr.send();
    },

    getMedia: function(cfunc) {
      csn_link = [];
      csn_length = this.getMediaCount();

      for (var i = 0; i < this._urls.length; i++) {
        var xhr = new XMLHttpRequest();
        xhr.xmlParser = new DOMParser;
        xhr.media_pattern = this.MEDIA_PATTERN;
        xhr.media_type = this._urls[i].indexOf('video') >=0 ? Media_type[0] : Media_type[1];
        xhr.callback = cfunc;
        this._getMediaFromXmlUrl(xhr, this._urls[i],
          this.processXMLResponse);
      }
    },

    processRequest: function(t) {
      var tags = document.querySelectorAll(this.MEDIA_QUERY);
      this._urls = [];
      for (var i = 0; i < tags.length; i++) {
        var link = tags[i].getAttribute('href') + "";
        if (link.indexOf('download') >= 0)
            this._urls.push(link);
      }

      return tags != null;
    },

    processXMLResponse: function(xhr) {
      if (xhr.readyState == 4 && xhr.status == 200) { //Response complete
        var xmlContent = xhr.responseText,
          tracks = [];

        var dom = xhr.xmlParser.parseFromString(xmlContent, "text/html"), type = xhr.media_type;
        Array.prototype.push.apply(tracks,
          dom.querySelectorAll(xhr.media_pattern));

        var t = dom.querySelector('title').textContent;
        if (tracks.length == 0) {
            tracks = (type == Media_type[0]) ? xmlContent.match(/href=\"http:\/\/data(\d+)*\.chiasenhac\.com\/downloads\/\S+[a-zA-Z0-9\[\]\ ]+\.mp4/g)
                                             : xmlContent.match(/href=\"http:\/\/data(\d+)*\.chiasenhac\.com\/downloads\/\S+[a-zA-Z0-9\[\]\ ]+\.mp3/g)
            for (var i in tracks) {
              var l = tracks[i].split('="')[1];
              var list = l.split('/');

              csn_link.push({
                url: l,
                mime: FBV.getFileExtension(l, 'mp3'),
                quality: list[7],
                title: list[8].match(/\S+/i)[0].replace(/%20/g, ' '),
                resolution: undefined,
                media_type: type,
              });
            }
        } else {
            for (var i in tracks) {
              var l = tracks[i].getAttribute('href') + "",
                tag = tracks[i].textContent;

              tag = tag.substr(tag.lastIndexOf(':') + 2, tag.length);
              var list = tag.split(' ');
              var m = list[0],
                  q = list[1],
                len = list[2];

              csn_link.push({
                url: l,
                mime: m,
                len: len,
                quality: q,
                title: NormalizeFileName(t),
                resolution: undefined,
                media_type: type,
              });
            }
        }

        // remove duplicate
        var unique_link = [];
        for (var i = csn_link.length - 1; i >= 0; i--) {
            if (unique_link.indexOf(csn_link[i].url) == -1)
                unique_link.push(csn_link[i].url);
            else
                csn_link.splice(i, 1);
        };

        csn_link.sort(function(a,b) {
            return parseInt(a.quality) > parseInt(b.quality);
        });

        chrome.extension.sendMessage({
          msg: "ON_RESPONSE_EVENT_URLS",
          response: {
            org_id: CSN.org_id,
            org_url: CSN.org_url,
            links: csn_link
          }
        });
      }
    },
  };
  extended(chiasenhac, MediaProviderInterface);

  // http://nhaccuatui.com
  // =============================================================================
  // Video
  var nctvideo = function() {
    nctvideo.superclass.constructor.apply(this, arguments);
    this.id = "nctvideo";
    //this.MEDIA_QUERY = 'param[name="flashvars"]';
    this.MEDIA_QUERY = 'div>[content*="nhaccuatui.com/flash"], meta>[content*="nhaccuatui.com/flash"]';
  };

  nctvideo.prototype = {
    _getMediaFromXmlUrl: function(url, cfunc) {
      this.xhr.onload = (function(xhr) {
        return function() {
          cfunc(xhr);
        }
      })(this.xhr); //cfunc;
      this.xhr.open("GET", url, true);
      this.xhr.setRequestHeader("Cache-Control", "no-cache");
      this.xhr.send();
    },

    getMedia: function(cfunc) {
      this.xhr = new XMLHttpRequest();
      this.xhr.callback = cfunc;
      this.xhr.xmlParser = new DOMParser;
      this._getMediaFromXmlUrl(this._urls[0], this.processXMLResponse);
    },

    getPlaylist: function(url, callback) {
      this._urls.push(url);
      this.getMedia(callback);
    },
// ThangLVb - Bat link download nay tren html
    processRequest: function(t) {
      // var link, tags = document.querySelectorAll(this.MEDIA_QUERY);
      // this._urls = [];
      // for (var i = 0; i < tags.length; i++) {
      //   var tag = tags[i].getAttribute('content'),
      //     list = tag.split('?file=');
      //   for (var i in list) {
      //     if (list[i].indexOf('nhaccuatui.com/flash') != -1) {
      //       link = list[i].substr(list[i].indexOf('http'), list[i].length);
      //       this._urls.push(link);
      //       break;
      //     }
      //   }
        // [NamPHb 16/07/18] Get link request from document
        var textContent;
        var nodes = $('.box-left').contents();
        for (i = 0; i < nodes.length; i++) {
            if (nodes[i].nodeType == 8) {
                textContent = nodes[i].textContent;
                if (textContent.indexOf('embedURL') >= 0) {
                    var url = textContent.substring(textContent.lastIndexOf('http'), 
                                                    textContent.lastIndexOf('\"'));
                    this._urls.push(url);
                    break;
                }  
            }
        }
        
        return textContent != null;
        // end

      //return tags != null;
    },
// End [ThangLVb]

    processXMLResponse: function(xhr) {
      if (xhr.readyState == 4) {
        var xmlContent = xhr.responseText,
          tracks = [],
          links = [];
        var dom = xhr.xmlParser.parseFromString(xmlContent, "text/xml");
        Array.prototype.push.apply(tracks, dom.querySelectorAll("track"));

        for (var i in tracks) {
          var l = tracks[i].querySelector("location").textContent.trim(),
            lw = tracks[i].querySelector("lowquality").textContent.trim();
            hw = tracks[i].querySelector("highquality").textContent.trim();
            t = [tracks[i].querySelector("title").textContent.trim()],
            c = tracks[i].querySelector("creator").textContent.trim();

          // c = c.replace(/^\s+|\s+$/gm, '');
          // if (c !== "")
          //   t.unshift(c);
          // [NamPHb 16/07/18] Mofify mime and title
          var title = t + " - " + c;

          if (l.indexOf('m3u8') == -1) {
            // standard
            links.push({
              url: l,
              mime: l.substring(l.lastIndexOf('.') + 1, l.lastIndexOf('?')),
              resolution: "480p",
              len: undefined,
              title: title,
              media_type: Media_type[0],
              quality: undefined,
            });

            // Low
            if (!(lw == "" || lw == undefined)) {
              links.push({
                url: lw,
                mime: lw.substring(lw.lastIndexOf('.') + 1, lw.lastIndexOf('?')),
                resolution: "360p",
                len: undefined,
                title: title,
                quality: undefined,
                media_type: Media_type[0],
              });
            }

            // High
            if (!(hw == "" || hw == undefined)) {
              links.push({
                url: hw,
                mime: hw.substring(hw.lastIndexOf('.') + 1, hw.lastIndexOf('?')),
                resolution: "720p",
                len: undefined,
                title: title,
                quality: undefined,
                media_type: Media_type[0],
              });
            } // end
          } else if ((l2 = tracks[i].querySelector("bklink")) != null) {
            l2 = l2.textContent.trim();
            links.push({
              url: l2,
              mime: l2.substr(l2.lastIndexOf('.') + 1, l2.length).trim(),
              resolution: "720p",
              len: undefined,
              title: NormalizeFileName(t.join(" - ")),
              quality: undefined,
              media_type: Media_type[0],
            });
          }
        }

        //Response result to callback function
        // xhr.callback({
        // 	org_id: NCTV.org_id,
        // 	org_url: NCTV.org_url,
        // 	links: links
        // });

        chrome.extension.sendMessage({
          msg: "ON_RESPONSE_EVENT_URLS",
          response: {
            org_id: NCTV.org_id,
            org_url: NCTV.org_url,
            links: links
          }
        });
      }
    },
  };
  extended(nctvideo, MediaProviderInterface);

  // Audio
  //Example: www.nhaccuatui.com/playlist/bai-ca-tet-cho-em-va.qDScYcqfYr9t.html
  var nhaccuatui = function() {
    nhaccuatui.superclass.constructor.apply(this, arguments);
    this.id = "nhaccuatui";
  };

  nhaccuatui.prototype = {
    _getMediaFromXmlUrl: function(url, cfunc) {
      this.xhr.onload = (function(xhr) {
        return function() {
          cfunc(xhr);
        }
      })(this.xhr);
      this.xhr.open("GET", url, true);
      this.xhr.setRequestHeader("Cache-Control", "no-cache");
      this.xhr.send();
    },

    getMedia: function(cfunc) {
      this.xhr = new XMLHttpRequest();
      this.xhr.callback = cfunc;
      this.xhr.xmlParser = new DOMParser;
      this._getMediaFromXmlUrl(this._urls[0], this.processXMLResponse);
    },

    getPlaylist: function(url, callback) {
      this._urls.push(url);
      this.getMedia(callback);
    },

    processXMLResponse: function(xhr) {
      if (xhr.readyState == 4) {
        var xmlContent = xhr.responseText,
          tracks = [],
          links = [];
        var dom = xhr.xmlParser.parseFromString(xmlContent, "text/xml");
        Array.prototype.push.apply(tracks, dom.querySelectorAll("track"));

        for (var i in tracks) {
            var l = tracks[i].querySelector("location").textContent.trim(),
                t = [tracks[i].querySelector("title").textContent.trim()],
                c = tracks[i].querySelector("creator").textContent.trim();

        // [NamPHb 16/07/18] Mofify mime and title
            var title = t + " - " + c;

          // c = c.replace(/^\s+|\s+$/gm, '');
          // if (c !== "")
          //   t.unshift(c);
          links.push({
            url: l,
            mime: l.substring(l.lastIndexOf('.') + 1, l.lastIndexOf('?')).trim(),
            title: title,
            quality: undefined,
            len: undefined,
            resolution: undefined,
            media_type: Media_type[1],
          });
        } // end

        chrome.extension.sendMessage({
          msg: "ON_RESPONSE_EVENT_URLS",
          response: {
            org_id: NCT.org_id,
            org_url: NCT.org_url,
            links: links
          }
        });

      }
    },
  };

  extended(nhaccuatui, MediaProviderInterface);

  // ZING.VN
  // =============================================================================
  // Video
  var zvideo = function() {
    zvideo.superclass.constructor.apply(this, arguments);
    this.id = "zvideo";
    this.JSON_QUERY = 'div>[data-xml*="/media/get-source?"], div>[data-xml*="mp3.zing.vn/json/"], div>[data-xml*="/json/video/"]';
  }

  zvideo.prototype = {
    _getMediaFromXmlUrl: function(url, cfunc) {
      this.xhr.onload = cfunc;
      this.xhr.open("GET", url, true);
      this.xhr.setRequestHeader("Cache-Control", "no-cache");
      this.xhr.send();
    },

    getMedia: function(cfunc) {
      this.xhr = new XMLHttpRequest();
      this.xhr.callback = cfunc;
      this.xhr.xmlParser = new DOMParser;
      this._getMediaFromXmlUrl(this._urls[0], this.processXMLResponse);
    },

    getPlaylist: function(url, callback) {
      this._urls.push(url);
      this.getMedia(callback);
    },

    processRequest: function(t) {
      var tag = document.querySelector(this.JSON_QUERY);
      this._urls = [];
      if (tag != undefined) {
        var link = tag.getAttribute('data-xml') + "";
        if (link && link.indexOf('http') != 0)
            link = "https://mp3.zing.vn/xhr" + link;
        this._urls.push(link);
      } else {
        tag = document.querySelector(this.HTML5_QUERY);
        if (tag != undefined) {
          link = tag.getAttribute('data-xml');
          if (this._urls.indexOf(link) == -1)
            this._urls.push(link);
        }
      }

      return this._urls.length > 0;
    },

    getVideoQualities: function(videoTag) {
      var Qualities = {
        "f1080": "Full HD",
        "f720": "HD",
        "f480": "Standard",
        "f360": "Medium",
        "f240": "Small",
        "source": "Normal",
        "f": "Small"
      };
      return Qualities[videoTag];
    },

    processXMLResponse: function() {
      if (this.readyState == 4 && this.status == 200) { //Response complete
        var data = JSON.parse(this.responseText).data;
        if (!data)
            return;

        var links = [];
        var t = data.title;
        c = data.performer,

        c = c.replace(/^\s+|\s+$/gm, '');
        if (c !== "")
            t += ' - ' + c.trim();

        var source_list = data.source["mp4"];

        for (var i in source_list) {
        var l = source_list[i];
            if (l) {
                if (l.indexOf("http") != 0)
                    l = "https:" + l;
              links.push({
                url: l,
                mime: 'mp4',
                len: undefined,
                resolution: i,
                title: NormalizeFileName(t),
                quality: ZV.getVideoQualities(i),
                media_type: Media_type[0],
              });
            }
        }

        //ThangLVb - Sau khi phan tich va lay duoc link ==> Gui link sang cho background xu ly
        chrome.extension.sendMessage({
          msg: "ON_RESPONSE_EVENT_URLS",
          response: {
          org_id: ZV.org_id,
          org_url: ZV.org_url,
          links: links
          }
        });
        //End [ThangLVb]
      }
    },
  };
  extended(zvideo, MediaProviderInterface);

  // Single
  var zsingle = function() {
    console.log('Get');
    zsingle.superclass.constructor.apply(this, arguments);
    this.id = "zsingle";
    this.JSON_QUERY = 'div>[data-xml*="/media/get-source?"], div>[data-xml*="mp3.zing.vn/json/"], div>[data-xml*="/json/song/"]';
  }

  zsingle.prototype = {
    
    _getMediaFromXmlUrl: function(url, cfunc) {
      this.xhr.onload = cfunc;
      this.xhr.open("GET", url, true);
      this.xhr.setRequestHeader("Cache-Control", "no-cache");
      this.xhr.send();
    },

    getMedia: function(cfunc) {
      this.xhr = new XMLHttpRequest();
      this.xhr.callback = cfunc;
      this.xhr.xmlParser = new DOMParser;
      this._getMediaFromXmlUrl(this._urls[0], this.processXMLResponse);
    },

    getPlaylist: function(url, callback) {
      this._urls.push(url);
      this.getMedia(callback);
    },

    processRequest: function(t) {
      var tag = document.querySelector(this.JSON_QUERY);
      this._urls = [];
      if (tag != undefined) {
        var link = tag.getAttribute('data-xml') + "";
        if (link.indexOf('/media') == 0)
            link = "https://mp3.zing.vn/xhr" + link;
        if (link.indexOf('media/get-source') != -1) {
          this._urls.push(link);
        }
      }

      return this._urls.length > 0;
    },

    getAudioQualities: function(audioTag) {
      var Qualities = {
        "hq": "High Quality",
        "320": "High",
        "128": "Standard",
      };
      return Qualities[audioTag];
    },

    processXMLResponse: function() {
      if (this.readyState == 4) { //Response complete
        var object = JSON.parse(this.responseText),
          tracks = object.data,
          links = [];
        if (tracks == undefined)
            return;

        if (!Array.isArray(tracks))
            tracks = [tracks];

        for (var i in tracks) {
            if (tracks[i].source.mp4 == undefined) {
                var title, name, artists, source;
                name = tracks[i].name;
                artists = tracks[i].artists_names;
                title = name + " - " + artists;
                source = Object.entries(tracks[i].source);
                for (j = 0; j < source.length; j++) {
                    var url, bitrate;
                    url = source[j][1];
                    if (url != "") {
                        if (url.indexOf("http") < 0)
                            url = "https:" + url;
                        bitrate = source[j][0] + "kbps";
                        links.push({
                            url: url, 
                            mime: "mp3", 
                            len: undefined, 
                            title: title , 
                            quality: bitrate, 
                            media_type: Media_type[1]
                        });
                    }
                }
            } else if (tracks[i].source.mp4) {
                var title, name, artists, source;
                name = tracks[i].name;
                artists = tracks[i].artists_names;
                title = name + " - " + artists;
                source = Object.entries(tracks[i].source.mp4);
                for (j = 0; j < source.length; j++) {
                    var url, quality;
                    url = source[j][1];
                    if (url != "") {
                        if (url.indexOf("http") < 0)
                            url = "https:" + url;
                        quality = source[j][0];
                        links.push({
                            url: url, 
                            mime: "mp4", 
                            len: undefined, 
                            title: title, 
                            quality: quality, 
                            media_type: Media_type[0]
                        });
                    }
                }
            }
        }
        

          

        //ThangLVb - Sau khi phan tich va lay duoc link ==> Gui link sang cho background xu ly
        chrome.extension.sendMessage({
          msg: "ON_RESPONSE_EVENT_URLS",
          response: {
          org_id: ZS.org_id,
          org_url: ZS.org_url,
          links: links
          }
        });
        //End [ThangLVb]
      }
    },
  };
  extended(zsingle, MediaProviderInterface);

  // Audio
  //http://mp3.zing.vn/album/Chi-La-Em-Giau-Di-Bich-Phuong/ZWZB0I67.html
  var zing = function() {
    zing.superclass.constructor.apply(this, arguments);
    this.id = "zing";
    this.FLASH_QUERY = 'div>[flashvars*="mp3.zing.vn/xml"]';
    this.HTML5_QUERY = 'div>[data-xml*="/media/get-source?type=album"], div>[data-xml*="mp3.zing.vn"]';
  };


  zing.prototype = {
    _getMediaFromXmlUrl: function(url, cfunc) {
      this.xhr.onload = cfunc;
      this.xhr.open("GET", url, true);
      this.xhr.setRequestHeader("Cache-Control", "no-cache");
      this.xhr.send();
    },

    getMedia: function(cfunc) {
      this.xhr = new XMLHttpRequest();
      this.xhr.callback = cfunc;
      this.xhr.xmlParser = new DOMParser;
      this._getMediaFromXmlUrl(this._urls[this._urls.length - 1], this.processXMLResponse);
    },

    processRequest: function(t) {
      var tag = document.querySelector(this.FLASH_QUERY),
        link = '';
      if (tag != undefined) {
        tag = tag.getAttribute('flashvars') + "";
        var list = tag.split('&');
        for (var i in list) {
          if (list[i].indexOf('xmlURL=') != -1) {
            link = list[i].substr(list[i].indexOf('xmlURL=') + 7, list[i].length);
            break;
          }
        }

      } else {
        tag = document.querySelector(this.HTML5_QUERY);
        if (tag)
          link = tag.getAttribute('data-xml');
          /*VanDD*/
          if (link && link.indexOf('http') != 0)
            link = "https://mp3.zing.vn/xhr" + link;
      }

      if (link != '' && this._urls.indexOf(link) == -1)
        this._urls.push(link);

      return this._urls.length > 0;
    },

    getAudioQualities: function(audioTag) {
      var Qualities = {
        "hq": "High",
        "source": "Normal"
      };
      return Qualities[audioTag];
    },

    processXMLResponse: function() {
      if (this.readyState == 4) {
        var xmlContent = this.responseText,
          tracks = [],
          links = [];

        tracks = JSON.parse(this.responseText).data;
        // Vandd
        if (tracks[0] == null) {
          var songs = tracks.items;
          for (var i in songs) {
            var t = songs[i].name,
                c = songs[i].artist.name,
                m = "mp3",
                source_list = songs[i].source;
                c = c.replace(/^\s+|\s+$/gm, '');
                if (c !== "")
                  t = t + '-' + c.trim();
            for (var j in source_list) {
              var l = source_list[j];
              if (l) {
                if (l.indexOf("http") != 0)
                    l = "https:" + l;
                links.push({
                  url: l,
                  mime: m,
                  title: NormalizeFileName(t),
                  len: undefined,
                  resolution: undefined,
                  quality: ZA.getAudioQualities(j),
                  media_type: Media_type[1],
                  });
              }
            }
          }
        }
        // End of comment
        else for (var i in tracks) {
          var t = [tracks[i].querySelector("title").textContent],
            c = tracks[i].querySelector("performer").textContent,
            m = tracks[i].getAttribute("type"),
            qualities = [];

          c = c.replace(/^\s+|\s+$/gm, '');
          if (c !== "")
            t.unshift(c.trim());

          Array.prototype.push.apply(qualities, tracks[i].querySelectorAll("f1080, f720, hq, f480, f360, source, f240, f"));

          for (var j in qualities) {
            var l = qualities[j].textContent;
            if (l != "" && l !== "require vip") {
              links.push({
                url: l,
                mime: m,
                title: NormalizeFileName(t.join(" - ")),
                len: undefined,
                resolution: undefined,
                quality: ZA.getAudioQualities(qualities[j].nodeName),
                media_type: Media_type[1],
              });
            }
          }
        }
        // this.callback({
        // 	org_id: ZA.org_id,
        // 	org_url: ZA.org_url,
        // 	links: links
        // });
        chrome.extension.sendMessage({
          msg: "ON_RESPONSE_EVENT_URLS",
          response: {
            org_id: ZA.org_id,
            org_url: ZA.org_url,
            links: links
          }
        });
      }
    },
  };

  extended(zing, MediaProviderInterface);

  // TV
  var ztv = function() {
    ztv.superclass.constructor.apply(this, arguments);
    this.id = "ztv";
    this.MEDIA_QUERY = 'param[value*="tv.zing.vn/tv/xml/"]';
  }

  ztv.prototype = {
    _getMediaFromXmlUrl: function(url, cfunc) {
      this.xhr.onload = cfunc;
      this.xhr.open("GET", url, true);
      this.xhr.setRequestHeader("Cache-Control", "no-cache");
      this.xhr.send();
    },

    getMedia: function(cfunc) {
      this.xhr = new XMLHttpRequest();
      this.xhr.callback = cfunc;
      this.xhr.xmlParser = new DOMParser;
      this._getMediaFromXmlUrl(this._urls[0], this.processXMLResponse);
    },

    processRequest: function(t) {
      var tag = document.querySelector(this.MEDIA_QUERY)
        .getAttribute('value') + "";

      var list = tag.split('?n=&'),
        link = list[0].substr(list[0].indexOf('xmlURL=') + 7, list[0].length);
      link = link.split('&')[0];
      this._urls = [];
      this._urls.push(decodeURIComponent(link));

      return this._urls.length > 0;
    },

    getVideoQualities: function(videoTag) {
      var Qualities = {
        "f1080": "Full HD",
        "f720": "HD",
        "f480": "480p",
        "f360": "360p",
        "source": "Normal",
        "f240": "Small",
        "f": "Small"
      };
      return Qualities[videoTag];
    },

    processXMLResponse: function() {
      function encodeTime(a) {
        var i = "f_pk_ZingTV_1_@z",
            j = "f_iv_ZingTV_1_@z";
        return N.AES.encrypt(N.enc.Utf8.parse(a), N.enc.Utf8.parse(i), {
            iv: N.enc.Utf8.parse(j),
            mode: N.mode.CBC,
            padding: N.pad.NoPadding
        }).ciphertext.toString(N.enc.Hex)
      }

      if (this.readyState == 4) { //Response complete
        var xmlContent = this.responseText,
          tracks = [],
          links = [],
          link = undefined;

        var dom = this.xmlParser.parseFromString(xmlContent, "text/xml");
        Array.prototype.push.apply(tracks, dom.querySelectorAll("data > item"));

        for (var i in tracks) {
          var t = [tracks[i].querySelector("title").textContent],
            c = tracks[i].querySelector("performer").textContent,
            m = tracks[i].getAttribute("type"),
            qualities = [];

          c = c.replace(/^\s+|\s+$/gm, '');
          if (c !== "")
            t.unshift(c.trim());

          Array.prototype.push.apply(qualities, tracks[i].querySelectorAll("f1080, f720, hq, f480, f480, f360, source, f240, f"));

          // Tim link download trong script
          var script_all = document.querySelectorAll("script");
          var results = [];

          for (var i = 0; i < script_all.length; ++i) {
            var item = script_all[i];
            var result = item.textContent.match(/<source\s+src="([^"]+)"\s+type="([^"]+)"/i);
            if (result)
              results.push(result);
          }

          if (results.length > 0) {
            link = results[0][1];
            var ext = results[0][2];
            m = ext.substr(ext.lastIndexOf('/') + 1, ext.length);
          }

          for (var j in qualities) {
            var l = qualities[j].textContent;
            var r = qualities[j].tagName;
            r = r.substr(1, r.length);
            if (l !== "require vip" && !isNaN(parseInt(r))) {
              if (l == undefined || l.indexOf('http') == -1)
                l = link;
              if (l.indexOf('php') != -1) {
                var time = Date.now() + "|0\x00";
                l += "&start=0&token=" + encodeTime(time);
                console.log('ZTV link: ' + l);
              }

              links.push({
                url: l,
                mime: m,
                len: 0,
                resolution: r + 'p',
                title: NormalizeFileName(t.join(" - ")),
                quality: ZGTV.getVideoQualities(qualities[j].nodeName),
                media_type: Media_type[0],
              });
            }
          }
        }

        chrome.extension.sendMessage({
          msg: "ON_RESPONSE_EVENT_URLS",
          response: {
            org_id: ZGTV.org_id,
            org_url: ZGTV.org_url,
            links: links,
            ot_link: true
          }
        });
      }
    },
  };
  extended(ztv, MediaProviderInterface);

  // Nhac.vn
  var nhacvn = function() {
    nhacvn.superclass.constructor.apply(this, arguments);
    this.id = "nhacvn";
    this.links = [];
    this.typeOfSource = "";
  }

  nhacvn.prototype = {
    getMedia: function(callback) {
        // callback({
        //     org_id: this.org_id,
        //     org_url: this.org_url,
        //     links: NVN.links,
        //     referrer: document.location.href,
        // });
        if (this.typeOfSource.indexOf("myaudio") || this.typeOfSource.indexOf("myalbum")) {
            chrome.extension.sendMessage({
                msg: "ON_RESPONSE_EVENT_URLS", 
                response: {
                    org_id: NVN.org_id,
                    org_url: NVN.org_url,
                    links: this.links
                }
            });
        }
    },

    processRequest: function(t) {
      // parsing playlist info in current page
      // var script_all = document.querySelectorAll("script");
      // var results = [];

      // for (var i = 0; i < script_all.length; ++i) {
      //   var item = script_all[i].textContent.trim();
      //   if (item.length > 0) {
      //       var result = item.match(/playlist\: \[\{"sources"\:(\[[^"]+(\S+\w\ )+)/i), arr = [];
      //       if (result) {
      //           var pos1 = item.indexOf('playlist:'), pos2 = item.indexOf('\n', pos1);
      //           result = item.substr(pos1 + 12, pos2 - pos1 - 14);
      //           arr = result.split(',{');
      //       }
      //   }
      // }
      
      // // Extract song info
      // if (arr.length > 0) {
      //   for (var i = 0; i < arr.length; i++) {
      //       var object = JSON.parse('{' + arr[i]);
      //       var link = object.sources[0].file, quality = object.sources[0].label;
      //       var title = object.media_desc + ' - ' + object.media_title;
      //       NVN.links.push({
      //         url: link,
      //         mime: 'mp3',
      //         title: title,
      //         quality: quality,
      //         resolution: undefined,
      //         len: undefined,
      //         media_type: Media_type[1],
      //       });
      //   }
      // }
        var scriptDOM = document.querySelectorAll("script");
        var sourceContent;
        var sourcePattern = /jwplayer([a-z\-(\"|\')])*\.setup/g;

        for (i = scriptDOM.length - 1; i >= 0; i--) {
            if (sourcePattern.test(scriptDOM[i].text)) {
                sourceContent = scriptDOM[i].text;
                this.typeOfSource = sourceContent.match(sourcePattern);
                break;
            }
        }

        if (sourceContent && this.typeOfSource) {
            if (this.typeOfSource[0].indexOf("myaudio") >= 0) {
                this.audioParse(sourceContent);
            } else if (this.typeOfSource[0].indexOf("myvideo") >= 0) {
                this.videoParse(sourceContent);
            } else if (this.typeOfSource[0].indexOf("myalbum") >= 0) {
                this.audioPlayListParse(sourceContent);
            }
        }
    },

    getLinksDownload: function(resolutionsUrls, resolutions, commonUrl) {
        var links = [];
        for (i = 0; i < resolutionsUrls.length; i++) {
            var xhr = new XMLHttpRequest, resolution = resolutions[i];
            xhr.onreadystatechange = function(resolution) {
                if (this.readyState == 4 && this.status == 200) {
                    var responseText = this.responseText, urls;
                    urlPattern = /[\w]+\.ts/g;
                    urls = responseText.match(urlPattern);
                    for (j = 0; j < urls.length; j++) {
                        urls[j] = commonUrl + urls[j];
                    }
                    links.push({
                        type: resolution, 
                        urls: urls
                    });
                    console.log(links[i]);
                }
            }
            xhr.open("GET", resolutionsUrls[i], true);
            xhr.send();
        }
    }, 

    getPlaylist: function(masterUrl, title) {
        var commonUrl = masterUrl.substring(0, masterUrl.lastIndexOf("/") + 1);
        var xhr = new XMLHttpRequest;
        var getFunction = this.getLinksDownload;
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var responseText = this.responseText;
                var resolutionPattern, urlPattern, resolutions, urls;
                resolutionPattern = /[0-9]{3,}p/g;
                urlPattern = /[\w]+\.m3u8/g;
                resolutions = responseText.match(resolutionPattern);
                urls = responseText.match(urlPattern);
                for (j = 0; j < urls.length; j++) {
                    urls[j] = commonUrl + urls[j];
                }
                getFunction(urls, resolutions, commonUrl);
                console.log(nhacvn.links);
            }
        }
        xhr.open("GET", masterUrl, true);
        xhr.send();
    },

    audioParse: function(sourceContent) {
        var audioUrlPattern, titlePattern, urls, title, bitrates, containTitle;
        audioUrlPattern = /https:[a-zA-Z0-9\.:_\*\-\/\\]*\.mp3/g;
        titlePattern = /title:\'[\w \u0000-\uFFFF\-\(\)\,\.\'\"]*\'/g;
        urls = sourceContent.match(audioUrlPattern);
        containTitle = sourceContent.match(titlePattern);
        containTitle = containTitle[0].split("'", 2);
        if (containTitle)
            title = containTitle[1];
        else
            title = document.title;
        this.links = [];
        bitrates = ["128kbps", "320kbps"]

        if (urls && urls.length > 0) {
            for (i = 0; i < urls.length; i++) {
                this.links.push({
                    url: urls[i], 
                    mime: "mp3", 
                    title: title, 
                    quality: bitrates[i], 
                    len: undefined, 
                    media_type: Media_type[1],
                });
            }
        }
    }, 

    audioPlayListParse: function(sourceContent) {
        var audioUrlPattern, bitratePattern, titlePattern, urls, bitrates, titles, containTitle;
        audioUrlPattern = /https:[\w\.:\*\-\/\\]*\.mp3/g;
        titlePattern = /title\":\"[a-zA-Z0-9 \\u0000-\\u007F\-\(\)\,\.\']*\"/g;
        urls = sourceContent.match(audioUrlPattern);
        containTitle = sourceContent.match(titlePattern);
        titles = [];
        for (i = 1; i < containTitle.length; i++) {
            containTitle[i] = containTitle[i].substring(7, containTitle[i].length);
            titles.push(JSON.parse(containTitle[i]));
        }
        bitrates = ["128kbps", "320kbps"];
        var j;
        if (urls && urls.length > 0) {
            for (i = 0; i < urls.length; i++) {
                j = i % 2 == 0 ? i : i - 1;
                this.links.push({
                    url: urls[i], 
                    mime: "mp3", 
                    title: titles[j], 
                    quality: bitrates[i % 2], 
                    len: undefined, 
                    media_type: Media_type[1],
                });
            }
        }
    }, 

    videoParse: function(sourceContent) {
        var videoUrlPatten, urls;
        videoUrlPatten = /https:\/\/[a-zA-Z0-9\.:_\*\-\/]*\.m3u8/g;
        urls = sourceContent.match(videoUrlPatten);
        title = NormalizeFileName(document.title);
        for (i = 0; i < urls.length; i++)
            this.getPlaylist(urls[i], title);
    }, 

  };
  extended(nhacvn, MediaProviderInterface);

  // Clip.vn:
  // Sample: http://clip.vn/watch/,?pl_id=315981
  //==============================================================================
  var clipvn = function() {
    clipvn.superclass.constructor.apply(this, arguments);
    this.id = "clipvn";
    this.MEDIA_QUERY = 'div[name="flashvars"]';
    this.EMBED_QUERY = 'div[id="box-player"]';
  }

  clipvn.prototype = {
    _getMediaFromXmlUrl: function(url, cfunc) {
      this.xhr.onload = cfunc;
      this.xhr.onerror = this.getEmbededContent(this.xhr.callback);
      this.xhr.open("POST", urlExtensions, true);
      var params = "onsite=clip";
      this.xhr.setRequestHeader("Content-type",
        "application/x-www-form-urlencoded");
      //this.xhr.setRequestHeader("Content-length", params.length);
      this.xhr.send(params);
    },

    getMedia: function(cfunc) {
      this.xhr = new XMLHttpRequest();
      this.xhr.callback = cfunc;
      this.xhr.xmlParser = new DOMParser;
      this._getMediaFromXmlUrl(this._urls[0], this.processXMLResponse);
    },

    getEmbededContent: function(callback) {},

    processRequest: function(t) {
      var link, tag = document.querySelector(this.MEDIA_QUERY);
      if (tag != null) {
        tag = tag.getAttribute('value') + "";
        var list = tag.split('&h=http:'),
          pos = list[0].indexOf('id=');
        var id = list[0].substr(pos + 3, list[0].length - pos - 3);
      } else {
        var id = document.location.href;
        if (id[id.length - 1] == '/')
          id = id.substr(0, id.length - 1);
        var pos = id.indexOf('id=');
        if (pos)
          id = id.substr(pos + 3, id.length - pos - 3);
      }
      link = "http://clip.vn/movies/nfo/" + id;
      this._urls = [];
      this._urls.push(link);

      return this._urls.length > 0;
    },

    processXMLResponse: function() {
      if (this.readyState == 4) { //Response complete
        var xmlContent = this.responseText,
          links = [];

        var dom = this.xmlParser.parseFromString(xmlContent, "text/xml");
        var t = dom.querySelector("CurrentClip ClipInfo title"),
          a = dom.querySelector("CurrentClip ClipInfo author");
        if (t == null) {
          CPN.getEmbededContent(this.callback);
          return;
        }

        t = t.textContent;
        a = a.textContent;
        var enclosure_maps = [];
        Array.prototype.push.apply(enclosure_maps,
          dom.querySelectorAll("CurrentClip > ClipInfo > enclosure"));

        var CLIPVN_QUALITY = [
          "144p", //Mobile - lv0
          "240p", //Small - lv1
          "360p", //Medium - lv2
          "480p", //Standard - lv3
          "720p", //HD - lv4
          "1080p" //Full - HD - lv5
        ];

        for (var i in enclosure_maps) {
          var l = enclosure_maps[i].getAttribute("url");
          var q = enclosure_maps[i].getAttribute("quality");
          links.push({
            url: l,
            mime: l.substr(l.lastIndexOf('.') + 1,
              l.length).trim(),
            len: undefined,
            resolution: CLIPVN_QUALITY[q],
            title: NormalizeFileName(t + " - " + a),
            quality: undefined,
            media_type: Media_type[0],

          });
        }

        //Response result to callback function
        this.callback({
          org_id: CPN.org_id,
          org_url: CPN.org_url,
          links: links
        });
      }
    },
  };
  extended(clipvn, MediaProviderInterface);

  //nhacso.net
  //http://nhacso.net/nghe-album/ngot-ngao-tinh-que.X1hTUEFdaw==.html
  //==============================================================================
  var nhacso = function() {
    nhacso.superclass.constructor.apply(this, arguments);
    this.id = "nhacso";
    this.MEDIA_QUERY = ['param[name="flashvars"][value*="xmlPath=http://nhacso.net"]',
      'iframe[src*="http://nhacso.net/embed"]',
      'param[name="movie"][value*="xmlPath=http://nhacso.net"]'
    ].join(",");
  };

  nhacso.prototype = {
    _getMediaFromXmlUrl: function(url, cfunc) {
      //this.xhr.onreadystatechange = cfunc;
      this.xhr.onload = cfunc;
      this.xhr.open("GET", url, true);
      this.xhr.setRequestHeader("Cache-Control", "no-cache");
      this.xhr.send();
    },

    processXMLResponse: function() {
      if (this.readyState == 4) { //Response complete
        var txtContent = this.responseText,
          tracks = [],
          links = [];
        var dom = JSON.parse(txtContent),
          title = (dom.object_name || "").trim();
        var tracks = dom.songs || [];
        for (var i in tracks) {
          var track = tracks[i],
            link = track.link_mp3;
          if (link) {

            links.push({
              url: link,
              mime: 'mp3',
              title: title != track.name ? NormalizeFileName(title + ' - ' + track.name) : NormalizeFileName(title),
              quality: undefined,
              resolution: undefined,
              len: undefined,
              media_type: Media_type[1],
            });
          }
        }

        chrome.extension.sendMessage({
          msg: "ON_RESPONSE_EVENT_URLS",
          response: {
            org_id: NS.org_id,
            org_url: NS.org_url,
            links: links
          }
        });
      }
    },

    getMedia: function(cfunc) {
      this.xhr = new XMLHttpRequest();
      this.xhr.callback = cfunc;
      this.xhr.xmlParser = new DOMParser;
      this._getMediaFromXmlUrl(this._urls[this._urls.length - 1], this.processXMLResponse);
    },

    processRequest: function(t) {
      // Extract id from url
      var link_lst = {
        album: "http://nhacso.net/albums/ajax-get-detail-album?dataId=",
        playlist: "http://nhacso.net/playlists/ajax-get-detail-playlist?dataId=",
        song: "http://nhacso.net/songs/ajax-get-detail-song?dataId="
      };
      var object_id, object_type;
      var url = document.location.pathname;
      var pos1 = url.indexOf('.html'),
        pos2 = url.lastIndexOf('.', pos1 - 1);
      object_id = url.substr(pos2 + 1, pos1 - pos2 - 1);

      if (url.indexOf('/nghe-playlist/') != -1)
        object_type = 'playlist';
      else if (url.indexOf('/nghe-album/') != -1)
        object_type = 'album';
      else if (url.indexOf('/nghe-nhac/') != -1)
        object_type = 'song';

      var link = link_lst[object_type] + object_id;
      if (this._urls.indexOf(link) == -1)
        this._urls.push(link);

      return this._urls.length > 0;
    },
  };
  extended(nhacso, MediaProviderInterface);

  //nhac.vui.vn
  // =============================================================================
  var nhacvui = function() {
    nhacvui.superclass.constructor.apply(this, arguments);
    this.id = "nhacvui";
    this.MEDIA_QUERY = 'param[name="flashvars"][value*="vui.vn"]';
    this.MEDIA_PATTERN = /(a|m|clip)(\d+)[^-]+$/i,
      this.mediaType = {
        a: 3,
        m: 1,
        clip: 1
      };
  };

  // http://nhac.vui.vn/album-noi-dat-buc-hoa-dong-que-vol-32-dan-truong-a54005p43.html
  //"http://nhac.vui.vn/asx2.php?type=3&id=54005"
  nhacvui.prototype = {
    URL_BASE: "http://nhac.vui.vn/asx2.php?",
    _getMediaFromXmlUrl: function(url, cfunc) {
      //this.xhr.onreadystatechange = cfunc;
      this.xhr.onload = cfunc;
      this.xhr.open("GET", url, true);
      this.xhr.setRequestHeader("Cache-Control", "no-cache");
      this.xhr.send();
    },
    getMedia: function(cfunc) {
      // this.xhr = new XMLHttpRequest();
      // this.xhr.callback = cfunc;
      // this.xhr.xmlParser = new DOMParser;
      // this._getMediaFromXmlUrl(this._urls[0].match(/^https?:\/\//i) ?
      //   this._urls[0] : this.URL_BASE + this._urls[0],
      //   this.processXMLResponse);

      var script_all = document.querySelectorAll('script'), arr_content = '';
      for (var i = 0; i < script_all.length; i++) {
        if (script_all[i].textContent.indexOf('MP.playlist = ') >= 0) {
            arr_content = script_all[i].textContent;
            var pos1 = arr_content.indexOf('MP.playlist = '), pos2 = arr_content.indexOf('];\n');
            arr_content = arr_content.substr(pos1 + 15, pos2 - pos1 - 14);
            break;
        }
      }

      if (arr_content != '') {
        // Split to file block
        var pos = 0, oldpos = arr_content.indexOf('{"mediaid":'), block;
        var links = [];
        while (true) {
            pos = arr_content.indexOf('{"mediaid":', oldpos + 1);
            if (pos == -1)
                break;
            block = JSON.parse(arr_content.substr(oldpos, pos - oldpos - 1));
            for (var j in block.sources) {
                links.push({
                      url: block.sources[j].file,
                      mime: 'mp3',
                      title: NormalizeFileName(block.title + ' - ' + block.subtitle),
                      len: undefined,
                      resolution: undefined,
                      quality: block.sources[j].label == "320kbps" ? "HQ" : "Normal",
                      media_type: Media_type[1],
                });
            }

            oldpos = pos;
        } while (pos != -1);
        // Parsing last content
        if (oldpos >= 0) {
            block = JSON.parse(arr_content.substr(oldpos, arr_content.length - oldpos - 1));
            for (var j in block.sources) {
                links.push({
                      url: block.sources[j].file,
                      mime: 'mp3',
                      title: NormalizeFileName(block.title + ' - ' + block.subtitle),
                      len: undefined,
                      resolution: undefined,
                      quality: block.sources[j].label = "320kbps" ? "HQ" : "Normal",
                      media_type: Media_type[1],
                });
            }
        }

        cfunc({
          org_id: NV.org_id,
          org_url: NV.org_url,
          links: links
        });
      }
    },
    processRequest: function(t) {
      // Get id and media type from url
      // var link = location.pathname;
      // var pos1 = link.lastIndexOf('-'),
      //   pos2 = link.lastIndexOf('.');
      // var id = link.substr(pos1 + 1, pos2 - pos1 - 1);
      // if (regex = id.match(this.MEDIA_PATTERN)) {
      //   this._urls.push('type=' + this.mediaType[regex[1]] + '&id=' + id.substr(1));
      // }
      // return this._urls.length > 0;
      return true;
    },
    processXMLResponse: function(xhr) {
      function _fixTitle(t) {
        return t.replace(/&#(\d+);/g, function(t, e) {
          return String.fromCharCode(+e)
        })
      };

      if (this.readyState == 4) { //Response complete
        var xmlContent = this.responseText,
          tracks = [],
          links = [];

        var dom = this.xmlParser.parseFromString(xmlContent, "text/xml");
        Array.prototype.push.apply(tracks, dom.querySelectorAll("item"));

        for (var i in tracks) {
          try {
            var t = tracks[i].querySelector("title").textContent,
              desc = tracks[i].querySelector("description").textContent,
              l = tracks[i].getElementsByTagName("file")[0].textContent,
              m = 'mp3';

            pos = l.lastIndexOf(m);
            if (pos != -1) {
                t = _fixTitle(t);
                desc = desc.replace(/thể hiện:/i, "").trim();
                l = l.substr(0, pos + 3);
                links.push({
                  url: l,
                  mime: m,
                  title: NormalizeFileName(t + '-' + desc),
                  len: undefined,
                  resolution: undefined,
                  quality: undefined,
                  media_type: Media_type[1],
                });
            }
          } catch (e) {
            //console.log(e.name + ': ' + e.message);
          }
        }

        this.callback({
          org_id: NV.org_id,
          org_url: NV.org_url,
          links: links
        });
      }
    },
  };
  extended(nhacvui, MediaProviderInterface);

  //vietgiaitri.com parse link
  //==============================================================================

  var vietgiaitri = function() {
    vietgiaitri.superclass.constructor.apply(this, arguments);
    this.id = "vietgiaitri";
    this.MEDIA_QUERY = 'param[name="flashvars"]';
  };
  vietgiaitri.prototype = {
    _getMediaFromXmlUrl: function(url, cfunc) {
      this.xhr.onload = cfunc;
      this.xhr.open("GET", url, true);
      this.xhr.setRequestHeader("Cache-Control", "no-cache");
      this.xhr.send();
    },
    getMedia: function(cfunc) {
      this.xhr = new XMLHttpRequest();
      this.xhr.callback = cfunc;
      this.xhr.xmlParser = new DOMParser;
      this._getMediaFromXmlUrl(this._urls[0], this.processXMLResponse);
    },
    processRequest: function(t) {
      var tags = document.querySelectorAll(this.MEDIA_QUERY);
      for (var i = 0; i < tags.length; i++) {
        var tag = tags[i].getAttribute('value'),
          list = tag.split('&');
        if (Array.isArray(list)) {
          var link = list[4].substr(list[4].indexOf('file=') + 5,
            list[4].length);
          this._urls = [];
          this._urls.push(decodeURIComponent(link));
          break;
        }
      }

      return this._urls.length > 0;
    },
    processXMLResponse: function(xhr) {
      if (this.readyState == 4) { //Response complete
        var xmlContent = this.responseText,
          tracks = [],
          links = [];

        var dom = this.xmlParser.parseFromString(xmlContent, "text/xml");
        Array.prototype.push.apply(tracks, dom.querySelectorAll("track"));
        for (var i in tracks) {
          var l = tracks[i].querySelector("location").textContent.trim(),
            t = [tracks[i].querySelector("title").textContent.trim()],
            c = tracks[i].querySelector("creator").textContent.trim();

          c = c.replace(/^\s+|\s+$/gm, '');
          if (c !== "")
            t.unshift(c);

          links.push({
            url: l,
            mime: l.substr(l.lastIndexOf('.') + 1, l.length).trim(),
            title: NormalizeFileName(t.join("-")),
            len: undefined,
            resolution: undefined,
            quality: undefined,
            media_type: Media_type[1],
          });
        }

        this.callback({
          org_id: VGT.org_id,
          org_url: VGT.org_url,
          links: links
        });
      }
    },

  };
  extended(vietgiaitri, MediaProviderInterface);

  //nghenhacvang.net parse link
  //==============================================================================
  var nghenhacvang = function() {
    nghenhacvang.superclass.constructor.apply(this, arguments);
    this.id = "nghenhacvang";
    this.MEDIA_QUERY = 'link[href *= "playplaylist"]';
  };
  nghenhacvang.prototype = {
    _getMediaFromXmlUrl: function(url, cfunc) {
      this.xhr.onload = cfunc;
      this.xhr.open("GET", url, true);
      this.xhr.setRequestHeader("Cache-Control", "no-cache");
      this.xhr.send();
    },
    getMedia: function(cfunc) {
      this.xhr = new XMLHttpRequest();
      this.xhr.callback = cfunc;
      this.xhr.xmlParser = new DOMParser;
      this._getMediaFromXmlUrl(this._urls[this._urls.length - 1], this.processXMLResponse);
    },
    processRequest: function(t) {
      var tags = document.querySelectorAll(this.MEDIA_QUERY);
      for (var i = 0; i < tags.length; i++) {
        var tag = tags[i].getAttribute('href'),
          list = tag.split('?');
        if (Array.isArray(list)) {
          var link = list[1].substr(list[1].indexOf('file=') + 5,
            list[1].length);
          this._urls.push(link.substr(0, link.indexOf('.xml') + 4));
          break;
        }
      }

      return this._urls.length > 0;
    },
    processXMLResponse: function(xhr) {
      if (this.readyState == 4) {
        var xmlContent = this.responseText,
          tracks = [],
          links = [];

        var dom = this.xmlParser.parseFromString(xmlContent, "text/xml");
        Array.prototype.push.apply(tracks, dom.querySelectorAll("item"));
        for (var i in tracks) {
          var t = [tracks[i].querySelector("title").textContent.trim()],
            c = tracks[i].querySelector("description").
          textContent.trim(),
            l = tracks[i].children[2].getAttribute('file');

          c = c.replace(/^\s+|\s+$/gm, '');
          if (c !== "")
            t.unshift(c);

          links.push({
            url: l,
            mime: l.substr(l.lastIndexOf('.') + 1, l.length).trim(),
            title: NormalizeFileName(t.join("-")),
            resolution: undefined,
            len: undefined,
            quality: undefined,
            media_type: Media_type[1],
          });
        }

        this.callback({
          org_id: NNV.org_id,
          org_url: NNV.org_url,
          links: links
        });
      }
    },

  };
  extended(nghenhacvang, MediaProviderInterface);

  // Foreign Music
  //soundcloud.com
  // =============================================================================
  var soundcloud = function() {
    soundcloud.superclass.constructor.apply(this, arguments);
    this.id = "soundcloud";
    this.type = '';
    this.fileName = '';
    this.user_id = '';
    this.trackId = [];
    this.title = [];
    this.mime = [];
    this.duration = [];
    this.fileSize = [];
    this.downloadLinks = [];
    this.ids = {
      clientId: "a3e059563d7fd3372b49b37f00a00bcf",
      clientId2: "02gUJC0hH2ct1EGOcYXQIzRFU91c72Ea"
    };
    this.callback = null;
    this.PATTERN_PLAYLIST = "^https?:\/\/(?:www\.)?(api|api-v2\.soundcloud.com)\/([a-zA-Z\/]+)(\\d+)\\?client_id=[a-zA-Z0-9]+";
    this.PATTERN_TRACK = "^https?:\/\/(?:www\.)?(api|api-v2\.soundcloud.com)\/([a-zA-Z]+)\\?ids=([0-9]+)&client_id=[a-zA-Z0-9]+";
    this.PATTERN_EMBEDED = "^https?:\/\/(?:www\.)?(api|api-v2).soundcloud.com\/([a-zA-Z\/]+)(\\d+)\\S+&client_id=[a-zA-Z0-9]+";
    // "soundcloud://users:154943791"
    // Set: https://api-v2.soundcloud.com/profile/soundcloud:users:154943791?client_id=02gUJC0hH2ct1EGOcYXQIzRFU91c72Ea
    // Track: https://api.soundcloud.com/i1/tracks/24614420/streams?client_id=02gUJC0hH2ct1EGOcYXQIzRFU91c72Ea
    // Embeded: https://api.soundcloud.com/playlists/162319299?limit=200&offset=0&linked_partitioning=1&secret_token=s-pq55W&client_id=cUa40O3Jg3Emvp6Tv4U6ymYYO50NUGpJ&format=json
  };
  soundcloud.prototype = {
    _getMediaFromXmlUrl: function(index, url, cfunc) {
      var xhr = new XMLHttpRequest();
      xhr.index = index;
      xhr.onload = cfunc;
      xhr.open("GET", url, true);
      xhr.setRequestHeader("Cache-Control", "no-cache");
      xhr.send();
    },
    processRequest: function(t) {
      var title = $('.soundTitle__title').text().trim();
      title = title.replace(/^\s+|\s+$/gm, '');
      var user_id = document.querySelector('link[href*="users:"]');
      if (user_id != undefined) {
        this.type = 'playlist';
        this.user_id = user_id.attributes['href'].value.match(/[0-9]+/)[0];
      } else {
        this.type = 'track';
        user_id = document.querySelector('link[href*="sounds:"]');
        this.user_id = user_id.attributes['href'].value.match(/[0-9]+/)[0];
      }
      if (title.length) {
        this.fileName = NormalizeFileName(title);
      } else {
        title = document.location.href;
        if (title[title.length - 1] == '/')
          title = title.substr(0, title.length - 1);
        if (title.lastIndexOf("/") != -1)
          this.fileName = title.substr(title.lastIndexOf('/') + 1, title.length - title.lastIndexOf('/') - 1);
      }

      var url = document.location.href;
      this._urls = [];
      this._urls.push(url);

      return true;
    },
    getMedia: function(cfunc) {
      if (this.type == 'playlist') {
        this.getEmbedPlaylist(escape(this._urls[0]), cfunc);
      } else if (this.type == 'track') {
        this.getEmbedTrack(escape(this._urls[0]), cfunc);
      }
    },
    getPlaylist: function(url, callback) {
      this._urls = [];
      this._urls.push(url);
      if (this._urls[0].match(this.PATTERN_EMBEDED)) {
        this.type = this._urls[0].match(this.PATTERN_EMBEDED)[2].indexOf('playlist') >= 0 ? 'playlist' : 'track';
        if (this.type == 'playlist') {
          this.getEmbedPlaylist(url, callback);
        } else {
          this.getEmbedTrack(url, callback);
        }
        return;
      } else {
        this.type = url.indexOf('tracks') >= 0 ? 'track' : 'playlist';
        this.user_id = (this.type == 'playlist') ? this._urls[0].match(this.PATTERN_PLAYLIST)[3] : this._urls[0].match(this.PATTERN_TRACK)[3];
      }
      this.getMedia(callback);
    },
    getEmbedTrack: function(url, cfunc) {
      if (this.user_id)
        url = "https://api.soundcloud.com/i1/tracks/" + this.user_id + "/streams?client_id=" + this.ids.clientId2;
      this.callback = cfunc;

      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.setRequestHeader("Cache-Control", "no-cache");
      // Call in closure manner
      xhr.onload = function() {
        if (this.readyState == 4 && 200 === this.status) {
          var object = JSON.parse(this.responseText);
          SC.downloadLinks.push({
            url: object.http_mp3_128_url,
            title: SC.fileName,
            mime: 'mp3',
            len: undefined,
            quality: undefined,
            resolution: undefined,
            media_type: Media_type[1],
          });
        }
      };
      xhr.send();
    },

    getEmbedPlaylist: function(url, cfunc) {
      if (this.user_id)
        url = "https://api-v2.soundcloud.com/profile/soundcloud:users:" + this.user_id + "?client_id=" + this.ids.clientId2;
      this.callback = cfunc;

      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.setRequestHeader("Cache-Control", "no-cache");
      // Call in closure manner
      xhr.onload = function() {
        if (this.readyState == 4 && 200 === this.status) {
          var has_download_link = false;
          var object = JSON.parse(this.responseText);
          object = (object.tracks != undefined) ? object.tracks : object.collection != undefined ? object.collection : null;
          if (!object)
            return;

          if (object[0].type == 'playlist') {
            for (var i = 1; i < object.length; i++) {
              if (object[i].type != 'track')
                continue;

              SC.trackId.push(object[i].track.id.toString());
              SC.title.push(object[i].track.title != undefined ? object[i].track.title : SC.fileName);
              SC.duration.push(object[i].duration);
              SC.fileSize.push(object[i].original_content_size);
            }
          } else if (object[0].kind == 'track') {
            for (var i = 1; i < object.length; i++) {
              if (object[i].kind != 'track')
                continue;

              SC.trackId.push(object[i].id.toString());
              SC.title.push(object[i].title != undefined ? object[i].title : 'track' + i);
              SC.duration.push(object[i].duration);
              SC.fileSize.push(object[i].original_content_size);
            }
          } else if (object[0].track != undefined) {
            SC.trackId.push(object[0].track.id.toString());
            SC.title.push(object[0].track.title != undefined ? object[0].track.title : SC.fileName);
            SC.duration.push(object[0].track.duration);
            SC.fileSize.push(object[0].track.original_content_size);
          }

          if (has_download_link) {
            SC.callback({
              links: SC.downloadLinks
            });
            return;
          }

          SC.getTrackInfo();
        }
      };

      xhr.send();
    },
    getTrackInfo: function() {
      for (var i = 0; i < SC.trackId.length; i++) {
        var url = "https://api.soundcloud.com/i1/tracks/" + this.trackId[i] + "/streams?client_id=" + this.ids.clientId;
        this._getMediaFromXmlUrl(i, url, this.processXMLResponse);
      }
    },
    processXMLResponse: function(xhr) {
      if (this.readyState == 4) {
        var object = JSON.parse(this.responseText);
        var i = this.index;
        SC.downloadLinks.push({
          url: object.http_mp3_128_url,
          title: SC.title[i],
          mime: 'mp3',
          len: SC.fileSize[i],
          quality: undefined,
          resolution: undefined,
          media_type: Media_type[1],
        });
        if (SC.downloadLinks.length >= SC.trackId.length) {
          chrome.extension.sendMessage({
            msg: "ON_RESPONSE_EVENT_URLS",
            response: {
              org_id: SC.org_id,
              org_url: SC.org_url,
              links: SC.downloadLinks
            }
          });
        }
      }
    },
  };
  extended(soundcloud, MediaProviderInterface);

  //vuiviet.com/vuiviet.vn/vuiviet.us
  // =============================================================================
  var vuiviet = function() {
    vuiviet.superclass.constructor.apply(this, arguments);
    this.id = "vuiviet";
    this.MEDIA_QUERY = 'embed[name="flashplayer"]';
    this.tab_id = false;
    this.links = [];
  };

  vuiviet.prototype = {
    URL_BASE: "http://vuiviet.us",
    _getMediaFromXmlUrl: function(url, cfunc) {},
    getMedia: function(cfunc) {
      chrome.extension.sendMessage({
          msg: "ON_QUERY_VIDEO_URLS",
          tabId: this.tab_id,
          yturl: this._urls[0],
        },
        //callback function
        this.processXMLResponse.bind()
      );
    },

    processRequest: function(t) {
      var tags = document.querySelectorAll(this.MEDIA_QUERY);
      for (var i = 0; i < tags.length; i++) {
        var tag = tags[i].getAttribute('flashvars'),
          list = tag.split('file=');
        if (Array.isArray(list)) {
          var link = list[1];
          this._urls.push(decodeURIComponent(link));
        }
      }

      return this._urls.length > 0;
    },

    processXMLResponse: function(xhr) {
      var tracks = xhr.videoUrls;
      if (tracks.length == 0)
        return;

      var links = [];

      for (var i in tracks) {
        try {
          var t = tracks[i].title,
            l = tracks[i].url,
            m = tracks[i].mime,
            len = tracks[i].len,
            r = tracks[i].res;

          links.push({
            url: l,
            mime: m,
            len: len,
            resolution: r,
            title: NormalizeFileName(t),
            quality: undefined,
            media_type: Media_type[0],
          });

        } catch (e) {
          console.log(e.name + ': ' + e.message);
        }
      }
      this.callback({
        org_id: VGTV.org_id,
        org_url: VGTV.org_url,
        links: links
      });
    },
  };
  extended(vuiviet, MediaProviderInterface);

  //Facebook Video
  // =============================================================================
  var facebook = function() {
    facebook.superclass.constructor.apply(this, arguments);
    this.id = "facebook";
    this.links = [];
    this.link_count = 0;
    this.videoTag = [];
    this.videoTitle = [];
    this.tagSet = {};
    this.referVideoSet = {};
    this.idSet = {};
  };

  facebook.prototype = {
    processRequest: function(t) {
      // this.videoTag = document.querySelectorAll('a[data-video-channel-id');
      // if (this.videoTag.length <= this.link_count)
      //   return false;
      videoNode = document.getElementsByTagName('video');
      if (videoNode.length <= this.link_count)
        return false;

      for (var i = 0; i < videoNode.length; i++) {
        const video_src = decodeURIComponent(videoNode[i].src);
        if (video_src && /^blob:https?:\/\/(www)?\.?facebook\.com\/[A-z0-9-]+$/.test(video_src)) {
            // Setup map from video to referrer url
            var tag = this.getVideoTag(videoNode[i]);
            if (tag != null) {
                this.videoTag.push(tag.video_id);
                this.videoTitle.push(tag.title);
                // Get referrence url
                if (tag.video_id.href.match(/\/videos\/\d+\/?$/))
                    this.referVideoSet[videoNode[i].id] = tag.video_id.href;

                $(videoNode[i]).bind('play', function (e) {
                    chrome.extension.sendMessage({
                      msg: "ON_SYNC_MEDIA_REFERER_URL",
                      response: {
                        org_id: FBV.org_id,
                        org_url: FBV.org_url,
                        sync_url: [FBV.referVideoSet[e.target.id], e.target.src]
                      }
                    });
                    $(e).unbind('play');
                });
            }
        }
      }

      this.link_count = this.videoTag.length;
      return true;
    },

    getMedia: function(cfunc) {
      // Reset info
      this.links = [];
      for (var i = 0; i < this.videoTag.length; i++) {
        var id = '';
        if (this.videoTag[i].hasAttribute("data-video-id")) {
            id = this.videoTag[i].getAttribute("data-video-id");
            if (this.idSet.hasOwnProperty(id))
                continue;
            this.idSet[id] = true;
        }
        this.requestVideoDescriptions(this.videoTag[i], this.videoTitle[i]);
      }
    },

    getVideoTag: function(video) {
        var root = video.parentNode.querySelectorAll('a[href^="/"]');
        var video_tag = this.getNearestParent(video, '[role="article"]');
        if (video_tag) {
            var v = video_tag.querySelector("a[data-video-id]");
            var t = video_tag.getElementsByClassName('_5pbx userContent');
            t = (t.length > 0) ? NormalizeFileName(t[0].textContent) : '';
            if (v) return {video_id: v, title: t};
        }
        return null;
    },

    getNearestParent: function(node, selector) {
        for (; node !== null && node instanceof HTMLElement && !node.matches(selector);)
            node = node.parentNode;
        return node;
    },

    requestVideoDescriptions: function(video_tag, title) {
        var xhr = new XMLHttpRequest;
        xhr.callback = this.queryData.bind();
        xhr.preset_title = title;
        xhr.onload = function() {
            if (this.readyState == 4 && 200 === this.status) {
                var xmlContent = this.responseText;
                var video_id = /"video_id":"(.*?)"/.exec(xmlContent);
                if (video_id == null)
                    return;

                var sd_src = /"sd_src":"(.*?)"/.exec(xmlContent),
                hd_src = /"hd_src":"(.*?)"/.exec(xmlContent),
                is_live_stream = /"is_live_stream":(true|false)/.exec(xmlContent),
                is_facecast_audio = /"is_facecast_audio":(true|false)/.exec(xmlContent),
                video_url = /"video_url":"(.*?)"/.exec(xmlContent);

                if (is_live_stream != null && is_live_stream[1] == "true")
                    return;
                if (is_facecast_audio != null && is_facecast_audio[1] == "true")
                    return;

                var links = [];
                var arr_title = video_url[1].split('\\');
                var title = this.preset_title;
                if (title == '' && arr_title.length > 0) {
                    title = arr_title[1].substr(1) + ' - ' + arr_title[3].substr(1) ;
                }
                if (title == '')
                    title = NormalizeFileName(video_id[1]);

                if (title.length > 40)
                    title = title.substr(0, 40) + '...';
                if (sd_src != null) {
                  sd_src = sd_src[1].replace(/\\/g, '')

                  links.push({
                    url: sd_src,
                    mime: 'mp4',
                    title: title + '.mp4',
                    quality: 'SD',
                    len: undefined,
                    resolution: undefined,
                    media_type: Media_type[1],
                  });
                }
                if (hd_src != null) {
                  hd_src = hd_src[1].replace(/\\/g, '')

                  links.push({
                    url: hd_src,
                    mime: 'mp4',
                    title: title + '.mp4',
                    quality: 'HD',
                    len: undefined,
                    resolution: undefined,
                    media_type: Media_type[1],
                  });
                }
                this.callback(video_id[1], links);
            }
        };
        xhr.open("GET", "https://www.facebook.com/video/embed/async/dialog/?url=" + video_tag + "&dpr=1&__a=1");
        xhr.send()
    },

    queryData: function(tag, links) {
        if (FBV.tagSet.hasOwnProperty(tag))
            return;

        FBV.tagSet[tag] = true;
        // May be correct title
        chrome.extension.sendMessage({
          msg: "ON_RESPONSE_EVENT_URLS",
          response: {
            org_id: FBV.org_id,
            org_url: FBV.org_url,
            links: links
          }
        });
    },

    getTitle: function(tag) {
        return tag + '.mp4';
    },

    getLinks: function(parent, callback) {
      var count = 0,
        _this = this;
      var timeEvent = null, parentTag = parent;

      var func = function() {
        var embed = parentTag.querySelector('embed');
        if (embed != undefined) {
          _this.link_count--;
          _this.getLinksFromEmbed(embed);
          if (0 == FBV.link_count) {
            callback.call(_this, {
              org_id: _this.org_id,
              org_url: _this.org_url,
              links: _this.links
            });
          }

          return;
        }

        var video = parentTag.querySelector('video');
        if (video) {
          _this.link_count--;
          _this.getLinksFromVideo(video);
          if (0 == _this.link_count) {
            callback.call(_this, {
              org_id: _this.org_id,
              org_url: _this.org_url,
              links: _this.links
            });
          }
          return;
        }

        embed = null;
        video = null;

        count++;
        if (count > 10) {
          callback.call(_this, null);
          clearTimeout(timeEvent);
        }

        timeEvent = setTimeout(func, 1000);
      };

      timeEvent = setTimeout(func, 1000);
    },

    // Get link from embed flash params
    getLinksFromEmbed: function(embed) {
      var extractVideoLink = function(item) {
        var title = FBV.getTitle();
        if (item.sd_src) {
          var ext = FBV.getFileExtension(item.sd_src, 'mp4');
          if (title.length <= 0)
            title = FBV.getFilenameFromUrl(item.sd_src);
          FBV.links.push({
            url: item.sd_src,
            mime: ext,
            title: NormalizeFileName(title),
            quality: 'SD',
            len: undefined,
            resolution: undefined,
            media_type: Media_type[1],
          });
        }
        if (item.hd_src) {
          var ext = FBV.getFileExtension(item.hd_src, 'mp4');
          if (title.length <= 0)
            title = FBV.getFilenameFromUrl(item.hd_src);
          FBV.links.push({
            url: item.hd_src,
            mime: ext,
            title: NormalizeFileName(title),
            quality: 'HD',
            len: undefined,
            resolution: undefined,
            media_type: Media_type[1],
          });
        }
      };

      if (!embed) return null;

      var fv = embed.getAttribute('flashvars');
      if (fv === null) return null;

      var params = this.parseUrlParams(fv).params;
      if (params === undefined) return null;

      try {
        params = JSON.parse(decodeURIComponent(params));
      } catch (e) {
        return null;
      }
      if (!params || !params.video_data) return null;

      var videoData = params.video_data;
      if (!Array.isArray(videoData.progressive)) {
        item = videoData.progressive;
        extractVideoLink(item);
      } else {
        for (var i = 0; i < videoData.progressive.length; i++) {
            var item = videoData.progressive[i];
            extractVideoLink(item);
          }
       }
    },

    // Get link frome Hmtl5 video player
    getLinksFromVideo: function(video) {
      if (!video)
        return null;

      FBV.links = {};
      if (video.src) {
        var ext = this.getFileExtension(video.src, 'mp4');
        FBV.links[video.src] = ext.toUpperCase();
      }

      var src = video.querySelectorAll('source');
      if (src && src.length > 0) {
        for (var i = 0; i < src.length; i++) {
          var ext = this.getFileExtension(src[i].src, 'mp4');
          FBV.links[src[i].src] = ext.toUpperCase();
        }
      }
    },

    parseUrlParams: function(url, options) {
      options = options || {};
      var startFrom = url.indexOf('?');
      var query = url;
      if (!options.argsOnly && startFrom !== -1) {
        query = url.substr(startFrom + 1);
      }
      var sep = options.forceSep || '&';
      if (!options.forceSep && query.indexOf('&amp;') !== -1) {
        sep = '&amp;';
      }
      var dblParamList = query.split(sep);
      var params = {};
      for (var i = 0, len = dblParamList.length; i < len; i++) {
        var item = dblParamList[i];
        var ab = item.split('=');
        if (options.useDecode) {
          params[ab[0]] = decodeURIComponent(ab[1] || '');
        } else {
          params[ab[0]] = ab[1] || '';
        }

      }
      return params;
    },

    getFilenameFromUrl: function(str) {
      var fileName = str.match(/\/([^\/]+\.[a-z0-9]{3,4})(?:\?|$)/i);
      if (fileName) {
        fileName = fileName[0];
        return fileName.toUpperCase();
      }

      return '';
    },

    getFileExtension: function(str, def) {
      var ext = str.match(/\.([a-z0-9]{3,4})(\?|$)/i);
      if (ext) {
        ext = ext[1];
        return ext.toLowerCase();
      }

      return (def ? def : '');
    },
  };
  extended(facebook, MediaProviderInterface);

  // Vimeo Video
  // =============================================================================
  // https://vimeo.com/channels/staffpicks/141737411
  // https://player.vimeo.com/video/141737411/config?referrer=https://vimeo.com/channels/staffpicks/149184273
  var vimeo = function() {
    vimeo.superclass.constructor.apply(this, arguments);
    this.id = "vimeo";
    this.links = [];
    this.callback = null;
    this.videoId = null;
    this.link_pattern = "https://player.vimeo.com/video/{{id}}/config?referrer={{referrer}}";
  };

  vimeo.prototype = {
    processRequest: function(t) {
      if (location.href.match("(^http|https:)\/\/vimeo.com\/[a-z\/]*(\\d+)")) {
        this.videoId = location.href.match("(^http|https:)\/\/vimeo.com\/[a-z\/]*(\\d+)")[2];
        if (this.videoId != null) {
            chrome.extension.sendMessage({
                msg: "ON_SYNC_MEDIA_REFERER_URL",
                    response: {
                    org_id: VMO.org_id,
                    org_url: VMO.org_url,
                    sync_url: ["https://player.vimeo.com/video/" + this.videoId, document.getElementsByTagName('video')[0].src]
                }
            });
        }

        return true;
      }

      var container = document.querySelectorAll('#clip');
      if (container && container.length == 1) {
        this.videoId = this.getVideoId(container);
      } else {
        container = document.querySelectorAll('#channel_clip_container');
        if (container && container.length === 2) {
          if (container[0].hasChildNodes(container[1])) {
            container = [container[1]];
          }
        }
        if (container && container.length === 1) {
          container = container[0];
          this.videoId = this.getVideoId(container);
        }
      }

      return this.videoId != null;
    },

    getMedia: function(cfunc) {
      this.getVimeoLinks(this.videoId, cfunc);
    },

    getVideoId: function(container) {
      var id = null;
      var player = container.querySelector('.player[data-fallback-url]');
      if (player) {
        var fallbackUrl = player.dataset.fallbackUrl || '';
        fallbackUrl = fallbackUrl.match(/video\/([0-9]+)\//);
        if (fallbackUrl) {
          return fallbackUrl[1];
        }
      }
      player = container.querySelector('div.player_wrapper > div.faux_player[data-clip_id]');
      if (player) {
        id = player.dataset.clip_id;
        if (id) {
          return id;
        }
      }
    },

    getVimeoLinks: function(videoId, callback) {
      var xhr = new XMLHttpRequest();
      xhr.callback = callback;
      var url = this.link_pattern.replace('{{id}}', this.videoId).replace('{{referrer}}', location.href);
      xhr.onload = function() {
        if (this.readyState == 4 && 200 === this.status) {
          var object = JSON.parse(this.responseText);
          try {
            var data = object.request.files.progressive;
            var title = object.video.title;
            var links = [];
            for (var i = 0; i < data.length; i++) {
              links.push({
                url: data[i].url,
                mime: data[i].mime,
                title: NormalizeFileName(title) + ' - ' + data[i].quality,
                quality: ZV.getVideoQualities(data[i].quality),
                len: undefined,
                resolution: undefined,
                media_type: Media_type[0],
              });
            }
            chrome.extension.sendMessage({
              msg: "ON_RESPONSE_EVENT_URLS",
              response: {
                org_id: VMO.org_id,
                org_url: VMO.org_url,
                links: links
              }
            });
          } catch (e) {
            this.callback(null, '');
          }
        } else {
          this.callback(null, '');
        }
      }; //cfunc;
      xhr.open('GET', url, true);
      xhr.send();
    },

    getVimeoEmbedLinks: function(videoId, callback) {
      var xhr = new XMLHttpRequest();
      xhr.callback = callback;
      var url = 'http://player.vimeo.com/video/' + videoId;
      xhr.onload = function() {
        if (this.readyState == 4 && 200 === this.status) {
          var config = this.responseText.match(/,c\s*=\s*(\{[\s\S]+?\})\s*;/i);
          if (config && config.length > 1) {
            config = config[1];
            var data = VMO.getVimeoDataFromConfig(config);
            if (data && data.links) {
              return this.callback(data.links, data.title);
            }
          }
          this.callback(null, '');
        } else {
          this.callback(null, '');
        }
      }; //cfunc;
      xhr.open('GET', url, true);
      xhr.send();
    },

    getVimeoNoEmbedLinks: function(videoId, callback) {
      var xhr = new XMLHttpRequest();
      var url = 'http://vimeo.com/' + videoId;
      xhr.object = this;
      xhr.callback = callback;
      xhr.onload = function() {
        if (this.readyState == 4 && 200 === this.status) {
          var configUrl = this.responseText.match(/data-config-url=[\"']([^\s\"'\<\>]+)/i);
          if (configUrl && configUrl.length > 1) {
            configUrl = configUrl[1].replace(/&amp;/ig, '&');
            var xhr = new XMLHttpRequest();
            xhr.cb = this.callback;
            xhr.onload = function() {
              if (this.readyState == 4 && 200 === this.status) {
                var data = VMO.getVimeoDataFromConfig(xhr.responseText);
                if (data && data.links) {
                  return this.cb(data.links, data.title, data.thumb);
                }
                this.cb(null, '');
              } else {
                this.cb(null, '');
              }
            };
            xhr.open('GET', configUrl, true);
            xhr.send();
          }
        } else {
          this.callback(null, '');
        }
      }; //cfunc;
      xhr.open('GET', url, true);
      xhr.send();
    },

    getVimeoDataFromConfig: function(config) {
      config = config.replace(/(\{|,)\s*(\w+)\s*:/ig, '$1"$2":').
      replace(/(:\s+)\'/g, '$1"').replace(/\'([,\]\}])/g, '"$1');

      try {
        config = JSON.parse(config);
      } catch (err) {
        return null;
      }

      if (!config || !config.request || !config.video ||
        !config.request.files || !config.request.files.codecs.length) {
        return null;
      }

      var r = config.request,
        v = config.video,
        data = {};

      data.title = v.title ? v.title : '';
      data.links = [];
      var codecs = r.files.codecs;
      for (var k = 0; k < codecs.length; k++) {
        var files = r.files[codecs[k]];
        if (files) {
          for (var i in files) {
            var name = i.length <= 3 ? i.toUpperCase() : i;

            var ext = files[i].url.match(/\.(\w{2,4})(?:\?|#|$)/i);
            if (ext && ext.length > 1)
              ext = ext[1].toLowerCase();
            else
              ext = 'mp4';

            data.links.push({
              url: files[i].url,
              type: name,
              ext: ext
            });
          }
        }
      }

      return data;
    }
  };
  extended(vimeo, MediaProviderInterface);

  // Dailymotion site
  // http://www.dailymotion.com/video/x2ow19d
  // http://www.dailymotion.com/json/video/x2ow19d?fields=id,swf_url,thumbnail_url,thumbnail_large_url,thumbnail_medium_url,stream_h264_url,stream_h264_ld_url,stream_h264_hq_url,stream_h264_hd_url,stream_h264_hd1080_url,paywall,mode,onair,audience_url,stream_live_hls_url,title,url,owner_screenname,owner_username,duration,channel,owner_url,ads,private,type,owner.type,isrc,language,available_formats,explicit,created_time,stream_hls_url,vast_url_template,log_view_urls
  var dailymotion = function() {
    dailymotion.superclass.constructor.apply(this, arguments);
    this.id = "dailymotion";
    this.downloadLinks = [];
    this.videoTag = "^(http|https)?:\/\/(?:www\.)?www.dailymotion.com/video/([a-zA-Z0-9_-]+)";
    this.embedTag = "id,swf_url,thumbnail_url,thumbnail_large_url,thumbnail_medium_url,stream_h264_url,stream_h264_ld_url,stream_h264_hq_url,stream_h264_hd_url,stream_h264_hd1080_url,paywall,mode,onair,audience_url,stream_live_hls_url,title,url,owner_screenname,owner_username,duration,channel,owner_url,ads,private,type,owner.type,isrc,language,available_formats,explicit,created_time,stream_hls_url,vast_url_template,log_view_urls";
    this.link_pattern = "http://www.dailymotion.com/json/video/{{id}}?fields={{referrer}}";
    this.url_qualtily_map = {
        ld: "stream_h264_ld_url",
        sd: "stream_h264_url",
        hq: "stream_h264_hq_url",
        hd: "stream_h264_hd_url",
        hd720: "stream_h264_hd_url",
        hd1080: "stream_h264_hd1080_url"
    };
  };

  dailymotion.prototype = {
    getMedia: function(cfunc) {
      this.xhr = new XMLHttpRequest();
      this.xhr.callback = cfunc;
      this.xhr.xmlParser = new DOMParser;
      this._getMediaFromXmlUrl(this._urls[this._urls.length - 1], this.processXMLResponse);
    },

    processRequest: function(t) {
      var video_id = location.href.match(this.videoTag);
      if (video_id != null) {
        var link = this.link_pattern.replace('{{id}}', video_id[2] + '').replace('{{referrer}}', encodeURIComponent(this.embedTag));
        this._urls.push(link);
      }

      return this._urls.length > 0;
    },

    _getMediaFromXmlUrl: function(url, cfunc) {
      this.xhr.onload = cfunc;
      this.xhr.open("GET", url, true);
      this.xhr.setRequestHeader("Cache-Control", "no-cache");
      this.xhr.send();
    },

    processXMLResponse: function(xhr) {
      if (this.readyState == 4 && this.status == 200) {
        var object = JSON.parse(this.responseText);
        var title = object.title;
        var avails_format = object.available_formats;
        if (avails_format != undefined && avails_format.length > 0) {
          for (var i in avails_format) {
            var quality = DMO.getQuality(avails_format[i]);
            if ((url = DMO.url_qualtily_map[avails_format[i]]) != undefined) {
              var link = object[url];
              DMO.downloadLinks.push({
                url: link,
                title: title,
                mime: 'mp4',
                len: undefined,
                quality: quality,
                resolution: undefined,
                media_type: Media_type[1],
              });
            }
          }

          chrome.extension.sendMessage({
            msg: "ON_RESPONSE_EVENT_URLS",
            response: {
              org_id: DMO.org_id,
              org_url: DMO.org_url,
              links: DMO.downloadLinks
            }
          });
        }
      }
    },

    getQuality: function(qualtity) {
      switch (qualtity) {
        case "l1":
        case "l2":
        case "ld":
          return 'Low';
        case "sd":
          return 'Normal';
        case "hq":
          return '480';
        case "hd720":
          return 'HD 720';
        case "hd1080":
          return "HD 1080";

        default:
          return "";
      }
    },
  };
  extended(dailymotion, MediaProviderInterface);

  // HD Films Site
  var HDVFilm = function() {
    HDVFilm.superclass.constructor.apply(this, arguments);
    this.links = [];
    this.pattern = '';
  };

  HDVFilm.prototype = {
    getFileName: function() {
      filename = document.location.pathname;
      filename = filename.substr(filename.lastIndexOf('/') + 1, filename.length);
      filename = filename.substr(0, filename.lastIndexOf('-'));
      return filename;
    },
    getPlaylist: function(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.link_pattern = this.pattern;
      xhr.id = this.id;
      xhr.fileName = this.getFileName();
      xhr.onload = function() {
        if (this.readyState == 4 && 200 === this.status) {
          var response = this.responseText;
          var link = '',
            arr = [];
          while (link = this.link_pattern.exec(response)) {
            arr.push(link);
          }
          if (arr.length > 0) {
            chrome.extension.sendMessage({
              msg: "ON_RESPONSE_STREAMMING_URLS",
              id: this.id,
              org_url: location.href,
              fileName: this.fileName,
              url: [{
                type: 'Standard',
                urls: arr
              }],
            });
          }
        }
      }; //cfunc;
      xhr.open('GET', url, true);
      xhr.send();
    },
  };
  extended(HDVFilm, MediaProviderInterface);

  var HayHayTV = function() {
    HayHayTV.superclass.constructor.apply(this, arguments);
    this.id = "hayhaytv";
    this.pattern = /media_[0-9]+\.ts/g;
  };
  extended(HayHayTV, HDVFilm);

  var HDViet = function() {
    HDViet.superclass.constructor.apply(this, arguments);
    this.id = "hdviet";
    //this.playlist_pattern = /http?:\/\/(?:www\.)?((([a-zA-Z0-9-_.])+\/)+)([0-9a-z_.])+\.m3u8/g;
    this.playlist_pattern = /(.*?)\.m3u8/g;
    this.link_pattern = /(.*?)\.ts/g;
    this.qualities = 0;
    this.arr_qualities = [];
  };

  HDViet.prototype = {
    getFileName: function() {
      filename = location.pathname;
      filename = filename.substr(filename.lastIndexOf('/') + 1, filename.length);
      filename = filename.substr(0, filename.lastIndexOf('.'));
      return filename;
    },

    // Retrive playlist of all cater url
    getPlaylist: function(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.pattern = this.playlist_pattern;
      xhr.hostname = url.substr(0, url.lastIndexOf('/') + 1);
      xhr.onload = function() {
        if (this.readyState == 4 && 200 === this.status) {
          var response = this.responseText;
          var link = '';
          arr_quality = [];
          while (link = this.pattern.exec(response)) {
            if (link[0].indexOf("http") == -1)
              arr_quality.push(this.hostname + link[0]);
            else
              arr_quality.push(link[0]);
          }
          //RESOLUTION=480x270
          var res = '',
            res_pattern = /(.*?),RESOLUTION=([0-9]+)x([0-9]+)/g,
            arr_type = [];
          while (res = res_pattern.exec(response)) {
            arr_type.push(res[2].toString());
          }
          if (arr_quality.length > 0) {
            HDV.qualities = arr_quality.length;
            for (var i in arr_quality)
              HDV.queryLinks(arr_quality[i], arr_type[i] != undefined ? arr_type[i] : 'Standard');
          }
        }
      }; //cfunc;
      xhr.open('GET', url, true);
      xhr.send();
    },
    // Query all downloadable link
    queryLinks: function(url, type, callback) {
      var xhr = new XMLHttpRequest();
      xhr.id = this.id;
      xhr.type = type;
      xhr.pattern = this.link_pattern;
      xhr.fileName = this.getFileName();
      xhr.onload = function() {
        if (this.readyState == 4 && 200 === this.status) {
          var response = this.responseText;
          var link = '';
          arr = [];
          while (link = this.pattern.exec(response)) {
            arr.push(link[0].indexOf("http") == -1 ? this.responseURL.substr(0, this.responseURL.lastIndexOf('/') + 1) + link[0] : link[0]);
          }
          if (arr.length > 0) {
            HDV.arr_qualities.push({
              type: this.type,
              urls: arr
            });
          }
          HDV.qualities--;
          if (HDV.qualities == 0) {
            HDV.arr_qualities.sort(function(a, b) {
              return parseInt(a.type) < parseInt(b.type);
            });
            chrome.extension.sendMessage({
              msg: "ON_RESPONSE_STREAMMING_URLS",
              id: this.id,
              org_url: location.href,
              fileName: this.fileName,
              url: HDV.arr_qualities,
            });
          }
        }
      }; //cfunc;
      xhr.open('GET', url, true);
      xhr.send();
    },
  };
  extended(HDViet, HDVFilm);

  var HDOnline = function() {
    HDOnline.superclass.constructor.apply(this, arguments);
    this.id = "hdonline";
  };
  extended(HDOnline, HDViet);

    // VNNews
  var VNNews = function() {
    VNNews.superclass.constructor.apply(this, arguments);
    this.id = "vnn";
    this.rsmp_links = [];
    this.link_pattern = /(.*?)\.ts/g;
  };

  VNNews.prototype = {
    processRequest: function() {
        var script_all = document.querySelectorAll("script");
        for (var i = 0; i < script_all.length; ++i) {
            pos1 = script_all[i].textContent.indexOf("sources: [{file:");
            if (pos1 >= 0) {
                pos1 = script_all[i].textContent.indexOf("file: ", pos1 + 16);
                pos2 = script_all[i].textContent.indexOf(".m3u8", pos1);
                if (pos2 != 1) {
                    this.rsmp_links.push(script_all[i].textContent.substr(pos1 + 7, pos2 - pos1 - 2));
                    return true;
                }
            }
        }
        return false;
    },
    getMedia: function(cfunc) {
      var xhr = new XMLHttpRequest();
      xhr.onload = this.processXMLResponse.bind(xhr);
      xhr.open("GET", this.rsmp_links[0], true);
      xhr.setRequestHeader("Cache-Control", "no-cache");
      xhr.send();
    },

    processXMLResponse: function(xhr) {
        if (this.readyState == 4) {
          var response = this.responseText;
          var link = '', arr = [];
          var base_url = this.responseURL.substr(0, this.responseURL.lastIndexOf('/') + 1);
          while (link = VNN.link_pattern.exec(response)) {
            if (link[0].indexOf('http') == -1)
                arr.push(base_url + link[0]);
            else
                arr.push(link[0]);
          }
          if (arr.length > 0) {
            var name_arr = location.pathname.split('/');
            var fileName = name_arr[name_arr.length - 1];
            if (fileName.indexOf('.html') > 0)
                fileName = fileName.substr(0, fileName.length - 5);
            chrome.extension.sendMessage({
              msg: "ON_RESPONSE_STREAMMING_URLS",
              id: VNN.id,
              org_url: location.href,
              fileName: fileName,
              url: [{
                type: 'Standard',
                urls: arr
              }],
            });
          }
        }
    }
  };
  extended(VNNews, MediaProviderInterface);

  ////////////////////////////////////////////////////////////////////////////
  var hls = function() {
    hls.superclass.constructor.apply(this, arguments);
    this.id = "infant";

    this.playlist_pattern = /(.*?)\.m3u8.*/g;
    this.link_pattern = /(.*?)\.ts/g;
    this.qualities = 0;
    this.arr_qualities = [];
  };

  hls.prototype = {
    getFileName: function() {
      return NormalizeFileName(document.title);
    },
        // Retrive playlist of all cater url
    getPlaylist: function(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.pattern = this.playlist_pattern;
      xhr.hostname = url.substr(0, url.lastIndexOf('/') + 1);
      xhr.onload = function() {
        if (this.readyState == 4 && 200 === this.status) {
          var response = this.responseText;
          var link = '';
          arr_quality = [];
          INFANT.arr_qualities = []; // VanDD : clean this
          while (link = this.pattern.exec(response)) {
            if (link[0].indexOf('http') != 0)
                link[0] = this.hostname + link[0];
            arr_quality.push(link[0]);
          }
          //RESOLUTION=480x270
          var res = '',
            res_pattern = /(.*?),RESOLUTION=([0-9]+)x([0-9]+)/g,
            arr_type = [];
          while (res = res_pattern.exec(response)) {
            arr_type.push(res[2].toString() + 'x' + res[3].toString());
          }
          if (arr_quality.length > 0) {
            INFANT.qualities = arr_quality.length;
            for (var i in arr_quality)
              INFANT.queryLinks(arr_quality[i], arr_type[i] != undefined ? arr_type[i] : 'Standard');
          } else if (response.indexOf('.ts') >= 0) {
            INFANT.qualities = 1;
            INFANT.getLinks(response, this.hostname, 'Standard');
          }
        }
      }; //cfunc;
      xhr.open('GET', url, true);
      xhr.send();
    },
    // Query all downloadable link
    queryLinks: function(url, type, callback) {
      var xhr = new XMLHttpRequest();
      xhr.id = this.id;
      xhr.type = type;
      xhr.pattern = this.link_pattern;
      xhr.fileName = this.getFileName();
      xhr.onload = function() {
        if (this.readyState == 4 && 200 === this.status) {
          var response = this.responseText;
          var link = '';
          arr = [];
          while (link = this.pattern.exec(response)) {
            // VanDD : add the https case
            arr.push((link[0].indexOf('http:') != -1 ||
                link[0].indexOf('https:') != -1)  ? link[0] : 'http:' + link[0]);
          }
          if (arr.length > 0) {
            INFANT.arr_qualities.push({
              type: this.type,
              urls: arr
            });
          }
          INFANT.qualities--;
          if (INFANT.qualities == 0) {
            INFANT.arr_qualities.sort(function(a, b) {
              return parseInt(a.type) < parseInt(b.type);
            });
            // [24/8/2018 VanDD] : delay this task to fix wrong location.href
            let response_ = {
              msg: "ON_RESPONSE_STREAMMING_URLS",
              id: this.id,
              org_url: location.href,
              fileName: this.fileName,
              url: INFANT.arr_qualities,
            }
            setTimeout(function() {
                response_.org_url = location.href;
                response_.fileName = NormalizeFileName(document.title);
                chrome.extension.sendMessage(response_)
            }, 1000);
            // End of comment
          }
        }
      }; //cfunc;
      // VanDD : add this
      if (url.indexOf('http:') == -1 && url.indexOf('https:') == -1)
        url = 'http:' + url;
      xhr.open('GET', url, true);
      xhr.send();
    },

    getLinks: function(response, current_host, type) {
      var link = '';
      arr = [];
      while (link = INFANT.link_pattern.exec(response)) {
        arr.push(((link[0].indexOf('http:') != -1) || (link[0].indexOf('https:') != -1)) ?
         link[0] : current_host + link[0]);
      }
      if (arr.length > 0) {
        INFANT.arr_qualities.push({
          type: type,
          urls: arr
        });
      }
      INFANT.qualities--;
      if (INFANT.qualities == 0) {
        INFANT.arr_qualities.sort(function(a, b) {
          return parseInt(a.type) < parseInt(b.type);
        });
        // [24/8/2018 VanDD] : delay this task to fix wrong location.href
        let response_ = {
          msg: "ON_RESPONSE_STREAMMING_URLS",
          org_url: location.href,
          id: this.id,
          fileName: this.getFileName(),
          url: INFANT.arr_qualities
        };
        setTimeout(function() {
            response_.org_url = location.href;
            response_.fileName = NormalizeFileName(document.title);
            chrome.extension.sendMessage(response_)
        }, 1000);
        // End of comment
      }
    },
  };
  extended(hls, HDViet);

  // NamPHb [06/08/18] Get link(s) download video from dantri
  var dantrivideo = function() {
    dantrivideo.superclass.constructor.apply(this, arguments);
    this.id = "dantri";
  };

  dantrivideo.prototype = {
    _getMediaFromXmlUrl: function(url, cfunc) {
      this.xhr.onload = (function(xhr) {
        return function() {
          cfunc(xhr);
        }
      })(this.xhr); //cfunc;
      this.xhr.open("GET", url, true);
      this.xhr.setRequestHeader("Cache-Control", "no-cache");
      this.xhr.send();
    },

    getMedia: function(cfunc) {
      this.xhr = new XMLHttpRequest();
      this.xhr.callback = cfunc;
      this.xhr.xmlParser = new DOMParser;
      this._getMediaFromXmlUrl(this._urls[0], this.processXMLResponse);
    },

    getPlaylist: function(url, callback) {
      this._urls.push(url);
      this.getMedia(callback);
    },

    processXMLResponse: function(xhr) {
      if (xhr.readyState == 4) {
        var xmlContent = JSON.parse(xhr.responseText);
        var title = xmlContent.title;
        var file = xmlContent.file;
        var namespace = xmlContent.namespace;

        var xhttp = new XMLHttpRequest;
        var url = "https://hls.mediacdn.vn/" + namespace + "\/" + file + "\.json?";
        var links = [];
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                
                var response = JSON.parse(this.responseText);
                var length = response.html5.length;
                if (length <= 0)
                    links.push({
                    url: response.mp4,
                    mime: "mp4",
                    resolution: undefined,
                    len: undefined,
                    title: title,
                    media_type: Media_type[0], 
                    quality: undefined,
                    });
                else {
                    let link, resolution;
                    for (i = 0; i < length; i++) {
                        link = response.html5[i];
                        resolution = 
                            link.substring(link.lastIndexOf("_") + 1, link.lastIndexOf("."));
                        links.push({
                            url: link,
                            mime: "mp4",
                            resolution: resolution,
                            len: undefined,
                            title: title,
                            media_type: Media_type[0], 
                            quality: undefined,
                        }) 
                    }
                }

                chrome.extension.sendMessage({
                    msg: "ON_RESPONSE_EVENT_URLS",
                    response: {
                        org_id: DTV.org_id,
                        org_url: DTV.org_url,
                        links: links
                    }
                });   
            }  
        }
        xhttp.open("GET", url, true);
        xhttp.send(null);
      }
    },

    processRequest: function() {

    }
  };
  extended(dantrivideo, MediaProviderInterface);

  // NamPHb [07/08/18] Get link(s) download video from kenh14
  var kenh14video = function() {
    kenh14video.superclass.constructor.apply(this, arguments);
    this.id = "kenh14";
  };

  kenh14video.prototype = {
    _getMediaFromXmlUrl: function(url, cfunc) {
      this.xhr.onload = (function(xhr) {
        return function() {
          cfunc(xhr);
        }
      })(this.xhr); //cfunc;
      this.xhr.open("GET", url, true);
      this.xhr.setRequestHeader("Cache-Control", "no-cache");
      this.xhr.send();
    },

    getMedia: function(cfunc) {
      this.xhr = new XMLHttpRequest();
      this.xhr.callback = cfunc;
      this.xhr.xmlParser = new DOMParser;
      this._getMediaFromXmlUrl(this._urls[this._urls.length - 1], this.processXMLResponse);
    },

    getPlaylist: function(url, callback) {
      this._urls.push(url);
      this.getMedia(callback);
    },

    processXMLResponse: function(xhr) {
      if (xhr.readyState == 4) {
        var xmlContent = JSON.parse(xhr.responseText);
        var title = xmlContent.title;
        var file = xmlContent.file;
        var namespace = xmlContent.namespace;

        var xhttp = new XMLHttpRequest;
        var url = "http://hls.mediacdn.vn/" + namespace + "\/" + file + "\.json?";
        var links = [];
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                
                var response = JSON.parse(this.responseText);
                var length = response.html5.length;
                if (length <= 0)
                    links.push({
                    url: response.mp4,
                    mime: "mp4",
                    resolution: undefined,
                    len: undefined,
                    title: title,
                    media_type: Media_type[0], 
                    quality: undefined,
                    });
                else {
                    let link, resolution;
                    for (i = 0; i < length; i++) {
                        link = response.html5[i];
                        resolution = 
                            link.substring(link.lastIndexOf("_") + 1, link.lastIndexOf("."));
                        links.push({
                            url: link,
                            mime: "mp4",
                            resolution: resolution,
                            len: undefined,
                            title: title,
                            media_type: Media_type[0], 
                            quality: undefined,
                        }) 
                    }
                }

                chrome.extension.sendMessage({
                    msg: "ON_RESPONSE_EVENT_URLS",
                    response: {
                        org_id: K14V.org_id,
                        org_url: K14V.org_url,
                        links: links
                    }
                });   
            }  
        }
        xhttp.open("GET", url, true);
        xhttp.send(null);
      }
    },
  };
  extended(kenh14video, MediaProviderInterface);
  // end

  // [NamPHb 06/09/18] 
  var phimbathu = function() {
    phimbathu.superclass.constructor.apply(this, arguments);
    this.id = "phimbathu";
    this.links = [];
  };

  phimbathu.prototype = {
    processRequest: function() {
        var processFunction = this.processXMLResponse;
        var title = document.title;
        var url = this.org_url;
        this.xhr = new XMLHttpRequest();
        this.xhr.__proto__.links = [];
        this.xhr.onload = function() {
            if (this.xhr.readyState == 4 && this.xhr.status == 200) {
                var responseText = JSON.parse(this.xhr.responseText);
                for (var i = 0; i < responseText.length; i++) {
                    this.xhr.links.push({
                        url: responseText[i].file, 
                        mime: "mp4", 
                        resolution: responseText[i].label, 
                        title: title, 
                        len: undefined, 
                        media_type: Media_type[0], 
                        quality: undefined
                    });
                }
            }
        };
        xhr.open("GET", url, true);
        xhr.send();
    }, 

    processXMLResponse: function(xhr, title) {
        
    }, 

    getMedia: function(callback) {
        var links = this.xhr.links;
        chrome.extension.sendMessage({
            msg: "ON_RESPONSE_EVENT_URLS",
            response: {
                org_id: PHB.org_id,
                org_url: PBH.org_url,
                links: links
            }
        });   
    }

  };
  extended(phimbathu, MediaProviderInterface);
  // end

  // call
  // =============================================================================
  var fb_callback = function() {
    chrome.extension.sendMessage({
        msg: "ON_RESPONSE_EVENT_URLS",
        response: {
          org_id: FBV.org_id,
          org_url: FBV.org_url,
          links: FBV.links
      }
    });
  };
  var fbScrollHandler = function() {
    if (FBV.processRequest())
        FBV.getMedia(fb_callback);
  };

  var MediaGrabber = function() {
    this._providers = new Array;
    this._has_init = false;
    this.provider = null;
    this.timeEvent = null;
    this.callback = null;
  };

  MediaGrabber.prototype = {
    constructor: MediaGrabber,

    _init: function() {
      chrome.extension.onMessage.addListener(
        this._onMessageHandler.bind(this))

      if (document.location.href.indexOf("facebook.com") != -1)
        document.addEventListener("scroll", fbScrollHandler);
      // Setup timer to fetch common media content
      setTimeout(function() {
        GGVIDEO.processRequest();
        GGVIDEO.getMedia();
      }, 2000)
    },

    _onMessageHandler: function(t, e, callback) {
      var requestType = t.msg;
      requestType = requestType.slice(18, -1).toLowerCase();

      for (var i = 0; i <= this._providers.length - 1; i++) {
        if (requestType.indexOf(this._providers[i].id) >= 0) {
          this._providers[i].org_id = t.tabid;
          this._providers[i].org_url = t.url;
          R.provider = this._providers[i];
          R.callback = callback;
          R._has_init = true;
          break;
        }
      }

      if (R._has_init) {
        if (t.playlist != undefined) {
          R.provider.getPlaylist(t.playlist, R.callback);
          return;
        }

        if (document.readyState == 'complete') {
          R.provider.processRequest();
          R.provider.getMedia(R.callback);
          return;
        } else {
          // Set time interval for loop current page to query media
          var retry_times = 0;
          R.timeEvent = setInterval(function() {
            if (document.readyState != 'complete') {
              if (R.provider.processRequest()) {
                R.provider.getMedia(R.callback);
                clearInterval(R.timeEvent);
              }
              if (++retry_times >= 10)
                clearInterval(R.timeEvent);
              return;
            }

            clearInterval(R.timeEvent);
            R.provider.processRequest();
            R.provider.getMedia(R.callback);
          }, 200);
        }
      }

      return !0;
    },

    _registerProviders: function(t) {
      if (!Array.isArray(t))
        throw 'Invalid provider list';

      Array.prototype.push.apply(this._providers, t);
      return this;
    }

  };

  // Create
  // =============================================================================
  VMO = new vimeo;
  DMO = new dailymotion;
  ZA = new zing;
  ZS = new zsingle;
  ZV = new zvideo;
  NVN = new nhacvn;
  ZGTV = new ztv;
  CSN = new chiasenhac;
  NCT = new nhaccuatui;
  SC = new soundcloud;
  NS = new nhacso;
  NV = new nhacvui;
  VGT = new vietgiaitri;
  NNV = new nghenhacvang;
  FBV = new facebook;
  CPN = new clipvn;
  NCTV = new nctvideo;
  VGTV = new vuiviet;
  HHTV = new HayHayTV;
  HDV = new HDViet;
  HDO = new HDOnline;
  VNN = new VNNews;
  INFANT = new hls;

  GGVIDEO = new GoogleVideoProvider;
    // [NamPHb 06/08/18] add provider for dantri and kenh14
    DTV = new dantrivideo;
    K14V = new kenh14video;
    // end
    // [NamPHb 06/09/18]
    PBH = new phimbathu;
    // end
  R = new MediaGrabber;
  R._registerProviders([
    // Audio
    CSN,
    NCT,
    ZA,
    ZS,
    NS,
    NV,
    VGT,
    NNV,
    SC,
    NVN,

    // Video
    CPN,
    NCTV,
    ZV,
    ZGTV,
    VGTV,
    FBV,
    VMO, //new vimeo,
    DMO, // new dailymotion
    PBH, // [NamPHb]

    // HD site
    HHTV,
    HDV,
    HDO,
    VNN,
    INFANT,
    GGVIDEO,
    // [NamPHb 06/08/18] register provider
    DTV,
    K14V,
    // end
    new CommonProvider,
  ]);
  R._init();

})();
