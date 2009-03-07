/**
 * Extensions for Object for mocking-support. Extend objects with the $m()
 * function.
 */
Test.Unit.MockExtensions = {
  /**
   * Adds an expectation that a method identified by method must be called
   * exactly once with any parameters. Returns the new expectation which can be
   * further modified by methods on Test.Unit.Expectation.
   *
   *   new Test.Unit.Runner({
   *     testShouldExpectMethodCall: function() { with(this) {
   *       o = new Object();
   *       expects(o, 'foo');
   *       o.foo('a', 'b', 'c');
   *     }}
   *   }
   *
   * The above is equivalent to
   *
   *   new Test.Unit.Runner({
   *     testShouldExpectMethodCall: function() { with(this) {
   *       o = $m(new Object());
   *       o.expects('foo');
   *       o.foo('a', 'b', 'c');
   *     }}
   *   }
   *
   * If method is an Array, an expectation will be set up for each entry.
   * 
   *   new Test.Unit.Runner({
   *     testShouldExpectTwoMethodCalls: function() { with(this) {
   *       o = $m(new Object());
   *       o.expects(['foo', 'bar']);
   *       o.foo();
   *       o.bar();
   *     }}
   *   }
   *
   * This is equivalent to
   * 
   *   new Test.Unit.Runner({
   *     testShouldExpectTwoMethodCalls: function() { with(this) {
   *       o = $m(new Object());
   *       o.expects('foo');
   *       o.expects('bar');
   *       o.foo();
   *       o.bar();
   *     }}
   *   }
   *
   * If method is a Hash, an expectation will be set up for each entry using the
   * key as method and value as return.
   * 
   *   new Test.Unit.Runner({
   *     testShouldExpectTwoMethodCallsWithReturnValue: function() { with(this) {
   *       o = $m(new Object());
   *       o.expects({'foo': 1, 'bar': 2});
   *       assert_equal(1, o.foo());
   *       assert_equal(2, o.bar());
   *     }}
   *   }
   *
   * This is equivalent to
   * 
   *   new Test.Unit.Runner({
   *     testShouldExpectTwoMethodCallsWithReturnValue: function() { with(this) {
   *       o = $m(new Object());
   *       o.expects('foo').returns(1);
   *       o.expects('bar').returns(2);
   *       assert_equal(1, o.foo());
   *       assert_equal(2, o.bar());
   *     }}
   *   }
   */
  expects: function(object, method) {
    if (Object.isString(method)) {
      var expectation = new Test.Unit.Expectation(object, method);
      Test.Unit.Mocking.expect(expectation);
      expectation.apply();
      return expectation;
    } else if (Object.isArray(method)) {
      $A(method).each(function(meth) {
        Test.Unit.MockExtensions.expects(object, meth);
      });
    } else {
      $H(method).each(function(pair) {
        Test.Unit.MockExtensions.expects(object, pair.first()).returns(pair.last());
      });
    }
  },
  
  /**
   * Adds an expectation that an objects super class' method must be called
   * exactly once with any parameters. Returns the new expectation which can be
   * further modified by methods on Test.Unit.Expectation.
   *
   *   new Test.Unit.Runner({
   *     testShouldExpectSuperClassMethodCall: function() { with(this) {
   *       var Base = Class.create({
   *         method: function() {}
   *       });
   *       var Sub = Class.create(Base, {
   *         method: function() { Base.prototype.method.apply(this, arguments); }
   *       });
   *    
   *       o = $m(new Sub());
   *       o.expectsSuper('method');
   *       o.method();
   *     }}
   *   }
   */
  expectsSuper: function(object, method) {
    var klass = object.constructor.superclass;
    if (!klass) {
      throw("expectsSuper: object has no super class");
    }
    
    Test.Unit.MockExtensions.expects(klass.prototype, method);
  },
  
  /**
   * Adds an expectation that a method identified by method may be called any
   * number of times with any parameters. Returns the new expectation which can
   * be further modified by methods on Test.Unit.Expectation.
   *
   *   new Test.Unit.Runner({
   *     testShouldStubMethodCall: function() { with(this) {
   *       o = $m(new Object());
   *       o.stubs('foo');
   *       o.foo('a', 'b', 'c');
   *       o.foo(); // no error raised
   *       // or no call at all
   *     }}
   *   }
   *
   * If method is an Array, an expectation will be set up for each entry.
   * 
   *   new Test.Unit.Runner({
   *     testShouldStubTwoMethodCalls: function() { with(this) {
   *       o = $m(new Object());
   *       o.stubs(['foo', 'bar']);
   *       o.foo();
   *       o.foo(); // no error raised
   *       o.bar();
   *       // or no call at all
   *     }}
   *   }
   *
   * This is equivalent to
   * 
   *   new Test.Unit.Runner({
   *     testShouldStubTwoMethodCalls: function() { with(this) {
   *       o = $m(new Object());
   *       o.stubs('foo');
   *       o.stubs('bar');
   *       o.foo();
   *       o.foo(); // no error raised
   *       o.bar();
   *       // or no call at all
   *     }}
   *   }
   *
   * If method is a Hash, an expectation will be set up for each entry using the
   * key as method and value as return.
   * 
   *   new Test.Unit.Runner({
   *     testShouldStubTwoMethodCallsWithReturnValue: function() { with(this) {
   *       o = $m(new Object());
   *       o.stubs({'foo': 1, 'bar': 2});
   *       o.foo();
   *       assert_equal(1, o.foo()); // no error raised
   *       assert_equal(2, o.bar());
   *       // or no call at all
   *     }}
   *   }
   *
   * This is equivalent to
   * 
   *   new Test.Unit.Runner({
   *     testShouldStubTwoMethodCallsWithReturnValue: function() { with(this) {
   *       o = $m(new Object());
   *       o.stubs('foo').returns(1);
   *       o.stubs('bar').returns(2);
   *       o.foo();
   *       assert_equal(1, o.foo()); // no error raised
   *       assert_equal(2, o.bar());
   *       // or no call at all
   *     }}
   *   }
   */
  stubs: function(object, method) {
    if (Object.isString(method)) {
      return Test.Unit.MockExtensions.expects(object, method).anyTime();
    } else if (Object.isArray(method)) {
      $A(method).each(function(meth) {
        Test.Unit.MockExtensions.stubs(object, meth);
      });
    } else {
      $H(method).each(function(pair) {
        Test.Unit.MockExtensions.stubs(object, pair.first()).returns(pair.last());
      });
    }
  },
  
  /**
   * Adds an expectation that an instance of the specified class will be created
   * exactly once. Returns the new expectation which can be further modified by
   * methods on Test.Unit.Expectation.
   *
   *   new Test.Unit.Runner({
   *     testShouldExpectClassInstance: function() { with(this) {
   *       $m(Klass).instantiates();
   *       new Klass();
   *     }}
   *   }
   */
  instantiates: function(klass) {
    return Test.Unit.MockExtensions.expects(klass.prototype, 'initialize');
  }
};

