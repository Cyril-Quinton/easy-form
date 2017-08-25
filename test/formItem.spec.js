import { FormItem } from '../src/FormItem.js';
import { buildForm } from '../src/FormBuilder.js';
import { Navigator } from '../src/Navigator.js';
import { observable } from 'mobx';
import { assert, expect, to, be } from 'chai';

const FORM_DATA = {
  descriptor: {
    name: "top",
  },
  children: [
    {
      descriptor: {
        name: "s1"
      },
      children: [
        {
          descriptor: {
            name: "q1",
            componentName: "Q1",
            description: "this question is a non-sense",
            validateFunction: (userValue, answers) => { return userValue === "toto" && answers.get("top/s1/q2") > 2 }
          }
        },
        {
          descriptor: {
            name: "q2",
            componentName: "NumberInput",
            description: "how many times have you eaten a good roulé?",
            validateFunction: (userVal) => { return userVal >= 0 }
          }
        }
      ]
    },
    {
      descriptor: {
        name: "s2"
      },
      children: [
        {
          descriptor: {
            name: "q1",
            componentName: "StringInput",
            description: "Who cares"
          }
        },
        {
          descriptor: {
            name: "q2",
            componentName: "String Input",
            description: "another random input"
          }
        }
      ]
    }
  ]
}

const FORM_DATA_2 = {
  descriptor: {
    name: "top"
  },
  children: [
    {
      descriptor: {
        name: "q1",
        validateFunction: (val) => typeof val === "string"
      }
    },
    {
      descriptor: {
        name: "q2",
        validateFunction: (val) => typeof val === "number"
      }
    },
    {
      descriptor: {
        name: "q3",
        validateFunction: (val) => typeof val === "number"
      }
    }
  ]
}

const FORM_DATA_3 = {
  descriptor: {
    name: "top"
  },
  children: [
    {
      descriptor: {
        name: "s1"
      },
      children: [
        {
          descriptor: {
            name: "q1",
            validateFunction: (val) => typeof val === "string"
          }
        },
        {
          descriptor: {
            name: "q2",
            validateFunction: (val) => typeof val === "number"
          }
        },
        {
          descriptor: {
            name: "q3",
            validateFunction: (val) => typeof val === "number"
          }
        }
      ]
    },
    {
      descriptor: {
        name: "s2"
      },
      children: [
        {
          descriptor: {
            name: "q2",
            validateFunction: (val) => typeof val === "number"
          }
        },
        {
          descriptor: {
            name: "q3",
            validateFunction: (val) => typeof val === "number"
          }
        }
      ]
    }
  ]
}

const initialize = function (formData) {
  const answersMap = observable(new Map());
  const form = buildForm(formData, answersMap);
  const nav = new Navigator(form);
  nav.init();
  return [form, nav];
}

const compareArrays = function (expected, actual) {
  expect(actual.every((item, i) => item === expected[i])).to.equal(true);
}

describe('Form builder tests', () => {
  it('builds the form without problems', () => {
    const form = buildForm(FORM_DATA, new Map());
    expect(form.children.length).to.equal(2);
    expect(form.children[0].children.length).to.equal(2);
  });
})

