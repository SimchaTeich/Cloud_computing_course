# Task 7
7th Task- Test your backend scalability
 
## Instructions 
Write a load test for your backend server to ensure it can scale properly when handling numerous simultaneous requests.

Just remember, we limit the maximum instances to 3, so we still have some limitations. But from the other components, for example, static web pages, we can assume that there is an infinite number of requests allowed.

make sure that:
* the auto scaler launches 3 instances automatically, and then when the load is ended, decreases it back to 1.

* test and explain the behavior of bursting many requests simultaneously vs monotonic increasing of requests.

* try to measure your latency when you have heavily loaded and the SLA of the service, for example, what is the max request that your service can support.

[S3 List object](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html) operation may be a bottleneck in latency and scalability for your application. With some assumptions and simple changes, you can improve that. For example, each instance can do it only once (with the assumption that the file list should not be changed frequently, less than 1 hour). Try to make that optimization and describe whether it improves your application’s scalability or not.

## Implementation
First of all, I changed the settings of the auto scaling group Machine songs according to average requests (just for now, to see the effect)

![](./img/00%20-%20change%20auto%20scale%20settings.png)

After that I created [loadTest.js](./LoadTest/loadTest.js) which will make many requests in parallel with the load balancer. The test should run from my computer or from github codespace and not from the machines in Amazon's lab, because it is important that the test reflect browsing from the world, and not necessarily from that region.

This is what the load balancer looks like before running the test:

![](./img/01%20-%20load%20balancer%20map%20before%20load%20test.png)

This is what the load balancer looks like during the test run:

![](./img/02%20-%20load%20balancer%20map%20after%20load%20test.png)

The consule printing give us the next outputs:
```
...
Response status: 200, Time Taken: 105 ms
Response status: 200, Time Taken: 105 ms
...
Response status: 200, Time Taken: 107 ms
Response status: 200, Time Taken: 106 ms
Response status: 200, Time Taken: 105 ms
Response status: 200, Time Taken: 133 ms
Response status: 200, Time Taken: 110 ms
Response status: 200, Time Taken: 105 ms
Response status: 200, Time Taken: 110 ms
...
Response status: 200, Time Taken: 112 ms
Response status: 200, Time Taken: 123 ms
Response status: 200, Time Taken: 105 ms
Response status: 200, Time Taken: 116 ms
Response status: 200, Time Taken: 103 ms
Response status: 200, Time Taken: 115 ms
Response status: 200, Time Taken: 107 ms
...
```

About 20 minutes after the end of the test, the auto scaling starts killing machines:

![](./img/03%20-%20load%20balancr%20map%20while%20after%20end%20load%20test.png)
![](./img/04%20-%20load%20balancr%20map%20while%20after%20end%20load%20test.png)

After several tests and experiments, I discovered that sending requests at the same time is the one that causes the number of machines to increase, and not sending messages serially. And this because at any given moment there are fewer requests on the machine in a serial format, as opposed to simultaneous sending.

After that, to try to improve performance, I added cashing to express in the backend. You can see the changes in the [myAPI](./myAPI/) folder. Then I packed the backend again into [package.zip](./backend_deployment/package.zip) and updated the s3 bucket named `simcha-Assignment1-deployment-bucket`.