Object.extend(Object, Test.Unit.MockExtensions);

/**
 * Returns object, but extended with the methods from Test.Unit.MockExtensions.
 *
 * This method only needs to be called once per object. It provides a shortcut
 * for the expects(), stubs() and instantiates() methods.
 *
 * Instead of
 *
 *   Object.expects(object, 'method');
 *
 * You can call
 *
 *   $m(object).expects('method');
 */
function $m(object) {
  Object.extend(object, {
    expects: Test.Unit.MockExtensions.expects.methodize(),
    expectsSuper: Test.Unit.MockExtensions.expectsSuper.methodize(),
    stubs: Test.Unit.MockExtensions.stubs.methodize(),
    instantiates: Test.Unit.MockExtensions.instantiates.methodize()
  });
  return object;
}

Test.Unit.Expectation = Class.create({
  /**
   * Sets up a new expectation that method name will be called exactly once on
   * object, with any parameters and no return value.
   */
  initialize: function(object, name) {
    this.object = object;
    this.methodName = name;
    this.originalMethod = object[name];
    
    this.parametersMatcher = new Test.Unit.ParametersMatcher([new Test.Unit.AnyParametersMatcher()]);
    this.cardinalityMatcher = new Test.Unit.ExactCardinalityMatcher(1);
    this.correctParameters = true;
    this.timesCalled = 0;
    this.callArguments = [];
    this.returnValues = [];
    this.negated = false;
  },
  
  /**
   * @inner
   * Moves the original expected method away and replaces it with a method
   * showing the expected behaviour.
   * This method is automatically called.
   */
  apply: function() {
    this.object[this.methodName] = this.call.bind(this);
  },
  
  /**
   * @inner
   * Restores the original expected method. This method is automatically called
   * on teardown.
   */
  restore: function() {
    this.object[this.methodName] = this.originalMethod;
  },
  
  /**
   * @inner
   * Method that simulates the expected behaviour. It matches the expected
   * parameters, increments the call counter and returns the expected return
   * value.
   */
  call: function() {
    this.callArguments.push($A(arguments));
    this.correctParameters = this.correctParameters && this.parametersMatcher.match(arguments);
    this.timesCalled++;
    return this.returnValues.length > 1 ? this.returnValues.shift() : this.returnValues.first();
  },
  
  /**
   * @inner
   * Evaluates if the expectations have been met.
   */
  evaluate: function() {
    this.correctCardinality = this.cardinalityMatcher.match(this.timesCalled);
    var satisfied = this.correctParameters && this.correctCardinality;
    return this.negated ? !satisfied : satisfied;
  },
  
  /**
   * @inner
   * Provides a short description of the expectation.
   */
  toString: function() {
    var string = (this.negated ? "NOT Call" : "Call") + " of method '" + this.methodName;
    string += "' with " + this.parametersMatcher.toString();
    string += ", " + this.cardinalityMatcher.toString();
    var returnString = "" + this.returnValues.collect(function(value) { return Object.inspect(value); }).join(', then ')
    if (returnString.length > 0) {
      string += ", returning " + returnString;
    }
    return string;
  },
  
  /**
   * @inner
   * Provides a detailled description of the expectation, including which
   * expectations have been satisfied, and which have not.
   */
  details: function() {
    string = "";
    if (this.correctParameters) {
      string += 'Parameters were correctly matched. ';
    } else {
      string += 'Parameters were NOT correctly matched. ';
    }
    if (this.correctCardinality) {
      string += 'Expected number of calls was matched. ';
    } else {
      string += 'Expected number of calls was NOT matched. ';
    }
    string += this.timesCalled + ' times called'
    if (this.callArguments.length > 0) {
      string += ', with ' + $A(this.callArguments).collect(function(args) { return Object.inspect($(args)) }).join('; ');
    }
    if (this.negated) {
      string += " NOTE! This expectation was negated."
    }
    return string;
  },
  
  /**
   * Modifies the expectation so that the expected method must be called with
   * the supplied parameters.
   *
   *   object = $m(new Object());
   *   object.expects('method').withArgs('param1', 'param2');
   *   object.method('param1', 'param2'); // succeeds
   *
   *   object = $m(new Object());
   *   object.expects('method').withArgs('param3');
   *   object.method('param1', 'param2'); // fails
   *
   * Parameter matchers may be supplied as arguments.
   */
  withArgs: function() {
    this.parametersMatcher = new Test.Unit.ParametersMatcher(arguments);
    return this;
  },
  
  /**
   * Modifies the expectation so that when the expected method is called, it
   * returns the specified value.
   *
   * This method may be called with multiple arguments, or multiple times. In
   * this case, the values are returned in turn on consecutive calls to the
   * method.
   *
   *   object = $m(new Object());
   *   object.stubs('foo').returns(10, 12);
   *   object.stubs('bar').returns(14).then().returns(16);
   */
  returns: function() {
    this.returnValues = this.returnValues.concat($A(arguments));
    return this;
  },
  
  /**
   * Syntactic sugar for complex expectations. Actually does nothing.
   */
  then: function() {
    return this;
  },
  
  /**
   * Modifies the expectation so that the expected method must be called the
   * specified amount of times.
   *
   *   object = $m(new Object());
   *   object.expects('foo').times(3);
   */
  times: function(card) {
    this.cardinalityMatcher = new Test.Unit.ExactCardinalityMatcher(card);
    return this;
  },
  
  /**
   * Modifies the expectation so that the expected method may be called any
   * amount of times.
   */
  anyTime: function() {
    this.cardinalityMatcher = new Test.Unit.AnyCardinalityMatcher();
    return this;
  },
  
  /**
   * Modifies the expectation so that the expected method must not be called at
   * all.
   */
  never: function() {
    return this.times(0);
  },
  
  /**
   * Modifies the expectation so that the expected method must be called exactly
   * once. This is the default setting.
   */
  once: function() {
    return this.times(1);
  },
  
  /**
   * Modifies the expectation so that the expected method must be called exactly
   * twice.
   */
  twice: function() {
    return this.times(2);
  },
  
  /**
   * Modifies the expectation so that the expected method must be called at
   * least the specified amount of times.
   */
  atLeast: function(times) {
    this.cardinalityMatcher = new Test.Unit.MinimumCardinalityMatcher(times);
    return this;
  },
  
  /**
   * Modifies the expectation so that the expected method must be called at
   * most the specified amount of times.
   */
  atMost: function(times) {
    this.cardinalityMatcher = new Test.Unit.MaximumCardinalityMatcher(times);
    return this;
  },
  
  /**
   * Modifies the expectation so that the expected method must be called any
   * amount of times in the interval specified by from and to.
   */
  between: function(from, to) {
    this.cardinalityMatcher = new Test.Unit.RangeCardinalityMatcher(from, to);
    return this;
  },
  
  /**
   * Negates the expectation, such that it the evaluation fails if all specified
   * criteria are met.
   *
   * In the following example, no instance of class D may be created.
   *
   *   var D = Class.create({});
   *   $m(D).instantiates().not();
   */
  not: function() {
    this.negated = true;
    return this;
  }
});

