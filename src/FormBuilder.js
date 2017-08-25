import {FormItem} from './FormItem.js';

export const buildForm = function(formDescriptor, answerMap) {
    const item = new FormItem(formDescriptor.descriptor, answerMap);
    if (formDescriptor.children) {
        formDescriptor.children.forEach(child => item.addChild(buildForm(child, answerMap)));
    }
    return item;
};