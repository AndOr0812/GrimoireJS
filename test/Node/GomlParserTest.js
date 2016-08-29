import '../XMLDomInit'
import test from 'ava';
import sinon from 'sinon';
import GomlParser from "../../lib-es5/Core/Node/GomlParser";
import xmldom from 'xmldom';
import GrimoireInterface from "../../lib-es5/Core/GrimoireInterface"
import NSIdentity from "../../lib-es5/Core/Base/NSIdentity"
import jsdomAsync from "../JsDOMAsync";
import {
  goml,
  stringConverter,
  testComponent1,
  testComponent2,
  testComponentBase,
  testComponentOptional,
  testNode1,
  testNode2,
  testNodeBase,
  conflictNode1,
  conflictNode2,
  conflictComponent1,
  conflictComponent2
} from "./_TestResource/GomlParserTest_Registering";

function loadFromTestResource(path) {
  return require("./_TestResource/" + path);
}

// Get element from test case source which is located with relative path.
function obtainElementTag(path) {
  const DOMParser = xmldom.DOMParser;
  global.Node = {
    ELEMENT_NODE: 1
  };
  const parser = new DOMParser();
  return parser.parseFromString(loadFromTestResource(path), "text/xml").documentElement;
}

test.afterEach(() => {
  GrimoireInterface.clear();
});

let stringConverterSpy,
  testComponent1Spy,
  testComponent2Spy,
  testComponentBaseSpy,
  testComponentOptionalSpy,
  conflictComponent1Spy,
  conflictComponent2Spy;

test.beforeEach(async () => {
  global.document = (await jsdomAsync("<html></html>",[])).document;
  goml();
  testNode1();
  testNode2();
  testNodeBase();
  conflictNode1();
  conflictNode2();
  stringConverterSpy = stringConverter();
  testComponent1Spy = testComponent1();
  testComponent2Spy = testComponent2();
  testComponentBaseSpy = testComponentBase();
  testComponentOptionalSpy = testComponentOptional();
  conflictComponent1Spy = conflictComponent1();
  conflictComponent2Spy = conflictComponent2();
  registerUserPlugin();
});


function registerUserPlugin() {
  const ns1 = "http://testNamespace/test1";
  const ns2 = "http://testNamespace/test2";
  const id_a = new NSIdentity(ns1, "conflictNode");
  const id_b = new NSIdentity(ns2, "conflictNode");
  const id_a_c = new NSIdentity(ns1, "conflictComponent");
  const id_b_c = new NSIdentity(ns2, "conflictComponent");
  GrimoireInterface.registerNode(id_a, ["testComponent2"], {
    attr1: "nodeA"
  }, null, null);
  GrimoireInterface.registerNode(id_b, ["testComponent2"], {
    attr1: "nodeB"
  });
  GrimoireInterface.registerComponent(id_a_c, {
    value: {
      converter: "stringConverter",
      defaultValue: "aaa"
    }
  }, {
    conf1: function(obj) {
      const v = this.attributes.get("value").Value;
      obj.value = v;
    //  console.log("component conf1 ::" + v);
    }
  });
  GrimoireInterface.registerComponent(id_b_c, {
    value: {
      converter: "stringConverter",
      defaultValue: "bbb"
    }
  });
  GrimoireInterface.registerNode("scenes");
  GrimoireInterface.registerNode("scene");
}



test('test for parsing node hierarchy.', (t) => {
  const element = obtainElementTag("GomlParserTest_Case1.goml");
  const node = GomlParser.parse(element);
  t.truthy(node.parent === null);
  t.truthy(node.children.length === 1);
  const c = node.children[0];
  t.truthy(c.parent === node);
  t.truthy(c.children.length === 2);
  t.truthy(c.children[0].children.length === 0);
  t.truthy(c.children[0].parent === c);
  t.truthy(c.children[1].children.length === 0);
  t.truthy(c.children[1].parent === c);
});

test('test for send/broadcastMessage and component Attribute parsing.', (t) => {
  const element = obtainElementTag("GomlParserTest_Case2.goml");
  const node = GomlParser.parse(element);
  t.truthy(node.parent === null);
  sinon.assert.notCalled(stringConverterSpy);
});

test('test for parse user-define component.', (t) => {
  const element = obtainElementTag("GomlParserTest_Case3.goml");
  const node = GomlParser.parse(element);
  sinon.assert.notCalled(stringConverterSpy);
  node.broadcastMessage("onTest", "testArg");
  sinon.assert.neverCalledWith(testComponent1Spy, "testArg");
  sinon.assert.neverCalledWith(testComponent2Spy, "testArg");
  sinon.assert.neverCalledWith(testComponentOptionalSpy, "testArg");
  // TODO uncomment this. sinon.assert.calledWith(testComponentBaseSpy, "testArg");
  sinon.assert.neverCalledWith(stringConverterSpy, "hugahuga");
  sinon.assert.neverCalledWith(stringConverterSpy, "123");
  //sinon.assert.calledWith(stringConverterSpy, "hogehoge");
  sinon.assert.neverCalledWith(stringConverterSpy, "999");
});

test('test for namespace parsing.', (t) => {
  const element = obtainElementTag("GomlParserTest_Case4.goml");
  const node = GomlParser.parse(element);
  node.broadcastMessage("onTest","testArg");
  sinon.assert.notCalled(conflictComponent1Spy);
  sinon.assert.neverCalledWith(conflictComponent1Spy,"aaa");
  sinon.assert.neverCalledWith(conflictComponent2Spy,"bbb");
});

test('test for companion', (t) => {
  const element = obtainElementTag("GomlParserTest_Case4.goml");
  const node = GomlParser.parse(element);
  const components = node.children[0].getComponents();
  const ns1 = new NSIdentity("http://testNamespace/test1","conflictComponent");
  const ns2 = new NSIdentity("http://testNamespace/test2","conflictComponent");
  const compo1 = components.find((comp)=>ns1.fqn === comp.name.fqn);
  const compo2 = components.find((comp)=>ns2.fqn === comp.name.fqn);
  t.truthy(compo1.companion === compo2.companion);
});

test('treeInterface must be same if the node is included in same tree', (t) => {
  const element = obtainElementTag("GomlParserTest_Case4.goml");
  const node = GomlParser.parse(element);
  const original = node._treeInterface;
  node.callRecursively(v=>{
    t.truthy(original === v._treeInterface);
  });
});