Test.Unit.ParametersMatcher = Class.create({
  initialize: function(args) {
    this.expectedArgs = $A(args);
  },
  
  match: function(args) {
    var array = $A(args);
    var result = this.matchers().all(function(matcher) {
      return matcher.match(array);
    });
    return result && array.length == 0;
  },
  
  matchers: function() {
    return this.expectedArgs.collect(function(arg) {
      return this.toMatcher(arg);
    }.bind(this));
  },
  
  toMatcher: function(thing) {
    if (Object.keys(thing).include('match')) {
      return thing;
    } else {
      return new Test.Unit.ExactParameterMatcher(thing);
    }
  },

  toString: function() {
    return this.matchers().collect(function(matcher) { return matcher.toString(); }).join(', ');
  }
});

Test.Unit.ParameterMatcher = Class.create({
  match: function(args) {
    throw('Not Implemented');
  },

  toMatcher: function(thing) {
    if (Object.keys(thing).include('match')) {
      return thing;
    } else {
      return new Test.Unit.ExactParameterMatcher(thing);
    }
  }
});

/**
 * Parameter matcher that matches any parameters, even none at all.
 *
 * Don't use this class directly, use the AnyParameters() function instead.
 */
Test.Unit.AnyParametersMatcher = Class.create(Test.Unit.ParameterMatcher, {
  match: function(args) {
    args.clear();
    return true;
  },
  
  toString: function() { return 'any parameters'; }
});