describe("FormItem tests", () => {
  it('converts to array correctly', () => {
    const form = buildForm(FORM_DATA, new Map());
    const formArray = form.toArray();
    const formIds = formArray.map(form => form.id);

    expect(formIds[0]).to.equal("top");
    expect(formIds[1]).to.equal("top/s1");
    expect(formIds[2]).to.equal("top/s1/q1");
    expect(formIds[3]).to.equal("top/s1/q2");
    expect(formIds[4]).to.equal("top/s2");
    expect(formIds[5]).to.equal("top/s2/q1");
  });

  it('validates and saves user inputs correctly', () => {
    const answersMap = observable(new Map());
    const form = buildForm(FORM_DATA, answersMap);
    const formArray = form.toArray();
    const qtoto = formArray.find(item => item.id === "top/s1/q1");
    const qNumber = formArray.find(item => item.id === "top/s1/q2");

    qNumber.setValue(-1);
    expect(qNumber.validated).to.equal(false);
    expect(answersMap.get("top/s1/q2")).to.equal(undefined);

    qtoto.setValue("toto");
    expect(qtoto.validated).to.equal(false);
    expect(answersMap.get("top/s1/q1")).to.equal(undefined);

    qNumber.setValue(3);
    expect(qNumber.validated).to.equal(true);
    expect(answersMap.get("top/s1/q2")).to.equal(3);

    // The qNumber question has changed, qToto should be validated automatically. 
    expect(qtoto.validated).to.equal(true);
    expect(answersMap.get("top/s1/q1")).to.equal("toto");

    qNumber.setValue(1);
    expect(qNumber.validated).to.equal(true);
    expect(answersMap.get("top/s1/q2")).to.equal(1);

    expect(qtoto.validated).to.equal(false);
    expect(answersMap.get("top/s1/q1")).to.equal(undefined);

    qtoto.setValue("yo");
    expect(answersMap.get('top/s1/q1')).to.equal(undefined);

  });

  it("getValue should return the value if it was validated, undefined instead", () => {
    const answersMap = observable(new Map());
    const form = buildForm(FORM_DATA_3, answersMap);
    const q1 = form.toArray().find(item => item.id === "top/s1/q1");
    q1.setValue("yo");
    expect(q1.value).to.equal("yo");
    q1.setValue(1);
    expect(q1.getValue()).to.equal(undefined);
  });

  it("should validate inner node when every children nodes are validated", () => {
    const answersMap = observable(new Map());
    const form = buildForm(FORM_DATA_2, answersMap);

    expect(form.validated).to.equal(false);
    form.children[0].setValue("hello");
    expect(form.validated).to.equal(false);
    form.children[1].setValue(1);
    form.children[2].setValue(5);
    expect(form.validated).to.equal(true);
  });

  it("should update the global progress correctly", () => {
    const answersMap = observable(new Map());
    const form = buildForm(FORM_DATA_2, answersMap);

    expect(form.globalProgress).to.equal(0);
    form.children[0].setValue("hello");
    expect(form.children[0].validated).to.equal(true);
    expect(form.globalProgress).to.equal(1 / 3);
    form.children[1].setValue(1);
    expect(form.globalProgress).to.equal(2 / 3);
    form.children[2].setValue(5);
    expect(form.globalProgress).to.equal(1);
  });

  it("should update the detailedProgress correctly", () => {
    const answersMap = observable(new Map());
    const form = buildForm(FORM_DATA_3, answersMap);

    const s1 = form.children[0];
    const s2 = form.children[1];

    expect(form.detailedProgress).to.equal(0);
    s1.children[0].setValue("hey");
    expect(form.detailedProgress).to.equal(1 / 5);
    s2.children[0].setValue(5);
    expect(form.detailedProgress).to.equal(2 / 5);
    s2.children[1].setValue(4);
    expect(form.detailedProgress).to.equal(3 / 5);
  });

});

describe("Navigator tests", () => {
  it("navigator should init correctly", () => {
    const [form, nav] = initialize(FORM_DATA_3);

    const currentNavIds = nav.currentNav.map(item => item.id);
    const expected = ['top', 'top/s1', 'top/s1/q1'];
    expect(currentNavIds.every((item, i) => item === expected[i])).to.equal(true);
  });

  it("the currentNav should be updated while changing the current item to another leaf", () => {
    const [form, nav] = initialize(FORM_DATA_3);

    const newCurrentItem = form.toArray().find(item => item.id === 'top/s2/q3');
    nav.currentItem = newCurrentItem;
    const expected = ['top', 'top/s2', 'top/s2/q3'];
    const actual = nav.currentNav.map(item => item.id);
    compareArrays(expected, actual);
  });

  it("the currentNav should be updated while changing the current item to another inner node", () => {
    const [form, nav] = initialize(FORM_DATA_3);

    const newCurrentItem = form.toArray().find(item => item.id === 'top/s2');
    nav.currentItem = newCurrentItem;
    const expected = ['top', 'top/s2', 'top/s2/q2'];
    const actual = nav.currentNav.map(item => item.id);
    compareArrays(expected, actual);

  });

  it("the navigator should return the next leaf correctly", () => {
    const [form, nav] = initialize(FORM_DATA_3);

    let nextLeaf = nav.nextLeaf();
    expect(nextLeaf.id).to.equal("top/s1/q2");

    nav.goToNextLeaf();
    nextLeaf = nav.nextLeaf();
    expect(nextLeaf.id).to.equal("top/s1/q3");

    nav.goToNextLeaf();
    nextLeaf = nav.nextLeaf();
    expect(nextLeaf.id).to.equal("top/s2/q2");

    nav.goToNextLeaf();
    nextLeaf = nav.nextLeaf();
    expect(nextLeaf.id).to.equal("top/s2/q3");

    nav.goToNextLeaf();
    nextLeaf = nav.nextLeaf();;
    expect(nextLeaf).to.equal(null);
  });

  it("goTo should update the current nav correctly", () => {
    const [form, nav] = initialize(FORM_DATA_3);

    nav.goTo("top/s2");

    const expected = ['top', 'top/s2', 'top/s2/q2'];
    const actual = nav.currentNav.map(item => item.id);
    expect(actual).to.eql(expected);
  });
  it("goTo should throw an error when the path does not exist", () => {
    const [form, nav] = initialize(FORM_DATA_3);
    assert.throws(() => { nav.goTo("arandom/path"); }, Error, "path 'arandom/path' does not exist");

  })
})



