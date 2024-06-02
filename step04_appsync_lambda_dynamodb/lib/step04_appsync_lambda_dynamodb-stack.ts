import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
 import * as appsync from 'aws-cdk-lib/aws-appsync';
 import * as lambda from 'aws-cdk-lib/aws-lambda';
 import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class Step04AppsyncLambdaDynamodbStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    //APPSYNC API gives you a graphql api with api key
    const api = new appsync.GraphqlApi(this, 'Api', {
      name: 'cdk-todos-appsync-api',
      schema: appsync.SchemaFile.fromAsset('graphql/schema.gql'),  ///Path specified for lambda
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,  ///Defining Authorization Type
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365))    ///set expiration for API Key
          }
        },
      },
      xrayEnabled: true,
    });
    

     ///Lambda Fucntion
    const todosLambda = new lambda.Function(this, 'AppSyncNotesHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'main.handler',
      code: lambda.Code.fromAsset('lambda'),
      memorySize: 1024
    });

     ////Set lambda as a datasource
    const lambdaDs = api.addLambdaDataSource('lambdaDatasource', todosLambda);


     ///Describing resolver for datasource
    lambdaDs.createResolver("createResolverQuerygetTodos",{
      typeName: "Query",
      fieldName: "getTodos"
    });

    lambdaDs.createResolver("createResolverMutationaddTodo",{
      typeName: "Mutation",
      fieldName: "addTodo"
    });

    lambdaDs.createResolver("createResolverMutationdeleteTodo",{
      typeName: "Mutation",
      fieldName: "deleteTodo"
    });

    lambdaDs.createResolver("createResolverMutationupdateTodo",{
      typeName: "Mutation",
      fieldName: "updateTodo"
    });
    const todosTable = new dynamodb.Table(this, 'CDKTodosTable', {
      tableName: "TodoTable",
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
    });

    todosTable.grantFullAccess(todosLambda)
    todosLambda.addEnvironment('TODOS_TABLE', todosTable.tableName);

    // Prints out the AppSync GraphQL endpoint to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl
    });

    // Prints out the AppSync GraphQL API key to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || ''
    });

    // Prints out the stack region to the terminal
    new cdk.CfnOutput(this, "Stack Region", {
      value: this.region
    });
  }
}