/**
 * Parameter matcher that matches any parameters, even none at all.
 */
function AnyParameters() {
  return new Test.Unit.AnyParametersMatcher();
}

Test.Unit.CompositeParameterMatcher = Class.create(Test.Unit.ParameterMatcher, {
  initialize: function(children) {
    this.childMatchers = children;
  },
  
  matchers: function() {
    return this.childMatchers.collect(function(arg) {
      return this.toMatcher(arg);
    }.bind(this));
  }
});

/**
 * Parameter matcher that matches one parameter against any of the specified
 * parameter matchers.
 *
 * Don't use this class directly, use the AnyOf() function instead.
 */
Test.Unit.AnyOfParameterMatcher = Class.create(Test.Unit.CompositeParameterMatcher, {
  match: function(args) {
    arg = args.shift();
    return this.matchers().any(function(matcher) {
      return matcher.match([arg]);
    });
  },
  
  toString: function() {
    return 'any of (' + this.matchers().collect(function(matcher) {
      return matcher.toString();
    }).join(', ') + ')';
  }
});

/**
 * Parameter matcher that matches any parameters, even none at all.
 */
function AnyOf() {
  return new Test.Unit.AnyOfParameterMatcher($A(arguments));
}

/**
 * Parameter matcher that matches one parameter against all of the specified
 * parameter matchers.
 *
 * Don't use this class directly, use the AllOf() function instead.
 */
