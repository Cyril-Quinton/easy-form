import { computed, extendObservable, autorun } from 'mobx';
export class FormItem {

  constructor(descriptor, answerMap) {
    if (!descriptor.name) {
      throw 'A form item must have a name';
    }
    if (!answerMap) {
      throw 'A form item must be passed an answer map';
    }
    extendObservable(this, {
      progress: 0,
      children: [],
      value: null,
      validated: computed(() => {
        if (this.isLeaf) {
          if (this.validateFunction) {
            return this.validateFunction(this.value, this.answerMap);
          }
        }
        return this.children.every(child => child.validated);
      }),
      globalProgress: computed(() => {
        if (!this.isLeaf) {
          return this.children.filter(child => child.validated).length / this.children.length;
        }
        return this.validated ? 1 : 0;
      }),
      detailedProgress: computed(() => {
        const array = this.toArray();
        const leaves = array.filter(element => element.isLeaf);
        return leaves.filter(leaf => leaf.validated).length / leaves.length;
      }),
      isLeaf: computed(() => this.children.length === 0)
    });
    this.name = descriptor.name;
    this.answerMap = answerMap;
    this.componentName = descriptor.componentName;
    this.validateFunction = descriptor.validateFunction;
    this.descripton = descriptor.description;
    this.parent = null;

    const updateAnswerToMap = autorun(() => {
      this.validated ? this.answerMap.set(this.id, this.value) : this.answerMap.set(this.id, undefined);
    });

  }

  get id() {
    if (!this.parent) {
      return this.name;
    }
    return this.parent.id + "_" + this.name;
  }

  set isCurrent(bool) {
    if (this.children.filter(child => child.isCurrent).length == 0) {
      if (this.children.length > 0) {
        this.children[0].isCurrent = true;
      }
    }
  }

  setValue(val) {
    this.value = val;
  }

  toArray(array) {
    if (!array) {
      array = [];
    }
    array.push(this);
    this.children.forEach(child => child.toArray(array));
    return array;
  }

  addChild(child) {
    this.children.push(child);
    child.parent = this;
  }

}
