import { app, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import require$$0 from "path";
import require$$1 from "fs";
import require$$3 from "events";
import path from "node:path";
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var lib = {};
var util = {};
Object.defineProperty(util, "__esModule", { value: true });
util.allowMethods = void 0;
function allowMethods(socketPrototype, methods) {
  const toDelete = ["send", "receive", "join", "leave"];
  for (const method of toDelete) {
    if (methods.includes(method)) {
      delete socketPrototype[method];
    }
  }
}
util.allowMethods = allowMethods;
var native$1 = { exports: {} };
function commonjsRequire(path2) {
  throw new Error('Could not dynamically require "' + path2 + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}
var loadAddon$1 = { exports: {} };
var loadAddon = loadAddon$1.exports;
var __importDefault = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(loadAddon, "__esModule", { value: true });
const path_1 = __importDefault(require$$0);
const fs_1 = __importDefault(require$$1);
function errStr(error) {
  return error instanceof Error ? `${error.name}: ${error.message}
${error.stack}` : String(error);
}
function devWarn(message) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(message);
  }
}
function findAddon() {
  let addon = void 0;
  try {
    const addonParentDir = path_1.default.resolve(path_1.default.join(__dirname, "..", "build", process.platform, process.arch, "node"));
    const addOnAbiDirs = fs_1.default.readdirSync(addonParentDir).sort((a, b) => {
      return Number.parseInt(b, 10) - Number.parseInt(a, 10);
    });
    for (const addOnAbiDir of addOnAbiDirs) {
      const addonPath = path_1.default.join(addonParentDir, addOnAbiDir, "addon.node");
      try {
        addon = commonjsRequire(addonPath);
        break;
      } catch (err) {
        if (fs_1.default.existsSync(addonPath)) {
          devWarn(`Failed to load addon at ${addonPath}: ${errStr(err)}
Trying others...`);
        } else {
          devWarn(`No addon.node found in ${addonPath}
Trying others...`);
        }
      }
    }
  } catch (err) {
    throw new Error(`Failed to load zeromq.js addon.node: ${errStr(err)}`);
  }
  if (addon === void 0) {
    throw new Error("No compatible zeromq.js addon found");
  }
  return addon;
}
loadAddon$1.exports = findAddon();
var loadAddonExports = loadAddon$1.exports;
var native = native$1.exports;
Object.defineProperty(native, "__esModule", { value: true });
native$1.exports = loadAddonExports;
var nativeExports = native$1.exports;
var draft = {};
Object.defineProperty(draft, "__esModule", { value: true });
draft.Datagram = draft.Scatter = draft.Gather = draft.Dish = draft.Radio = draft.Client = draft.Server = void 0;
const native_1 = nativeExports;
const util_1 = util;
class Server extends native_1.Socket {
  constructor(options) {
    super(12, options);
  }
}
draft.Server = Server;
(0, util_1.allowMethods)(Server.prototype, ["send", "receive"]);
class Client extends native_1.Socket {
  constructor(options) {
    super(13, options);
  }
}
draft.Client = Client;
(0, util_1.allowMethods)(Client.prototype, ["send", "receive"]);
class Radio extends native_1.Socket {
  constructor(options) {
    super(14, options);
  }
}
draft.Radio = Radio;
(0, util_1.allowMethods)(Radio.prototype, ["send"]);
const join = native_1.Socket.prototype.join;
const leave = native_1.Socket.prototype.leave;
class Dish extends native_1.Socket {
  constructor(options) {
    super(15, options);
  }
  /* TODO: These methods might accept arrays in their C++ implementation for
     the sake of simplicity. */
  join(...values) {
    for (const value of values) {
      join(value);
    }
  }
  leave(...values) {
    for (const value of values) {
      leave(value);
    }
  }
}
draft.Dish = Dish;
(0, util_1.allowMethods)(Dish.prototype, ["receive", "join", "leave"]);
class Gather extends native_1.Socket {
  constructor(options) {
    super(16, options);
  }
}
draft.Gather = Gather;
(0, util_1.allowMethods)(Gather.prototype, ["receive"]);
class Scatter extends native_1.Socket {
  constructor(options) {
    super(17, options);
  }
}
draft.Scatter = Scatter;
(0, util_1.allowMethods)(Scatter.prototype, ["send"]);
class Datagram extends native_1.Socket {
  constructor(options) {
    super(18, options);
  }
}
draft.Datagram = Datagram;
(0, util_1.allowMethods)(Datagram.prototype, ["send", "receive"]);
(function(exports) {
  var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === void 0) k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = commonjsGlobal && commonjsGlobal.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = commonjsGlobal && commonjsGlobal.__importStar || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
      for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Stream = exports.XSubscriber = exports.XPublisher = exports.Push = exports.Pull = exports.Router = exports.Dealer = exports.Reply = exports.Request = exports.Subscriber = exports.Publisher = exports.Pair = exports.Proxy = exports.Observer = exports.Socket = exports.Context = exports.version = exports.curveKeyPair = exports.context = exports.capability = void 0;
  const util_12 = util;
  var native_12 = nativeExports;
  Object.defineProperty(exports, "capability", { enumerable: true, get: function() {
    return native_12.capability;
  } });
  Object.defineProperty(exports, "context", { enumerable: true, get: function() {
    return native_12.context;
  } });
  Object.defineProperty(exports, "curveKeyPair", { enumerable: true, get: function() {
    return native_12.curveKeyPair;
  } });
  Object.defineProperty(exports, "version", { enumerable: true, get: function() {
    return native_12.version;
  } });
  Object.defineProperty(exports, "Context", { enumerable: true, get: function() {
    return native_12.Context;
  } });
  Object.defineProperty(exports, "Socket", { enumerable: true, get: function() {
    return native_12.Socket;
  } });
  Object.defineProperty(exports, "Observer", { enumerable: true, get: function() {
    return native_12.Observer;
  } });
  Object.defineProperty(exports, "Proxy", { enumerable: true, get: function() {
    return native_12.Proxy;
  } });
  const native_2 = nativeExports;
  const draft$1 = __importStar(draft);
  function asyncIterator() {
    return {
      next: async () => {
        if (this.closed) {
          return { done: true };
        }
        try {
          return { value: await this.receive(), done: false };
        } catch (err) {
          if (this.closed && err.code === "EAGAIN") {
            return { done: true };
          } else {
            throw err;
          }
        }
      }
    };
  }
  Object.assign(native_2.Socket.prototype, { [Symbol.asyncIterator]: asyncIterator });
  Object.assign(native_2.Observer.prototype, { [Symbol.asyncIterator]: asyncIterator });
  if (!native_2.Observer.prototype.hasOwnProperty("emitter")) {
    Object.defineProperty(native_2.Observer.prototype, "emitter", {
      get: function emitter() {
        const events = require$$3;
        const value = new events.EventEmitter();
        const boundReceive = this.receive.bind(this);
        Object.defineProperty(this, "receive", {
          get: () => {
            throw new Error("Observer is in event emitter mode. After a call to events.on() it is not possible to read events with events.receive().");
          }
        });
        const run = async () => {
          while (!this.closed) {
            const event = await boundReceive();
            value.emit(event.type, event);
          }
        };
        run();
        Object.defineProperty(this, "emitter", { value });
        return value;
      }
    });
  }
  native_2.Observer.prototype.on = function on(...args) {
    return this.emitter.on(...args);
  };
  native_2.Observer.prototype.off = function off(...args) {
    return this.emitter.off(...args);
  };
  class Pair extends native_2.Socket {
    constructor(options) {
      super(0, options);
    }
  }
  exports.Pair = Pair;
  (0, util_12.allowMethods)(Pair.prototype, ["send", "receive"]);
  class Publisher extends native_2.Socket {
    constructor(options) {
      super(1, options);
    }
  }
  exports.Publisher = Publisher;
  (0, util_12.allowMethods)(Publisher.prototype, ["send"]);
  class Subscriber extends native_2.Socket {
    constructor(options) {
      super(2, options);
    }
    /**
     * Establish a new message filter. Newly created {@link Subsriber} sockets
     * will filtered out all incoming messages. Call this method to subscribe to
     * messages beginning with the given prefix.
     *
     * Multiple filters may be attached to a single socket, in which case a
     * message shall be accepted if it matches at least one filter. Subscribing
     * without any filters shall subscribe to **all** incoming messages.
     *
     * ```typescript
     * const sub = new Subscriber()
     *
     * // Listen to all messages beginning with 'foo'.
     * sub.subscribe("foo")
     *
     * // Listen to all incoming messages.
     * sub.subscribe()
     * ```
     *
     * @param prefixes The prefixes of messages to subscribe to.
     */
    subscribe(...prefixes) {
      if (prefixes.length === 0) {
        this.setStringOption(6, null);
      } else {
        for (const prefix of prefixes) {
          this.setStringOption(6, prefix);
        }
      }
    }
    /**
     * Remove an existing message filter which was previously established with
     * {@link subscribe}(). Stops receiving messages with the given prefix.
     *
     * Unsubscribing without any filters shall unsubscribe from the "subscribe
     * all" filter that is added by calling {@link subscribe}() without arguments.
     *
     * ```typescript
     * const sub = new Subscriber()
     *
     * // Listen to all messages beginning with 'foo'.
     * sub.subscribe("foo")
     * // ...
     *
     * // Stop listening to messages beginning with 'foo'.
     * sub.unsubscribe("foo")
     * ```
     *
     * @param prefixes The prefixes of messages to subscribe to.
     */
    unsubscribe(...prefixes) {
      if (prefixes.length === 0) {
        this.setStringOption(7, null);
      } else {
        for (const prefix of prefixes) {
          this.setStringOption(7, prefix);
        }
      }
    }
  }
  exports.Subscriber = Subscriber;
  (0, util_12.allowMethods)(Subscriber.prototype, ["receive"]);
  class Request extends native_2.Socket {
    constructor(options) {
      super(3, options);
    }
  }
  exports.Request = Request;
  (0, util_12.allowMethods)(Request.prototype, ["send", "receive"]);
  class Reply extends native_2.Socket {
    constructor(options) {
      super(4, options);
    }
  }
  exports.Reply = Reply;
  (0, util_12.allowMethods)(Reply.prototype, ["send", "receive"]);
  class Dealer extends native_2.Socket {
    constructor(options) {
      super(5, options);
    }
  }
  exports.Dealer = Dealer;
  (0, util_12.allowMethods)(Dealer.prototype, ["send", "receive"]);
  class Router extends native_2.Socket {
    constructor(options) {
      super(6, options);
    }
    /**
     * Connects to the given remote address. To specificy a specific routing id,
     * provide a `routingId` option. The identity should be unique, from 1 to 255
     * bytes long and MAY NOT start with binary zero.
     *
     * @param address The `tcp://` address to connect to.
     * @param options Any connection options.
     */
    connect(address, options = {}) {
      if (options.routingId) {
        this.setStringOption(61, options.routingId);
      }
      super.connect(address);
    }
  }
  exports.Router = Router;
  (0, util_12.allowMethods)(Router.prototype, ["send", "receive"]);
  class Pull extends native_2.Socket {
    constructor(options) {
      super(7, options);
    }
  }
  exports.Pull = Pull;
  (0, util_12.allowMethods)(Pull.prototype, ["receive"]);
  class Push extends native_2.Socket {
    constructor(options) {
      super(8, options);
    }
  }
  exports.Push = Push;
  (0, util_12.allowMethods)(Push.prototype, ["send"]);
  class XPublisher extends native_2.Socket {
    /**
     * ZMQ_XPUB_VERBOSE / ZMQ_XPUB_VERBOSER
     *
     * Whether to pass any duplicate subscription/unsuscription messages.
     *  * `null` (default) - Only unique subscribe and unsubscribe messages are
     *    visible to the caller.
     *  * `"allSubs"` - All subscribe messages (including duplicates) are visible
     *    to the caller, but only unique unsubscribe messages are visible.
     *  * `"allSubsUnsubs"` - All subscribe and unsubscribe messages (including
     *    duplicates) are visible to the caller.
     */
    set verbosity(value) {
      switch (value) {
        case null:
          this.setBoolOption(40, false);
          break;
        case "allSubs":
          this.setBoolOption(40, true);
          break;
        case "allSubsUnsubs":
          this.setBoolOption(78, true);
          break;
      }
    }
    constructor(options) {
      super(9, options);
    }
  }
  exports.XPublisher = XPublisher;
  (0, util_12.allowMethods)(XPublisher.prototype, ["send", "receive"]);
  class XSubscriber extends native_2.Socket {
    constructor(options) {
      super(10, options);
    }
  }
  exports.XSubscriber = XSubscriber;
  (0, util_12.allowMethods)(XSubscriber.prototype, ["send", "receive"]);
  class Stream extends native_2.Socket {
    constructor(options) {
      super(11, options);
    }
    /**
     * Connects to the given remote address. To specificy a specific routing id,
     * provide a `routingId` option. The identity should be unique, from 1 to 255
     * bytes long and MAY NOT start with binary zero.
     *
     * @param address The `tcp://` address to connect to.
     * @param options Any connection options.
     */
    connect(address, options = {}) {
      if (options.routingId) {
        this.setStringOption(61, options.routingId);
      }
      super.connect(address);
    }
  }
  exports.Stream = Stream;
  (0, util_12.allowMethods)(Stream.prototype, ["send", "receive"]);
  function defineOpt(targets, name, id, type, acc = 3, values) {
    const desc = {};
    if (acc & 1) {
      const getter = `get${type}Option`;
      if (values) {
        desc.get = function get() {
          return values[this[getter](id)];
        };
      } else {
        desc.get = function get() {
          return this[getter](id);
        };
      }
    }
    if (acc & 2) {
      const setter = `set${type}Option`;
      if (values) {
        desc.set = function set(val) {
          this[setter](id, values.indexOf(val));
        };
      } else {
        desc.set = function set(val) {
          this[setter](id, val);
        };
      }
    }
    for (const target of targets) {
      if (target.prototype.hasOwnProperty(name)) {
        continue;
      }
      Object.defineProperty(target.prototype, name, desc);
    }
  }
  defineOpt(
    [native_2.Context],
    "ioThreads",
    1,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    [native_2.Context],
    "maxSockets",
    2,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    [native_2.Context],
    "maxSocketsLimit",
    3,
    "Int32",
    1
    /* Acc.Read */
  );
  defineOpt(
    [native_2.Context],
    "threadPriority",
    3,
    "Int32",
    2
    /* Acc.Write */
  );
  defineOpt(
    [native_2.Context],
    "threadSchedulingPolicy",
    4,
    "Int32",
    2
    /* Acc.Write */
  );
  defineOpt(
    [native_2.Context],
    "maxMessageSize",
    5,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    [native_2.Context],
    "ipv6",
    42,
    "Bool"
    /* Type.Bool */
  );
  defineOpt(
    [native_2.Context],
    "blocky",
    70,
    "Bool"
    /* Type.Bool */
  );
  const writables = [
    Pair,
    Publisher,
    Request,
    Reply,
    Dealer,
    Router,
    Push,
    XPublisher,
    XSubscriber,
    Stream,
    draft$1.Server,
    draft$1.Client,
    draft$1.Radio,
    draft$1.Scatter,
    draft$1.Datagram
  ];
  defineOpt(
    writables,
    "sendBufferSize",
    11,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    writables,
    "sendHighWaterMark",
    23,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    writables,
    "sendTimeout",
    28,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    writables,
    "multicastHops",
    25,
    "Int32"
    /* Type.Int32 */
  );
  const readables = [
    Pair,
    Subscriber,
    Request,
    Reply,
    Dealer,
    Router,
    Pull,
    XPublisher,
    XSubscriber,
    Stream,
    draft$1.Server,
    draft$1.Client,
    draft$1.Dish,
    draft$1.Gather,
    draft$1.Datagram
  ];
  defineOpt(
    readables,
    "receiveBufferSize",
    12,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    readables,
    "receiveHighWaterMark",
    24,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    readables,
    "receiveTimeout",
    27,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    [native_2.Socket],
    "affinity",
    4,
    "Uint64"
    /* Type.Uint64 */
  );
  defineOpt(
    [Request, Reply, Router, Dealer],
    "routingId",
    5,
    "String"
    /* Type.String */
  );
  defineOpt(
    [native_2.Socket],
    "rate",
    8,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    [native_2.Socket],
    "recoveryInterval",
    9,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    [native_2.Socket],
    "type",
    16,
    "Int32",
    1
    /* Acc.Read */
  );
  defineOpt(
    [native_2.Socket],
    "linger",
    17,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    [native_2.Socket],
    "reconnectInterval",
    18,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    [native_2.Socket],
    "backlog",
    19,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    [native_2.Socket],
    "reconnectMaxInterval",
    21,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    [native_2.Socket],
    "maxMessageSize",
    22,
    "Int64"
    /* Type.Int64 */
  );
  defineOpt(
    [native_2.Socket],
    "lastEndpoint",
    32,
    "String",
    1
    /* Acc.Read */
  );
  defineOpt(
    [Router],
    "mandatory",
    33,
    "Bool"
    /* Type.Bool */
  );
  defineOpt(
    [native_2.Socket],
    "tcpKeepalive",
    34,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    [native_2.Socket],
    "tcpKeepaliveCount",
    35,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    [native_2.Socket],
    "tcpKeepaliveIdle",
    36,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    [native_2.Socket],
    "tcpKeepaliveInterval",
    37,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    [native_2.Socket],
    "tcpAcceptFilter",
    38,
    "String"
    /* Type.String */
  );
  defineOpt(
    [native_2.Socket],
    "immediate",
    39,
    "Bool"
    /* Type.Bool */
  );
  defineOpt(
    [native_2.Socket],
    "ipv6",
    42,
    "Bool"
    /* Type.Bool */
  );
  defineOpt([native_2.Socket], "securityMechanism", 43, "Int32", 1, [
    null,
    "plain",
    "curve",
    "gssapi"
  ]);
  defineOpt(
    [native_2.Socket],
    "plainServer",
    44,
    "Bool"
    /* Type.Bool */
  );
  defineOpt(
    [native_2.Socket],
    "plainUsername",
    45,
    "String"
    /* Type.String */
  );
  defineOpt(
    [native_2.Socket],
    "plainPassword",
    46,
    "String"
    /* Type.String */
  );
  if (native_2.capability.curve) {
    defineOpt(
      [native_2.Socket],
      "curveServer",
      47,
      "Bool"
      /* Type.Bool */
    );
    defineOpt(
      [native_2.Socket],
      "curvePublicKey",
      48,
      "String"
      /* Type.String */
    );
    defineOpt(
      [native_2.Socket],
      "curveSecretKey",
      49,
      "String"
      /* Type.String */
    );
    defineOpt(
      [native_2.Socket],
      "curveServerKey",
      50,
      "String"
      /* Type.String */
    );
  }
  defineOpt(
    [Router, Dealer, Request],
    "probeRouter",
    51,
    "Bool",
    2
    /* Acc.Write */
  );
  defineOpt(
    [Request],
    "correlate",
    52,
    "Bool",
    2
    /* Acc.Write */
  );
  defineOpt(
    [Request],
    "relaxed",
    53,
    "Bool",
    2
    /* Acc.Write */
  );
  const conflatables = [
    Pull,
    Push,
    Subscriber,
    Publisher,
    Dealer,
    draft$1.Scatter,
    draft$1.Gather
  ];
  defineOpt(
    conflatables,
    "conflate",
    54,
    "Bool",
    2
    /* Acc.Write */
  );
  defineOpt(
    [native_2.Socket],
    "zapDomain",
    55,
    "String"
    /* Type.String */
  );
  defineOpt(
    [Router],
    "handover",
    56,
    "Bool",
    2
    /* Acc.Write */
  );
  defineOpt(
    [native_2.Socket],
    "typeOfService",
    57,
    "Uint32"
    /* Type.Uint32 */
  );
  if (native_2.capability.gssapi) {
    defineOpt(
      [native_2.Socket],
      "gssapiServer",
      62,
      "Bool"
      /* Type.Bool */
    );
    defineOpt(
      [native_2.Socket],
      "gssapiPrincipal",
      63,
      "String"
      /* Type.String */
    );
    defineOpt(
      [native_2.Socket],
      "gssapiServicePrincipal",
      64,
      "String"
      /* Type.String */
    );
    defineOpt(
      [native_2.Socket],
      "gssapiPlainText",
      65,
      "Bool"
      /* Type.Bool */
    );
    const principals = ["hostBased", "userName", "krb5Principal"];
    defineOpt([native_2.Socket], "gssapiPrincipalNameType", 90, "Int32", 3, principals);
    defineOpt([native_2.Socket], "gssapiServicePrincipalNameType", 91, "Int32", 3, principals);
  }
  defineOpt(
    [native_2.Socket],
    "handshakeInterval",
    66,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    [native_2.Socket],
    "socksProxy",
    68,
    "String"
    /* Type.String */
  );
  defineOpt(
    [XPublisher, Publisher],
    "noDrop",
    69,
    "Bool",
    2
    /* Acc.Write */
  );
  defineOpt(
    [XPublisher],
    "manual",
    71,
    "Bool",
    2
    /* Acc.Write */
  );
  defineOpt(
    [XPublisher],
    "welcomeMessage",
    72,
    "String",
    2
    /* Acc.Write */
  );
  defineOpt(
    [Stream],
    "notify",
    73,
    "Bool",
    2
    /* Acc.Write */
  );
  defineOpt(
    [Publisher, Subscriber, XPublisher],
    "invertMatching",
    74,
    "Bool"
    /* Type.Bool */
  );
  defineOpt(
    [native_2.Socket],
    "heartbeatInterval",
    75,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    [native_2.Socket],
    "heartbeatTimeToLive",
    76,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    [native_2.Socket],
    "heartbeatTimeout",
    77,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    [native_2.Socket],
    "connectTimeout",
    79,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    [native_2.Socket],
    "tcpMaxRetransmitTimeout",
    80,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    [native_2.Socket],
    "threadSafe",
    81,
    "Bool",
    1
    /* Acc.Read */
  );
  defineOpt(
    [native_2.Socket],
    "multicastMaxTransportDataUnit",
    84,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    [native_2.Socket],
    "vmciBufferSize",
    85,
    "Uint64"
    /* Type.Uint64 */
  );
  defineOpt(
    [native_2.Socket],
    "vmciBufferMinSize",
    86,
    "Uint64"
    /* Type.Uint64 */
  );
  defineOpt(
    [native_2.Socket],
    "vmciBufferMaxSize",
    87,
    "Uint64"
    /* Type.Uint64 */
  );
  defineOpt(
    [native_2.Socket],
    "vmciConnectTimeout",
    88,
    "Int32"
    /* Type.Int32 */
  );
  defineOpt(
    [native_2.Socket],
    "interface",
    92,
    "String"
    /* Type.String */
  );
  defineOpt(
    [native_2.Socket],
    "zapEnforceDomain",
    93,
    "Bool"
    /* Type.Bool */
  );
  defineOpt(
    [native_2.Socket],
    "loopbackFastPath",
    94,
    "Bool"
    /* Type.Bool */
  );
})(lib);
const zeromq = /* @__PURE__ */ getDefaultExportFromCjs(lib);
const require2 = createRequire(import.meta.url);
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs"),
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
let pyProc = null;
const createPyProc = () => {
  const script = "C:/Users/rtiamiyu/OneDrive - Ovintiv/Documents/GG/seismic_finder/G&G Network Deletion Tool.py";
  console.log(script);
  pyProc = require2("child_process").spawn("python", [script]);
  if (pyProc != null) {
    console.log("python connected");
  } else {
    console.log("python failed to connected");
  }
};
const connectToPy = async () => {
  new zeromq.Request();
  new zeromq.Pull();
};
const exitPyProc = () => {
  pyProc.kill();
  pyProc = null;
};
app.on("ready", createPyProc);
app.on("ready", connectToPy);
app.on("will-quit", exitPyProc);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