Test.Unit.AllOfParameterMatcher = Class.create(Test.Unit.CompositeParameterMatcher, {
  match: function(args) {
    arg = args.shift();
    return this.matchers().all(function(matcher) {
      return matcher.match([arg]);
    });
  },
  
  toString: function() {
    return 'all of (' + this.matchers().collect(function(matcher) {
      return matcher.toString();
    }).join(', ') + ')';
  }
});

/**
 * Parameter matcher that matches any parameters, even none at all.
 */
function AllOf() {
  return new Test.Unit.AllOfParameterMatcher($A(arguments));
}

/**
 * Parameter matcher that matches if no parameters are given.
 *
 * Don't use this class directly, use the NoParameters() function instead.
 */
Test.Unit.NoParametersMatcher = Class.create(Test.Unit.ParameterMatcher, {
  match: function(args) {
    return args.length == 0;
  },
  
  toString: function() { return 'no parameters'; }
});

/**
 * Parameter matcher that matches if no parameters are given.
 */
function Nothing() {
  return new Test.Unit.NoParametersMatcher();
}

/**
 * Parameter matcher that matches one exactly specified parameter.
 *
 * Don't use this class directly, just write out the parameter itself, or use
 * the Exactly() function.
 */
Test.Unit.ExactParameterMatcher = Class.create(Test.Unit.ParameterMatcher, {
  initialize: function(argument) {
    this.expectedArg = argument;
  },
  
  match: function(args) {
    return args.shift() == this.expectedArg;
  },

  toString: function() {
    return Object.inspect(this.expectedArg);
  }
});

/**
 * Parameter matcher that matches one exactly specified parameter.
 */
function Exactly(arg) {
  return new Test.Unit.ExactParameterMatcher(arg);
}

/**
 * Parameter matcher that matches any one parameter.
 *
 * Don't use this class directly, use the AnyParameter() or Anything() functions
 * instead.
 */
Test.Unit.AnyParameterMatcher = Class.create(Test.Unit.ParameterMatcher, {
  match: function(args) {
    return args.shift() !== undefined;
  },
  
  toString: function() { return 'any parameter'; }
});

/**
 * Parameter matcher that matches any one parameter. Alias for Anything().
 */
function AnyParameter() {
  return new Test.Unit.AnyParameterMatcher();
}

/**
 * Parameter matcher that matches any one parameter. Alias for AnyParameter().
 */
function Anything() {
  return AnyParameter();
}

/**
 * Parameter matcher that matches a hash parameter having the specified keys and
 * values.
 *
 * Don't use this class directly, use the Having() function instead.
 */
Test.Unit.HavingMatcher = Class.create(Test.Unit.ParameterMatcher, {
  initialize: function(hash) {
    this.hash = $H(hash);
  },
  
  match: function(args) {
    arg = args.shift();
    return this.hash.any(function(pair) {
      return arg[pair.first()] == pair.last();
    }.bind(this));
  },
  
  toString: function() {
    return '[hash containing ' + Object.inspect(this.hash) + ']';
  }
});

/**
* Parameter matcher that matches a hash parameter having the specified keys and
* values.
 */
function Having(hash) {
  return new Test.Unit.HavingMatcher($H(hash));
}

/**
 * Parameter matcher that matches a hash parameter having the specified key.
 *
 * Don't use this class directly, use the HavingKey() function instead.
 */
Test.Unit.HavingKeyMatcher = Class.create(Test.Unit.ParameterMatcher, {
  initialize: function(matcher) {
    this.matcher = this.toMatcher(matcher);
  },
  
  match: function(args) {
    arg = $H(args.shift());
    return arg.any(function(pair) {
      return this.matcher.match([pair.first()]);
    }.bind(this));
  },
  
  toString: function() {
    return '[hash with key ' + this.matcher.toString() + ']';
  }
});

