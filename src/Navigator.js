import { observable, computed, extendObservable } from 'mobx';

export class Navigator {
    constructor(formItem) {
        this.formItem = formItem;
        extendObservable(this, {
            currentNav: [],
            hasNextLeaf: computed(() => {
                return this.nextLeaf != null;
            })
        });
    }

    init() {
        this.initNav(this.formItem, this.currentNav);
    }

    nextLeaf() {
        if (this.currentNav.length > 0) {
            let child = this.currentNav[this.currentNav.length - 1];
            let parent = child.parent;
            while (parent) {
                const childIndex = parent.children.findIndex(aChild => aChild.id === child.id);
                if (parent.children.length < childIndex - 1) {
                    return parent.children[childIndex + 1];
                }
                child = parent;
                parent = child.parent;
            }

        }
        return null;
    }

    // @computed hasNextLeaf() {
    //     return this.nextLeaf != null;
    // }

    goToNext() {
        if (this.hasNextLeaf()) {
            this.currentItem = this.nextLeaf();
        }
    }


    initNav(formItem, currentNav) {
        currentNav.push(formItem);
        if (formItem.children[0]) {
            this.initNav(formItem.children[0], currentNav);
        }
    }

    set currentItem(item) {
        this.currentNav = [];
        let chainItem = item;
        while (chainItem.parent) {
            chainItem = chainItem.parent;
            this.currentNav.unshift(chainItem);
        }
        this.initNav(item, this.currentNav);
    }
}