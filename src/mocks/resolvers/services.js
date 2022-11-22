import { uniqBy } from 'lodash';
import { allProductsByNamespace, store } from './consumers';

const gatewayServices = [
  {
    id: '123123',
    name: 'aps-example',
    updatedAt: '2022-10-21T15:55:35.732Z',
    environment: {
      name: 'prod',
    },
    routes: [
      {
        id: '2034ur20',
        name: 'aps-example',
      },
    ],
    plugins: [
      {
        id: '3423dk',
        name: 'response-transformer',
      },
    ],
  },
  {
    id: '32ejwij1j',
    name: 'a-service-for-aps-portal',
    updatedAt: '2022-10-21T15:55:36.842Z',
    environment: {
      name: 'dev',
    },
    routes: [
      {
        id: '109ej23',
        name: 'a-service-for-aps-portal-route',
      },
    ],
    plugins: [
      {
        id: '012ijd02q',
        name: 'acl',
      },
      {
        id: '102uj09ej',
        name: 'key-auth',
      },
    ],
  },
  {
    id: '10idj03wiej',
    name: 'aps-portal',
    updatedAt: '2022-10-21T15:55:31.637Z',
    environment: {
      name: 'prod',
    },
    routes: [
      {
        id: '90jwe0r9f',
        name: 'aps-portal-directory-api',
      },
      {
        id: '90asdj0f',
        name: 'aps-portal',
      },
      {
        id: 'oj0j09ij',
        name: 'aps-portal-logout-bceid-fix',
      },
    ],
    plugins: [
      {
        id: '0i1j0',
        name: 'request-transformer',
      },
      {
        id: '0a9sdj',
        name: 'response-transformer',
      },
    ],
  },
];

