import mongoose from "mongoose";

/**
 * Internal data structure
 */
interface Data {
    name: string;
    ref: string;
}

/**
 * Processes a single document
 *
 * @param document Document to be handled
 * @param model Model of the Document
 */
async function processDocument(document: any, model: mongoose.Model<unknown>) {
    const paths: Data[] = [];
    model.schema.eachPath((name, type) => {
        if (document[name]) {
            if (type instanceof mongoose.Schema.Types.Array) {
                const embedType = (<any>type)["$embeddedSchemaType"];
                if (embedType.instance == "ObjectID") {
                    type = embedType;
                }
            }
            if (type.options.ref) {
                paths.push({
                    name,
                    ref: type.options.ref
                });
            }
        }
    });

    // Populate the given fields, and process down afterwards
    await Promise.all(
        paths.map(async function (data: Data) {
            await document.populate(data.name);
            await populateAll(document[data.name], mongoose.model(data.ref));
        })
    );
}

export function sanitize(doc: any) {
    for (let i in doc) {
        if (i.startsWith("_") || i === "type") {
            delete doc[i];
        }
        if (doc[i] instanceof Object) {
            doc[i] = sanitize(doc[i]);
        }
    }
    return doc;
}

/**
 * Given a Mongoose Document and it's corresponding Model, populates
 * all references within the document recursively.
 *
 * @param doc The Document to populate
 * @param model The Model of the document
 */
export async function populateAll(doc: any, model: mongoose.Model<unknown>) {
    const arr = doc instanceof Array ? doc : [doc];
    await Promise.all(
        arr.map(async (document) => processDocument(document, model))
    );
}
