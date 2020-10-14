const log = console.log;
const clear = console.clear;

// creation
{
  // 1. literal
  const o = {
    k: "v",
  };

  // 2. constructor
  const _o = new Object();
  _o.k = "v";
}

// auto-boxing
{
  const s = "A";
  log(typeof s); // "string"
  log(s instanceof String);

  const _s = new String("B");
  log(typeof _s); // "object"
  log(_s instanceof String); // true

  // auto-boxing
  log(s.length); // String('A').length, 1
}

clear();

// property
{
  const o = {
    k: 1,
    3: 1,
  };

  // key-access
  log(o["k"]); // 1
  log(o["3"]); // 1

  // property-access
  log(o.k); // 1
  // log(o.3); // syntax error

  // computed property
  o["_" + "k"] = 2;
  log(o["_k"]); // 2
  log(o._k); // 2

  function qux() {
    // ...
  }

  o.foo = qux;

  const _o = {
    bar: qux,
  };

  _o.baz = o.foo;

  // foo, bar, baz are pointer(= reference)
  log(o.foo === _o.bar); // true
  log(_o.baz === _o.bar); // true
}

clear();

// array
{
  const l = [1, 2, 3];
  log(l.length); // 3

  l.foo = "foo";
  log(l.length); // 3

  l["4"] = 3;
  log(l); // [1, 2, 3, <1 empty item>, 3, foo: 'foo']
  log(l.length); // 5
}

// object copy
{
  // shallow-copy: Object.assign()
  {
    const o = { a: 1, foo: { _a: 1 } };
    const _o = Object.assign({}, o);
    log(o === _o); // false

    log(o.a); // 1
    _o.a = 2;
    log(_o.a); // 2

    log(o.foo === _o.foo); // true

    _o.foo._a = 2;
    log(o.foo._a); // 2
    log(_o.foo._a); // 2
  }

  // deep-copy: Object.freeze()
  {
    const o = { a: 1, foo: { _a: 1 } };
    const _o = Object.assign({}, o);

    Object.freeze(o);

    o.a = 2; // ignore

    log(o.a); // 1
    log(Object.isFrozen(o)); // trues

    o.foo._a = 3; // change
    log(o.foo._a); // 3

    function deepFreeze(o) {
      const props = Object.getOwnPropertyNames(o);

      props.forEach((prop) => {
        const value = o[prop];

        if (typeof value === "object" && value !== null) deepFreeze(value);
      });

      return Object.freeze(o);
    }
  }
}

clear();

// property-descriptor
{
  // Object.getOwnPropertyDescriptor()
  // Object.defineProperty()
  const o = {
    a: 1,
  };

  log(Object.getOwnPropertyDescriptor(o, "a")); // { value: 1, writable: true, enumerable: true, configurable: true }

  Object.defineProperty(o, "a", {
    value: 2,
    writable: true,
    configurable: true,
    enumerable: true,
  });

  log(Object.getOwnPropertyDescriptor(o, "a")); // { value: 2, writable: true, enumerable: true, configurable: true }

  // writable - value
  // configurable - defineProperty()
  // enumerable -  for-in

  // immutability
  // 1. constant
  {
    const o = {};
    Object.defineProperty(o, "CONST_NUMBER", {
      value: 10,
      writable: false,
      configurable: false,
    });
  }

  // 2. Object.preventExtensions()
  {
    const o = {};
    Object.preventExtensions(o);

    o.a = 2;
    log(o.a); // undefined
  }

  clear();

  // 3. Object.seal()
  {
    const o = { a: 1 };
    Object.seal(o);

    o.b = 2;
    log(o.b); // undefined

    // Object.defineProperty() - X
    o.a = 2;
    log(o.a); // 2

    delete o.a;
    log(o.a); // 2
  }

  // 4. Object.freeze()
  {
    const foo = {
      b: 2,
    };

    const o = {
      a: 1,
      foo,
    };

    Object.freeze(o);

    o.a = 2;
    log(o.a); // 1

    // shallow
    o.foo.b = 3;
    log(o.foo.b); // 3

    foo.b = 4;
    log(foo.b); // 4
  }
}

// getter and setter
{
  let o = {
    a: 1,
  };

  // [[Get]] Operation
  log(o.a); // success, 1
  log(o.b); // failure, undefined

  // identifier search failure - ReferenceError
  // property search failure - undefined

  // [[Put]] Operation
  // 1. is Accessor Discriptor? (getter or setter)
  // 2. writable: false -> TypeError
  // 3. proprty setting

  Object.defineProperty(o, "b", {
    get: function () {
      return this.a * 2;
    },
    enumerable: true,
  });

  log(o.b); // 2

  o = {
    get c() {
      return 3;
    },
  };

  log(o.c); // 3

  const _o = {
    get d() {
      return this.d;
    },
    set d(v) {
      this.d = v;
    },
  };

  o.d = 4;
  log(o.d); // 4
}

clear();

// Property check: in vs. hasOwnProperty()
{
  const o = {
    a: 1,
  };

  log("a" in o); // true
  log(o.hasOwnProperty("a")); // true

  log("toString" in o); // true, Object.prototype.toString() "prototype chaining"

  // good
  log(Object.prototype.hasOwnProperty(o, "toString")); // false
}

// Property get keys: keys() vs. getOwnPropertyNames()
{
  const o = {};
  Object.defineProperty(o, "a", {
    value: 1,
    enumerable: true,
  });

  Object.defineProperty(o, "b", {
    value: 2,
    enumerable: false,
  });

  log(o.propertyIsEnumerable("a")); // true
  log(o.propertyIsEnumerable("b")); // false

  // "no-prototype chaining"
  log(Object.keys(o)); // ['a']
  log(Object.getOwnPropertyNames(o)); // ['a', 'b']
}
