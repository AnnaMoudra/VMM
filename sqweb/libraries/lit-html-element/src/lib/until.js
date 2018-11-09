import { directive } from '../lit-html.js';
export const until = (promise, defaultContent) => directive((part) => {
    part.setValue(defaultContent);
    return promise;
});
//# sourceMappingURL=until.js.map