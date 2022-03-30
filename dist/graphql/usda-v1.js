import { gql } from "apollo-server-core";
import fs from "fs";
import path from "path";
import { getFood } from "../helpers/usda-v1.js";
const __dirname = (() => {
    let path = new URL(".", import.meta.url).pathname;
    if (process.platform === "win32") {
        path = path.replace(new RegExp("^/", "g"), "");
    }
    return path;
})();
export const typeDefs = gql(String(fs.readFileSync(path.resolve(__dirname, "../../schema.graphql"))));
export const resolvers = {
    FoodItem: {
        __resolveType(obj) {
            return obj.type;
        }
    },
    Query: {
        async food(parent, args) {
            return (await getFood({ fdcId: args.fdcId }, args))[0];
        },
        async foods(parent, args) {
            return await getFood({ fdcId: { $in: args.fdcIds } }, args);
        },
        async foodList(parent, args) {
            return await getFood({}, args);
        },
        async foodSearch(parent, args) {
            const { query, brandOwner } = args;
            const opts = query
                ? { $text: { $search: query }, brandOwner }
                : {};
            if (!brandOwner) {
                delete opts.brandOwner;
            }
            return await getFood(opts, args);
        }
    }
};
export default {
    typeDefs,
    resolvers
};
//# sourceMappingURL=usda-v1.js.map