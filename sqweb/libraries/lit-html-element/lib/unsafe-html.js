import { directive } from '../lit-html.js';
export const unsafeHTML = (value) => directive((_part) => {
    const tmp = document.createElement('template');
    tmp.innerHTML = value;
    return document.importNode(tmp.content, true);
});
//# sourceMappingURL=unsafe-html.js.map