import { directive, NodePart } from '../lit-html.js';
export const asyncReplace = (value, mapper) => directive((part) => __awaiter(this, void 0, void 0, function* () {
    if (value === part._previousValue) {
        return;
    }
    const itemPart = new NodePart(part.instance, part.startNode, part.endNode);
    part._previousValue = itemPart;
    let i = 0;
    try {
        for (var value_1 = __asyncValues(value), value_1_1; value_1_1 = yield value_1.next(), !value_1_1.done;) {
            let v = yield value_1_1.value;
            if (i === 0) {
                part.clear();
            }
            if (part._previousValue !== itemPart) {
                break;
            }
            if (mapper !== undefined) {
                v = mapper(v, i);
            }
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
//# sourceMappingURL=async-replace.js.map