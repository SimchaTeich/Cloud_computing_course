import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class FinalProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // labRole
    /*--------------------------------------------------------------------------------------------------------------*/
    // My labRole. using it later for lambdas                                                                       //
    const labRole = iam.Role.fromRoleArn(this, 'Role', "arn:aws:iam::160844318631:role/LabRole", {mutable: false}); //
    /*--------------------------------------------------------------------------------------------------------------*/



    // users table 
    /*--------------------------------------------------------------------------------------------------------------*/
    // create the users table for the user system                                                                   //
    const users_table = new cdk.aws_dynamodb.Table(this, 'users', {                                                 //
      partitionKey: {name: 'userID', type: cdk.aws_dynamodb.AttributeType.STRING}                                   //
    });                                                                                                             //
    //                                                                                                              //
    // Create Global Secondary Index                                                                                //
    users_table.addGlobalSecondaryIndex({                                                                           //
      indexName: 'emailIndex',                                                                                      //
      partitionKey: { name: 'email', type: cdk.aws_dynamodb.AttributeType.STRING },                                 //
      projectionType: cdk.aws_dynamodb.ProjectionType.ALL, // Adjust projection type as per your needs              //
      readCapacity: 1, // Adjust as needed                                                                          //
      writeCapacity: 1, // Adjust as needed                                                                         //
    });                                                                                                             //
    /*--------------------------------------------------------------------------------------------------------------*/



    // sns topic-per-user table
    /*--------------------------------------------------------------------------------------------------------------*/
    // create the users table for the user system                                                                   //
    const topics_table = new cdk.aws_dynamodb.Table(this, 'topics', {                                               //
      partitionKey: {name: 'userID', type: cdk.aws_dynamodb.AttributeType.STRING}                                   //
    });                                                                                                             //                                                                                                            //
    /*--------------------------------------------------------------------------------------------------------------*/



    // s3 for users
    /*--------------------------------------------------------------------------------------------------------------*/
    // add s3 bucket proxy to the api gateway                                                                       //
    const bucket = new s3.Bucket(this, 'HelloBucket', {                                                             //
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,                                                  //
      cors: [                                                                                                       //
        {                                                                                                           //
          allowedOrigins: ['*'], // Adjust this to your specific origins                                            //
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],                                                 //
          allowedHeaders: ['*'],                                                                                    //
        },                                                                                                          //
      ],                                                                                                            //
    });                                                                                                             //
    // Output s3 bucket name                                                                                        //
    new cdk.CfnOutput(this, 'BucketName', { value: bucket.bucketName });                                            //
    const s3Integration = this.createS3Integration(bucket, labRole);                                                //
    /*--------------------------------------------------------------------------------------------------------------*/



    // lambdas for user system
    /*--------------------------------------------------------------------------------------------------------------*/
    // create lambda for user registration                                                                          //
    const UserRegisterLambda = new cdk.aws_lambda.Function(this, 'UserRegisterHandler', {                           //
      runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,                                                                //
      handler: 'register.handler',                                                                                  //
      code: cdk.aws_lambda.Code.fromAsset('lambdas\\userRegister_lambda'),                                          //
      environment: {                                                                                                //
        USERS_TABLE_NAME: users_table.tableName,                                                                    //
        TOPICS_TABLE_NAME: topics_table.tableName,                                                                  //
        BUCKET_NAME: bucket.bucketName                                                                              //
      },                                                                                                            //
      role: labRole, // important for the lab so the cdk will not create a new role                                 //
    });                                                                                                             //
    //                                                                                                              //
    // create lambda for getting user details by userID                                                             //
    const GetUserLambda = new cdk.aws_lambda.Function(this, 'GetUserHandler', {                                     //
      runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,                                                                //
      handler: 'userDetails.handler',                                                                               //
      code: cdk.aws_lambda.Code.fromAsset('lambdas\\getUser_lambda'),                                               //
      environment: {                                                                                                //
        USERS_TABLE_NAME: users_table.tableName,                                                                    //
        BUCKET_NAME: bucket.bucketName                                                                              //
      },                                                                                                            //
      role: labRole, // important for the lab so the cdk will not create a new role                                 //
    });                                                                                                             //
    //                                                                                                              //
    // create lambda for delete user by userID                                                                      //
    const DeleteUserLambda = new cdk.aws_lambda.Function(this, 'DeleteUserHandler', {                               //
      runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,                                                                //
      handler: 'deleteUser.handler',                                                                                //
      code: cdk.aws_lambda.Code.fromAsset('lambdas\\deleteUser_lambda'),                                            //
      environment: {                                                                                                //
        USERS_TABLE_NAME: users_table.tableName,                                                                    //
        BUCKET_NAME: bucket.bucketName                                                                              //
      },                                                                                                            //
      role: labRole, // important for the lab so the cdk will not create a new role                                 //
    });                                                                                                             //
    //
    // create lambda for upload user profile by userID (return preSignUrl for put command)
    const UploadProfileLambda = new cdk.aws_lambda.Function(this, 'UploadProfileHandler', { 
      runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,
      handler: 'uploadProfile.handler',
      code: cdk.aws_lambda.Code.fromAsset('lambdas\\UploadProfile_lambda'),
      environment: {
        USERS_TABLE_NAME: users_table.tableName,
        BUCKET_NAME: bucket.bucketName
      },
      role: labRole, // important for the lab so the cdk will not create a new role
    });
    /*--------------------------------------------------------------------------------------------------------------*/




    // API for user system
    /*--------------------------------------------------------------------------------------------------------------*/
    // create REST API Gateway for the user system                                                                  //
    const user_system_api = new cdk.aws_apigateway.RestApi(this, 'UserSystemAPI', {                                 //
      restApiName: 'UserSystemAPI',                                                                                 //
      description: 'User System API for login and register users',                                                  //
      defaultCorsPreflightOptions: {                                                                                //
        allowOrigins: cdk.aws_apigateway.Cors.ALL_ORIGINS,                                                          //
        allowMethods: cdk.aws_apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'] // Allow necessary headers
      }                                                                                                             //
    });                                                                                                             //
    //                                                                                                              //
    // add lambdas to the user system api gateway                                                                   //
    const register = user_system_api.root.addResource('register');                                                  //
    register.addMethod('POST', new cdk.aws_apigateway.LambdaIntegration(UserRegisterLambda));
    const userDetails = user_system_api.root.addResource('userDetails');                                            //
    userDetails.addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(GetUserLambda));                          //
    const deleteUser = user_system_api.root.addResource('deleteUser');                                              //
    deleteUser.addMethod('DELETE', new cdk.aws_apigateway.LambdaIntegration(DeleteUserLambda));                       //
    const uploadProfile = user_system_api.root.addResource('uploadProfile');                                        
    uploadProfile.addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(UploadProfileLambda), {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Methods': true,
            'method.response.header.Access-Control-Allow-Headers': true,
          }
        }
      ]
    });
    
    /*--------------------------------------------------------------------------------------------------------------*/

    
    // // curl https://kbjilkhg8l.execute-api.us-east-1.amazonaws.com/prod/assets/test/sample_image.jpg
    //this.addAssetsEndpoint(user_system_api, s3Integration);
  }

  private createS3Integration(assetsBucket: cdk.aws_s3.IBucket, executeRole: cdk.aws_iam.IRole) {
    return new cdk.aws_apigateway.AwsIntegration({
      service: "s3",
      integrationHttpMethod: "GET",
      path: `${assetsBucket.bucketName}/{folder}/{key}`,
      options: {
        credentialsRole: executeRole,
        integrationResponses: [
          {
            statusCode: "200",
            responseParameters: {
              "method.response.header.Content-Type": "integration.response.header.Content-Type",
            },
          },
        ],

        requestParameters: {
          "integration.request.path.folder": "method.request.path.folder",
          "integration.request.path.key": "method.request.path.key",
        },
      },
    });
  }

  // private addAssetsEndpoint(
  //   apiGateway: cdk.aws_apigateway.RestApi,
  //   s3Integration: cdk.aws_apigateway.AwsIntegration
  // ) {
  //   apiGateway.root
  //     .addResource("assets")
  //     .addResource("{folder}")
  //     .addResource("{key}")
  //     .addMethod("GET", s3Integration, {
  //       methodResponses: [
  //         {
  //           statusCode: "200",
  //           responseParameters: {
  //             "method.response.header.Content-Type": true,
  //           },
  //         },
  //       ],
  //       requestParameters: {
  //         "method.request.path.folder": true,
  //         "method.request.path.key": true,
  //         "method.request.header.Content-Type": true,
  //       },
  //       apiKeyRequired: false,
  //     });
  // }
}