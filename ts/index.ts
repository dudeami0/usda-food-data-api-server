#!/usr/bin/env node
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { ApolloServer } from "apollo-server-koa";
import http from "http";
import Koa from "koa";
import koaBody from "koa-body";
import "source-map-support/register.js";
import * as db from "usda-food-data-api-schema";
import { USDA as USDAgql } from "./graphql/index.js";
import options from "./options.js";
import { USDA } from "./rest/index.js";

process.on("SIGINT", async () => {
    await db.shutdown();
    process.exit();
});

async function bootstrap() {
    await db.start();

    const koa = new Koa();
    const httpServer = http.createServer(koa.callback());
    koa.use(koaBody());
    koa.use(USDA.routes());

    // GraphQL
    const apollo = new ApolloServer({
        ...USDAgql,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
    });
    await apollo.start();
    apollo.applyMiddleware({ app: koa });

    httpServer.on("request", koa.callback());

    await new Promise<void>((resolve) =>
        httpServer.listen({ port: options.port }, resolve)
    );
}

if (options.port > 0) {
    bootstrap();
}
