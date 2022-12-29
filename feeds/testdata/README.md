# Test Data

```
curl -v http://localhost:3000/feed/GatewayService \
  -H "Content-Type: application/json" \
  -X PUT -T gw-services-test.json

curl -v http://localhost:3000/feed/GatewayRoute \
  -H "Content-Type: application/json" \
  -X PUT -T gw-route.json

curl -v http://localhost:3000/feed/GatewayRoute \
  -H "Content-Type: application/json" \
  -X PUT -T gw-route-noplugin.json

curl -v http://localhost:3000/feed/Organization \
  -H "Content-Type: application/json" \
  -X PUT -T org-l1.json

curl -v http://localhost:3000/feed/Organization \
  -H "Content-Type: application/json" \
  -X PUT -T org-l2.json

curl -v http://localhost:3000/feed/Dataset \
  -H "Content-Type: application/json" \
  -X PUT -T dataset.json

curl -v http://localhost:3000/feed/GatewayConsumer \
  -H "Content-Type: application/json" \
  -X PUT -T consumer.json

-- Consumer in Kong was deleted and then created again
curl -v http://localhost:3000/feed/GatewayConsumer \
  -H "Content-Type: application/json" \
  -X PUT -T consumer-2.json

```
