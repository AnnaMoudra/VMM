import { directive, NodePart } from '../lit-html.js';
export const asyncAppend = (value, mapper) => directive((part) => __awaiter(this, void 0, void 0, function* () {
    if (value === part._previousValue) {
        return;
    }
    part._previousValue = value;
    let itemPart;
    let i = 0;
    try {
        for (var value_1 = __asyncValues(value), value_1_1; value_1_1 = yield value_1.next(), !value_1_1.done;) {
            let v = yield value_1_1.value;
            if (i === 0) {
                part.clear();
            }
            if (part._previousValue !== value) {
                break;
            }
            if (mapper !== undefined) {
                v = mapper(v, i);
            }
            let itemStartNode = part.startNode;
            if (itemPart !== undefined) {
                itemStartNode = document.createTextNode('');
                itemPart.endNode = itemStartNode;
                part.endNode.parentNode.insertBefore(itemStartNode, part.endNode);
            }
            itemPart = new NodePart(part.instance, itemStartNode, part.endNode);
            itemPart.setValue(v);
            i++;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (value_1_1 && !value_1_1.done && (_a = value_1.return)) yield _a.call(value_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    var e_1, _a;
}));
//# sourceMappingURL=async-append.js.map