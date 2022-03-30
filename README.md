**NOTE: THIS PACKAGE IS UNRELATED TO THE OFFICIAL USDA FOOD DATA API**

# usda-food-data-api-server

**NOTE: THIS PACKAGE IS UNRELATED TO THE OFFICIAL USDA FOOD DATA API**

Data links referenced/used by this program provided by:

> U.S. Department of Agriculture, Agricultural Research Service. FoodData
> Central, 2019. [fdc.nal.usda.gov](https://fdc.nal.usda.gov/).

A REST and GraphQL server to serve the USDA Food Data API. The REST version
tries to be compatible with the official USDA Food Data APIs, but cannot
guarantee interoperability.

## Getting the USDA Food Data into a MongoDB

To run this API server, you first need the USDA Food Data imported into a
MongoDB database using the `usda-food-data-api-builder` package. A MongoDB dump
that doesn't come with the performance requirements.

### Restoring from the MongoDB dump

If your goal is to quickly setup this project, you can download a gzip MongoDB
dump from the releases on the
[`usda-food-data-api-builder`](https://github.com/dudeami/usda-food-data-api-builder#readme)
repo:

```shell
# curl -L https://github.com/dudeami/usda-food-data-api-builder/releases/download/v1.0.2/usda-food-data-linked-v1.0.2.gz -O
# mongorestore --uri mongodb://localhost/usda-food-data --db usda-food-data --gzip --archive=./usda-food-data-linked-v1.0.2.gz
```

The `mongorestore` process took ~5 minutes on the Windows x64 machine used to
develop this.

Make sure to replace `mongodb://localhost/usda-food-data` with your MongoDB URI.
Once the database is setup, you can continue down to "Running the server"

### Building

Alternatively, you can use the
[`usda-food-data-api-builder`](https://github.com/dudeami/usda-food-data-api-builder#readme)
to build this data.

## Running the server

Now that the data is in place, you can run the server. The fastest way to do
this is to call the package via npx.

```shell
npx usda-food-data-api-server --port 4000
```

It will ask for a MongoDB URI to connect to, and save this to
`usda-food-data.json` for future runs. The API server will then be live on port
`4000`.

## Missing functionality and differences

While this project aims to replicate the USDA Food Data API, it hasn't be tested
for accuracy against it. The API request are the same, but slight differences
might occur. A list of known issues are:

-   Usage of the `format` query option. All queries, including the search, will
    return full size documents with the `nutrients` filter applied. A version
    with `AbridgedFoodItem` is planned.
-   No authentication, the API is wide open with no rate limits. Make sure to
    place this behind your own authentication system. An example repo of an
    auth-based API using this package is planned.

## REST API

The rest API parameters match the USDA api. These can be viewed at:

https://fdc.nal.usda.gov/api-spec/fdc_api.html
https://app.swaggerhub.com/apis/fdcnal/food-data_central_api/1.0.0

## GraphQL

The GraphQL queries supported closely mirror the REST API. You can look at
`./schema.graphql`, at the bottom is the `Query` schema. For easy reference, it
will also be listed here:

```graphql
union FoodItem =
      FoundationFoodItem
    | BrandedFoodItem
    | SurveyFoodItem
    | SRLegacyFoodItem
    | AbridgedFoodItem

type Query {
    food(fdcId: Int!): FoodItem
    foods(fdcIds: [Int]!): [FoodItem]
    foodList(
        nutrients: [Int]
        dataType: [String]
        pageSize: Int
        pageNumber: Int
        sortBy: String
        sortOrder: String
        brandOwner: String
    ): [FoodItem]
    foodSearch(
        query: String!
        nutrients: [Int]
        dataType: [String]
        pageSize: Int
        pageNumber: Int
        sortBy: String
        sortOrder: String
        brandOwner: String
    ): [FoodItem]
}
```

Make note of the `FoodItem` union. To better replicate the results possible with
the USDA REST api, these data types did not get seperate queries. Your graphql
query will need to handle each data type you expect, else unused data types
should be filtered out using the `dataType` query parameter. An example query using `foodSearch` for `Foundation` items:

```graphql
query {
    foodSearch(query: "BEANS", dataType: ["Foundation"]) {
        ... on FoundationFoodItem {
            scientificName
            description
        }
    }
}
```

Here is a table of the `dataType`'s able to be requested, and their
corresponding schemas:

| dataType       | Schema             |
| -------------- | ------------------ |
| `"Foundation"` | FoundationFoodItem |
| `"Branded"`    | BrandedFoodItem    |
| `"Survey"`     | SurveyFoodItem     |
| `"SR Legacy"`  | SRLegacyFoodItem   |

## Thanks

Thank you to the USDA and all the authors involved in the dependencies of
this project. Without that work this tool would not exist.
