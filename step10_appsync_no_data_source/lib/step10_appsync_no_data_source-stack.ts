import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appsync from 'aws-cdk-lib/aws-appsync';

export class Step10AppsyncNoDataSourceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new appsync.GraphqlApi(this, "noDataSourceAPI", {
      name: "noDataSourceAPI",
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ALL,
      },
      schema: appsync.SchemaFile.fromAsset("graphql/schema.gql"),
    });

    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl,
    });

    const dataSource = api.addNoneDataSource("noDataSource", {
      name: "noDataSource",
      description: "Does not save incoming data anywhere",
    });

    dataSource.createResolver("createResolverMutationchangeStatus",{
      typeName: "Mutation",
      fieldName: "changeStatus",
      requestMappingTemplate: appsync.MappingTemplate.fromString(`{
        "version" : "2017-02-28",
        "payload": $util.toJson($context.arguments)
        }`),
      responseMappingTemplate: appsync.MappingTemplate.fromString(
        "$util.toJson($context.result)"
      ),
    });
  }
}
