import mongoose from "mongoose";
/**
 * FoodQuery which allows fields to be missing
 */
export interface FoodQuery {
    format?: string;
    dataType?: string[];
    nutrients?: number[];
    sortBy?: string;
    sortOrder?: string;
    pageSize?: number;
    pageNumber?: number;
}
/**
 * FoodQuery that promises everything is defined
 */
export interface DefinedFoodQuery {
    format: string;
    dataType: string[];
    nutrients: number[];
    sortBy: string;
    sortOrder: string;
    pageSize: number;
    pageNumber: number;
}
/**
 * A DefinedFoodQuery defining the API query defaults
 */
export declare const defaultFoodQuery: DefinedFoodQuery;
/**
 * Given a MongoDB filter and API query arguments, finds the items requested.
 *
 * @param filter A valid MongoDB filter
 * @param query The API Query arguments
 * @returns
 */
export declare function getFood(filter: {
    [key: string]: any;
}, query?: FoodQuery): Promise<mongoose.Document<any, any, any>[]>;
