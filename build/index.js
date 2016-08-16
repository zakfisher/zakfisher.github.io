"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);throw new Error("Cannot find module '" + o + "'");
      }var f = n[o] = { exports: {} };t[o][0].call(f.exports, function (e) {
        var n = t[o][1][e];return s(n ? n : e);
      }, f, f.exports, e, t, n, r);
    }return n[o].exports;
  }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
    s(r[o]);
  }return s;
})({ 1: [function (require, module, exports) {
    (function (process, global, Buffer, __argument0, __argument1, __argument2, __argument3, __filename, __dirname) {
      /*!
       * The buffer module from node.js, for the browser.
       *
       * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
       * @license  MIT
       */

      var base64 = require('base64-js');
      var ieee754 = require('ieee754');

      exports.Buffer = Buffer;
      exports.SlowBuffer = Buffer;
      exports.INSPECT_MAX_BYTES = 50;
      Buffer.poolSize = 8192;

      /**
       * If `Buffer._useTypedArrays`:
       *   === true    Use Uint8Array implementation (fastest)
       *   === false   Use Object implementation (compatible down to IE6)
       */
      Buffer._useTypedArrays = function () {
        // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
        // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
        // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
        // because we need to be able to add all the node Buffer API methods. This is an issue
        // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
        try {
          var buf = new ArrayBuffer(0);
          var arr = new Uint8Array(buf);
          arr.foo = function () {
            return 42;
          };
          return 42 === arr.foo() && typeof arr.subarray === 'function'; // Chrome 9-10 lack `subarray`
        } catch (e) {
          return false;
        }
      }();

      /**
       * Class: Buffer
       * =============
       *
       * The Buffer constructor returns instances of `Uint8Array` that are augmented
       * with function properties for all the node `Buffer` API functions. We use
       * `Uint8Array` so that square bracket notation works as expected -- it returns
       * a single octet.
       *
       * By augmenting the instances, we can avoid modifying the `Uint8Array`
       * prototype.
       */
      function Buffer(subject, encoding, noZero) {
        if (!(this instanceof Buffer)) return new Buffer(subject, encoding, noZero);

        var type = typeof subject === "undefined" ? "undefined" : _typeof(subject);

        // Workaround: node's base64 implementation allows for non-padded strings
        // while base64-js does not.
        if (encoding === 'base64' && type === 'string') {
          subject = stringtrim(subject);
          while (subject.length % 4 !== 0) {
            subject = subject + '=';
          }
        }

        // Find the length
        var length;
        if (type === 'number') length = coerce(subject);else if (type === 'string') length = Buffer.byteLength(subject, encoding);else if (type === 'object') length = coerce(subject.length); // assume that object is array-like
        else throw new Error('First argument needs to be a number, array or string.');

        var buf;
        if (Buffer._useTypedArrays) {
          // Preferred: Return an augmented `Uint8Array` instance for best performance
          buf = Buffer._augment(new Uint8Array(length));
        } else {
          // Fallback: Return THIS instance of Buffer (created by `new`)
          buf = this;
          buf.length = length;
          buf._isBuffer = true;
        }

        var i;
        if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
          // Speed optimization -- use set if we're copying from a typed array
          buf._set(subject);
        } else if (isArrayish(subject)) {
          // Treat array-ish objects as a byte array
          for (i = 0; i < length; i++) {
            if (Buffer.isBuffer(subject)) buf[i] = subject.readUInt8(i);else buf[i] = subject[i];
          }
        } else if (type === 'string') {
          buf.write(subject, 0, encoding);
        } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
          for (i = 0; i < length; i++) {
            buf[i] = 0;
          }
        }

        return buf;
      }

      // STATIC METHODS
      // ==============

      Buffer.isEncoding = function (encoding) {
        switch (String(encoding).toLowerCase()) {
          case 'hex':
          case 'utf8':
          case 'utf-8':
          case 'ascii':
          case 'binary':
          case 'base64':
          case 'raw':
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return true;
          default:
            return false;
        }
      };

      Buffer.isBuffer = function (b) {
        return !!(b !== null && b !== undefined && b._isBuffer);
      };

      Buffer.byteLength = function (str, encoding) {
        var ret;
        str = str + '';
        switch (encoding || 'utf8') {
          case 'hex':
            ret = str.length / 2;
            break;
          case 'utf8':
          case 'utf-8':
            ret = utf8ToBytes(str).length;
            break;
          case 'ascii':
          case 'binary':
          case 'raw':
            ret = str.length;
            break;
          case 'base64':
            ret = base64ToBytes(str).length;
            break;
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            ret = str.length * 2;
            break;
          default:
            throw new Error('Unknown encoding');
        }
        return ret;
      };

      Buffer.concat = function (list, totalLength) {
        assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' + 'list should be an Array.');

        if (list.length === 0) {
          return new Buffer(0);
        } else if (list.length === 1) {
          return list[0];
        }

        var i;
        if (typeof totalLength !== 'number') {
          totalLength = 0;
          for (i = 0; i < list.length; i++) {
            totalLength += list[i].length;
          }
        }

        var buf = new Buffer(totalLength);
        var pos = 0;
        for (i = 0; i < list.length; i++) {
          var item = list[i];
          item.copy(buf, pos);
          pos += item.length;
        }
        return buf;
      };

      // BUFFER INSTANCE METHODS
      // =======================

      function _hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0;
        var remaining = buf.length - offset;
        if (!length) {
          length = remaining;
        } else {
          length = Number(length);
          if (length > remaining) {
            length = remaining;
          }
        }

        // must be an even number of digits
        var strLen = string.length;
        assert(strLen % 2 === 0, 'Invalid hex string');

        if (length > strLen / 2) {
          length = strLen / 2;
        }
        for (var i = 0; i < length; i++) {
          var byte = parseInt(string.substr(i * 2, 2), 16);
          assert(!isNaN(byte), 'Invalid hex string');
          buf[offset + i] = byte;
        }
        Buffer._charsWritten = i * 2;
        return i;
      }

      function _utf8Write(buf, string, offset, length) {
        var charsWritten = Buffer._charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length);
        return charsWritten;
      }

      function _asciiWrite(buf, string, offset, length) {
        var charsWritten = Buffer._charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length);
        return charsWritten;
      }

      function _binaryWrite(buf, string, offset, length) {
        return _asciiWrite(buf, string, offset, length);
      }

      function _base64Write(buf, string, offset, length) {
        var charsWritten = Buffer._charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length);
        return charsWritten;
      }

      function _utf16leWrite(buf, string, offset, length) {
        var charsWritten = Buffer._charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length);
        return charsWritten;
      }

      Buffer.prototype.write = function (string, offset, length, encoding) {
        // Support both (string, offset, length, encoding)
        // and the legacy (string, encoding, offset, length)
        if (isFinite(offset)) {
          if (!isFinite(length)) {
            encoding = length;
            length = undefined;
          }
        } else {
          // legacy
          var swap = encoding;
          encoding = offset;
          offset = length;
          length = swap;
        }

        offset = Number(offset) || 0;
        var remaining = this.length - offset;
        if (!length) {
          length = remaining;
        } else {
          length = Number(length);
          if (length > remaining) {
            length = remaining;
          }
        }
        encoding = String(encoding || 'utf8').toLowerCase();

        var ret;
        switch (encoding) {
          case 'hex':
            ret = _hexWrite(this, string, offset, length);
            break;
          case 'utf8':
          case 'utf-8':
            ret = _utf8Write(this, string, offset, length);
            break;
          case 'ascii':
            ret = _asciiWrite(this, string, offset, length);
            break;
          case 'binary':
            ret = _binaryWrite(this, string, offset, length);
            break;
          case 'base64':
            ret = _base64Write(this, string, offset, length);
            break;
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            ret = _utf16leWrite(this, string, offset, length);
            break;
          default:
            throw new Error('Unknown encoding');
        }
        return ret;
      };

      Buffer.prototype.toString = function (encoding, start, end) {
        var self = this;

        encoding = String(encoding || 'utf8').toLowerCase();
        start = Number(start) || 0;
        end = end !== undefined ? Number(end) : end = self.length;

        // Fastpath empty strings
        if (end === start) return '';

        var ret;
        switch (encoding) {
          case 'hex':
            ret = _hexSlice(self, start, end);
            break;
          case 'utf8':
          case 'utf-8':
            ret = _utf8Slice(self, start, end);
            break;
          case 'ascii':
            ret = _asciiSlice(self, start, end);
            break;
          case 'binary':
            ret = _binarySlice(self, start, end);
            break;
          case 'base64':
            ret = _base64Slice(self, start, end);
            break;
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            ret = _utf16leSlice(self, start, end);
            break;
          default:
            throw new Error('Unknown encoding');
        }
        return ret;
      };

      Buffer.prototype.toJSON = function () {
        return {
          type: 'Buffer',
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };

      // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
      Buffer.prototype.copy = function (target, target_start, start, end) {
        var source = this;

        if (!start) start = 0;
        if (!end && end !== 0) end = this.length;
        if (!target_start) target_start = 0;

        // Copy 0 bytes; we're done
        if (end === start) return;
        if (target.length === 0 || source.length === 0) return;

        // Fatal error conditions
        assert(end >= start, 'sourceEnd < sourceStart');
        assert(target_start >= 0 && target_start < target.length, 'targetStart out of bounds');
        assert(start >= 0 && start < source.length, 'sourceStart out of bounds');
        assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds');

        // Are we oob?
        if (end > this.length) end = this.length;
        if (target.length - target_start < end - start) end = target.length - target_start + start;

        var len = end - start;

        if (len < 100 || !Buffer._useTypedArrays) {
          for (var i = 0; i < len; i++) {
            target[i + target_start] = this[i + start];
          }
        } else {
          target._set(this.subarray(start, start + len), target_start);
        }
      };

      function _base64Slice(buf, start, end) {
        if (start === 0 && end === buf.length) {
          return base64.fromByteArray(buf);
        } else {
          return base64.fromByteArray(buf.slice(start, end));
        }
      }

      function _utf8Slice(buf, start, end) {
        var res = '';
        var tmp = '';
        end = Math.min(buf.length, end);

        for (var i = start; i < end; i++) {
          if (buf[i] <= 0x7F) {
            res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i]);
            tmp = '';
          } else {
            tmp += '%' + buf[i].toString(16);
          }
        }

        return res + decodeUtf8Char(tmp);
      }

      function _asciiSlice(buf, start, end) {
        var ret = '';
        end = Math.min(buf.length, end);

        for (var i = start; i < end; i++) {
          ret += String.fromCharCode(buf[i]);
        }return ret;
      }

      function _binarySlice(buf, start, end) {
        return _asciiSlice(buf, start, end);
      }

      function _hexSlice(buf, start, end) {
        var len = buf.length;

        if (!start || start < 0) start = 0;
        if (!end || end < 0 || end > len) end = len;

        var out = '';
        for (var i = start; i < end; i++) {
          out += toHex(buf[i]);
        }
        return out;
      }

      function _utf16leSlice(buf, start, end) {
        var bytes = buf.slice(start, end);
        var res = '';
        for (var i = 0; i < bytes.length; i += 2) {
          res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
        }
        return res;
      }

      Buffer.prototype.slice = function (start, end) {
        var len = this.length;
        start = clamp(start, len, 0);
        end = clamp(end, len, len);

        if (Buffer._useTypedArrays) {
          return Buffer._augment(this.subarray(start, end));
        } else {
          var sliceLen = end - start;
          var newBuf = new Buffer(sliceLen, undefined, true);
          for (var i = 0; i < sliceLen; i++) {
            newBuf[i] = this[i + start];
          }
          return newBuf;
        }
      };

      // `get` will be removed in Node 0.13+
      Buffer.prototype.get = function (offset) {
        console.log('.get() is deprecated. Access using array indexes instead.');
        return this.readUInt8(offset);
      };

      // `set` will be removed in Node 0.13+
      Buffer.prototype.set = function (v, offset) {
        console.log('.set() is deprecated. Access using array indexes instead.');
        return this.writeUInt8(v, offset);
      };

      Buffer.prototype.readUInt8 = function (offset, noAssert) {
        if (!noAssert) {
          assert(offset !== undefined && offset !== null, 'missing offset');
          assert(offset < this.length, 'Trying to read beyond buffer length');
        }

        if (offset >= this.length) return;

        return this[offset];
      };

      function _readUInt16(buf, offset, littleEndian, noAssert) {
        if (!noAssert) {
          assert(typeof littleEndian === 'boolean', 'missing or invalid endian');
          assert(offset !== undefined && offset !== null, 'missing offset');
          assert(offset + 1 < buf.length, 'Trying to read beyond buffer length');
        }

        var len = buf.length;
        if (offset >= len) return;

        var val;
        if (littleEndian) {
          val = buf[offset];
          if (offset + 1 < len) val |= buf[offset + 1] << 8;
        } else {
          val = buf[offset] << 8;
          if (offset + 1 < len) val |= buf[offset + 1];
        }
        return val;
      }

      Buffer.prototype.readUInt16LE = function (offset, noAssert) {
        return _readUInt16(this, offset, true, noAssert);
      };

      Buffer.prototype.readUInt16BE = function (offset, noAssert) {
        return _readUInt16(this, offset, false, noAssert);
      };

      function _readUInt32(buf, offset, littleEndian, noAssert) {
        if (!noAssert) {
          assert(typeof littleEndian === 'boolean', 'missing or invalid endian');
          assert(offset !== undefined && offset !== null, 'missing offset');
          assert(offset + 3 < buf.length, 'Trying to read beyond buffer length');
        }

        var len = buf.length;
        if (offset >= len) return;

        var val;
        if (littleEndian) {
          if (offset + 2 < len) val = buf[offset + 2] << 16;
          if (offset + 1 < len) val |= buf[offset + 1] << 8;
          val |= buf[offset];
          if (offset + 3 < len) val = val + (buf[offset + 3] << 24 >>> 0);
        } else {
          if (offset + 1 < len) val = buf[offset + 1] << 16;
          if (offset + 2 < len) val |= buf[offset + 2] << 8;
          if (offset + 3 < len) val |= buf[offset + 3];
          val = val + (buf[offset] << 24 >>> 0);
        }
        return val;
      }

      Buffer.prototype.readUInt32LE = function (offset, noAssert) {
        return _readUInt32(this, offset, true, noAssert);
      };

      Buffer.prototype.readUInt32BE = function (offset, noAssert) {
        return _readUInt32(this, offset, false, noAssert);
      };

      Buffer.prototype.readInt8 = function (offset, noAssert) {
        if (!noAssert) {
          assert(offset !== undefined && offset !== null, 'missing offset');
          assert(offset < this.length, 'Trying to read beyond buffer length');
        }

        if (offset >= this.length) return;

        var neg = this[offset] & 0x80;
        if (neg) return (0xff - this[offset] + 1) * -1;else return this[offset];
      };

      function _readInt16(buf, offset, littleEndian, noAssert) {
        if (!noAssert) {
          assert(typeof littleEndian === 'boolean', 'missing or invalid endian');
          assert(offset !== undefined && offset !== null, 'missing offset');
          assert(offset + 1 < buf.length, 'Trying to read beyond buffer length');
        }

        var len = buf.length;
        if (offset >= len) return;

        var val = _readUInt16(buf, offset, littleEndian, true);
        var neg = val & 0x8000;
        if (neg) return (0xffff - val + 1) * -1;else return val;
      }

      Buffer.prototype.readInt16LE = function (offset, noAssert) {
        return _readInt16(this, offset, true, noAssert);
      };

      Buffer.prototype.readInt16BE = function (offset, noAssert) {
        return _readInt16(this, offset, false, noAssert);
      };

      function _readInt32(buf, offset, littleEndian, noAssert) {
        if (!noAssert) {
          assert(typeof littleEndian === 'boolean', 'missing or invalid endian');
          assert(offset !== undefined && offset !== null, 'missing offset');
          assert(offset + 3 < buf.length, 'Trying to read beyond buffer length');
        }

        var len = buf.length;
        if (offset >= len) return;

        var val = _readUInt32(buf, offset, littleEndian, true);
        var neg = val & 0x80000000;
        if (neg) return (0xffffffff - val + 1) * -1;else return val;
      }

      Buffer.prototype.readInt32LE = function (offset, noAssert) {
        return _readInt32(this, offset, true, noAssert);
      };

      Buffer.prototype.readInt32BE = function (offset, noAssert) {
        return _readInt32(this, offset, false, noAssert);
      };

      function _readFloat(buf, offset, littleEndian, noAssert) {
        if (!noAssert) {
          assert(typeof littleEndian === 'boolean', 'missing or invalid endian');
          assert(offset + 3 < buf.length, 'Trying to read beyond buffer length');
        }

        return ieee754.read(buf, offset, littleEndian, 23, 4);
      }

      Buffer.prototype.readFloatLE = function (offset, noAssert) {
        return _readFloat(this, offset, true, noAssert);
      };

      Buffer.prototype.readFloatBE = function (offset, noAssert) {
        return _readFloat(this, offset, false, noAssert);
      };

      function _readDouble(buf, offset, littleEndian, noAssert) {
        if (!noAssert) {
          assert(typeof littleEndian === 'boolean', 'missing or invalid endian');
          assert(offset + 7 < buf.length, 'Trying to read beyond buffer length');
        }

        return ieee754.read(buf, offset, littleEndian, 52, 8);
      }

      Buffer.prototype.readDoubleLE = function (offset, noAssert) {
        return _readDouble(this, offset, true, noAssert);
      };

      Buffer.prototype.readDoubleBE = function (offset, noAssert) {
        return _readDouble(this, offset, false, noAssert);
      };

      Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
        if (!noAssert) {
          assert(value !== undefined && value !== null, 'missing value');
          assert(offset !== undefined && offset !== null, 'missing offset');
          assert(offset < this.length, 'trying to write beyond buffer length');
          verifuint(value, 0xff);
        }

        if (offset >= this.length) return;

        this[offset] = value;
      };

      function _writeUInt16(buf, value, offset, littleEndian, noAssert) {
        if (!noAssert) {
          assert(value !== undefined && value !== null, 'missing value');
          assert(typeof littleEndian === 'boolean', 'missing or invalid endian');
          assert(offset !== undefined && offset !== null, 'missing offset');
          assert(offset + 1 < buf.length, 'trying to write beyond buffer length');
          verifuint(value, 0xffff);
        }

        var len = buf.length;
        if (offset >= len) return;

        for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
          buf[offset + i] = (value & 0xff << 8 * (littleEndian ? i : 1 - i)) >>> (littleEndian ? i : 1 - i) * 8;
        }
      }

      Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
        _writeUInt16(this, value, offset, true, noAssert);
      };

      Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
        _writeUInt16(this, value, offset, false, noAssert);
      };

      function _writeUInt32(buf, value, offset, littleEndian, noAssert) {
        if (!noAssert) {
          assert(value !== undefined && value !== null, 'missing value');
          assert(typeof littleEndian === 'boolean', 'missing or invalid endian');
          assert(offset !== undefined && offset !== null, 'missing offset');
          assert(offset + 3 < buf.length, 'trying to write beyond buffer length');
          verifuint(value, 0xffffffff);
        }

        var len = buf.length;
        if (offset >= len) return;

        for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
          buf[offset + i] = value >>> (littleEndian ? i : 3 - i) * 8 & 0xff;
        }
      }

      Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
        _writeUInt32(this, value, offset, true, noAssert);
      };

      Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
        _writeUInt32(this, value, offset, false, noAssert);
      };

      Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
        if (!noAssert) {
          assert(value !== undefined && value !== null, 'missing value');
          assert(offset !== undefined && offset !== null, 'missing offset');
          assert(offset < this.length, 'Trying to write beyond buffer length');
          verifsint(value, 0x7f, -0x80);
        }

        if (offset >= this.length) return;

        if (value >= 0) this.writeUInt8(value, offset, noAssert);else this.writeUInt8(0xff + value + 1, offset, noAssert);
      };

      function _writeInt16(buf, value, offset, littleEndian, noAssert) {
        if (!noAssert) {
          assert(value !== undefined && value !== null, 'missing value');
          assert(typeof littleEndian === 'boolean', 'missing or invalid endian');
          assert(offset !== undefined && offset !== null, 'missing offset');
          assert(offset + 1 < buf.length, 'Trying to write beyond buffer length');
          verifsint(value, 0x7fff, -0x8000);
        }

        var len = buf.length;
        if (offset >= len) return;

        if (value >= 0) _writeUInt16(buf, value, offset, littleEndian, noAssert);else _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert);
      }

      Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
        _writeInt16(this, value, offset, true, noAssert);
      };

      Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
        _writeInt16(this, value, offset, false, noAssert);
      };

      function _writeInt32(buf, value, offset, littleEndian, noAssert) {
        if (!noAssert) {
          assert(value !== undefined && value !== null, 'missing value');
          assert(typeof littleEndian === 'boolean', 'missing or invalid endian');
          assert(offset !== undefined && offset !== null, 'missing offset');
          assert(offset + 3 < buf.length, 'Trying to write beyond buffer length');
          verifsint(value, 0x7fffffff, -0x80000000);
        }

        var len = buf.length;
        if (offset >= len) return;

        if (value >= 0) _writeUInt32(buf, value, offset, littleEndian, noAssert);else _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert);
      }

      Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
        _writeInt32(this, value, offset, true, noAssert);
      };

      Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
        _writeInt32(this, value, offset, false, noAssert);
      };

      function _writeFloat(buf, value, offset, littleEndian, noAssert) {
        if (!noAssert) {
          assert(value !== undefined && value !== null, 'missing value');
          assert(typeof littleEndian === 'boolean', 'missing or invalid endian');
          assert(offset !== undefined && offset !== null, 'missing offset');
          assert(offset + 3 < buf.length, 'Trying to write beyond buffer length');
          verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
        }

        var len = buf.length;
        if (offset >= len) return;

        ieee754.write(buf, value, offset, littleEndian, 23, 4);
      }

      Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
        _writeFloat(this, value, offset, true, noAssert);
      };

      Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
        _writeFloat(this, value, offset, false, noAssert);
      };

      function _writeDouble(buf, value, offset, littleEndian, noAssert) {
        if (!noAssert) {
          assert(value !== undefined && value !== null, 'missing value');
          assert(typeof littleEndian === 'boolean', 'missing or invalid endian');
          assert(offset !== undefined && offset !== null, 'missing offset');
          assert(offset + 7 < buf.length, 'Trying to write beyond buffer length');
          verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
        }

        var len = buf.length;
        if (offset >= len) return;

        ieee754.write(buf, value, offset, littleEndian, 52, 8);
      }

      Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
        _writeDouble(this, value, offset, true, noAssert);
      };

      Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
        _writeDouble(this, value, offset, false, noAssert);
      };

      // fill(value, start=0, end=buffer.length)
      Buffer.prototype.fill = function (value, start, end) {
        if (!value) value = 0;
        if (!start) start = 0;
        if (!end) end = this.length;

        if (typeof value === 'string') {
          value = value.charCodeAt(0);
        }

        assert(typeof value === 'number' && !isNaN(value), 'value is not a number');
        assert(end >= start, 'end < start');

        // Fill 0 bytes; we're done
        if (end === start) return;
        if (this.length === 0) return;

        assert(start >= 0 && start < this.length, 'start out of bounds');
        assert(end >= 0 && end <= this.length, 'end out of bounds');

        for (var i = start; i < end; i++) {
          this[i] = value;
        }
      };

      Buffer.prototype.inspect = function () {
        var out = [];
        var len = this.length;
        for (var i = 0; i < len; i++) {
          out[i] = toHex(this[i]);
          if (i === exports.INSPECT_MAX_BYTES) {
            out[i + 1] = '...';
            break;
          }
        }
        return '<Buffer ' + out.join(' ') + '>';
      };

      /**
       * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
       * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
       */
      Buffer.prototype.toArrayBuffer = function () {
        if (typeof Uint8Array !== 'undefined') {
          if (Buffer._useTypedArrays) {
            return new Buffer(this).buffer;
          } else {
            var buf = new Uint8Array(this.length);
            for (var i = 0, len = buf.length; i < len; i += 1) {
              buf[i] = this[i];
            }return buf.buffer;
          }
        } else {
          throw new Error('Buffer.toArrayBuffer not supported in this browser');
        }
      };

      // HELPER FUNCTIONS
      // ================

      function stringtrim(str) {
        if (str.trim) return str.trim();
        return str.replace(/^\s+|\s+$/g, '');
      }

      var BP = Buffer.prototype;

      /**
       * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
       */
      Buffer._augment = function (arr) {
        arr._isBuffer = true;

        // save reference to original Uint8Array get/set methods before overwriting
        arr._get = arr.get;
        arr._set = arr.set;

        // deprecated, will be removed in node 0.13+
        arr.get = BP.get;
        arr.set = BP.set;

        arr.write = BP.write;
        arr.toString = BP.toString;
        arr.toLocaleString = BP.toString;
        arr.toJSON = BP.toJSON;
        arr.copy = BP.copy;
        arr.slice = BP.slice;
        arr.readUInt8 = BP.readUInt8;
        arr.readUInt16LE = BP.readUInt16LE;
        arr.readUInt16BE = BP.readUInt16BE;
        arr.readUInt32LE = BP.readUInt32LE;
        arr.readUInt32BE = BP.readUInt32BE;
        arr.readInt8 = BP.readInt8;
        arr.readInt16LE = BP.readInt16LE;
        arr.readInt16BE = BP.readInt16BE;
        arr.readInt32LE = BP.readInt32LE;
        arr.readInt32BE = BP.readInt32BE;
        arr.readFloatLE = BP.readFloatLE;
        arr.readFloatBE = BP.readFloatBE;
        arr.readDoubleLE = BP.readDoubleLE;
        arr.readDoubleBE = BP.readDoubleBE;
        arr.writeUInt8 = BP.writeUInt8;
        arr.writeUInt16LE = BP.writeUInt16LE;
        arr.writeUInt16BE = BP.writeUInt16BE;
        arr.writeUInt32LE = BP.writeUInt32LE;
        arr.writeUInt32BE = BP.writeUInt32BE;
        arr.writeInt8 = BP.writeInt8;
        arr.writeInt16LE = BP.writeInt16LE;
        arr.writeInt16BE = BP.writeInt16BE;
        arr.writeInt32LE = BP.writeInt32LE;
        arr.writeInt32BE = BP.writeInt32BE;
        arr.writeFloatLE = BP.writeFloatLE;
        arr.writeFloatBE = BP.writeFloatBE;
        arr.writeDoubleLE = BP.writeDoubleLE;
        arr.writeDoubleBE = BP.writeDoubleBE;
        arr.fill = BP.fill;
        arr.inspect = BP.inspect;
        arr.toArrayBuffer = BP.toArrayBuffer;

        return arr;
      };

      // slice(start, end)
      function clamp(index, len, defaultValue) {
        if (typeof index !== 'number') return defaultValue;
        index = ~~index; // Coerce to integer.
        if (index >= len) return len;
        if (index >= 0) return index;
        index += len;
        if (index >= 0) return index;
        return 0;
      }

      function coerce(length) {
        // Coerce length to a number (possibly NaN), round up
        // in case it's fractional (e.g. 123.456) then do a
        // double negate to coerce a NaN to 0. Easy, right?
        length = ~~Math.ceil(+length);
        return length < 0 ? 0 : length;
      }

      function isArray(subject) {
        return (Array.isArray || function (subject) {
          return Object.prototype.toString.call(subject) === '[object Array]';
        })(subject);
      }

      function isArrayish(subject) {
        return isArray(subject) || Buffer.isBuffer(subject) || subject && (typeof subject === "undefined" ? "undefined" : _typeof(subject)) === 'object' && typeof subject.length === 'number';
      }

      function toHex(n) {
        if (n < 16) return '0' + n.toString(16);
        return n.toString(16);
      }

      function utf8ToBytes(str) {
        var byteArray = [];
        for (var i = 0; i < str.length; i++) {
          var b = str.charCodeAt(i);
          if (b <= 0x7F) byteArray.push(str.charCodeAt(i));else {
            var start = i;
            if (b >= 0xD800 && b <= 0xDFFF) i++;
            var h = encodeURIComponent(str.slice(start, i + 1)).substr(1).split('%');
            for (var j = 0; j < h.length; j++) {
              byteArray.push(parseInt(h[j], 16));
            }
          }
        }
        return byteArray;
      }

      function asciiToBytes(str) {
        var byteArray = [];
        for (var i = 0; i < str.length; i++) {
          // Node's code seems to be doing this and not & 0x7F..
          byteArray.push(str.charCodeAt(i) & 0xFF);
        }
        return byteArray;
      }

      function utf16leToBytes(str) {
        var c, hi, lo;
        var byteArray = [];
        for (var i = 0; i < str.length; i++) {
          c = str.charCodeAt(i);
          hi = c >> 8;
          lo = c % 256;
          byteArray.push(lo);
          byteArray.push(hi);
        }

        return byteArray;
      }

      function base64ToBytes(str) {
        return base64.toByteArray(str);
      }

      function blitBuffer(src, dst, offset, length) {
        var pos;
        for (var i = 0; i < length; i++) {
          if (i + offset >= dst.length || i >= src.length) break;
          dst[i + offset] = src[i];
        }
        return i;
      }

      function decodeUtf8Char(str) {
        try {
          return decodeURIComponent(str);
        } catch (err) {
          return String.fromCharCode(0xFFFD); // UTF 8 invalid char
        }
      }

      /*
       * We have to make sure that the value is a valid integer. This means that it
       * is non-negative. It has no fractional component and that it does not
       * exceed the maximum allowed value.
       */
      function verifuint(value, max) {
        assert(typeof value === 'number', 'cannot write a non-number as a number');
        assert(value >= 0, 'specified a negative value for writing an unsigned value');
        assert(value <= max, 'value is larger than maximum value for type');
        assert(Math.floor(value) === value, 'value has a fractional component');
      }

      function verifsint(value, max, min) {
        assert(typeof value === 'number', 'cannot write a non-number as a number');
        assert(value <= max, 'value larger than maximum allowed value');
        assert(value >= min, 'value smaller than minimum allowed value');
        assert(Math.floor(value) === value, 'value has a fractional component');
      }

      function verifIEEE754(value, max, min) {
        assert(typeof value === 'number', 'cannot write a non-number as a number');
        assert(value <= max, 'value larger than maximum allowed value');
        assert(value >= min, 'value smaller than minimum allowed value');
      }

      function assert(test, message) {
        if (!test) throw new Error(message || 'Failed assertion');
      }
    }).call(this, require("1YiZ5S"), typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}, require("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/index.js", "/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer");
  }, { "1YiZ5S": 4, "base64-js": 2, "buffer": 1, "ieee754": 3 }], 2: [function (require, module, exports) {
    (function (process, global, Buffer, __argument0, __argument1, __argument2, __argument3, __filename, __dirname) {
      var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

      ;(function (exports) {
        'use strict';

        var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

        var PLUS = '+'.charCodeAt(0);
        var SLASH = '/'.charCodeAt(0);
        var NUMBER = '0'.charCodeAt(0);
        var LOWER = 'a'.charCodeAt(0);
        var UPPER = 'A'.charCodeAt(0);
        var PLUS_URL_SAFE = '-'.charCodeAt(0);
        var SLASH_URL_SAFE = '_'.charCodeAt(0);

        function decode(elt) {
          var code = elt.charCodeAt(0);
          if (code === PLUS || code === PLUS_URL_SAFE) return 62; // '+'
          if (code === SLASH || code === SLASH_URL_SAFE) return 63; // '/'
          if (code < NUMBER) return -1; //no match
          if (code < NUMBER + 10) return code - NUMBER + 26 + 26;
          if (code < UPPER + 26) return code - UPPER;
          if (code < LOWER + 26) return code - LOWER + 26;
        }

        function b64ToByteArray(b64) {
          var i, j, l, tmp, placeHolders, arr;

          if (b64.length % 4 > 0) {
            throw new Error('Invalid string. Length must be a multiple of 4');
          }

          // the number of equal signs (place holders)
          // if there are two placeholders, than the two characters before it
          // represent one byte
          // if there is only one, then the three characters before it represent 2 bytes
          // this is just a cheap hack to not do indexOf twice
          var len = b64.length;
          placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0;

          // base64 is 4/3 + up to two characters of the original data
          arr = new Arr(b64.length * 3 / 4 - placeHolders);

          // if there are placeholders, only get up to the last complete 4 chars
          l = placeHolders > 0 ? b64.length - 4 : b64.length;

          var L = 0;

          function push(v) {
            arr[L++] = v;
          }

          for (i = 0, j = 0; i < l; i += 4, j += 3) {
            tmp = decode(b64.charAt(i)) << 18 | decode(b64.charAt(i + 1)) << 12 | decode(b64.charAt(i + 2)) << 6 | decode(b64.charAt(i + 3));
            push((tmp & 0xFF0000) >> 16);
            push((tmp & 0xFF00) >> 8);
            push(tmp & 0xFF);
          }

          if (placeHolders === 2) {
            tmp = decode(b64.charAt(i)) << 2 | decode(b64.charAt(i + 1)) >> 4;
            push(tmp & 0xFF);
          } else if (placeHolders === 1) {
            tmp = decode(b64.charAt(i)) << 10 | decode(b64.charAt(i + 1)) << 4 | decode(b64.charAt(i + 2)) >> 2;
            push(tmp >> 8 & 0xFF);
            push(tmp & 0xFF);
          }

          return arr;
        }

        function uint8ToBase64(uint8) {
          var i,
              extraBytes = uint8.length % 3,
              // if we have 1 byte left, pad 2 bytes
          output = "",
              temp,
              length;

          function encode(num) {
            return lookup.charAt(num);
          }

          function tripletToBase64(num) {
            return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F);
          }

          // go through the array every three bytes, we'll deal with trailing stuff later
          for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
            temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
            output += tripletToBase64(temp);
          }

          // pad the end with zeros, but make sure to not forget the extra bytes
          switch (extraBytes) {
            case 1:
              temp = uint8[uint8.length - 1];
              output += encode(temp >> 2);
              output += encode(temp << 4 & 0x3F);
              output += '==';
              break;
            case 2:
              temp = (uint8[uint8.length - 2] << 8) + uint8[uint8.length - 1];
              output += encode(temp >> 10);
              output += encode(temp >> 4 & 0x3F);
              output += encode(temp << 2 & 0x3F);
              output += '=';
              break;
          }

          return output;
        }

        exports.toByteArray = b64ToByteArray;
        exports.fromByteArray = uint8ToBase64;
      })(typeof exports === 'undefined' ? this.base64js = {} : exports);
    }).call(this, require("1YiZ5S"), typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}, require("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib/b64.js", "/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/base64-js/lib");
  }, { "1YiZ5S": 4, "buffer": 1 }], 3: [function (require, module, exports) {
    (function (process, global, Buffer, __argument0, __argument1, __argument2, __argument3, __filename, __dirname) {
      exports.read = function (buffer, offset, isLE, mLen, nBytes) {
        var e, m;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var nBits = -7;
        var i = isLE ? nBytes - 1 : 0;
        var d = isLE ? -1 : 1;
        var s = buffer[offset + i];

        i += d;

        e = s & (1 << -nBits) - 1;
        s >>= -nBits;
        nBits += eLen;
        for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

        m = e & (1 << -nBits) - 1;
        e >>= -nBits;
        nBits += mLen;
        for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

        if (e === 0) {
          e = 1 - eBias;
        } else if (e === eMax) {
          return m ? NaN : (s ? -1 : 1) * Infinity;
        } else {
          m = m + Math.pow(2, mLen);
          e = e - eBias;
        }
        return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
      };

      exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
        var e, m, c;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
        var i = isLE ? 0 : nBytes - 1;
        var d = isLE ? 1 : -1;
        var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;

        value = Math.abs(value);

        if (isNaN(value) || value === Infinity) {
          m = isNaN(value) ? 1 : 0;
          e = eMax;
        } else {
          e = Math.floor(Math.log(value) / Math.LN2);
          if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
          }
          if (e + eBias >= 1) {
            value += rt / c;
          } else {
            value += rt * Math.pow(2, 1 - eBias);
          }
          if (value * c >= 2) {
            e++;
            c /= 2;
          }

          if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
          } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
          } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
          }
        }

        for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

        e = e << mLen | m;
        eLen += mLen;
        for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

        buffer[offset + i - d] |= s * 128;
      };
    }).call(this, require("1YiZ5S"), typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}, require("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/ieee754/index.js", "/../node_modules/gulp-browserify/node_modules/browserify/node_modules/buffer/node_modules/ieee754");
  }, { "1YiZ5S": 4, "buffer": 1 }], 4: [function (require, module, exports) {
    (function (process, global, Buffer, __argument0, __argument1, __argument2, __argument3, __filename, __dirname) {
      // shim for using process in browser

      var process = module.exports = {};

      process.nextTick = function () {
        var canSetImmediate = typeof window !== 'undefined' && window.setImmediate;
        var canPost = typeof window !== 'undefined' && window.postMessage && window.addEventListener;

        if (canSetImmediate) {
          return function (f) {
            return window.setImmediate(f);
          };
        }

        if (canPost) {
          var queue = [];
          window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
              ev.stopPropagation();
              if (queue.length > 0) {
                var fn = queue.shift();
                fn();
              }
            }
          }, true);

          return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
          };
        }

        return function nextTick(fn) {
          setTimeout(fn, 0);
        };
      }();

      process.title = 'browser';
      process.browser = true;
      process.env = {};
      process.argv = [];

      function noop() {}

      process.on = noop;
      process.addListener = noop;
      process.once = noop;
      process.off = noop;
      process.removeListener = noop;
      process.removeAllListeners = noop;
      process.emit = noop;

      process.binding = function (name) {
        throw new Error('process.binding is not supported');
      };

      // TODO(shtylman)
      process.cwd = function () {
        return '/';
      };
      process.chdir = function (dir) {
        throw new Error('process.chdir is not supported');
      };
    }).call(this, require("1YiZ5S"), typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}, require("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/../node_modules/gulp-browserify/node_modules/browserify/node_modules/process/browser.js", "/../node_modules/gulp-browserify/node_modules/browserify/node_modules/process");
  }, { "1YiZ5S": 4, "buffer": 1 }], 5: [function (require, module, exports) {
    (function (process, global, Buffer, __argument0, __argument1, __argument2, __argument3, __filename, __dirname) {
      var TwitchService = require('../services/twitch');
      var Component = require('../libs/component');

      var ResultsComponent = function (_Component) {
        _inherits(ResultsComponent, _Component);

        function ResultsComponent(rootSelector) {
          _classCallCheck(this, ResultsComponent);

          var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ResultsComponent).call(this, rootSelector));

          _this.resultsPerPage = 10;

          _this.loading = _this.el.querySelector('.loading');
          _this.resultCount = _this.el.querySelector('.result-count span');
          _this.pagination = _this.el.querySelector('.pagination');
          _this.currentPage = _this.pagination.querySelector('span.current');
          _this.totalPages = _this.pagination.querySelector('span.total');
          _this.prevPageNav = _this.pagination.querySelector('.prev');
          _this.nextPageNav = _this.pagination.querySelector('.next');
          _this.resultList = _this.el.querySelector('ul.result-list');

          // Add pagination handlers
          _this.prevPageNav.addEventListener('click', function () {
            _this.goToPage('prev');
          });
          _this.nextPageNav.addEventListener('click', function () {
            _this.goToPage('next');
          });

          // Hook into Twitch Service for data updates
          TwitchService.listen(_this.update.bind(_this));
          return _this;
        }

        _createClass(ResultsComponent, [{
          key: "update",
          value: function update(event) {
            switch (event.action) {
              case 'loading streams':
                this.el.hidden = true;
                this.loading.hidden = false;
                break;
              case 'get streams from query':
                var streams = event.data ? event.data.streams : [];
                this.results = streams;
                this.el.hidden = false;
                this.loading.hidden = true;

                // Update pagination
                this.resultCount.innerText = streams.length;
                this.currentPage.innerText = 1;
                this.totalPages.innerText = streams.length ? Math.ceil(streams.length / this.resultsPerPage) : 1;

                // Toggle pagination nav display
                var onlyOnePage = this.currentPage.innerText === this.totalPages.innerText;
                this.prevPageNav.hidden = onlyOnePage;
                this.nextPageNav.hidden = onlyOnePage;

                // Render results list
                var pageOneResults = streams.slice(0, this.resultsPerPage);
                this.renderList(pageOneResults);
                break;
            }
          }
        }, {
          key: "renderList",
          value: function renderList() {
            var results = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

            var html = '<li>No results found.</li>';
            if (results.length > 0) {
              html = '';
              results.forEach(function (result) {
                var background = "url(" + result.preview.medium + ") center center / cover no-repeat";
                html += "\n          <li>\n            <div class=\"image\" style=\"background: " + background + "\"></div>\n            <div class=\"info\">\n              <h1>" + result.channel.display_name + "</h1>\n              <h2>" + result.game + " - " + result.channel.views + " viewers</h2>\n              <p>" + result.channel.status + "</p>\n            </div>\n          </li>\n        ";
              });
            }
            this.resultList.innerHTML = html;
          }
        }, {
          key: "goToPage",
          value: function goToPage() {
            var direction = arguments.length <= 0 || arguments[0] === undefined ? 'next' : arguments[0];

            var currentPage = this.currentPage.innerText;
            var totalPages = this.totalPages.innerText;

            switch (direction) {
              case 'prev':
                if (parseInt(currentPage) === 1) currentPage = totalPages;else currentPage--;
                break;
              case 'next':
                if (currentPage === totalPages) currentPage = 1;else currentPage++;
                break;
              default:
            }

            // Update display
            this.currentPage.innerText = currentPage;

            // Render results list
            var fromIndex = --currentPage * this.resultsPerPage;
            var toIndex = fromIndex + this.resultsPerPage;
            var pageResults = this.results.slice(fromIndex, toIndex);
            this.renderList(pageResults);
          }
        }]);

        return ResultsComponent;
      }(Component);

      module.exports = ResultsComponent;
    }).call(this, require("1YiZ5S"), typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}, require("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/components/results.js", "/components");
  }, { "../libs/component": 8, "../services/twitch": 11, "1YiZ5S": 4, "buffer": 1 }], 6: [function (require, module, exports) {
    (function (process, global, Buffer, __argument0, __argument1, __argument2, __argument3, __filename, __dirname) {
      var TwitchService = require('../services/twitch');
      var Component = require('../libs/component');

      var SearchComponent = function (_Component2) {
        _inherits(SearchComponent, _Component2);

        function SearchComponent(rootSelector) {
          _classCallCheck(this, SearchComponent);

          var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(SearchComponent).call(this, rootSelector));

          _this2.query = _this2.el.querySelector('input[name="query"]');

          // Hook into Twitch Service for data updates
          TwitchService.listen(_this2.update.bind(_this2));

          // Add submit handler to form
          _this2.el.addEventListener('submit', _this2.submit);
          return _this2;
        }

        _createClass(SearchComponent, [{
          key: "submit",
          value: function submit(e) {
            e.preventDefault();
            TwitchService.getStreamsFromQuery(this.query.value.trim());
            this.query.blur();
          }
        }]);

        return SearchComponent;
      }(Component);

      module.exports = SearchComponent;
    }).call(this, require("1YiZ5S"), typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}, require("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/components/search.js", "/components");
  }, { "../libs/component": 8, "../services/twitch": 11, "1YiZ5S": 4, "buffer": 1 }], 7: [function (require, module, exports) {
    (function (process, global, Buffer, __argument0, __argument1, __argument2, __argument3, __filename, __dirname) {
      var ResultsComponent = require('./components/results');
      var SearchComponent = require('./components/search');
      // const TwitchService = require('./services/twitch')

      var App = function App() {
        _classCallCheck(this, App);

        this.results = new ResultsComponent('main .results');
        this.search = new SearchComponent('main .search');

        // Load initial data (will render results on callback)
        // TwitchService.getStreamsFromQuery('starcraft')
        // TwitchService.getStreamsFromQuery()
      };

      module.exports = window.App = new App();
    }).call(this, require("1YiZ5S"), typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}, require("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/fake_7fc3f510.js", "/");
  }, { "./components/results": 5, "./components/search": 6, "1YiZ5S": 4, "buffer": 1 }], 8: [function (require, module, exports) {
    (function (process, global, Buffer, __argument0, __argument1, __argument2, __argument3, __filename, __dirname) {
      var Component = function () {
        function Component(rootSelector) {
          _classCallCheck(this, Component);

          this.el = document.querySelector(rootSelector);
        }

        _createClass(Component, [{
          key: "update",
          value: function update() {}
        }, {
          key: "render",
          value: function render() {}
        }]);

        return Component;
      }();

      module.exports = Component;
    }).call(this, require("1YiZ5S"), typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}, require("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/libs/component.js", "/libs");
  }, { "1YiZ5S": 4, "buffer": 1 }], 9: [function (require, module, exports) {
    (function (process, global, Buffer, __argument0, __argument1, __argument2, __argument3, __filename, __dirname) {
      var Service = function () {
        function Service() {
          var actions = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

          _classCallCheck(this, Service);

          this.actions = actions;
          this.data = {};
          this.listeners = [];
          this.initActions();
        }

        _createClass(Service, [{
          key: "initActions",
          value: function initActions() {
            var _this3 = this;

            // Hook each action to an on<ActionName> callback
            // i.e. `getData` will fire `onGetData`
            this.actions.forEach(function (action) {
              _this3[action] = function (data) {
                var onAction = "on" + action[0].toUpperCase() + action.substr(1);
                if (_this3[onAction]) {
                  _this3[onAction](data);
                }
              };
            });
          }
        }, {
          key: "listen",
          value: function listen(listener) {
            if (typeof listener === 'function') {
              this.listeners.push(listener);
            }
          }
        }, {
          key: "trigger",
          value: function trigger(data) {
            this.listeners.forEach(function (listener) {
              listener(data);
            });
          }
        }, {
          key: "jsonp",
          value: function jsonp(url, callback) {
            var timeoutLimit = 10000; // timeout request after 5 seconds
            var isLoaded = false;

            // Create script with url and callback (if specified)
            var ref = window.document.getElementsByTagName('script')[0];
            var script = window.document.createElement('script');
            script.src = url + (url.indexOf('?') > -1 ? '&' : '?') + 'callback=next';
            window.next = callback;

            // Insert script tag into the DOM (append to <head>)
            ref.parentNode.insertBefore(script, ref);

            // After the script is loaded (and executed), remove it
            script.onload = function () {
              script.remove();
              isLoaded = true;
            };

            // If request times out...
            setTimeout(function () {
              if (!isLoaded) {
                console.warn('Request timed out.', url);
                script.remove();
                next();
              }
            }, timeoutLimit);
          }
        }]);

        return Service;
      }();

      module.exports = Service;
    }).call(this, require("1YiZ5S"), typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}, require("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/libs/service.js", "/libs");
  }, { "1YiZ5S": 4, "buffer": 1 }], 10: [function (require, module, exports) {
    (function (process, global, Buffer, __argument0, __argument1, __argument2, __argument3, __filename, __dirname) {
      module.exports = {
        "_total": 79,
        "_links": {
          "self": "https://api.twitch.tv/kraken/search/streams?limit=10&offset=0&q=starcraft",
          "next": "https://api.twitch.tv/kraken/search/streams?limit=10&offset=10&q=starcraft"
        },
        "streams": [{
          "_id": 22793040720,
          "game": "StarCraft: Brood War",
          "viewers": 44,
          "video_height": 720,
          "average_fps": 60.8571428571,
          "delay": 0,
          "created_at": "2016-08-12T16:55:25Z",
          "is_playlist": false,
          "preview": {
            "small": "/images/slack.jpg",
            "medium": "https://static-cdn.jtvnw.net/previews-ttv/live_user_skryoo1004-320x180.jpg",
            "large": "https://static-cdn.jtvnw.net/previews-ttv/live_user_skryoo1004-640x360.jpg",
            "template": "https://static-cdn.jtvnw.net/previews-ttv/live_user_skryoo1004-{width}x{height}.jpg"
          },
          "_links": {
            "self": "https://api.twitch.tv/kraken/streams/skryoo1004"
          },
          "channel": {
            "mature": false,
            "status": "StarCraft Scan 2v2 cash games",
            "broadcaster_language": "ko",
            "display_name": "skryoo1004",
            "game": "StarCraft: Brood War",
            "language": "en",
            "_id": 15580913,
            "name": "skryoo1004",
            "created_at": "2010-09-13T23:24:38Z",
            "updated_at": "2016-08-12T19:34:29Z",
            "delay": null,
            "logo": "https://static-cdn.jtvnw.net/jtv_user_pictures/skryoo1004-profile_image-91e1cf9d7d789391-300x300.jpeg",
            "banner": null,
            "video_banner": "https://static-cdn.jtvnw.net/jtv_user_pictures/skryoo1004-channel_offline_image-0dbae918147949be-1920x1080.jpeg",
            "background": null,
            "profile_banner": "https://static-cdn.jtvnw.net/jtv_user_pictures/skryoo1004-profile_banner-83a06d611944c2d0-480.jpeg",
            "profile_banner_background_color": null,
            "partner": true,
            "url": "https://www.twitch.tv/skryoo1004",
            "views": 2344380,
            "followers": 3300,
            "_links": {
              "self": "https://api.twitch.tv/kraken/channels/skryoo1004",
              "follows": "https://api.twitch.tv/kraken/channels/skryoo1004/follows",
              "commercial": "https://api.twitch.tv/kraken/channels/skryoo1004/commercial",
              "stream_key": "https://api.twitch.tv/kraken/channels/skryoo1004/stream_key",
              "chat": "https://api.twitch.tv/kraken/chat/skryoo1004",
              "features": "https://api.twitch.tv/kraken/channels/skryoo1004/features",
              "subscriptions": "https://api.twitch.tv/kraken/channels/skryoo1004/subscriptions",
              "editors": "https://api.twitch.tv/kraken/channels/skryoo1004/editors",
              "teams": "https://api.twitch.tv/kraken/channels/skryoo1004/teams",
              "videos": "https://api.twitch.tv/kraken/channels/skryoo1004/videos"
            }
          }
        }, {
          "_id": 22792733744,
          "game": "StarCraft II",
          "viewers": 24,
          "video_height": 1080,
          "average_fps": 30.0144300144,
          "delay": 0,
          "created_at": "2016-08-12T16:33:40Z",
          "is_playlist": false,
          "preview": {
            "small": "/images/slack.jpg",
            "medium": "https://static-cdn.jtvnw.net/previews-ttv/live_user_leipzigesports-320x180.jpg",
            "large": "https://static-cdn.jtvnw.net/previews-ttv/live_user_leipzigesports-640x360.jpg",
            "template": "https://static-cdn.jtvnw.net/previews-ttv/live_user_leipzigesports-{width}x{height}.jpg"
          },
          "_links": {
            "self": "https://api.twitch.tv/kraken/streams/leipzigesports"
          },
          "channel": {
            "mature": false,
            "status": "2. Leipzig eSports StarCraft II Trainingsturnier",
            "broadcaster_language": "de",
            "display_name": "LeipzigeSports",
            "game": "StarCraft II",
            "language": "de",
            "_id": 41069413,
            "name": "leipzigesports",
            "created_at": "2013-03-07T11:55:36Z",
            "updated_at": "2016-08-12T19:34:25Z",
            "delay": null,
            "logo": "https://static-cdn.jtvnw.net/jtv_user_pictures/leipzigesports-profile_image-73626ab190377bfd-300x300.png",
            "banner": null,
            "video_banner": "https://static-cdn.jtvnw.net/jtv_user_pictures/leipzigesports-channel_offline_image-9cdf667018b03a52-1920x1080.png",
            "background": null,
            "profile_banner": "https://static-cdn.jtvnw.net/jtv_user_pictures/leipzigesports-profile_banner-0d905e45beaa31b2-480.png",
            "profile_banner_background_color": "#000000",
            "partner": false,
            "url": "https://www.twitch.tv/leipzigesports",
            "views": 29642,
            "followers": 490,
            "_links": {
              "self": "https://api.twitch.tv/kraken/channels/leipzigesports",
              "follows": "https://api.twitch.tv/kraken/channels/leipzigesports/follows",
              "commercial": "https://api.twitch.tv/kraken/channels/leipzigesports/commercial",
              "stream_key": "https://api.twitch.tv/kraken/channels/leipzigesports/stream_key",
              "chat": "https://api.twitch.tv/kraken/chat/leipzigesports",
              "features": "https://api.twitch.tv/kraken/channels/leipzigesports/features",
              "subscriptions": "https://api.twitch.tv/kraken/channels/leipzigesports/subscriptions",
              "editors": "https://api.twitch.tv/kraken/channels/leipzigesports/editors",
              "teams": "https://api.twitch.tv/kraken/channels/leipzigesports/teams",
              "videos": "https://api.twitch.tv/kraken/channels/leipzigesports/videos"
            }
          }
        }, {
          "_id": 22796038368,
          "game": "StarCraft II",
          "viewers": 16,
          "video_height": 1080,
          "average_fps": 30,
          "delay": 0,
          "created_at": "2016-08-12T19:49:20Z",
          "is_playlist": false,
          "preview": {
            "small": "/images/slack.jpg",
            "medium": "https://static-cdn.jtvnw.net/previews-ttv/live_user_lscander-320x180.jpg",
            "large": "https://static-cdn.jtvnw.net/previews-ttv/live_user_lscander-640x360.jpg",
            "template": "https://static-cdn.jtvnw.net/previews-ttv/live_user_lscander-{width}x{height}.jpg"
          },
          "_links": {
            "self": "https://api.twitch.tv/kraken/streams/lscander"
          },
          "channel": {
            "mature": false,
            "status": "Чистокровный ГМЛ берет 6К ММР",
            "broadcaster_language": "ru",
            "display_name": "lscander",
            "game": "StarCraft II",
            "language": "ru",
            "_id": 65161942,
            "name": "lscander",
            "created_at": "2014-06-27T08:02:51Z",
            "updated_at": "2016-08-12T19:34:34Z",
            "delay": null,
            "logo": null,
            "banner": null,
            "video_banner": "https://static-cdn.jtvnw.net/jtv_user_pictures/lscander-channel_offline_image-0eb219452928c841-1920x1080.png",
            "background": null,
            "profile_banner": null,
            "profile_banner_background_color": null,
            "partner": false,
            "url": "https://www.twitch.tv/lscander",
            "views": 68511,
            "followers": 3656,
            "_links": {
              "self": "https://api.twitch.tv/kraken/channels/lscander",
              "follows": "https://api.twitch.tv/kraken/channels/lscander/follows",
              "commercial": "https://api.twitch.tv/kraken/channels/lscander/commercial",
              "stream_key": "https://api.twitch.tv/kraken/channels/lscander/stream_key",
              "chat": "https://api.twitch.tv/kraken/chat/lscander",
              "features": "https://api.twitch.tv/kraken/channels/lscander/features",
              "subscriptions": "https://api.twitch.tv/kraken/channels/lscander/subscriptions",
              "editors": "https://api.twitch.tv/kraken/channels/lscander/editors",
              "teams": "https://api.twitch.tv/kraken/channels/lscander/teams",
              "videos": "https://api.twitch.tv/kraken/channels/lscander/videos"
            }
          }
        }, {
          "_id": 22794314624,
          "game": "StarCraft II",
          "viewers": 8,
          "video_height": 720,
          "average_fps": 30.6451612903,
          "delay": 0,
          "created_at": "2016-08-12T18:07:44Z",
          "is_playlist": false,
          "preview": {
            "small": "/images/slack.jpg",
            "medium": "https://static-cdn.jtvnw.net/previews-ttv/live_user_misterlard-320x180.jpg",
            "large": "https://static-cdn.jtvnw.net/previews-ttv/live_user_misterlard-640x360.jpg",
            "template": "https://static-cdn.jtvnw.net/previews-ttv/live_user_misterlard-{width}x{height}.jpg"
          },
          "_links": {
            "self": "https://api.twitch.tv/kraken/streams/misterlard"
          },
          "channel": {
            "mature": false,
            "status": "[57] The History of Blizzard: StarCraft II: Legacy of the Void",
            "broadcaster_language": "en",
            "display_name": "MisterLard",
            "game": "StarCraft II",
            "language": "en",
            "_id": 25574151,
            "name": "misterlard",
            "created_at": "2011-10-19T22:20:32Z",
            "updated_at": "2016-08-12T19:04:33Z",
            "delay": null,
            "logo": "https://static-cdn.jtvnw.net/jtv_user_pictures/misterlard-profile_image-d8f3a478c396c216-300x300.png",
            "banner": null,
            "video_banner": "https://static-cdn.jtvnw.net/jtv_user_pictures/misterlard-channel_offline_image-5af0be7c52972d1a-1920x1080.png",
            "background": null,
            "profile_banner": null,
            "profile_banner_background_color": null,
            "partner": false,
            "url": "https://www.twitch.tv/misterlard",
            "views": 2936,
            "followers": 60,
            "_links": {
              "self": "https://api.twitch.tv/kraken/channels/misterlard",
              "follows": "https://api.twitch.tv/kraken/channels/misterlard/follows",
              "commercial": "https://api.twitch.tv/kraken/channels/misterlard/commercial",
              "stream_key": "https://api.twitch.tv/kraken/channels/misterlard/stream_key",
              "chat": "https://api.twitch.tv/kraken/chat/misterlard",
              "features": "https://api.twitch.tv/kraken/channels/misterlard/features",
              "subscriptions": "https://api.twitch.tv/kraken/channels/misterlard/subscriptions",
              "editors": "https://api.twitch.tv/kraken/channels/misterlard/editors",
              "teams": "https://api.twitch.tv/kraken/channels/misterlard/teams",
              "videos": "https://api.twitch.tv/kraken/channels/misterlard/videos"
            }
          }
        }, {
          "_id": 22795950640,
          "game": "StarCraft: Brood War",
          "viewers": 2,
          "video_height": 720,
          "average_fps": 25,
          "delay": 0,
          "created_at": "2016-08-12T19:43:56Z",
          "is_playlist": false,
          "preview": {
            "small": "/images/slack.jpg",
            "medium": "https://static-cdn.jtvnw.net/previews-ttv/live_user_certicky-320x180.jpg",
            "large": "https://static-cdn.jtvnw.net/previews-ttv/live_user_certicky-640x360.jpg",
            "template": "https://static-cdn.jtvnw.net/previews-ttv/live_user_certicky-{width}x{height}.jpg"
          },
          "_links": {
            "self": "https://api.twitch.tv/kraken/streams/certicky"
          },
          "channel": {
            "mature": false,
            "status": "[HD] SSCAIT: StarCraft AI Tournament",
            "broadcaster_language": "en",
            "display_name": "certicky",
            "game": "StarCraft: Brood War",
            "language": "en",
            "_id": 30861655,
            "name": "certicky",
            "created_at": "2012-05-27T21:55:11Z",
            "updated_at": "2016-08-12T19:32:46Z",
            "delay": null,
            "logo": "https://static-cdn.jtvnw.net/jtv_user_pictures/certicky-profile_image-27d84b71c3611d9b-300x300.png",
            "banner": null,
            "video_banner": "https://static-cdn.jtvnw.net/jtv_user_pictures/certicky-channel_offline_image-f9714af244be6564-1920x1080.png",
            "background": null,
            "profile_banner": "https://static-cdn.jtvnw.net/jtv_user_pictures/certicky-profile_banner-1232071cedcb4c8c-480.jpeg",
            "profile_banner_background_color": "#000000",
            "partner": false,
            "url": "https://www.twitch.tv/certicky",
            "views": 152210,
            "followers": 581,
            "_links": {
              "self": "https://api.twitch.tv/kraken/channels/certicky",
              "follows": "https://api.twitch.tv/kraken/channels/certicky/follows",
              "commercial": "https://api.twitch.tv/kraken/channels/certicky/commercial",
              "stream_key": "https://api.twitch.tv/kraken/channels/certicky/stream_key",
              "chat": "https://api.twitch.tv/kraken/chat/certicky",
              "features": "https://api.twitch.tv/kraken/channels/certicky/features",
              "subscriptions": "https://api.twitch.tv/kraken/channels/certicky/subscriptions",
              "editors": "https://api.twitch.tv/kraken/channels/certicky/editors",
              "teams": "https://api.twitch.tv/kraken/channels/certicky/teams",
              "videos": "https://api.twitch.tv/kraken/channels/certicky/videos"
            }
          }
        }, {
          "_id": 22796067904,
          "game": "StarCraft II",
          "viewers": 1,
          "video_height": 480,
          "average_fps": 25.4258835495,
          "delay": 0,
          "created_at": "2016-08-12T19:51:12Z",
          "is_playlist": false,
          "preview": {
            "small": "/images/slack.jpg",
            "medium": "https://static-cdn.jtvnw.net/previews-ttv/live_user_sdsg_stratos-320x180.jpg",
            "large": "https://static-cdn.jtvnw.net/previews-ttv/live_user_sdsg_stratos-640x360.jpg",
            "template": "https://static-cdn.jtvnw.net/previews-ttv/live_user_sdsg_stratos-{width}x{height}.jpg"
          },
          "_links": {
            "self": "https://api.twitch.tv/kraken/streams/sdsg_stratos"
          },
          "channel": {
            "mature": false,
            "status": "[FR] Road to Master ! Zerg-Diamant [FR]",
            "broadcaster_language": "fr",
            "display_name": "SDSG_StratoS",
            "game": "StarCraft II",
            "language": "fr",
            "_id": 85936997,
            "name": "sdsg_stratos",
            "created_at": "2015-03-23T19:46:40Z",
            "updated_at": "2016-08-12T19:00:14Z",
            "delay": null,
            "logo": "https://static-cdn.jtvnw.net/jtv_user_pictures/sdsg_stratos-profile_image-0289965b03d324eb-300x300.jpeg",
            "banner": null,
            "video_banner": null,
            "background": null,
            "profile_banner": "https://static-cdn.jtvnw.net/jtv_user_pictures/sdsg_stratos-profile_banner-385da6db9ee94304-480.jpeg",
            "profile_banner_background_color": null,
            "partner": false,
            "url": "https://www.twitch.tv/sdsg_stratos",
            "views": 1273,
            "followers": 55,
            "_links": {
              "self": "https://api.twitch.tv/kraken/channels/sdsg_stratos",
              "follows": "https://api.twitch.tv/kraken/channels/sdsg_stratos/follows",
              "commercial": "https://api.twitch.tv/kraken/channels/sdsg_stratos/commercial",
              "stream_key": "https://api.twitch.tv/kraken/channels/sdsg_stratos/stream_key",
              "chat": "https://api.twitch.tv/kraken/chat/sdsg_stratos",
              "features": "https://api.twitch.tv/kraken/channels/sdsg_stratos/features",
              "subscriptions": "https://api.twitch.tv/kraken/channels/sdsg_stratos/subscriptions",
              "editors": "https://api.twitch.tv/kraken/channels/sdsg_stratos/editors",
              "teams": "https://api.twitch.tv/kraken/channels/sdsg_stratos/teams",
              "videos": "https://api.twitch.tv/kraken/channels/sdsg_stratos/videos"
            }
          }
        }, {
          "_id": 22794344608,
          "game": "StarCraft II",
          "viewers": 1,
          "video_height": 720,
          "average_fps": 60,
          "delay": 0,
          "created_at": "2016-08-12T18:09:32Z",
          "is_playlist": false,
          "preview": {
            "small": "/images/slack.jpg",
            "medium": "https://static-cdn.jtvnw.net/previews-ttv/live_user_355th300-320x180.jpg",
            "large": "https://static-cdn.jtvnw.net/previews-ttv/live_user_355th300-640x360.jpg",
            "template": "https://static-cdn.jtvnw.net/previews-ttv/live_user_355th300-{width}x{height}.jpg"
          },
          "_links": {
            "self": "https://api.twitch.tv/kraken/streams/355th300"
          },
          "channel": {
            "mature": false,
            "status": "Professinal Russian Plays Starcraft stream ;)",
            "broadcaster_language": "en",
            "display_name": "355th300",
            "game": "StarCraft II",
            "language": "en",
            "_id": 77052882,
            "name": "355th300",
            "created_at": "2014-12-12T16:00:58Z",
            "updated_at": "2016-08-12T19:00:47Z",
            "delay": null,
            "logo": "https://static-cdn.jtvnw.net/jtv_user_pictures/355th300-profile_image-27a906f0ba0e545a-300x300.jpeg",
            "banner": null,
            "video_banner": "https://static-cdn.jtvnw.net/jtv_user_pictures/355th300-channel_offline_image-b8f047c7d24c1d8a-1920x1080.jpeg",
            "background": null,
            "profile_banner": null,
            "profile_banner_background_color": "#00139f",
            "partner": false,
            "url": "https://www.twitch.tv/355th300",
            "views": 342,
            "followers": 21,
            "_links": {
              "self": "https://api.twitch.tv/kraken/channels/355th300",
              "follows": "https://api.twitch.tv/kraken/channels/355th300/follows",
              "commercial": "https://api.twitch.tv/kraken/channels/355th300/commercial",
              "stream_key": "https://api.twitch.tv/kraken/channels/355th300/stream_key",
              "chat": "https://api.twitch.tv/kraken/chat/355th300",
              "features": "https://api.twitch.tv/kraken/channels/355th300/features",
              "subscriptions": "https://api.twitch.tv/kraken/channels/355th300/subscriptions",
              "editors": "https://api.twitch.tv/kraken/channels/355th300/editors",
              "teams": "https://api.twitch.tv/kraken/channels/355th300/teams",
              "videos": "https://api.twitch.tv/kraken/channels/355th300/videos"
            }
          }
        }, {
          "_id": 22796102640,
          "game": "StarCraft II",
          "viewers": 0,
          "video_height": 720,
          "average_fps": 24,
          "delay": 0,
          "created_at": "2016-08-12T19:53:18Z",
          "is_playlist": false,
          "preview": {
            "small": "/images/slack.jpg",
            "medium": "https://static-cdn.jtvnw.net/previews-ttv/live_user_wolfslairsc2-320x180.jpg",
            "large": "https://static-cdn.jtvnw.net/previews-ttv/live_user_wolfslairsc2-640x360.jpg",
            "template": "https://static-cdn.jtvnw.net/previews-ttv/live_user_wolfslairsc2-{width}x{height}.jpg"
          },
          "_links": {
            "self": "https://api.twitch.tv/kraken/streams/wolfslairsc2"
          },
          "channel": {
            "mature": false,
            "status": "Wolf's Lair's Thor",
            "broadcaster_language": "tr",
            "display_name": "Wolfslairsc2",
            "game": "StarCraft II",
            "language": "tr",
            "_id": 117175160,
            "name": "wolfslairsc2",
            "created_at": "2016-02-27T19:56:01Z",
            "updated_at": "2016-08-12T18:31:33Z",
            "delay": null,
            "logo": "https://static-cdn.jtvnw.net/jtv_user_pictures/wolfslairsc2-profile_image-24a719b3507d7472-300x300.jpeg",
            "banner": null,
            "video_banner": "https://static-cdn.jtvnw.net/jtv_user_pictures/wolfslairsc2-channel_offline_image-565eba2c6484febb-1920x1080.jpeg",
            "background": null,
            "profile_banner": "https://static-cdn.jtvnw.net/jtv_user_pictures/wolfslairsc2-profile_banner-02bc09237522e195-480.png",
            "profile_banner_background_color": null,
            "partner": false,
            "url": "https://www.twitch.tv/wolfslairsc2",
            "views": 4300,
            "followers": 109,
            "_links": {
              "self": "https://api.twitch.tv/kraken/channels/wolfslairsc2",
              "follows": "https://api.twitch.tv/kraken/channels/wolfslairsc2/follows",
              "commercial": "https://api.twitch.tv/kraken/channels/wolfslairsc2/commercial",
              "stream_key": "https://api.twitch.tv/kraken/channels/wolfslairsc2/stream_key",
              "chat": "https://api.twitch.tv/kraken/chat/wolfslairsc2",
              "features": "https://api.twitch.tv/kraken/channels/wolfslairsc2/features",
              "subscriptions": "https://api.twitch.tv/kraken/channels/wolfslairsc2/subscriptions",
              "editors": "https://api.twitch.tv/kraken/channels/wolfslairsc2/editors",
              "teams": "https://api.twitch.tv/kraken/channels/wolfslairsc2/teams",
              "videos": "https://api.twitch.tv/kraken/channels/wolfslairsc2/videos"
            }
          }
        }, {
          "_id": 22795333232,
          "game": "Starcraft (lotv) // Skill // CSGO",
          "viewers": 0,
          "video_height": 1080,
          "average_fps": 30.0150075038,
          "delay": 0,
          "created_at": "2016-08-12T19:08:00Z",
          "is_playlist": false,
          "preview": {
            "small": "/images/slack.jpg",
            "medium": "https://static-cdn.jtvnw.net/previews-ttv/live_user_mrmanslol-320x180.jpg",
            "large": "https://static-cdn.jtvnw.net/previews-ttv/live_user_mrmanslol-640x360.jpg",
            "template": "https://static-cdn.jtvnw.net/previews-ttv/live_user_mrmanslol-{width}x{height}.jpg"
          },
          "_links": {
            "self": "https://api.twitch.tv/kraken/streams/mrmanslol"
          },
          "channel": {
            "mature": null,
            "status": "Starcraft (lotv) // Skill // CSGO",
            "broadcaster_language": "de",
            "display_name": "MrMansLoL",
            "game": "Starcraft (lotv) // Skill // CSGO",
            "language": "de",
            "_id": 77468375,
            "name": "mrmanslol",
            "created_at": "2014-12-18T21:45:49Z",
            "updated_at": "2016-08-12T19:38:17Z",
            "delay": null,
            "logo": null,
            "banner": null,
            "video_banner": null,
            "background": null,
            "profile_banner": null,
            "profile_banner_background_color": null,
            "partner": false,
            "url": "https://www.twitch.tv/mrmanslol",
            "views": 47,
            "followers": 1,
            "_links": {
              "self": "https://api.twitch.tv/kraken/channels/mrmanslol",
              "follows": "https://api.twitch.tv/kraken/channels/mrmanslol/follows",
              "commercial": "https://api.twitch.tv/kraken/channels/mrmanslol/commercial",
              "stream_key": "https://api.twitch.tv/kraken/channels/mrmanslol/stream_key",
              "chat": "https://api.twitch.tv/kraken/chat/mrmanslol",
              "features": "https://api.twitch.tv/kraken/channels/mrmanslol/features",
              "subscriptions": "https://api.twitch.tv/kraken/channels/mrmanslol/subscriptions",
              "editors": "https://api.twitch.tv/kraken/channels/mrmanslol/editors",
              "teams": "https://api.twitch.tv/kraken/channels/mrmanslol/teams",
              "videos": "https://api.twitch.tv/kraken/channels/mrmanslol/videos"
            }
          }
        }, {
          "_id": 22795221456,
          "game": "StarCraft II",
          "viewers": 0,
          "video_height": 1080,
          "average_fps": 30.8823529412,
          "delay": 0,
          "created_at": "2016-08-12T19:01:54Z",
          "is_playlist": false,
          "preview": {
            "small": "/images/slack.jpg",
            "medium": "https://static-cdn.jtvnw.net/previews-ttv/live_user_adimax1993-320x180.jpg",
            "large": "https://static-cdn.jtvnw.net/previews-ttv/live_user_adimax1993-640x360.jpg",
            "template": "https://static-cdn.jtvnw.net/previews-ttv/live_user_adimax1993-{width}x{height}.jpg"
          },
          "_links": {
            "self": "https://api.twitch.tv/kraken/streams/adimax1993"
          },
          "channel": {
            "mature": false,
            "status": "Starcraft 2 Archont GM EU",
            "broadcaster_language": "pl",
            "display_name": "Adimax1993",
            "game": "StarCraft II",
            "language": "pl",
            "_id": 32648720,
            "name": "adimax1993",
            "created_at": "2012-08-02T22:19:20Z",
            "updated_at": "2016-08-12T19:31:41Z",
            "delay": null,
            "logo": "https://static-cdn.jtvnw.net/jtv_user_pictures/adimax1993-profile_image-d1bb683b433312dd-300x300.png",
            "banner": null,
            "video_banner": null,
            "background": null,
            "profile_banner": null,
            "profile_banner_background_color": null,
            "partner": false,
            "url": "https://www.twitch.tv/adimax1993",
            "views": 712,
            "followers": 16,
            "_links": {
              "self": "https://api.twitch.tv/kraken/channels/adimax1993",
              "follows": "https://api.twitch.tv/kraken/channels/adimax1993/follows",
              "commercial": "https://api.twitch.tv/kraken/channels/adimax1993/commercial",
              "stream_key": "https://api.twitch.tv/kraken/channels/adimax1993/stream_key",
              "chat": "https://api.twitch.tv/kraken/chat/adimax1993",
              "features": "https://api.twitch.tv/kraken/channels/adimax1993/features",
              "subscriptions": "https://api.twitch.tv/kraken/channels/adimax1993/subscriptions",
              "editors": "https://api.twitch.tv/kraken/channels/adimax1993/editors",
              "teams": "https://api.twitch.tv/kraken/channels/adimax1993/teams",
              "videos": "https://api.twitch.tv/kraken/channels/adimax1993/videos"
            }
          }
        }]
      };
    }).call(this, require("1YiZ5S"), typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}, require("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/services/mockData.js", "/services");
  }, { "1YiZ5S": 4, "buffer": 1 }], 11: [function (require, module, exports) {
    (function (process, global, Buffer, __argument0, __argument1, __argument2, __argument3, __filename, __dirname) {
      var Service = require('../libs/service');

      var TwitchService = function (_Service) {
        _inherits(TwitchService, _Service);

        function TwitchService() {
          _classCallCheck(this, TwitchService);

          // this.useMockData = true
          var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(TwitchService).call(this, ['getStreamsFromQuery']));

          _this4.rootUrl = 'https://api.twitch.tv/kraken/search/streams';
          return _this4;
        }

        _createClass(TwitchService, [{
          key: "onGetStreamsFromQuery",
          value: function onGetStreamsFromQuery() {
            var _this5 = this;

            var query = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

            var event = {
              action: 'get streams from query',
              data: null,
              query: query
            };

            // Escape if no query
            if (query.length === 0) {
              return this.trigger(event);
            }

            // Use mock data (for testing)
            if (this.useMockData) {
              event.data = require('./mockData');
              return this.trigger(event);
            }

            // Fetch our data via JSONP from Twitch API
            this.trigger({ action: 'loading streams' });
            this.jsonp(this.rootUrl + "?limit=100&q=" + query, function (data) {
              event.data = data;
              _this5.trigger(event);
            });
          }
        }]);

        return TwitchService;
      }(Service);

      module.exports = new TwitchService();
    }).call(this, require("1YiZ5S"), typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}, require("buffer").Buffer, arguments[3], arguments[4], arguments[5], arguments[6], "/services/twitch.js", "/services");
  }, { "../libs/service": 9, "./mockData": 10, "1YiZ5S": 4, "buffer": 1 }] }, {}, [7]);