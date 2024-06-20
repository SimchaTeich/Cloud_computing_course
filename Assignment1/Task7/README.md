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

After that I created [loadTest.js](./LoadTest/loadTest.js) which will make many requests in parallel with the load balancer.

This is what the load balancer looks like before running the test:

![](./img/01%20-%20load%20balancer%20map%20before%20load%20test.png)

This is what the load balancer looks like during the test run:

![](./img/02%20-%20load%20balancer%20map%20after%20load%20test.png)

The consule printing give us the next outputs:
```
...
Response status: 200, Time Taken: 21 ms
Response status: 200, Time Taken: 19 ms
Response status: 200, Time Taken: 22 ms
Response status: 200, Time Taken: 20 ms
Response status: 200, Time Taken: 22 ms
Response status: 200, Time Taken: 19 ms
Response status: 200, Time Taken: 19 ms
Response status: 200, Time Taken: 22 ms
....
Response status: 200, Time Taken: 28 ms
Response status: 200, Time Taken: 27 ms
Response status: 200, Time Taken: 26 ms
Response status: 200, Time Taken: 31 ms
Response status: 200, Time Taken: 19 ms
Response status: 200, Time Taken: 66 ms
Response status: 200, Time Taken: 31 ms
Response status: 200, Time Taken: 28 ms
...
```

About 20 minutes after the end of the test, the auto scaling starts killing machines:

![](./img/03%20-%20load%20balancr%20map%20while%20after%20end%20load%20test.png)
![](./img/04%20-%20load%20balancr%20map%20while%20after%20end%20load%20test.png)

