import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class Step03AppsyncLambdaAsDatasourceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

     // The code that defines your stack goes here

    ///APPSYNC API gives you a graphql api with api key
    const api = new appsync.GraphqlApi(this, "GRAPHQL_API", {
      name: 'cdk-api',
      schema: appsync.SchemaFile.fromAsset('graphql/schema.gql'),       ///Path specified for lambda
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,     ///Defining Authorization Type
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365))   ///set expiration for API Key
          }
        },
      },
      xrayEnabled: true                                             ///Enables xray debugging
    })

    ///Print Graphql Api Url on console after deploy
    new cdk.CfnOutput(this, "APIGraphQlURL", {
      value: api.graphqlUrl
    });

    ///Print API Key on console after deploy
    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || ''
    });

    ///Lambda Fucntion
    const lambda_function = new lambda.Function(this, "LambdaFucntion", {
      runtime: lambda.Runtime.NODEJS_18_X,            ///set nodejs runtime environment
      code: lambda.Code.fromAsset("lambda"),          ///path for lambda function directory
      handler: 'index.handler',                       ///specfic fucntion in specific file
      timeout: cdk.Duration.seconds(10)               ///Time for function to break. limit upto 15 mins
    });


    ////Set lambda as a datasource
    const lambda_data_source = api.addLambdaDataSource("lamdaDataSource", lambda_function);


    ///Describing resolver for datasource
    lambda_data_source.createResolver("createResolverForQuerynotes",{
      typeName: "Query",
      fieldName: "products"
    });

    lambda_data_source.createResolver("createResolverForQuerycustomNote",{
      typeName: "Query",
      fieldName: "customProduct"
    });


    lambda_data_source.createResolver("createResolverForMutationaddProduct",{
      typeName: "Mutation",
      fieldName: "addProduct"
    });
  }
}