/**
* Parameter matcher that matches a hash parameter having the specified key.
 */
function HavingKey(key) {
  return new Test.Unit.HavingKeyMatcher(key);
}

/**
 * Parameter matcher that matches a hash parameter having the specified value.
 *
 * Don't use this class directly, use the InstanceValue() function instead.
 */
Test.Unit.HavingValueMatcher = Class.create(Test.Unit.ParameterMatcher, {
  initialize: function(matcher) {
    this.matcher = this.toMatcher(matcher);
  },
  
  match: function(args) {
    arg = $H(args.shift());
    return arg.any(function(pair) {
      return this.matcher.match([pair.last()]);
    }.bind(this));
  },
  
  toString: function() {
    return '[hash with value ' + this.matcher.toString() + ']';
  }
});

/**
 * Parameter matcher that matches any parameter that is an instance of class
 * klass.
 */
function HavingValue(key) {
  return new Test.Unit.HavingValueMatcher(key);
}

/**
 * Parameter matcher that matches any parameter that is an instance of class
 * klass.
 *
 * Don't use this class directly, use the InstanceOf() function instead.
 */
Test.Unit.InstanceOfMatcher = Class.create(Test.Unit.ParameterMatcher, {
  initialize: function(klass) {
    this.expectedClass = klass;
  },
  
  match: function(args) {
    return args.shift() instanceof this.expectedClass;
  },
  
  toString: function() {
    return '[instanceof ' + Object.inspect(this.expectedClass) + ']';
  }
});

/**
 * Parameter matcher that matches any parameter that is an instance of class
 * klass.
 */
function InstanceOf(klass) {
  return new Test.Unit.InstanceOfMatcher(klass);
}

/**
 * Parameter matcher that matches the elements of an array parameter against
 * another parameter matcher.
 *
 * Don't use this class directly, use the Includes() function instead.
 */
Test.Unit.IncludesParameterMatcher = Class.create(Test.Unit.ParameterMatcher, {
  initialize: function(matcher) {
    this.matcher = this.toMatcher(matcher);
  },
  
  match: function(args) {
    arg = args.shift();
    return Object.isArray(arg) && $A(arg).any(function(element) {
      return this.matcher.match([element]);
    }.bind(this));
  },
  
  toString: function() {
    return '[including ' + this.matcher.toString() + ']';
  }
});

/**
 * Parameter matcher that matches the elements of an array parameter against
 * another parameter matcher.
 */
function Includes(matcher) {
  return new Test.Unit.IncludesParameterMatcher(matcher);
}

/**
 * Parameter matcher that matches a string parameter against a specified
 * regular expression.
 *
 * Don't use this class directly, use the SomethingLike() function instead.
 */
Test.Unit.RegexpParameterMatcher = Class.create(Test.Unit.ParameterMatcher, {
  initialize: function(regexp) {
    this.regexp = regexp;
  },
  
  match: function(args) {
    return this.regexp.match(args.shift());
  },
  
  toString: function() {
    return 'regexp ' + Object.inspect(this.regexp);
  }
});

/**
 * Parameter matcher that matches a string parameter against a specified
 * regular expression.
 */
function SomethingLike(klass) {
  return new Test.Unit.RegexpParameterMatcher(klass);
}

/**
 * Parameter matcher that matches an object parameter that responds to method,
 * optionally returing return.
 *
 * Don't use this class directly, use the RespondsWith() function instead.
 */
Test.Unit.RespondsWithParameterMatcher = Class.create(Test.Unit.ParameterMatcher, {
  initialize: function(method, returnValue) {
    this.method = method;
    this.returnValue = returnValue
  },
  
  match: function(args) {
    obj = args.shift();
    if (this.returnValue === undefined) {
      return obj[this.method];
    } else {
      return obj[this.method] && obj[this.method]();
    }
  },
  
  toString: function() {
    var string = 'responds with "' + this.method + '"'
    if (this.returnValue !== undefined) {
      string += ' returning ' + Object.inspect(this.returnValue);
    }
    return string;
  }
});

/**
* Parameter matcher that matches an object parameter that responds to method,
* optionally returing return.
 */
function RespondsWith(method, returnValue) {
  return new Test.Unit.RespondsWithParameterMatcher(method, returnValue);
}

