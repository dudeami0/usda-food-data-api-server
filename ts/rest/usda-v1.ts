import { dump } from "js-yaml";
import { BaseContext } from "koa";
import Router from "koa-router";
import {
    defaultFoodQuery,
    DefinedFoodQuery,
    getFood
} from "../helpers/usda-v1.js";
import { splitNumber } from "./koa-normalize-arguments.js";

const router = new Router({
    prefix: "/v1"
});

export default router;

/**
 * Given a Koa.JS query param, returns a valid format type for formatDocument
 * @param input koa query param
 * @returns yaml or json
 */
function sanitizeFormatType(input: string | string[] | undefined) {
    let str = (input instanceof Array ? input[0] : input) || "json";
    return str.toLowerCase() === "yaml" ? "yaml" : "json";
}

/**
 * Given a raw query or POST body, normalizes the arguments.
 * @param dirty The dirty request parameters
 * @returns Normalized request parameters
 */
function getArgs(dirty: any) {
    const results = { ...defaultFoodQuery, ...dirty };
    results.pageSize = Math.max(1, Number(results.pageSize));
    results.pageNumber = Math.max(0, Number(results.pageNumber));
    results.nutrients = splitNumber(results.nutrients);
    results.format = sanitizeFormatType(results.format);
    return <DefinedFoodQuery>results;
}

/**
 * Handles a generic API request, taking a response and formatting it into the
 * requested format.
 *
 * @param ctx Koa ctx
 * @param docs The documents to be served
 * @param format json or yaml format
 */
function handleApi(ctx: BaseContext, docs: any, format: string) {
    if (docs) {
        let contentType = format === "yaml" ? "text/yaml" : "application/json";
        ctx.set("Content-type", contentType);
        if (format === "yaml") {
            ctx.body = dump(docs);
        } else {
            ctx.body = JSON.stringify(docs);
        }
    } else {
        ctx.status = 404;
        ctx.body = `Not found`; // TODO Match USDA Api
    }
}

/**
 * For the given fdcId, returns a FoodItem
 */
router.get("/food/:fdcId", async function (ctx) {
    const fdcId = splitNumber(ctx.params.fdcId);
    const args = getArgs(ctx.request.query);
    handleApi(ctx, (await getFood({ fdcId }, args))[0], args.format);
});

/**
 * For the given context, finds the requested FoodItem for the given fdcIds.
 * Handles both the POST and GET requests.
 * @param ctx Koa ctx
 */
async function handleFdcIdsApi(ctx: any) {
    const post = ctx.request.method === "POST";
    const params = ctx.request[post ? "body" : "query"];
    const fdcIds = splitNumber(params.fdcIds || "");
    const args = getArgs(params);
    handleApi(
        ctx,
        await getFood({ fdcId: { $in: fdcIds } }, args),
        args.format
    );
}

router.get("/foods", handleFdcIdsApi);
router.post("/foods", handleFdcIdsApi);

/**
 * For the given context, finds the required FoodItem's and returns them.
 * Covers both /foods/list and /foods/search since they offer the same
 * functionality, with the difference of a full text search.
 * @param ctx Koa context
 */
async function handleSearchApi(ctx: any) {
    const params =
        ctx.request.method === "GET" ? ctx.request.query : ctx.request.body;
    const { query } = params;
    const args = getArgs(params);
    const opts = query ? { $text: { $search: query } } : {};
    handleApi(ctx, await getFood(opts, args), args.format);
}

router.get("/foods/list", handleSearchApi);
router.post("/foods/list", handleSearchApi);
router.get("/foods/search", handleSearchApi);
router.post("/foods/search", handleSearchApi);

// TODO - specs

router.get("/json-spec", async (ctx) => {
    ctx.status = 404;
    ctx.body = "Not found";
});

router.get("/yaml-spec", async (ctx) => {
    ctx.status = 404;
    ctx.body = "Not found";
});
