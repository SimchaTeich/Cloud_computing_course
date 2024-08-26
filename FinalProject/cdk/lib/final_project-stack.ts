/************************************************************************************************************************************
* RESOURCES:                                                                                                                        *
* sqs creation: https://www.youtube.com/watch?v=blnjyseXQVo                                                                         *
* connect lambda triger by sqs: https://www.alexkates.dev/blog/how-to-trigger-an-aws-lambda-function-from-an-sqs-message            *
* 
*************************************************************************************************************************************/

// Imports
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from "aws-cdk-lib/aws-sqs";

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



    // post table
    /*--------------------------------------------------------------------------------------------------------------*/
    // create the post table                                                                                        //
    const post_table = new cdk.aws_dynamodb.Table(this, 'posts', {                                                  //
      partitionKey: {name: 'postID', type: cdk.aws_dynamodb.AttributeType.STRING},                                  //
      sortKey: {name: 'userID', type: cdk.aws_dynamodb.AttributeType.STRING}                                        //
    });                                                                                                             //                                                                                                            //
    /*--------------------------------------------------------------------------------------------------------------*/



    // s3 for users
    /*--------------------------------------------------------------------------------------------------------------*/
    // add s3 bucket proxy to the api gateway                                                                       //
    const user_bucket = new s3.Bucket(this, 'UserBucket', {                                                         //
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
    new cdk.CfnOutput(this, 'BucketName', { value: user_bucket.bucketName });                                       //
    const s3Integration = this.createS3Integration(user_bucket, labRole);                                           //
    /*--------------------------------------------------------------------------------------------------------------*/



    // s3 for posts
    /*--------------------------------------------------------------------------------------------------------------*/
    // add s3 bucket to the api gateway                                                                             //
    const post_bucket = new s3.Bucket(this, 'PostBucket', {                                                         //
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
    new cdk.CfnOutput(this, 'posts-BucketName', { value: post_bucket.bucketName });                                 //
    /*--------------------------------------------------------------------------------------------------------------*/



    // sqs for distribution messages
    /*--------------------------------------------------------------------------------------------------------------*/
    const queue = new sqs.Queue(this, 'distributionMsgSqs', {                                                       //
      visibilityTimeout: cdk.Duration.seconds(300)                                                                  //
    });                                                                                                             //
    // Output sqs queue name                                                                                        //
    new cdk.CfnOutput(this, 'sqs-name', { value: queue.queueName });                                                //
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
        BUCKET_NAME: user_bucket.bucketName                                                                         //
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
        BUCKET_NAME: user_bucket.bucketName                                                                         //
      },                                                                                                            //
      role: labRole,                                                                                                //
    });                                                                                                             //
    //                                                                                                              //
    // create lambda for delete user by userID                                                                      //
    const DeleteUserLambda = new cdk.aws_lambda.Function(this, 'DeleteUserHandler', {                               //
      runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,                                                                //
      handler: 'deleteUser.handler',                                                                                //
      code: cdk.aws_lambda.Code.fromAsset('lambdas\\deleteUser_lambda'),                                            //
      environment: {                                                                                                //
        USERS_TABLE_NAME: users_table.tableName,                                                                    //
        TOPICS_TABLE_NAME: topics_table.tableName,                                                                  //
        BUCKET_NAME: user_bucket.bucketName                                                                         //
      },                                                                                                            //
      role: labRole,                                                                                                //
    });                                                                                                             //
    //                                                                                                              //
    // create lambda for upload user profile by userID (return preSignUrl for put command)                          //
    const UploadProfileLambda = new cdk.aws_lambda.Function(this, 'UploadProfileHandler', {                         //
      runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,                                                                //
      handler: 'uploadProfile.handler',                                                                             //
      code: cdk.aws_lambda.Code.fromAsset('lambdas\\UploadProfile_lambda'),                                         //
      environment: {                                                                                                //
        USERS_TABLE_NAME: users_table.tableName,                                                                    //
        BUCKET_NAME: user_bucket.bucketName                                                                         //
      },                                                                                                            //
      role: labRole,                                                                                                //
    });                                                                                                             //
    // create lambda for get a list of all users                                                                    //
    const GetOtherUsersLambda = new cdk.aws_lambda.Function(this, 'GetOtherUsersHandler', {                         //
      runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,                                                                //
      handler: 'getOtherUsers.handler',                                                                             //
      code: cdk.aws_lambda.Code.fromAsset('lambdas\\getOtherUsers_lambda'),                                         //
      environment: {                                                                                                //
        USERS_TABLE_NAME: users_table.tableName                                                                     //
      },                                                                                                            //
      role: labRole,                                                                                                //
    });                                                                                                             //
    /*--------------------------------------------------------------------------------------------------------------*/



    // lambdas for distribution messeages to subscribers
    /*--------------------------------------------------------------------------------------------------------------*/
    // create lambda for subscribe                                                                                  //
    const SubscribeLambda = new cdk.aws_lambda.Function(this, 'SubscribeHandler', {                                 //
      runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,                                                                //
      handler: 'subscribe.handler',                                                                                 //
      code: cdk.aws_lambda.Code.fromAsset('lambdas\\subscribe_lambda'),                                             //
      environment: {                                                                                                //
        USERS_TABLE_NAME: users_table.tableName,                                                                    //
        TOPICS_TABLE_NAME: topics_table.tableName                                                                   //
      },                                                                                                            //
      role: labRole,                                                                                                //
    });                                                                                                             //
    //                                                                                                              //
    // create lambda for publish message from the queue                                                             //
    const PublishFromSQSLambda = new cdk.aws_lambda.Function(this, 'PublishFromSQSHandler', {                       //
      runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,                                                                //
      handler: 'publishFromSqs.handler',                                                                            //
      code: cdk.aws_lambda.Code.fromAsset('lambdas\\publishFromSqs_lambda'),                                        //
      environment: {                                                                                                //
        TOPICS_TABLE_NAME: topics_table.tableName                                                                   //
      },                                                                                                            //
      role: labRole,                                                                                                //
    });                                                                                                             //
    // connect it to the sqs queue                                                                                  //
    PublishFromSQSLambda.addEventSource(new cdk.aws_lambda_event_sources.SqsEventSource(queue));                    //
    //                                                                                                              //
    // create lambda for sending message into the queue                                                             //
    const sendMsgToSQSLambda = new cdk.aws_lambda.Function(this, 'sendMsgToSQSHandler', {                           //
      runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,                                                                //
      handler: 'sendMsgToSqs.handler',                                                                              //
      code: cdk.aws_lambda.Code.fromAsset('lambdas\\sendMsgToSqs_lambda'),                                          //
      environment: {                                                                                                //
        USERS_TABLE_NAME: users_table.tableName,                                                                    //
        SQS_URL: queue.queueUrl                                                                                     //
      },                                                                                                            //
      role: labRole,                                                                                                //
    });                                                                                                             //
    /*--------------------------------------------------------------------------------------------------------------*/



    // lambdas for posts (post in social network)
    /*--------------------------------------------------------------------------------------------------------------*/
    // create lambda for upload post                                                                                //
    const UploadPostLambda = new cdk.aws_lambda.Function(this, 'UploadPostHandler', {                               //
      runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,                                                                //
      handler: 'uploadPost.handler',                                                                                //
      code: cdk.aws_lambda.Code.fromAsset('lambdas\\uploadPost_lambda'),                                            //
      environment: {                                                                                                //
        USERS_TABLE_NAME: users_table.tableName,                                                                    //
        POSTS_TABLE_NAME: post_table.tableName,                                                                     //
        POSTS_BUCKET_NAME: post_bucket.bucketName                                                                   //
      },                                                                                                            //
      role: labRole,                                                                                                //
    });                                                                                                             //
    //                                                                                                              //
    // create lambda for get all posts                                                                              //
    const GetPostsLambda = new cdk.aws_lambda.Function(this, 'GetPostsHandler', {                                   //
      runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,                                                                //
      handler: 'getPostsList.handler',                                                                              //
      code: cdk.aws_lambda.Code.fromAsset('lambdas\\getPostsList_lambda'),                                          //
      environment: {                                                                                                //
        USERS_TABLE_NAME: users_table.tableName,                                                                    //
        POSTS_TABLE_NAME: post_table.tableName,                                                                     //
        POSTS_BUCKET_NAME: post_bucket.bucketName                                                                   //
      },                                                                                                            //
      role: labRole,                                                                                                //
    });                                                                                                             //
    //                                                                                                              //
    /*--------------------------------------------------------------------------------------------------------------*/



    // API for user system
    /*--------------------------------------------------------------------------------------------------------------*/
    // create REST API Gateway for the user system                                                                  //
    const user_system_api = new cdk.aws_apigateway.RestApi(this, 'UserSystemAPI', {                                 //
      restApiName: 'UserSystemAPI',                                                                                 //
      description: 'User System API for login and register users',                                                  //
      defaultCorsPreflightOptions: {                                                                                //
        allowOrigins: cdk.aws_apigateway.Cors.ALL_ORIGINS,                                                          //
        allowMethods: cdk.aws_apigateway.Cors.ALL_METHODS,                                                          //
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token']          //
      }                                                                                                             //
    });                                                                                                             //
    //                                                                                                              //
    // add lambdas to the user system api gateway                                                                   //
    const register = user_system_api.root.addResource('register');                                                  //
    register.addMethod('POST', new cdk.aws_apigateway.LambdaIntegration(UserRegisterLambda));                       //
    const userDetails = user_system_api.root.addResource('userDetails');                                            //
    userDetails.addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(GetUserLambda));                          //
    const deleteUser = user_system_api.root.addResource('deleteUser');                                              //
    deleteUser.addMethod('DELETE', new cdk.aws_apigateway.LambdaIntegration(DeleteUserLambda));                     //
    const uploadProfile = user_system_api.root.addResource('uploadProfile');                                        //
    uploadProfile.addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(UploadProfileLambda), {                 //
      methodResponses: [                                                                                            //
        {                                                                                                           //
          statusCode: '200',                                                                                        //
          responseParameters: {                                                                                     //
            'method.response.header.Access-Control-Allow-Origin': true,                                             //
            'method.response.header.Access-Control-Allow-Methods': true,                                            //
            'method.response.header.Access-Control-Allow-Headers': true,                                            //
          }                                                                                                         //
        }                                                                                                           //
      ]                                                                                                             //
    });                                                                                                             //
    const otherUsers = user_system_api.root.addResource('otherUsers');                                              //
    otherUsers.addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(GetOtherUsersLambda));                     //
    /*--------------------------------------------------------------------------------------------------------------*/



    // API for distribution messages
    /*--------------------------------------------------------------------------------------------------------------*/
    // create REST API Gateway for the user system                                                                  //
    const distribution_msg_api = new cdk.aws_apigateway.RestApi(this, 'DistributionMsgApi', {                       //
      restApiName: 'DistributionMsgApi',                                                                            //
      description: 'API for distributing messages between users and their subscribers',                             //
      defaultCorsPreflightOptions: {                                                                                //
        allowOrigins: cdk.aws_apigateway.Cors.ALL_ORIGINS,                                                          //
        allowMethods: cdk.aws_apigateway.Cors.ALL_METHODS,                                                          //
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token']          //
      }                                                                                                             //
    });                                                                                                             //
    //                                                                                                              //
    // add lambdas to the user system api gateway                                                                   //
    const subscribe = distribution_msg_api.root.addResource('subscribe');                                           //
    subscribe.addMethod('POST', new cdk.aws_apigateway.LambdaIntegration(SubscribeLambda));                         //
    const msgToSubscribers = distribution_msg_api.root.addResource('msgToSubscribers');                             //
    msgToSubscribers.addMethod('POST', new cdk.aws_apigateway.LambdaIntegration(sendMsgToSQSLambda));               //
    /*--------------------------------------------------------------------------------------------------------------*/



    // API for handle posts (for social network)
    /*--------------------------------------------------------------------------------------------------------------*/
    // create REST API Gateway for the posts API                                                                    //
    const posts_api = new cdk.aws_apigateway.RestApi(this, 'PostsAPI', {                                            //
      restApiName: 'PostsAPI',                                                                                      //
      description: 'API for posts (social network)',                                                                //
      defaultCorsPreflightOptions: {                                                                                //
        allowOrigins: cdk.aws_apigateway.Cors.ALL_ORIGINS,                                                          //
        allowMethods: cdk.aws_apigateway.Cors.ALL_METHODS,                                                          //
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token']          //
      }                                                                                                             //
    });                                                                                                             //
    //                                                                                                              //
    // add lambdas to the api                                                                                       //
    const uploadPost = posts_api.root.addResource('uploadPost');                                                    //
    uploadPost.addMethod('POST', new cdk.aws_apigateway.LambdaIntegration(UploadPostLambda));                       //
    const viewPosts = posts_api.root.addResource('viewPosts');                                                      //
    viewPosts.addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(GetPostsLambda, {timeout: cdk.Duration.seconds(15)}));                       //
    /*--------------------------------------------------------------------------------------------------------------*/
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
}