/**
 * Parameter matcher that matches if the child parameter matcher doesn't match.
 *
 * Don't use this class directly, use the SomethingLike() function instead.
 */
Test.Unit.NotParameterMatcher = Class.create(Test.Unit.ParameterMatcher, {
  initialize: function(matcher) {
    this.matcher = this.toMatcher(matcher);
  },
  
  match: function(args) {
    return !this.matcher.match(args);
  },
  
  toString: function() {
    return 'not ' + this.matcher;
  }
});

/**
* Parameter matcher that matches if the child parameter matcher doesn't match.
 */
function Not(klass) {
  return new Test.Unit.NotParameterMatcher(klass);
}

Test.Unit.AnyCardinalityMatcher = Class.create({
  match: function(times) { return true; },
  toString: function() { return 'zero or more times' }
});

Test.Unit.ExactCardinalityMatcher = Class.create({
  initialize: function(times) {
    this.cardinality = times;
  },
  
  match: function(times) {
    return times == this.cardinality;
  },
  
  toString: function() {
    return 'exactly ' + this.cardinality + ' times';
  }
});

Test.Unit.RangeCardinalityMatcher = Class.create({
  initialize: function(from, to) {
    this.from = from;
    this.to = to;
  },
  
  match: function(times) {
    return this.from <= times && times <= this.to;
  },
  
  toString: function() {
    return 'between ' + this.from + ' and ' + this.to + ' times';
  }
});

Test.Unit.MinimumCardinalityMatcher = Class.create({
  initialize: function(times) {
    this.cardinality = times;
  },
  
  match: function(times) {
    return times >= this.cardinality;
  },
  
  toString: function() {
    return 'at least ' + this.cardinality + ' times';
  }
});

Test.Unit.MaximumCardinalityMatcher = Class.create({
  initialize: function(times) {
    this.cardinality = times;
  },
  
  match: function(times) {
    return times <= this.cardinality;
  },
  
  toString: function() {
    return 'at most ' + this.cardinality + ' times';
  }
});

Object.extend(Array.prototype, {
  equals: function(other) {
    return this.zip(other).all(function(pair) { return pair[0] == pair[1] });
  }
});

/**
 * Returns an empty object, that expects the specified methods, and returns the
 * specified values, if given.
 *
 *   o = mock();
 *   o = mock(['foo', 'bar']);
 *   o = mock({'foo': 1, 'bar': 2});
 */
function mock(methods) {
  var result = $m(new Object());
  result.expects(methods);
  return result;
}

/**
 * Returns an empty object, that stubs the specified methods, and returns the
 * specified values, if given.
 *
 *   o = stub();
 *   o = stub(['foo', 'bar']);
 *   o = stub({'foo': 1, 'bar': 2});
 */
function stub(methods) {
  var result = $m(new Object());
  result.stubs(methods);
  return result;
}

Test.Unit.Mocking = {
  expect: function(expectation) {
    Test.Unit.Mocking.expectations.push(expectation);
  },
  
  setupWithMocking: function() {
    Test.Unit.Mocking.expectations = $A([]);
  },
  
  teardownWithMocking: function() {
    try {
      Test.Unit.Mocking.expectations.each(function(expectation) {
        if (expectation.evaluate()) {
          this.pass();
        } else {
          this.fail("Expectation " + expectation.toString() + " not satisfied. Details: " + expectation.details());
        }
      }.bind(this));
    } catch(e) {}
    
    Test.Unit.Mocking.expectations.reverse().each(function(expectation) {
      expectation.restore();
    });
  }
};

/**
 * Returns a stub that behaves like a javascript event.
 */
function MockEvent(options) {
  var defaultOptions = { stop: true, 
                         preventDefault: true,
                         stopPropagation: true};
                         
  return stub(options ? $H(defaultOptions).merge(options) : defaultOptions);
}

Object.extend(Test.Unit.Testcase.prototype, Test.Unit.Mocking);

Test.Unit.Testcase.registerSetupHook(Test.Unit.Testcase.prototype.setupWithMocking);
Test.Unit.Testcase.registerTeardownHook(Test.Unit.Testcase.prototype.teardownWithMocking);
