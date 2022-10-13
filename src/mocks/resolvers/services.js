export const allServicesHandler = (req, res, ctx) => {
	return res(ctx.data({
		"allGatewayServicesByNamespace": [
			{
				"id": "976",
				"name": "a-service-for-moh-proto",
				"updatedAt": "2022-10-12T22:29:32.659Z",
				"environment": null,
				"routes": [
					{
						"id": "136",
						"name": "a-service-for-moh-proto-route"
					}
				],
				"plugins": [
					{
						"id": "159",
						"name": "jwt-keycloak"
					}
				]
			}
		],
		"allMetrics": [
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-08",
				"metric": "{\"namespace\":\"hnsesb-gold\"}",
				"values": "[[1665212400,\"0\"],[1665216000,\"0\"],[1665219600,\"0\"],[1665223200,\"0\"],[1665226800,\"0\"],[1665230400,\"0\"],[1665234000,\"0\"],[1665237600,\"0\"],[1665241200,\"0\"],[1665244800,\"0\"],[1665248400,\"0\"],[1665252000,\"0\"],[1665255600,\"0\"],[1665259200,\"0\"],[1665262800,\"0\"],[1665266400,\"0\"],[1665270000,\"0\"],[1665273600,\"0\"],[1665277200,\"0\"],[1665280800,\"0\"],[1665284400,\"0\"],[1665288000,\"0\"],[1665291600,\"0\"],[1665295200,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-08",
				"metric": "{\"namespace\":\"educ-grad\"}",
				"values": "[[1665212400,\"0\"],[1665216000,\"0\"],[1665219600,\"0\"],[1665223200,\"0\"],[1665226800,\"0\"],[1665230400,\"0\"],[1665234000,\"0\"],[1665237600,\"0\"],[1665241200,\"0\"],[1665244800,\"0\"],[1665248400,\"0\"],[1665252000,\"0\"],[1665255600,\"0\"],[1665259200,\"0\"],[1665262800,\"0\"],[1665266400,\"0\"],[1665270000,\"0\"],[1665273600,\"0\"],[1665277200,\"0\"],[1665280800,\"0\"],[1665284400,\"0\"],[1665288000,\"0\"],[1665291600,\"0\"],[1665295200,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-08",
				"metric": "{\"namespace\":\"platform\"}",
				"values": "[[1665212400,\"457.90794979079493\"],[1665216000,\"352.4686192468619\"],[1665219600,\"457.90794979079493\"],[1665223200,\"457.90794979079493\"],[1665226800,\"352.4686192468619\"],[1665230400,\"457.90794979079493\"],[1665234000,\"457.90794979079493\"],[1665237600,\"457.9079497907949\"],[1665241200,\"352.46861924686186\"],[1665244800,\"457.90794979079493\"],[1665248400,\"457.90794979079493\"],[1665252000,\"399.6652719665272\"],[1665255600,\"459.9163179916318\"],[1665259200,\"457.90794979079493\"],[1665262800,\"352.4686192468619\"],[1665266400,\"457.90794979079493\"],[1665270000,\"457.90794979079493\"],[1665273600,\"457.90794979079493\"],[1665277200,\"352.4686192468619\"],[1665280800,\"457.90794979079493\"],[1665284400,\"457.90794979079493\"],[1665288000,\"352.4686192468619\"],[1665291600,\"457.90794979079493\"],[1665295200,\"457.90794979079493\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-08",
				"metric": "{\"namespace\":\"ajctest-jun2022\"}",
				"values": "[[1665212400,\"0\"],[1665216000,\"0\"],[1665219600,\"0\"],[1665223200,\"0\"],[1665226800,\"0\"],[1665230400,\"0\"],[1665234000,\"0\"],[1665237600,\"0\"],[1665241200,\"0\"],[1665244800,\"0\"],[1665248400,\"0\"],[1665252000,\"0\"],[1665255600,\"0\"],[1665259200,\"0\"],[1665262800,\"0\"],[1665266400,\"0\"],[1665270000,\"0\"],[1665273600,\"0\"],[1665277200,\"0\"],[1665280800,\"0\"],[1665284400,\"0\"],[1665288000,\"0\"],[1665291600,\"0\"],[1665295200,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-08",
				"metric": "{\"namespace\":\"smk-apps\"}",
				"values": "[[1665212400,\"0\"],[1665216000,\"0\"],[1665219600,\"0\"],[1665223200,\"0\"],[1665226800,\"0\"],[1665230400,\"0\"],[1665234000,\"0\"],[1665237600,\"0\"],[1665241200,\"0\"],[1665244800,\"0\"],[1665248400,\"0\"],[1665252000,\"0\"],[1665255600,\"0\"],[1665259200,\"0\"],[1665262800,\"0\"],[1665266400,\"0\"],[1665270000,\"0\"],[1665273600,\"0\"],[1665277200,\"0\"],[1665280800,\"0\"],[1665284400,\"0\"],[1665288000,\"0\"],[1665291600,\"0\"],[1665295200,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-08",
				"metric": "{\"namespace\":\"hns-esb-dev\"}",
				"values": "[[1665212400,\"0\"],[1665216000,\"0\"],[1665219600,\"0\"],[1665223200,\"0\"],[1665226800,\"0\"],[1665230400,\"0\"],[1665234000,\"0\"],[1665237600,\"0\"],[1665241200,\"0\"],[1665244800,\"0\"],[1665248400,\"0\"],[1665252000,\"0\"],[1665255600,\"0\"],[1665259200,\"0\"],[1665262800,\"0\"],[1665266400,\"0\"],[1665270000,\"0\"],[1665273600,\"0\"],[1665277200,\"0\"],[1665280800,\"0\"],[1665284400,\"0\"],[1665288000,\"0\"],[1665291600,\"0\"],[1665295200,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-08",
				"metric": "{\"namespace\":\"educ-pen-test\"}",
				"values": "[[1665212400,\"0\"],[1665216000,\"0\"],[1665219600,\"0\"],[1665223200,\"0\"],[1665226800,\"0\"],[1665230400,\"0\"],[1665234000,\"0\"],[1665237600,\"0\"],[1665241200,\"0\"],[1665244800,\"0\"],[1665248400,\"0\"],[1665252000,\"0\"],[1665255600,\"0\"],[1665259200,\"0\"],[1665262800,\"0\"],[1665266400,\"0\"],[1665270000,\"0\"],[1665273600,\"0\"],[1665277200,\"0\"],[1665280800,\"0\"],[1665284400,\"0\"],[1665288000,\"0\"],[1665291600,\"0\"],[1665295200,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-08",
				"metric": "{\"namespace\":\"bcparks\"}",
				"values": "[[1665212400,\"0\"],[1665216000,\"0\"],[1665219600,\"0\"],[1665223200,\"0\"],[1665226800,\"0\"],[1665230400,\"0\"],[1665234000,\"0\"],[1665237600,\"0\"],[1665241200,\"0\"],[1665244800,\"0\"],[1665248400,\"0\"],[1665252000,\"0\"],[1665255600,\"0\"],[1665259200,\"0\"],[1665262800,\"0\"],[1665266400,\"0\"],[1665270000,\"0\"],[1665273600,\"0\"],[1665277200,\"0\"],[1665280800,\"0\"],[1665284400,\"0\"],[1665288000,\"0\"],[1665291600,\"0\"],[1665295200,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-08",
				"metric": "{\"namespace\":\"educ-pen\"}",
				"values": "[[1665212400,\"0\"],[1665216000,\"0\"],[1665219600,\"0\"],[1665223200,\"0\"],[1665226800,\"0\"],[1665230400,\"0\"],[1665234000,\"0\"],[1665237600,\"0\"],[1665241200,\"0\"],[1665244800,\"0\"],[1665248400,\"0\"],[1665252000,\"0\"],[1665255600,\"0\"],[1665259200,\"0\"],[1665262800,\"0\"],[1665266400,\"0\"],[1665270000,\"0\"],[1665273600,\"0\"],[1665277200,\"0\"],[1665280800,\"0\"],[1665284400,\"0\"],[1665288000,\"0\"],[1665291600,\"0\"],[1665295200,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-09",
				"metric": "{\"namespace\":\"bcparks\"}",
				"values": "[[1665298800,\"0\"],[1665302400,\"0\"],[1665306000,\"0\"],[1665309600,\"0\"],[1665313200,\"0\"],[1665316800,\"0\"],[1665320400,\"0\"],[1665324000,\"0\"],[1665327600,\"0\"],[1665331200,\"0\"],[1665334800,\"0\"],[1665338400,\"0\"],[1665342000,\"0\"],[1665345600,\"0\"],[1665349200,\"0\"],[1665352800,\"0\"],[1665356400,\"0\"],[1665360000,\"0\"],[1665363600,\"0\"],[1665367200,\"0\"],[1665370800,\"0\"],[1665374400,\"0\"],[1665378000,\"0\"],[1665381600,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-09",
				"metric": "{\"namespace\":\"ajctest-jun2022\"}",
				"values": "[[1665298800,\"0\"],[1665302400,\"0\"],[1665306000,\"0\"],[1665309600,\"0\"],[1665313200,\"0\"],[1665316800,\"0\"],[1665320400,\"0\"],[1665324000,\"0\"],[1665327600,\"0\"],[1665331200,\"0\"],[1665334800,\"0\"],[1665338400,\"0\"],[1665342000,\"0\"],[1665345600,\"0\"],[1665349200,\"0\"],[1665352800,\"0\"],[1665356400,\"0\"],[1665360000,\"0\"],[1665363600,\"0\"],[1665367200,\"0\"],[1665370800,\"0\"],[1665374400,\"0\"],[1665378000,\"0\"],[1665381600,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-09",
				"metric": "{\"namespace\":\"educ-pen\"}",
				"values": "[[1665298800,\"0\"],[1665302400,\"0\"],[1665306000,\"0\"],[1665309600,\"0\"],[1665313200,\"0\"],[1665316800,\"0\"],[1665320400,\"0\"],[1665324000,\"0\"],[1665327600,\"0\"],[1665331200,\"0\"],[1665334800,\"0\"],[1665338400,\"0\"],[1665342000,\"0\"],[1665345600,\"0\"],[1665349200,\"0\"],[1665352800,\"0\"],[1665356400,\"0\"],[1665360000,\"0\"],[1665363600,\"0\"],[1665367200,\"0\"],[1665370800,\"0\"],[1665374400,\"0\"],[1665378000,\"0\"],[1665381600,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-09",
				"metric": "{\"namespace\":\"educ-grad\"}",
				"values": "[[1665298800,\"0\"],[1665302400,\"0\"],[1665306000,\"0\"],[1665309600,\"0\"],[1665313200,\"0\"],[1665316800,\"0\"],[1665320400,\"0\"],[1665324000,\"0\"],[1665327600,\"0\"],[1665331200,\"0\"],[1665334800,\"0\"],[1665338400,\"0\"],[1665342000,\"0\"],[1665345600,\"0\"],[1665349200,\"0\"],[1665352800,\"0\"],[1665356400,\"0\"],[1665360000,\"0\"],[1665363600,\"0\"],[1665367200,\"0\"],[1665370800,\"0\"],[1665374400,\"0\"],[1665378000,\"0\"],[1665381600,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-09",
				"metric": "{\"namespace\":\"hns-esb-dev\"}",
				"values": "[[1665298800,\"0\"],[1665302400,\"0\"],[1665306000,\"0\"],[1665309600,\"0\"],[1665313200,\"0\"],[1665316800,\"0\"],[1665320400,\"0\"],[1665324000,\"0\"],[1665327600,\"0\"],[1665331200,\"0\"],[1665334800,\"0\"],[1665338400,\"0\"],[1665342000,\"0\"],[1665345600,\"0\"],[1665349200,\"0\"],[1665352800,\"0\"],[1665356400,\"0\"],[1665360000,\"0\"],[1665363600,\"0\"],[1665367200,\"0\"],[1665370800,\"0\"],[1665374400,\"0\"],[1665378000,\"0\"],[1665381600,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-09",
				"metric": "{\"namespace\":\"hnsesb-gold\"}",
				"values": "[[1665298800,\"0\"],[1665302400,\"0\"],[1665306000,\"0\"],[1665309600,\"0\"],[1665313200,\"0\"],[1665316800,\"0\"],[1665320400,\"0\"],[1665324000,\"0\"],[1665327600,\"0\"],[1665331200,\"0\"],[1665334800,\"0\"],[1665338400,\"0\"],[1665342000,\"0\"],[1665345600,\"0\"],[1665349200,\"0\"],[1665352800,\"0\"],[1665356400,\"0\"],[1665360000,\"0\"],[1665363600,\"0\"],[1665367200,\"0\"],[1665370800,\"0\"],[1665374400,\"0\"],[1665378000,\"0\"],[1665381600,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-09",
				"metric": "{\"namespace\":\"smk-apps\"}",
				"values": "[[1665298800,\"0\"],[1665302400,\"0\"],[1665306000,\"0\"],[1665309600,\"0\"],[1665313200,\"0\"],[1665316800,\"0\"],[1665320400,\"0\"],[1665324000,\"0\"],[1665327600,\"0\"],[1665331200,\"0\"],[1665334800,\"0\"],[1665338400,\"0\"],[1665342000,\"0\"],[1665345600,\"0\"],[1665349200,\"0\"],[1665352800,\"0\"],[1665356400,\"0\"],[1665360000,\"0\"],[1665363600,\"0\"],[1665367200,\"0\"],[1665370800,\"0\"],[1665374400,\"0\"],[1665378000,\"0\"],[1665381600,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-09",
				"metric": "{\"namespace\":\"educ-pen-test\"}",
				"values": "[[1665298800,\"0\"],[1665302400,\"0\"],[1665306000,\"0\"],[1665309600,\"0\"],[1665313200,\"0\"],[1665316800,\"0\"],[1665320400,\"0\"],[1665324000,\"0\"],[1665327600,\"0\"],[1665331200,\"0\"],[1665334800,\"0\"],[1665338400,\"0\"],[1665342000,\"0\"],[1665345600,\"0\"],[1665349200,\"0\"],[1665352800,\"0\"],[1665356400,\"0\"],[1665360000,\"0\"],[1665363600,\"0\"],[1665367200,\"0\"],[1665370800,\"0\"],[1665374400,\"0\"],[1665378000,\"0\"],[1665381600,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-09",
				"metric": "{\"namespace\":\"platform\"}",
				"values": "[[1665298800,\"457.90794979079493\"],[1665302400,\"352.4686192468619\"],[1665306000,\"457.90794979079493\"],[1665309600,\"457.90794979079493\"],[1665313200,\"352.4686192468619\"],[1665316800,\"457.90794979079493\"],[1665320400,\"457.90794979079493\"],[1665324000,\"352.4686192468619\"],[1665327600,\"459.91631799163173\"],[1665331200,\"458.91213389121333\"],[1665334800,\"457.90794979079493\"],[1665338400,\"352.4686192468619\"],[1665342000,\"457.90794979079493\"],[1665345600,\"457.90794979079493\"],[1665349200,\"352.4686192468619\"],[1665352800,\"457.90794979079493\"],[1665356400,\"457.90794979079493\"],[1665360000,\"423.765690376569\"],[1665363600,\"355.4811715481171\"],[1665367200,\"457.90794979079493\"],[1665370800,\"457.90794979079493\"],[1665374400,\"352.4686192468619\"],[1665378000,\"457.90794979079493\"],[1665381600,\"457.90794979079493\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-10",
				"metric": "{\"namespace\":\"hnsesb-gold\"}",
				"values": "[[1665385200,\"0\"],[1665388800,\"0\"],[1665392400,\"0\"],[1665396000,\"0\"],[1665399600,\"0\"],[1665403200,\"0\"],[1665406800,\"0\"],[1665410400,\"0\"],[1665414000,\"0\"],[1665417600,\"0\"],[1665421200,\"0\"],[1665424800,\"0\"],[1665428400,\"0\"],[1665432000,\"0\"],[1665435600,\"0\"],[1665439200,\"0\"],[1665442800,\"0\"],[1665446400,\"0\"],[1665450000,\"0\"],[1665453600,\"0\"],[1665457200,\"0\"],[1665460800,\"0\"],[1665464400,\"0\"],[1665468000,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-10",
				"metric": "{\"namespace\":\"educ-grad\"}",
				"values": "[[1665385200,\"0\"],[1665388800,\"0\"],[1665392400,\"0\"],[1665396000,\"0\"],[1665399600,\"0\"],[1665403200,\"0\"],[1665406800,\"0\"],[1665410400,\"0\"],[1665414000,\"0\"],[1665417600,\"0\"],[1665421200,\"0\"],[1665424800,\"0\"],[1665428400,\"0\"],[1665432000,\"0\"],[1665435600,\"0\"],[1665439200,\"0\"],[1665442800,\"0\"],[1665446400,\"0\"],[1665450000,\"0\"],[1665453600,\"0\"],[1665457200,\"0\"],[1665460800,\"0\"],[1665464400,\"0\"],[1665468000,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-10",
				"metric": "{\"namespace\":\"smk-apps\"}",
				"values": "[[1665385200,\"0\"],[1665388800,\"0\"],[1665392400,\"0\"],[1665396000,\"0\"],[1665399600,\"0\"],[1665403200,\"0\"],[1665406800,\"0\"],[1665410400,\"0\"],[1665414000,\"0\"],[1665417600,\"0\"],[1665421200,\"0\"],[1665424800,\"0\"],[1665428400,\"0\"],[1665432000,\"0\"],[1665435600,\"0\"],[1665439200,\"0\"],[1665442800,\"0\"],[1665446400,\"0\"],[1665450000,\"0\"],[1665453600,\"0\"],[1665457200,\"0\"],[1665460800,\"0\"],[1665464400,\"0\"],[1665468000,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-10",
				"metric": "{\"namespace\":\"hns-esb-dev\"}",
				"values": "[[1665385200,\"0\"],[1665388800,\"0\"],[1665392400,\"0\"],[1665396000,\"0\"],[1665399600,\"0\"],[1665403200,\"0\"],[1665406800,\"0\"],[1665410400,\"0\"],[1665414000,\"0\"],[1665417600,\"0\"],[1665421200,\"0\"],[1665424800,\"0\"],[1665428400,\"0\"],[1665432000,\"0\"],[1665435600,\"0\"],[1665439200,\"0\"],[1665442800,\"0\"],[1665446400,\"0\"],[1665450000,\"0\"],[1665453600,\"0\"],[1665457200,\"0\"],[1665460800,\"0\"],[1665464400,\"0\"],[1665468000,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-10",
				"metric": "{\"namespace\":\"bcparks\"}",
				"values": "[[1665385200,\"0\"],[1665388800,\"0\"],[1665392400,\"0\"],[1665396000,\"0\"],[1665399600,\"0\"],[1665403200,\"0\"],[1665406800,\"0\"],[1665410400,\"0\"],[1665414000,\"0\"],[1665417600,\"0\"],[1665421200,\"0\"],[1665424800,\"0\"],[1665428400,\"0\"],[1665432000,\"0\"],[1665435600,\"0\"],[1665439200,\"0\"],[1665442800,\"0\"],[1665446400,\"0\"],[1665450000,\"0\"],[1665453600,\"0\"],[1665457200,\"0\"],[1665460800,\"0\"],[1665464400,\"0\"],[1665468000,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-10",
				"metric": "{\"namespace\":\"ajctest-jun2022\"}",
				"values": "[[1665385200,\"0\"],[1665388800,\"0\"],[1665392400,\"0\"],[1665396000,\"0\"],[1665399600,\"0\"],[1665403200,\"0\"],[1665406800,\"0\"],[1665410400,\"0\"],[1665414000,\"0\"],[1665417600,\"0\"],[1665421200,\"0\"],[1665424800,\"0\"],[1665428400,\"0\"],[1665432000,\"0\"],[1665435600,\"0\"],[1665439200,\"0\"],[1665442800,\"0\"],[1665446400,\"0\"],[1665450000,\"0\"],[1665453600,\"0\"],[1665457200,\"0\"],[1665460800,\"0\"],[1665464400,\"0\"],[1665468000,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-10",
				"metric": "{\"namespace\":\"educ-pen-test\"}",
				"values": "[[1665385200,\"0\"],[1665388800,\"0\"],[1665392400,\"0\"],[1665396000,\"0\"],[1665399600,\"0\"],[1665403200,\"0\"],[1665406800,\"0\"],[1665410400,\"0\"],[1665414000,\"0\"],[1665417600,\"0\"],[1665421200,\"0\"],[1665424800,\"0\"],[1665428400,\"0\"],[1665432000,\"0\"],[1665435600,\"0\"],[1665439200,\"0\"],[1665442800,\"0\"],[1665446400,\"0\"],[1665450000,\"0\"],[1665453600,\"0\"],[1665457200,\"0\"],[1665460800,\"0\"],[1665464400,\"0\"],[1665468000,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-10",
				"metric": "{\"namespace\":\"educ-pen\"}",
				"values": "[[1665385200,\"0\"],[1665388800,\"0\"],[1665392400,\"0\"],[1665396000,\"0\"],[1665399600,\"0\"],[1665403200,\"0\"],[1665406800,\"0\"],[1665410400,\"0\"],[1665414000,\"0\"],[1665417600,\"0\"],[1665421200,\"0\"],[1665424800,\"0\"],[1665428400,\"0\"],[1665432000,\"0\"],[1665435600,\"0\"],[1665439200,\"0\"],[1665442800,\"0\"],[1665446400,\"0\"],[1665450000,\"0\"],[1665453600,\"0\"],[1665457200,\"0\"],[1665460800,\"0\"],[1665464400,\"0\"],[1665468000,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-10",
				"metric": "{\"namespace\":\"platform\"}",
				"values": "[[1665385200,\"352.4686192468619\"],[1665388800,\"457.90794979079493\"],[1665392400,\"457.90794979079493\"],[1665396000,\"457.90794979079493\"],[1665399600,\"352.4686192468619\"],[1665403200,\"457.90794979079493\"],[1665406800,\"457.9079497907949\"],[1665410400,\"352.4686192468619\"],[1665414000,\"457.90794979079493\"],[1665417600,\"457.90794979079493\"],[1665421200,\"352.4686192468619\"],[1665424800,\"457.90794979079493\"],[1665428400,\"457.90794979079493\"],[1665432000,\"461.92468619246864\"],[1665435600,\"354.4769874476987\"],[1665439200,\"457.90794979079493\"],[1665442800,\"468.9539748953974\"],[1665446400,\"352.4686192468619\"],[1665450000,\"457.90794979079493\"],[1665453600,\"457.90794979079493\"],[1665457200,\"457.907949790795\"],[1665460800,\"352.4686192468619\"],[1665464400,\"457.90794979079493\"],[1665468000,\"457.90794979079493\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-11",
				"metric": "{\"namespace\":\"platform\"}",
				"values": "[[1665471600,\"352.4686192468619\"],[1665475200,\"457.90794979079493\"],[1665478800,\"457.90794979079493\"],[1665482400,\"352.4686192468619\"],[1665486000,\"457.90794979079493\"],[1665489600,\"457.90794979079493\"],[1665493200,\"457.90794979079493\"],[1665496800,\"352.4686192468619\"],[1665500400,\"457.90794979079493\"],[1665504000,\"457.90794979079493\"],[1665507600,\"580.4184100418413\"],[1665511200,\"458.91213389121333\"],[1665514800,\"458.9121338912134\"],[1665518400,\"354.4769874476987\"],[1665522000,\"457.90794979079493\"],[1665525600,\"583.4309623430962\"],[1665529200,\"479.9999999999999\"],[1665532800,\"355.4811715481171\"],[1665536400,\"456.9037656903766\"],[1665540000,\"456.90376569037653\"],[1665543600,\"403.68200836820074\"],[1665547200,\"457.90794979079493\"],[1665550800,\"774.2259414225942\"],[1665554400,\"458.91213389121333\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-11",
				"metric": "{\"namespace\":\"hns-esb-dev\"}",
				"values": "[[1665471600,\"0\"],[1665475200,\"0\"],[1665478800,\"0\"],[1665482400,\"0\"],[1665486000,\"0\"],[1665489600,\"0\"],[1665493200,\"0\"],[1665496800,\"0\"],[1665500400,\"0\"],[1665504000,\"0\"],[1665507600,\"0\"],[1665511200,\"0\"],[1665514800,\"0\"],[1665518400,\"0\"],[1665522000,\"0\"],[1665525600,\"0\"],[1665529200,\"0\"],[1665532800,\"0\"],[1665536400,\"0\"],[1665540000,\"0\"],[1665543600,\"0\"],[1665547200,\"0\"],[1665550800,\"0\"],[1665554400,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-11",
				"metric": "{\"namespace\":\"ajctest-jun2022\"}",
				"values": "[[1665471600,\"0\"],[1665475200,\"0\"],[1665478800,\"0\"],[1665482400,\"0\"],[1665486000,\"0\"],[1665489600,\"0\"],[1665493200,\"0\"],[1665496800,\"0\"],[1665500400,\"0\"],[1665504000,\"0\"],[1665507600,\"0\"],[1665511200,\"0\"],[1665514800,\"0\"],[1665518400,\"0\"],[1665522000,\"0\"],[1665525600,\"0\"],[1665529200,\"0\"],[1665532800,\"0\"],[1665536400,\"0\"],[1665540000,\"0\"],[1665543600,\"0\"],[1665547200,\"0\"],[1665550800,\"0\"],[1665554400,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-11",
				"metric": "{\"namespace\":\"smk-apps\"}",
				"values": "[[1665471600,\"0\"],[1665475200,\"0\"],[1665478800,\"0\"],[1665482400,\"0\"],[1665486000,\"0\"],[1665489600,\"0\"],[1665493200,\"0\"],[1665496800,\"0\"],[1665500400,\"0\"],[1665504000,\"0\"],[1665507600,\"0\"],[1665511200,\"0\"],[1665514800,\"0\"],[1665518400,\"0\"],[1665522000,\"0\"],[1665525600,\"0\"],[1665529200,\"0\"],[1665532800,\"0\"],[1665536400,\"0\"],[1665540000,\"0\"],[1665543600,\"0\"],[1665547200,\"0\"],[1665550800,\"0\"],[1665554400,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-11",
				"metric": "{\"namespace\":\"bcparks\"}",
				"values": "[[1665471600,\"0\"],[1665475200,\"0\"],[1665478800,\"0\"],[1665482400,\"0\"],[1665486000,\"0\"],[1665489600,\"0\"],[1665493200,\"0\"],[1665496800,\"0\"],[1665500400,\"0\"],[1665504000,\"0\"],[1665507600,\"0\"],[1665511200,\"0\"],[1665514800,\"0\"],[1665518400,\"0\"],[1665522000,\"0\"],[1665525600,\"9.07563025210084\"],[1665529200,\"0\"],[1665532800,\"0\"],[1665536400,\"0\"],[1665540000,\"0\"],[1665543600,\"0\"],[1665547200,\"0\"],[1665550800,\"0\"],[1665554400,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-11",
				"metric": "{\"namespace\":\"educ-pen-test\"}",
				"values": "[[1665471600,\"0\"],[1665475200,\"0\"],[1665478800,\"0\"],[1665482400,\"0\"],[1665486000,\"0\"],[1665489600,\"0\"],[1665493200,\"0\"],[1665496800,\"0\"],[1665500400,\"0\"],[1665504000,\"0\"],[1665507600,\"0\"],[1665511200,\"6.050420168067227\"],[1665514800,\"0\"],[1665518400,\"0\"],[1665522000,\"0\"],[1665525600,\"0\"],[1665529200,\"0\"],[1665532800,\"0\"],[1665536400,\"0\"],[1665540000,\"0\"],[1665543600,\"0\"],[1665547200,\"0\"],[1665550800,\"0\"],[1665554400,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-11",
				"metric": "{\"namespace\":\"educ-pen\"}",
				"values": "[[1665471600,\"0\"],[1665475200,\"0\"],[1665478800,\"0\"],[1665482400,\"0\"],[1665486000,\"0\"],[1665489600,\"0\"],[1665493200,\"0\"],[1665496800,\"0\"],[1665500400,\"0\"],[1665504000,\"0\"],[1665507600,\"0\"],[1665511200,\"0\"],[1665514800,\"0\"],[1665518400,\"0\"],[1665522000,\"0\"],[1665525600,\"0\"],[1665529200,\"0\"],[1665532800,\"0\"],[1665536400,\"0\"],[1665540000,\"0\"],[1665543600,\"0\"],[1665547200,\"0\"],[1665550800,\"0\"],[1665554400,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-11",
				"metric": "{\"namespace\":\"educ-grad\"}",
				"values": "[[1665471600,\"0\"],[1665475200,\"0\"],[1665478800,\"0\"],[1665482400,\"0\"],[1665486000,\"0\"],[1665489600,\"0\"],[1665493200,\"0\"],[1665496800,\"0\"],[1665500400,\"0\"],[1665504000,\"0\"],[1665507600,\"0\"],[1665511200,\"0\"],[1665514800,\"0\"],[1665518400,\"0\"],[1665522000,\"0\"],[1665525600,\"0\"],[1665529200,\"0\"],[1665532800,\"0\"],[1665536400,\"0\"],[1665540000,\"0\"],[1665543600,\"0\"],[1665547200,\"0\"],[1665550800,\"0\"],[1665554400,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-11",
				"metric": "{\"namespace\":\"hnsesb-gold\"}",
				"values": "[[1665471600,\"0\"],[1665475200,\"0\"],[1665478800,\"0\"],[1665482400,\"0\"],[1665486000,\"0\"],[1665489600,\"0\"],[1665493200,\"0\"],[1665496800,\"0\"],[1665500400,\"0\"],[1665504000,\"0\"],[1665507600,\"0\"],[1665511200,\"0\"],[1665514800,\"0\"],[1665518400,\"0\"],[1665522000,\"0\"],[1665525600,\"0\"],[1665529200,\"0\"],[1665532800,\"0\"],[1665536400,\"0\"],[1665540000,\"0\"],[1665543600,\"0\"],[1665547200,\"0\"],[1665550800,\"0\"],[1665554400,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-12",
				"metric": "{\"namespace\":\"educ-grad\"}",
				"values": "[[1665558000,\"0\"],[1665561600,\"0\"],[1665565200,\"0\"],[1665568800,\"0\"],[1665572400,\"0\"],[1665576000,\"0\"],[1665579600,\"0\"],[1665583200,\"0\"],[1665586800,\"0\"],[1665590400,\"0\"],[1665594000,\"0\"],[1665597600,\"0\"],[1665601200,\"0\"],[1665604800,\"0\"],[1665608400,\"0\"],[1665612000,\"0\"],[1665615600,\"0\"],[1665619200,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-12",
				"metric": "{\"namespace\":\"ajctest-jun2022\"}",
				"values": "[[1665558000,\"0\"],[1665561600,\"0\"],[1665565200,\"0\"],[1665568800,\"0\"],[1665572400,\"0\"],[1665576000,\"0\"],[1665579600,\"0\"],[1665583200,\"0\"],[1665586800,\"0\"],[1665590400,\"0\"],[1665594000,\"0\"],[1665597600,\"0\"],[1665601200,\"0\"],[1665604800,\"0\"],[1665608400,\"0\"],[1665612000,\"0\"],[1665615600,\"0\"],[1665619200,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-12",
				"metric": "{\"namespace\":\"hns-esb-dev\"}",
				"values": "[[1665558000,\"0\"],[1665561600,\"0\"],[1665565200,\"0\"],[1665568800,\"0\"],[1665572400,\"0\"],[1665576000,\"0\"],[1665579600,\"0\"],[1665583200,\"0\"],[1665586800,\"0\"],[1665590400,\"0\"],[1665594000,\"0\"],[1665597600,\"0\"],[1665601200,\"0\"],[1665604800,\"0\"],[1665608400,\"0\"],[1665612000,\"0\"],[1665615600,\"0\"],[1665619200,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-12",
				"metric": "{\"namespace\":\"educ-pen-test\"}",
				"values": "[[1665558000,\"0\"],[1665561600,\"0\"],[1665565200,\"0\"],[1665568800,\"0\"],[1665572400,\"0\"],[1665576000,\"0\"],[1665579600,\"0\"],[1665583200,\"0\"],[1665586800,\"0\"],[1665590400,\"0\"],[1665594000,\"0\"],[1665597600,\"0\"],[1665601200,\"0\"],[1665604800,\"0\"],[1665608400,\"0\"],[1665612000,\"0\"],[1665615600,\"0\"],[1665619200,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-12",
				"metric": "{\"namespace\":\"hnsesb-gold\"}",
				"values": "[[1665558000,\"0\"],[1665561600,\"0\"],[1665565200,\"0\"],[1665568800,\"0\"],[1665572400,\"0\"],[1665576000,\"0\"],[1665579600,\"0\"],[1665583200,\"0\"],[1665586800,\"0\"],[1665590400,\"0\"],[1665594000,\"0\"],[1665597600,\"0\"],[1665601200,\"0\"],[1665604800,\"0\"],[1665608400,\"0\"],[1665612000,\"0\"],[1665615600,\"0\"],[1665619200,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-12",
				"metric": "{\"namespace\":\"educ-pen\"}",
				"values": "[[1665558000,\"0\"],[1665561600,\"0\"],[1665565200,\"0\"],[1665568800,\"0\"],[1665572400,\"0\"],[1665576000,\"0\"],[1665579600,\"0\"],[1665583200,\"0\"],[1665586800,\"0\"],[1665590400,\"0\"],[1665594000,\"0\"],[1665597600,\"0\"],[1665601200,\"0\"],[1665604800,\"0\"],[1665608400,\"0\"],[1665612000,\"0\"],[1665615600,\"0\"],[1665619200,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-12",
				"metric": "{\"namespace\":\"platform\"}",
				"values": "[[1665558000,\"353.47280334728026\"],[1665561600,\"457.90794979079493\"],[1665565200,\"457.90794979079493\"],[1665568800,\"352.4686192468619\"],[1665572400,\"457.90794979079493\"],[1665576000,\"457.90794979079493\"],[1665579600,\"352.4686192468619\"],[1665583200,\"457.90794979079493\"],[1665586800,\"457.90794979079493\"],[1665590400,\"458.91213389121333\"],[1665594000,\"351.46443514644346\"],[1665597600,\"459.91631799163173\"],[1665601200,\"548.2845188284518\"],[1665604800,\"367.7198987147301\"],[1665608400,\"463.93305439330544\"],[1665612000,\"575.3974895397491\"],[1665615600,\"456.9037656903766\"],[1665619200,\"122.55949106185717\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-12",
				"metric": "{\"namespace\":\"bcparks\"}",
				"values": "[[1665558000,\"0\"],[1665561600,\"0\"],[1665565200,\"0\"],[1665568800,\"0\"],[1665572400,\"0\"],[1665576000,\"0\"],[1665579600,\"0\"],[1665583200,\"0\"],[1665586800,\"0\"],[1665590400,\"0\"],[1665594000,\"0\"],[1665597600,\"0\"],[1665601200,\"4.033613445378151\"],[1665604800,\"0\"],[1665608400,\"0\"],[1665612000,\"2.0168067226890756\"],[1665615600,\"0\"],[1665619200,\"0\"]]"
			},
			{
				"query": "kong_http_requests_hourly_namespace",
				"day": "2022-10-12",
				"metric": "{\"namespace\":\"smk-apps\"}",
				"values": "[[1665558000,\"0\"],[1665561600,\"0\"],[1665565200,\"0\"],[1665568800,\"0\"],[1665572400,\"0\"],[1665576000,\"0\"],[1665579600,\"0\"],[1665583200,\"0\"],[1665586800,\"0\"],[1665590400,\"0\"],[1665594000,\"0\"],[1665597600,\"0\"],[1665601200,\"0\"],[1665604800,\"0\"],[1665608400,\"0\"],[1665612000,\"0\"],[1665615600,\"0\"],[1665619200,\"0\"]]"
			}
		]
	}));
};

export const getMetricsHandler = (req, res, ctx) => {
	return res(ctx.data({
		allMetrics: []
	}))
};
