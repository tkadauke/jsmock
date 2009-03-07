new Test.Unit.Runner({
  setup: function() {
    this.o = $m(new Object());
    this.p = $m(new Object());
  },
  
  testShouldProvideDetailsAboutExpectation: function() { with(this) {
    exp = new Test.Unit.Expectation(o, 'foo');
    exp.correctParameters = true;
    exp.correctCardinality = true;
    assert(!/NOT/.match(exp.details()));

    exp.correctParameters = false;
    exp.correctCardinality = true;
    assert(/Parameters were NOT/.match(exp.details()));

    exp.correctParameters = true;
    exp.correctCardinality = false;
    assert(/calls was NOT/.match(exp.details()));
    
    exp.callArguments = [1];
    exp.correctCardinality = true;
    assert(/with 1/.match(exp.details()));
    
    exp.negated = true;
    assert(/negated/.match(exp.details()));
  }},
  
  testShouldNegateExpectation: function() { with(this) {
    info(o.expects('foo').not().toString());
  }},
  
  testShouldThrowExceptionIfParameterMatcherNotImplemented: function() { with(this) {
    var matcher = new Test.Unit.ParameterMatcher();
    assertRaise(undefined, function() {
      matcher.match();
    });
  }},
  
  testShouldMatchAnyParametersByDefault: function() { with(this) {
    info(o.expects('foo').toString());
    o.foo('a', 'b', 'c');
  }},
  
  testShouldMatchNoParameters: function() { with(this) {
    info(o.expects('foo').withArgs(Nothing()).toString());
    o.foo();

    info(p.expects('foo').withArgs(Nothing()).not().toString());
    p.foo(1);
  }},
  
  testShouldMatchAnyParameters: function() { with(this) {
    info(o.expects('foo').withArgs(AnyParameters()).toString());
    o.foo('a', 'b', 'c');
  }},

  testShouldMatchAnyParameter: function() { with(this) {
    info(o.expects('foo').withArgs(Anything()).toString());
    o.foo('a');

    info(p.expects('foo').withArgs(Anything()).not().toString());
    p.foo();
  }},
  
  testShouldMatchAnyMatcherAgainstParameter: function() { with(this) {
    info(o.expects('foo').withArgs(AnyOf(1, 2)).toString());
    o.foo(2);
  }},
  
  testShouldMatchAllMatchersAgainstParameter: function() { with(this) {
    info(o.expects('foo').withArgs(AllOf(SomethingLike(/hello/), SomethingLike(/world/))).toString());
    o.foo('hello world');
  }},
  
  testShouldMatchArrayElementsAgainstMatcher: function() { with(this) {
    info(o.expects('foo').withArgs(Includes(1)).toString());
    o.foo([3, 5, 1, 2]);
  }},
  
  testShouldMatchExactParameter: function() { with(this) {
    info(o.expects('foo').withArgs('a').toString());
    o.foo('a');
    
    info(p.expects('foo').withArgs(Exactly('b')).toString());
    p.foo('b');

    q = $m(new Object());
    info(q.expects('foo').withArgs(Exactly('b')).not().toString());
    q.foo('c');
  }},

  testShouldMatchInstanceOfParameter: function() { with(this) {
    info(o.expects('foo').withArgs(InstanceOf(Array)).toString());
    o.foo([1]);

    info(p.expects('foo').withArgs(InstanceOf(Array)).not().toString());
    p.foo('hello');
  }},
  
  testShouldMatchHavingParameter: function() { with(this) {
    info(o.expects('foo').withArgs(Having({a: 10})).toString());
    o.foo({b: 13, a: 10});

    info(p.expects('foo').withArgs(Having({a: 10})).not().toString());
    p.foo({b: 13});
  }},
  
  testShouldMatchHavingKeyInParameter: function() { with(this) {
    info(o.expects('foo').withArgs(HavingKey('a')).toString());
    o.foo({'b': 13, 'a': 10});

    info(p.expects('foo').withArgs(HavingKey('a')).not().toString());
    p.foo({'c': 13, 'd': 10});
  }},
  
  testShouldMatchHavingValueInParameter: function() { with(this) {
    info(o.expects('foo').withArgs(HavingValue(13)).toString());
    o.foo({'b': 13, 'a': 10});

    info(p.expects('foo').withArgs(HavingValue(13)).not().toString());
    p.foo({'b': 19, 'c': 15});
  }},
  
  testShouldMatchRegexpParameter: function() { with(this) {
    info(o.expects('foo').withArgs(SomethingLike(/hello/)).toString());
    o.foo('hello world');

    info(p.expects('foo').withArgs(SomethingLike(/hello/)).not().toString());
    p.foo('hallo world');
  }},
  
  testShouldMatchRespondingParameter: function() { with(this) {
    p = stub(['bar'])
    info(o.expects('foo').withArgs(RespondsWith('bar')).toString());
    o.foo(p);

    q = $m(new Object());
    r = stub(['bar'])
    info(q.expects('foo').withArgs(RespondsWith('bar')).not().toString());
  }},
  
  testShouldMatchRespondingParameterWithReturnValue: function() { with(this) {
    p = stub({'bar': 1})
    info(o.expects('foo').withArgs(RespondsWith('bar', 1)).toString());
    o.foo(p);

    q = $m(new Object());
    r = stub({'bar': 1})
    info(q.expects('foo').withArgs(RespondsWith('bar', 1)).not().toString());
  }},
  
  testShouldNotMatchParameter: function() { with(this) {
    info(o.expects('foo').withArgs(Not(SomethingLike(/hallo/))).toString());
    o.foo('hello world');

    info(p.expects('foo').withArgs(Not(SomethingLike(/hallo/))).not().toString());
    p.foo('hallo world');
  }},
  
  testShouldMatchNoCall: function() { with(this) {
    info(o.expects('foo').never().toString());

    info(p.expects('foo').never().not().toString());
    p.foo();
  }},
  
  testShouldMatchOneCall: function() { with(this) {
    info(o.expects('foo').once().toString());
    o.foo('a');

    info(p.expects('foo').once().not().toString());
  }},
  
  testShouldMatchTwoCalls: function() { with(this) {
    info(o.expects('foo').twice().toString());
    o.foo('a');
    o.foo('b');

    info(p.expects('foo').twice().not().toString());
    p.foo('a');
  }},
  
  testShouldMatchSpecifiedCalls: function() { with(this) {
    info(o.expects('foo').times(5).toString());
    o.foo('a');
    o.foo('b');
    o.foo('c');
    o.foo('d');
    o.foo('e');
  }},
  
  testShouldMatchMinimumCalls: function() { with(this) {
    info(o.expects('foo').atLeast(3).toString());
    o.foo('a');
    o.foo('b');
    o.foo('c');
    o.foo('d');
    o.foo('e');

    info(p.expects('foo').atLeast(3).not().toString());
    p.foo('a');
    p.foo('b');
  }},
  
  testShouldMatchMaximumCalls: function() { with(this) {
    info(o.expects('foo').atMost(3).toString());
    o.foo('a');
    o.foo('b');

    info(p.expects('foo').atMost(3).not().toString());
    p.foo('a');
    p.foo('b');
    p.foo('c');
    p.foo('d');
  }},
  
  testShouldMatchRangeCalls: function() { with(this) {
    info(o.expects('foo').between(3, 5).toString());
    o.foo('a');
    o.foo('b');
    o.foo('c');
    o.foo('d');

    o.expects('foo').between(3, 5).not();
    o.foo('a');
  }},
  
  testShouldMatchAnyCalls: function() { with(this) {
    info(o.expects('foo').anyTime().toString());
    o.foo('a');
    o.foo('b');
    o.foo('c');
    o.foo('d');
  }},
  
  testShouldExpectMultipleCalls: function() { with(this) {
    o.expects(['foo', 'bar']);
    o.foo();
    o.bar();
  }},
  
  testShouldExpectMultipleCallsWithReturnValue: function() { with(this) {
    o.expects({'foo': 1, 'bar': 2});
    assertEqual(1, o.foo());
    assertEqual(2, o.bar());
  }},
  
  testShouldStubMethod: function() { with(this) {
    info(o.stubs('foo').toString());
    o.foo();
    o.foo();
  }},
  
  testShouldStubMultipleMethods: function() { with(this) {
    o.stubs(['foo', 'bar']);
    o.foo();
    o.foo();
    o.bar();
  }},
  
  testShouldStubMultipleMethodsWithReturnValue: function() { with(this) {
    o.stubs({'foo': 1, 'bar': 2});
    assertEqual(1, o.foo());
    assertEqual(1, o.foo());
    assertEqual(2, o.bar());
  }},
  
  testShouldMatchInitialization: function() { with(this) {
    var C = Class.create({});
    info($m(C).instantiates().toString());
    new C();

    var D = Class.create({});
    info($m(D).instantiates().not().toString());
  }},
  
  testShouldReturnSpecifiedValue: function() { with(this) {
    info(o.expects('foo').returns(10).toString());
    assertEqual(10, o.foo());
  }},
  
  testShouldReturnArrayValue: function() { with(this) {
    info(o.expects('foo').returns([10]).toString());
    assertEqual(10, o.foo()[0]);
  }},
  
  testShouldExpectDifferentValuesOnSubsequentCalls: function() { with(this) {
    info(o.expects('foo').twice().returns(10, 12).toString());
    info(o.expects('bar').twice().returns(14).then().returns(16).toString());
    assertEqual(10, o.foo());
    assertEqual(12, o.foo());
    assertEqual(14, o.bar());
    assertEqual(16, o.bar());
  }},
  
  testShouldStubDifferentValuesOnSubsequentCalls: function() { with(this) {
    info(o.stubs('foo').returns(10, 12).toString());
    info(o.stubs('bar').returns(14).then().returns(16).toString());
    assertEqual(10, o.foo());
    assertEqual(12, o.foo());
    assertEqual(12, o.foo());
    assertEqual(14, o.bar());
    assertEqual(16, o.bar());
  }},
  
  testShouldReturnArrayValueOnSubsequentCalls: function() { with(this) {
    info(o.stubs('foo').returns([10]).then().returns([5]).toString());
    assert($A(o.foo()).equals([10]));
    assert($A(o.foo()).equals([5]));
  }},
  
  testShouldMatchArgumentsAndCardinality: function() { with(this) {
    info(o.expects('foo').withArgs('a').times(5).toString());
    o.foo('a');
    o.foo('a');
    o.foo('a');
    o.foo('a');
    o.foo('a');
  }},
  
  testShouldExpectOverriddenSuperclassMethod: function() { with(this) {
    var Base = Class.create({
      method: function() {}
    });
    var Sub = Class.create(Base, {
      method: function() { Base.prototype.method.apply(this, arguments); }
    });
    
    o = $m(new Sub());
    o.expectsSuper('method');
    o.method();
  }},
  
  testShouldExpectNonOverriddenSuperclassMethod: function() { with(this) {
    var Base = Class.create({
      method: function() {}
    });
    var Sub = Class.create(Base, {});
    
    o = $m(new Sub());
    o.expectsSuper('method');
    o.method();
  }},
  
  testShouldCreateMock: function() { with(this) {
    var obj = mock();
    var obj2 = mock(['foo']);
    obj2.foo();
    var obj3 = mock({'foo': 1});
    assertEqual(1, obj3.foo());
  }},

  testShouldCreateStub: function() { with(this) {
    var obj = stub();
    var obj2 = stub(['foo']);
    var obj3 = stub({'foo': 1});
    assertEqual(1, obj3.foo());
  }},
  
  testShouldCreateMockEvent: function() { with(this) {
    var event = MockEvent();
    assert(event.stop());
    assert(event.preventDefault());
    assert(event.stopPropagation());
  }},
  
  testShouldRestoreExpectationsInReverseOrder: function() { with(this) {
    var o = $m({'foo': function() { return 0; }});
    o.expects('foo').returns(1);
    assertEqual(1, o.foo());

    o.expects('foo').returns(2);
    assertEqual(2, o.foo());
    this.teardownWithMocking();
    
    assertEqual(0, o.foo());
  }}
});
