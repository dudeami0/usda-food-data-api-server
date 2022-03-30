import mongoose from "mongoose";
import { populateAll, sanitize } from "./dbhelper.js";

/**
 * Key are USDA API `dataType` values, values are the corresponding Schema
 */
const translation: { [key: string]: string } = {
    Foundation: "FoundationFoodItem",
    "SR Legacy": "SRLegacyFoodItem",
    Branded: "BrandedFoodItem",
    Survey: "SurveyFoodItem"
};

const rootFoodTypes = Object.values(translation);

/**
 * Given an nutrients api query argument, filters the nutrients returned
 * to the given nutrient IDs.
 * @param doc The document to be filtered
 * @param nutrients
 * @returns
 */
function cleanNutrients(doc: any, nutrients: number[]) {
    if (doc.foodNutrients && nutrients.length > 0) {
        const set = new Set(nutrients);

        const filtered = [];
        for (let n in doc.foodNutrients) {
            let fn = doc.foodNutrients[n];
            if (set.has(fn.nutrient.id)) {
                filtered.push(doc.foodNutrients[n]);
            }
        }
        doc.foodNutrients = filtered;
        return doc;
    } else {
        return doc;
    }
}

/**
 * Given a dataType api query argument, returns the Schemas to use for search.
 * @param dataType dataType api query argument
 * @returns A list of Schema to use for this query
 */
function getFoodTypes(dataType: string[]) {
    dataType = dataType.filter((str) => str.trim().length > 0);
    if (dataType.length === 0) {
        return rootFoodTypes;
    }
    const foodTypes: string[] = [];
    dataType.forEach((str) => {
        if (translation[str]) {
            foodTypes.push(translation[str]);
        }
    });
    return foodTypes;
}

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
export const defaultFoodQuery: DefinedFoodQuery = {
    format: "json",
    dataType: Object.keys(translation),
    nutrients: [],
    sortBy: "_id",
    sortOrder: "desc",
    pageSize: 50,
    pageNumber: 0
};

/**
 * Given a MongoDB filter and API query arguments, finds the items requested.
 *
 * @param filter A valid MongoDB filter
 * @param query The API Query arguments
 * @returns
 */
export async function getFood(
    filter: { [key: string]: any },
    query: FoodQuery = {}
) {
    const results: mongoose.Document[] = [];
    const filterNutrients = query.nutrients;
    const foodTypes = getFoodTypes(query.dataType || []);
    const options: DefinedFoodQuery = { ...defaultFoodQuery, ...query };
    for (let f in foodTypes) {
        const model = mongoose.model(foodTypes[f]);
        const sort = options.sortOrder.toLowerCase() === "asc";
        const docs = await model.find(
            filter,
            {},
            {
                sort: {
                    [options.sortBy]: sort ? 1 : -1
                },
                limit: options.pageSize,
                skip: Math.max(0, options.pageNumber) * options.pageSize
            }
        );
        let tmp = await Promise.all(
            docs.map(async (doc) => {
                await populateAll(doc, model);
                let json: any = sanitize(doc.toJSON());
                if (filterNutrients) {
                    json = cleanNutrients(json, query.nutrients || []);
                }
                json.type = foodTypes[f];
                return json;
            })
        );
        tmp.forEach((t) => results.push(t));
    }
    return results;
}
