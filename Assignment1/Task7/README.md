# Task 7
7th Task- Test your backend scalability
 
## Instructions 
Write a load test for your backend server to ensure it can scale properly when handling numerous simultaneous requests.

Just remember, we limit the maximum instances to 3, so we still have some limitations. But from the other components, for example, static web pages, we can assume that there is an infinite number of requests allowed.

make sure that:
* the auto scaler launches 3 instances automatically, and then when the load is ended, decreases it back to 1.

* test and explain the behavior of bursting many requests simultaneously vs monotonic increasing of requests.

* try to measure your latency when you have heavily loaded and the SLA of the service, for example, what is the max request that your service can support.

[S3 List object](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html) operation may be a bottleneck in latency and scalability for your application. With some assumptions and simple changes, you can improve that. For example, each instance can do it only once (with the assumption that the file list should not be changed frequently, less than 1 hour). Try to make that optimization and describe whether it improves your application’s scalability or not
