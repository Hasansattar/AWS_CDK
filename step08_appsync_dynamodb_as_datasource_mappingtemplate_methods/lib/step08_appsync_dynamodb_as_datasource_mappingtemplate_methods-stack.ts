import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class Step08AppsyncDynamodbAsDatasourceMappingtemplateMethodsStack extends cdk.Stack {
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
    })

    ///Print API Key on console after deploy
    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || ''
    });


    ///Defining a DynamoDB Table
    const dynamoDBTable = new dynamodb.Table(this, 'Table', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
    });

    ///Attaching Datasource to api
    const db_data_source = api.addDynamoDbDataSource('DataSources', dynamoDBTable);

    db_data_source.createResolver("createResolverMutationcreateNote",{
      typeName: "Mutation",
      fieldName: "createNote",
      requestMappingTemplate : appsync.MappingTemplate.dynamoDbPutItem(
        appsync.PrimaryKey.partition('id').auto(),        ///Create an autoID for your primary Key Id
        appsync.Values.projecting()                       ///Add Remaining input values
      ),
        responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem()   ////Mapping template for a single result item from DynamoDB.
    })

    db_data_source.createResolver("createResolverQueryNote",{
      typeName: "Query",
      fieldName: "notes",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),      ///Mapping template to scan a DynamoDB table to fetch all entries.
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),    ////Mapping template for a result list from DynamoDB.
    })

    db_data_source.createResolver("createResolverMutationdeleteNote",{
      typeName: "Mutation",
      fieldName: "deleteNote",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbDeleteItem('id', 'id'),   ///Mapping template to delete a single item from a DynamoDB table.
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem()             ////Mapping template for a single result item from DynamoDB.
    });

    db_data_source.createResolver("createResolverMutationupdateNote",{
      typeName: "Mutation",
      fieldName: "updateNote",
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(                ///Mapping template to save a single item to a DynamoDB table.
        appsync.PrimaryKey.partition('id').is('id'),                                  ///Where id is input ID
        appsync.Values.projecting()),                                                 ///Add Remaining input values
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem()     ////Mapping template for a single result item from DynamoDB.
    });











  }
}
