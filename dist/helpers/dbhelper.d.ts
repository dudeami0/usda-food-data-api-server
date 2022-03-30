import mongoose from "mongoose";
export declare function sanitize(doc: any): any;
/**
 * Given a Mongoose Document and it's corresponding Model, populates
 * all references within the document recursively.
 *
 * @param doc The Document to populate
 * @param model The Model of the document
 */
export declare function populateAll(doc: any, model: mongoose.Model<unknown>): Promise<void>;