export const allServicesHandler = (req, res, ctx) => {
  return res(
    ctx.data({
      allGatewayServicesByNamespace: gatewayServices,
      allMetrics: [
        {
          query: 'kong_http_requests_hourly_namespace',
          day: '2022-10-17',
          metric: '{"namespace":"aps-portal"}',
          values:
            '[[1665990000,"265.1046025104602"],[1665993600,"265.1046025104602"],[1665997200,"207.8661087866109"],[1666000800,"265.1046025104602"],[1666004400,"265.10460251046027"],[1666008000,"265.1046025104602"],[1666011600,"265.10460251046027"],[1666015200,"265.1046025104602"],[1666018800,"206.86192468619248"],[1666022400,"264.1004184100418"],[1666026000,"265.10460251046027"],[1666029600,"265.10460251046027"],[1666033200,"314.3096234309623"],[1666036800,"266.1087866108786"],[1666040400,"272.1338912133891"],[1666044000,"472.97071129707115"],[1666047600,"442.8451882845189"],[1666051200,"289.205020920502"],[1666054800,"270.12552301255226"],[1666058400,"265.10460251046027"],[1666062000,"207.86610878661088"],[1666065600,"378.5774058577406"],[1666069200,"707.9497907949791"],[1666072800,"3258.5774058577413"]]',
        },
        {
          query: 'kong_http_requests_hourly_namespace',
          day: '2022-10-18',
          metric: '{"namespace":"aps-portal"}',
          values:
            '[[1666076400,"766.1924686192467"],[1666080000,"265.1046025104602"],[1666083600,"207.86610878661088"],[1666087200,"265.1046025104602"],[1666090800,"265.10460251046027"],[1666094400,"265.1046025104602"],[1666098000,"265.1046025104602"],[1666101600,"265.1046025104602"],[1666105200,"207.86610878661088"],[1666108800,"271.1297071129707"],[1666112400,"267.112970711297"],[1666116000,"265.1046025104602"],[1666119600,"1267.2950028798673"],[1666123200,"292.2175732217573"],[1666126800,"235.98326359832632"],[1666130400,"513.1380753138075"],[1666134000,"1346.6108786610878"],[1666137600,"713.9748953974897"],[1666141200,"300.25104602510453"],[1666144800,"300.25104602510464"],[1666148400,"243.01255230125523"],[1666152000,"300.25104602510464"],[1666155600,"463.93305439330544"],[1666159200,"328.3682008368201"]]',
        },
        {
          query: 'kong_http_requests_hourly_namespace',
          day: '2022-10-19',
          metric: '{"namespace":"aps-portal"}',
          values:
            '[[1666162800,"301.25523012552304"],[1666166400,"300.2510460251046"],[1666170000,"243.01255230125523"],[1666173600,"300.25104602510464"],[1666177200,"300.25104602510464"],[1666180800,"300.25104602510453"],[1666184400,"300.25104602510453"],[1666188000,"300.2510460251046"],[1666191600,"243.01255230125525"],[1666195200,"349.4560669456066"],[1666198800,"310.29288702928875"],[1666202400,"357.489539748954"],[1666206000,"300.2510460251046"],[1666209600,"300.2510460251046"],[1666213200,"562.3430962343095"],[1666216800,"301.255230125523"],[1666220400,"301.255230125523"],[1666224000,"300.2510460251046"],[1666227600,"300.2510460251046"],[1666231200,"300.2510460251046"],[1666234800,"243.0125523012552"],[1666238400,"300.2510460251046"],[1666242000,"300.2510460251046"],[1666245600,"300.2510460251046"]]',
        },
        {
          query: 'kong_http_requests_hourly_namespace',
          day: '2022-10-20',
          metric: '{"namespace":"aps-portal"}',
          values:
            '[[1666249200,"300.2510460251046"],[1666252800,"300.2510460251046"],[1666256400,"243.01255230125525"],[1666260000,"300.2510460251046"],[1666263600,"300.25104602510464"],[1666267200,"300.2510460251046"],[1666270800,"300.2510460251046"],[1666274400,"300.2510460251046"],[1666278000,"243.0125523012552"],[1666281600,"300.2510460251046"],[1666285200,"300.2510460251046"],[1666288800,"300.25104602510464"],[1666292400,"474.97907949790795"],[1666296000,"300.2510460251046"],[1666299600,"244.01673640167363"],[1666303200,"327.36401673640165"],[1666306800,"300.2510460251046"],[1666310400,"300.2510460251046"],[1666314000,"301.255230125523"],[1666317600,"300.2510460251046"],[1666321200,"243.01255230125525"],[1666324800,"300.2510460251046"],[1666328400,"300.2510460251046"],[1666332000,"5.601266666666667"]]',
        },
        {
          query: 'kong_http_requests_hourly_namespace',
          day: '2022-10-21',
          metric: '{"namespace":"aps-portal"}',
          values:
            '[[1666335600,"300.2510460251046"],[1666339200,"300.2510460251046"],[1666342800,"243.0125523012552"],[1666346400,"300.2510460251046"],[1666350000,"300.2510460251046"],[1666353600,"305.2225361698252"],[1666357200,"99.41422594142259"],[1666360800,"72.30125523012552"],[1666364400,"72.30125523012552"],[1666368000,"69.28872393710628"],[1666371600,"72.30125523012552"],[1666375200,"66.31624253393665"]]',
        },
      ],
    })
  );
};

