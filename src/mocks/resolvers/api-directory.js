import YAML from 'js-yaml';

const markdown = YAML.load(`
notes: |
  Here is some markdown.
  # Heading 1
  ## Heading 2
  ### Heading 3
  #### Heading 4
  Then I will do **bold**, _italics_ and ~~strikethrough~~.

  #### Heading 4
  
  And some text.

  How about a table?
  | Col1 | Col2 |
  | ---- | ---- |
  | Val1 | Val2 |

  How about a new line.

  And another line.

  Try a list:
  - one
  - two
  - three

  Or an ordered list:
  1. one
  1. two
  1. three

  Then there are images

  ![image](http://localhost:3000/images/bc_logo_header.svg)

  And links [my docs](https://github.com).

  Here are some block quotes

  > A block quote about something.

  What about a bit of code - \`alert("hi")\`.

  Code block?
  \`\`\`
  function (a) {
    // comment
  }
  \`\`\`

`);

const directories = [
  {
    id: 'api1',
    name: 'markdown-test',
    title: 'Testing Markdown on Dataset',
    notes: markdown.notes,
    sector: 'Natural Resources',
    license_title: 'Access Only',
    view_audience: 'Named users',
    security_class: 'LOW-PUBLIC',
    record_publish_date: '2020-04-28',
    tags: '["API","CDOGS","Document","Document Generation"]',
    organization: {
      title: 'Ministry of Environment and Climate Change Strategy',
    },
    organizationUnit: {
      title: 'Information Innovation and Technology',
    },
  },
  {
    id: 'api1',
    name: 'common-service-api',
    title: 'Common Service API',
    notes:
      'Common Service is a common hosted service (API) for generating documents from templates, data documents, and assets.\r\n\r\n__Capabilities:__\r\nThe API can generate any PDF or XML-based documents such as docx, xlsx, pptx, odt, ods, odp, and html. Examples of XML-based editors include Microsoft Office™, LibreOffice™ or OpenOffice™.\r\n\r\nThe CDOGS API is capable of doing the following:\r\n\r\nMerge complex datasets into document templates\r\nSupports any XML-based document templates including but not limited to Microsoft Office™, LibreOffice™ or OpenOffice™\r\nRich templating library support leveraging the Carbone JS library\r\n\r\n__Usage:__\r\nTo learn more on how to use the CDOGS API, check out the API Usage docs here.\r\nYou can find the OpenAPI 3.0 Specification of the CDOGS API here.\r\n\r\n__Onboarding:__\r\nFor information about onboarding to CDOGS or other common services, see the [onboarding documentation](https://github.com/bcgov/nr-get-token/wiki/Onboarding-Process).',
    sector: 'Natural Resources',
    license_title: 'Access Only',
    view_audience: 'Named users',
    security_class: 'LOW-PUBLIC',
    record_publish_date: '2020-04-28',
    tags: '["API","CDOGS","Document","Document Generation"]',
    organization: {
      title: 'Ministry of Environment and Climate Change Strategy',
    },
    organizationUnit: {
      title: 'Information Innovation and Technology',
    },
    products: [
      {
        id: 'p1',
        name: 'Document Generation',
        environments: [
          {
            name: 'prod',
            active: true,
            flow: 'public',
          },
          {
            name: 'sandbox',
            active: true,
            flow: 'public',
          },
        ],
        dataset: null,
      },
    ],
  },
  {
    id: 'api2',
    name: 'bc-route-planner',
    title: 'BC Route Planner',
    notes:
      'The BC Route Planner is a REST web service that offers vehicle route plans that are based on the BC Digital Road Atlas (DRA). The BC Route Planner computes the shortest or fastest route between start and end points and returns the route, distance, time, and directions.\r\n\r\nFor more information please see the [glossary](https://github.com/bcgov/api-specs/blob/master/router/glossary.md) and the [Router Developer Guide](https://github.com/bcgov/api-specs/blob/master/router/router-developer-guide.md).\r\n\r\n\r\n\r\n\r\nThe BC Route Planner is limited to use by the Government of BC. Please contact DataBC to arrange access to this web service.',
    sector: 'Service',
    license_title: 'Access Only',
    view_audience: 'Government',
    security_class: 'LOW-PUBLIC',
    record_publish_date: '2016-03-23',
    tags:
      '["API","OpenAPI spec","REST","directions","key-mandatory","route","router","travel planning"]',
    organization: {
      title: 'Ministry of Citizens Services',
    },
    organizationUnit: {
      title: 'DataBC Program',
    },
    products: [
      {
        id: 'p4',
        name: 'Route App',
        environments: [
          {
            name: 'prod',
            active: true,
            flow: 'kong-api-key-acl',
          },
          {
            name: 'test',
            active: false,
            flow: 'kong-api-key-acl',
          },
          {
            name: 'other',
            active: false,
            flow: 'kong-api-key-acl',
          },
          {
            name: 'dev',
            active: false,
            flow: 'kong-api-key-acl',
          },
        ],
        dataset: null,
      },
    ],
  },
  {
    id: 'api3',
    name: 'bc-web-service',
    title: 'BC Web Service',
    notes: 'The BC Web Service is a REST API ',
    sector: 'Service',
    license_title: 'Open Government Licence - British Columbia',
    view_audience: 'Public',
    security_class: 'LOW-PUBLIC',
    record_publish_date: '2013-01-25',
    tags: '["API","OpenAPI spec","REST","key-optional"]',
    organization: {
      title: 'Ministry of Citizens Services',
    },
    organizationUnit: {
      title: 'DataBC Program',
    },
    products: [
      {
        id: 'p5',
        name: 'My Product 1',
        environments: [
          {
            name: 'prod',
            active: true,
            flow: 'public',
          },
        ],
        dataset: null,
      },
      {
        id: 'p6',
        name: 'My Product 2',
        environments: [
          {
            name: 'dev',
            active: true,
            flow: 'public',
          },
          {
            name: 'prod',
            active: true,
            flow: 'public',
          },
        ],
        dataset: null,
      },
    ],
  },
];

export const apiDirectoriesHandler = (_, res, ctx) => {
  return res(ctx.json(directories));
};

export const apiDirectoryHandler = (req, res, ctx) => {
  const { id } = req.params;
  const directory = directories.find((d) => d.id === id);
  if (!directory) {
    return res(ctx.status(404), ctx.json({ error: 'not found' }));
  }
  return res(ctx.json(directory));
};
