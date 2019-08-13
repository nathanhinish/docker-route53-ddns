# route53-ddns

## Example Config
- HostedZoneId = AWS zone ID
- Common = These keys get applied to each record in the object
- Records = The domain name to update
```
[{
    "HostedZoneId": "FROM AWS",
    "Common": {
      "Region": "WHICH REGION",
      "SetIdentifier": "NOTE TO SELF",
      "Type": "A",
      "TTL": 60
    },
    "Records": [{
        "Name": "www.domain1.com"
      },
      {
        "Name": "www.domain2.com"
      },
      {
        "Name": "*.wildcarddomain.com"
      }
    ]
  },
  
]
```