export const getMetricsHandler = (req, res, ctx) => {
  const { service } = req.variables;
  const cached = {
    'aps-example': [
      {
        query: 'kong_http_requests_hourly_service',
        day: '2022-10-17',
        metric: '{"service":"aps-example"}',
        values:
          '[[1665990000,"228.9539748953975"],[1665993600,"228.95397489539747"],[1665997200,"171.7154811715481"],[1666000800,"228.95397489539747"],[1666004400,"228.9539748953975"],[1666008000,"228.95397489539747"],[1666011600,"228.9539748953975"],[1666015200,"228.95397489539747"],[1666018800,"171.7154811715481"],[1666022400,"228.9539748953975"],[1666026000,"228.9539748953975"],[1666029600,"228.95397489539747"],[1666033200,"277.1548117154811"],[1666036800,"229.9581589958159"],[1666040400,"235.98326359832635"],[1666044000,"433.8075313807532"],[1666047600,"398.66108786610886"],[1666051200,"253.05439330543933"],[1666054800,"228.9539748953975"],[1666058400,"228.9539748953975"],[1666062000,"171.7154811715481"],[1666065600,"338.41004184100416"],[1666069200,"657.7405857740586"],[1666072800,"2580.753138075314"]]',
        service: {
          name: 'aps-example',
        },
      },
      {
        query: 'kong_http_requests_hourly_service',
        day: '2022-10-18',
        metric: '{"service":"aps-example"}',
        values:
          '[[1666076400,"459.9163179916318"],[1666080000,"228.9539748953975"],[1666083600,"171.7154811715481"],[1666087200,"228.95397489539747"],[1666090800,"228.9539748953975"],[1666094400,"228.9539748953975"],[1666098000,"228.9539748953975"],[1666101600,"228.9539748953975"],[1666105200,"171.7154811715481"],[1666108800,"230.96234309623432"],[1666112400,"230.9623430962343"],[1666116000,"228.9539748953975"],[1666119600,"763.1799163179917"],[1666123200,"228.9539748953975"],[1666126800,"174.72803347280333"],[1666130400,"431.79916317991626"],[1666134000,"989.121338912134"],[1666137600,"566.3598326359834"],[1666141200,"228.95397489539747"],[1666144800,"228.9539748953975"],[1666148400,"171.7154811715481"],[1666152000,"228.9539748953975"],[1666155600,"379.581589958159"],[1666159200,"251.04602510460248"]]',
        service: {
          name: 'aps-example',
        },
      },
      {
        query: 'kong_http_requests_hourly_service',
        day: '2022-10-19',
        metric: '{"service":"aps-example"}',
        values:
          '[[1666162800,"229.9581589958159"],[1666166400,"228.95397489539747"],[1666170000,"171.7154811715481"],[1666173600,"228.9539748953975"],[1666177200,"228.9539748953975"],[1666180800,"228.9539748953975"],[1666184400,"228.95397489539747"],[1666188000,"228.9539748953975"],[1666191600,"171.7154811715481"],[1666195200,"277.15481171548106"],[1666198800,"238.9958158995816"],[1666202400,"285.1882845188284"],[1666206000,"228.9539748953975"],[1666209600,"228.9539748953975"],[1666213200,"234.97907949790792"],[1666216800,"228.95397489539747"],[1666220400,"228.95397489539747"],[1666224000,"228.9539748953975"],[1666227600,"228.9539748953975"],[1666231200,"228.95397489539747"],[1666234800,"171.7154811715481"],[1666238400,"228.9539748953975"],[1666242000,"228.95397489539747"],[1666245600,"228.9539748953975"]]',
        service: {
          name: 'aps-example',
        },
      },
      {
        query: 'kong_http_requests_hourly_service',
        day: '2022-10-20',
        metric: '{"service":"aps-example"}',
        values:
          '[[1666249200,"228.9539748953975"],[1666252800,"228.9539748953975"],[1666256400,"171.7154811715481"],[1666260000,"228.95397489539747"],[1666263600,"228.9539748953975"],[1666267200,"228.95397489539747"],[1666270800,"228.95397489539747"],[1666274400,"228.9539748953975"],[1666278000,"171.7154811715481"],[1666281600,"228.95397489539747"],[1666285200,"228.9539748953975"],[1666288800,"228.9539748953975"],[1666292400,"274.14225941422586"],[1666296000,"228.9539748953975"],[1666299600,"171.7154811715481"],[1666303200,"229.9581589958159"],[1666306800,"228.9539748953975"],[1666310400,"228.9539748953975"],[1666314000,"229.9581589958159"],[1666317600,"228.9539748953975"],[1666321200,"171.7154811715481"],[1666324800,"228.95397489539747"],[1666328400,"228.9539748953975"],[1666332000,"0"]]',
        service: {
          name: 'aps-example',
        },
      },
      {
        query: 'kong_http_requests_hourly_service',
        day: '2022-10-21',
        metric: '{"service":"aps-example"}',
        values:
          '[[1666335600,"228.9539748953975"],[1666339200,"228.95397489539747"],[1666342800,"171.7154811715481"],[1666346400,"228.9539748953975"],[1666350000,"228.9539748953975"],[1666353600,"172.75076688583383"],[1666357200,"0"],[1666360800,"0"],[1666364400,"0"],[1666368000,"0"],[1666371600,"0"],[1666375200,"0"]]',
        service: {
          name: 'aps-example',
        },
      },
    ],
    'aps-portal': [
      {
        query: 'kong_http_requests_hourly_service',
        day: '2022-10-17',
        metric: '{"service":"aps-portal"}',
        values:
          '[[1665990000,"36.15062761506276"],[1665993600,"36.15062761506276"],[1665997200,"36.15062761506276"],[1666000800,"36.15062761506276"],[1666004400,"36.15062761506276"],[1666008000,"36.15062761506276"],[1666011600,"36.15062761506276"],[1666015200,"36.15062761506276"],[1666018800,"35.146443514644346"],[1666022400,"35.146443514644346"],[1666026000,"36.15062761506276"],[1666029600,"36.15062761506276"],[1666033200,"36.15062761506276"],[1666036800,"36.15062761506276"],[1666040400,"36.15062761506276"],[1666044000,"36.15062761506276"],[1666047600,"43.179916317991626"],[1666051200,"36.15062761506276"],[1666054800,"41.17154811715481"],[1666058400,"36.15062761506276"],[1666062000,"36.15062761506276"],[1666065600,"36.15062761506276"],[1666069200,"36.15062761506276"],[1666072800,"664.7698744769875"]]',
        service: {
          name: 'aps-portal',
        },
      },
      {
        query: 'kong_http_requests_hourly_service',
        day: '2022-10-18',
        metric: '{"service":"aps-portal"}',
        values:
          '[[1666076400,"306.27615062761504"],[1666080000,"36.15062761506276"],[1666083600,"36.15062761506276"],[1666087200,"36.15062761506276"],[1666090800,"36.15062761506276"],[1666094400,"36.15062761506276"],[1666098000,"36.15062761506276"],[1666101600,"36.15062761506276"],[1666105200,"36.15062761506276"],[1666108800,"40.1673640167364"],[1666112400,"36.15062761506276"],[1666116000,"36.15062761506276"],[1666119600,"503.11090246145716"],[1666123200,"63.26359832635984"],[1666126800,"61.25523012552301"],[1666130400,"77.32217573221757"],[1666134000,"356.4853556485355"],[1666137600,"147.61506276150627"],[1666141200,"71.29707112970712"],[1666144800,"71.2970711297071"],[1666148400,"71.2970711297071"],[1666152000,"71.2970711297071"],[1666155600,"81.33891213389121"],[1666159200,"76.31799163179916"]]',
        service: {
          name: 'aps-portal',
        },
      },
      {
        query: 'kong_http_requests_hourly_service',
        day: '2022-10-19',
        metric: '{"service":"aps-portal"}',
        values:
          '[[1666162800,"71.2970711297071"],[1666166400,"71.2970711297071"],[1666170000,"71.29707112970712"],[1666173600,"71.2970711297071"],[1666177200,"71.2970711297071"],[1666180800,"71.2970711297071"],[1666184400,"71.2970711297071"],[1666188000,"71.2970711297071"],[1666191600,"71.2970711297071"],[1666195200,"71.2970711297071"],[1666198800,"71.2970711297071"],[1666202400,"71.2970711297071"],[1666206000,"71.2970711297071"],[1666209600,"71.29707112970712"],[1666213200,"327.36401673640165"],[1666216800,"72.30125523012552"],[1666220400,"72.30125523012553"],[1666224000,"71.2970711297071"],[1666227600,"71.29707112970712"],[1666231200,"71.2970711297071"],[1666234800,"71.2970711297071"],[1666238400,"71.2970711297071"],[1666242000,"71.2970711297071"],[1666245600,"71.2970711297071"]]',
        service: {
          name: 'aps-portal',
        },
      },
      {
        query: 'kong_http_requests_hourly_service',
        day: '2022-10-20',
        metric: '{"service":"aps-portal"}',
        values:
          '[[1666249200,"71.2970711297071"],[1666252800,"71.2970711297071"],[1666256400,"71.2970711297071"],[1666260000,"71.2970711297071"],[1666263600,"71.2970711297071"],[1666267200,"71.2970711297071"],[1666270800,"71.2970711297071"],[1666274400,"71.2970711297071"],[1666278000,"71.2970711297071"],[1666281600,"71.2970711297071"],[1666285200,"71.29707112970712"],[1666288800,"71.2970711297071"],[1666292400,"200.83682008368197"],[1666296000,"71.29707112970712"],[1666299600,"72.30125523012552"],[1666303200,"97.40585774058579"],[1666306800,"71.2970711297071"],[1666310400,"71.29707112970712"],[1666314000,"71.29707112970712"],[1666317600,"71.2970711297071"],[1666321200,"71.2970711297071"],[1666324800,"71.2970711297071"],[1666328400,"71.2970711297071"],[1666332000,"5.601266666666667"]]',
        service: {
          name: 'aps-portal',
        },
      },
      {
        query: 'kong_http_requests_hourly_service',
        day: '2022-10-21',
        metric: '{"service":"aps-portal"}',
        values:
          '[[1666335600,"71.2970711297071"],[1666339200,"71.2970711297071"],[1666342800,"71.2970711297071"],[1666346400,"71.2970711297071"],[1666350000,"71.2970711297071"],[1666353600,"132.47176928399142"],[1666357200,"99.41422594142259"],[1666360800,"72.30125523012552"],[1666364400,"72.30125523012552"],[1666368000,"69.28872393710628"],[1666371600,"72.30125523012552"],[1666375200,"66.31624253393665"]]',
        service: {
          name: 'aps-portal',
        },
      },
    ],
  };

  if (service === 'a-service-for-aps-portal') {
    return res(
      ctx.delay(2000),
      ctx.data({
        errors: [{ message: 'Metrics unavailable' }],
      })
    );
  }

  if (cached[service]) {
    return res(
      ctx.data({
        allMetrics: cached[service],
      })
    );
  }
  return res(
    ctx.data({
      allMetrics: [],
    })
  );
};

export const getGatewayServiceHandler = (req, res, ctx) => {
  const { id } = req.variables;
  const service = gatewayServices.find((g) => g.id === id);

  if (id === '1321') {
    return res(
      ctx.data({
        errors: [{ message: 'Unable to fetch metrics' }],
      })
    );
  }

  return res(
    ctx.delay(2000),
    ctx.data({
      GatewayService: {
        ...service,
        namespace: 'regresmay22',
        tags: '["ns.regresmay22"]',
        host: 'httpbin.org',
        routes: [
          {
            id: '111111',
            name: 'a-service2-for-regresmay22-route',
            hosts: '["a-service2-for-regresmay22.site.ca"]',
            paths: '["/"]',
            methods: '["GET"]',
          },
        ],
      },
    })
  );
};

export const getGatewayServiceFilterHandler = (req, res, ctx) => {
  return res(
    ctx.data({
      allGatewayPlugins: gatewayServices
        .map((s) => s.plugins.map((p) => ({ name: p.name, id: p.id })))
        .flat(),
      allProductsByNamespace,
      allConsumerScopesAndRoles: store.data.allConsumerScopesAndRoles,
    })
  );
};
