import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
//import * as s3 from 'aws-cdk-lib/aws-s3';

export class FinalProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const labRole = iam.Role.fromRoleArn(this, 'Role', "arn:aws:iam::160844318631:role/LabRole", {mutable: false});

    const table = new cdk.aws_dynamodb.Table(this, 'users', {
      partitionKey: {name: 'email', type: cdk.aws_dynamodb.AttributeType.STRING}
    });

    const lambda = new cdk.aws_lambda.Function(this, 'UserRegisterHandler', {
      runtime: cdk.aws_lambda.Runtime.NODEJS_LATEST,
      handler: 'register.handler',
      code: cdk.aws_lambda.Code.fromAsset('lambdas\\userRegister_lambda'),
      environment: {
        HITS_TABLE_NAME: table.tableName
      },
      role: labRole, // important for the lab so the cdk will not create a new role
    });


    const user_system_api = new cdk.aws_apigateway.RestApi(this, 'UserSystemAPI', {
      restApiName: 'UserSystemAPI',
      description: 'User System API for login and register users',
      defaultCorsPreflightOptions: {
        allowOrigins: cdk.aws_apigateway.Cors.ALL_ORIGINS,
        allowMethods: cdk.aws_apigateway.Cors.ALL_METHODS
      }
    });

    // add lambdas to the api gateway
    const register = user_system_api.root.addResource('register');
    register.addMethod('POST', new cdk.aws_apigateway.LambdaIntegration(lambda));

    // // add s3 bucket proxy to the api gateway
    // const bucket = new s3.Bucket(this, 'HelloBucket', {
    //   removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE
    // });

    // // Output s3 bucket name
    // new cdk.CfnOutput(this, 'BucketName', { value: bucket.bucketName });

    // const s3Integration = this.createS3Integration(bucket, labRole);
    
    // // curl https://kbjilkhg8l.execute-api.us-east-1.amazonaws.com/prod/assets/test/sample_image.jpg
    // this.addAssetsEndpoint(api, s3Integration);
  }

  // private createS3Integration(assetsBucket: cdk.aws_s3.IBucket, executeRole: cdk.aws_iam.IRole) {
  //   return new cdk.aws_apigateway.AwsIntegration({
  //     service: "s3",
  //     integrationHttpMethod: "GET",
  //     path: `${assetsBucket.bucketName}/{folder}/{key}`,
  //     options: {
  //       credentialsRole: executeRole,
  //       integrationResponses: [
  //         {
  //           statusCode: "200",
  //           responseParameters: {
  //             "method.response.header.Content-Type": "integration.response.header.Content-Type",
  //           },
  //         },
  //       ],

  //       requestParameters: {
  //         "integration.request.path.folder": "method.request.path.folder",
  //         "integration.request.path.key": "method.request.path.key",
  //       },
  //     },
  //   });
  // }

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