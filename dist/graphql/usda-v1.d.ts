/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose" />
import { FoodQuery } from "../helpers/usda-v1.js";
interface FoodArgs extends FoodQuery {
    fdcId?: number;
}
interface FoodsArgs extends FoodQuery {
    fdcIds?: number;
}
interface FoodSearchArgs extends FoodQuery {
    query?: string;
    brandOwner?: string;
}
export declare const typeDefs: import("graphql").DocumentNode;
export declare const resolvers: {
    FoodItem: {
        __resolveType(obj: any): any;
    };
    Query: {
        food(parent: undefined, args: FoodArgs): Promise<import("mongoose").Document<any, any, any>>;
        foods(parent: undefined, args: FoodsArgs): Promise<import("mongoose").Document<any, any, any>[]>;
        foodList(parent: undefined, args: FoodQuery): Promise<import("mongoose").Document<any, any, any>[]>;
        foodSearch(parent: undefined, args: FoodSearchArgs): Promise<import("mongoose").Document<any, any, any>[]>;
    };
};
declare const _default: {
    typeDefs: import("graphql").DocumentNode;
    resolvers: {
        FoodItem: {
            __resolveType(obj: any): any;
        };
        Query: {
            food(parent: undefined, args: FoodArgs): Promise<import("mongoose").Document<any, any, any>>;
            foods(parent: undefined, args: FoodsArgs): Promise<import("mongoose").Document<any, any, any>[]>;
            foodList(parent: undefined, args: FoodQuery): Promise<import("mongoose").Document<any, any, any>[]>;
            foodSearch(parent: undefined, args: FoodSearchArgs): Promise<import("mongoose").Document<any, any, any>[]>;
        };
    };
};
export default _default;
