# Cross App demo [ WIP ]

This demo verifies the propagation of the trace context. This demo contains two applications(`serverA` and `serverB`).
The client call serverA by browser, and then the serverA call serverB by httpClient, finally the serverB execute SQL by mysql client.

serverB execute SQL three times, the first execution will happen when the web service called. and the second execution will happened
after the first execution, and the last execution will happened when the call back method belong to the first execution is invoked.

## Generated Segments

### ServerA

Here is generated segments by ServerA.
```json
{
    "traceSegmentId": "d964",
    "span": [
        {
            "operationName": "/test",
            "spanId": 0,
            "parentSpanId": -1
        },
        {
            "operationName": "/1",
            "spanId": 1,
            "parentSpanId": 0
        }
    ]
}
    
```

### ServerB

Here is generated segments by ServerB.
```json
{
    "traceSegmentId": "",
    "span": [
        {
            "operationName": "/1",
            "spanId": 0,
            "parentSpanId": -1
        },
        {
            "operationName": "MySQL/query",
            "spanId": 1,
            "parentSpanId": 0,
        },
        {
            "operationName": "MySQL/query",
            "spanId": 2,
            "parentSpanId": 0
        },
        {
            "operationName": "MySQL/query",
            "spanId": 3,
            "parentSpanId": 0
        }
    ],
    "ref": [
        {
            "parentSegmentId": "d964"
        }
    ]
}
```
