import FooterPage from '@/components/footer-page';
import Head from 'next/head';

const AboutPage: React.FC = () => {
  let pageHeader = 'General Terms of Service';
  let updateDate = 'August 27, 2021';
  let content = `DSS services encompass a comprehensive suite of hardware, security, software, 
  application platforms, web services and databases. The Client is the user of the Services.
  Some terms may not be applicable to specific services.\n\nDSS may make changes to these
  General Terms of Service at any time. By using the Services you acknowledge that you have read
  and agree to all the terms set out below.\n\n## 1. Service Availability
  \n\n- The Services in production are available and monitored during standard business hours 
  08:30 to 16:30 Monday to Friday.\n- Service availability outside of standard business hours is 
  provided on a cost recovery basis (see Schedule C)
  \n\n## 2. Incident Management and Technical Support\n\n- DSS will 
  provide technical support pertaining to the Client's use of the Services;\n- Technical 
  issues and service requests should be directed as follows:\n- Access to technical support
  beyond Hours of Operation is negotiable on a case by case basis.\n- DSS and the Client will
  make best efforts to notify the other party when either becomes aware of issues affecting the 
  Services.\n- DSS will notify the Client about incident status and resolution.\n- The Client 
  is solely responsible for resolving its issues that are unrelated to the Services. DSS 
  support for helping resolve such issues may incur service charges.
  \n\n## 3. Change and Release Management\n\n- DSS reserves the right to implement service 
  changes at any time.\n- The standard production service change windows are Sundays from 
  06:00 to 12:00 and Tuesdays from 16:00 to 18:00.\n- The Client will make best efforts to keep 
  up to date and use the current Services;\n- The Client is solely responsible for its use of 
  the Services, including fixing and improving its business applications, release management, 
  acceptance testing, and stakeholder coordination;\n- DSS will provide support to the Client 
  during planned Service changes;\n- DSS will make best efforts to ensure that its Services 
  are backward compatible so as to reduce the scope and impact of a change;\n- DSS will notify 
  the Client of planned changes affecting the Client's use of the Services. Notification lead 
  time for a given change event will be determined based on the scope and impact of the change. 
  The Client should expect to be consulted in regards to high impact changes;\n- Change 
  cancellations and scheduling are negotiable on a case by case basis.\n- DSS is not required 
  to forward Shared Services BC Technical Information Bulletins to the Client 
  (see https://ssbc-client.gov.bc.ca/TIBS).
  \n\n## 4. Configuration Management\n\nWith respect to its use of the Services, the 
  Client agrees to:\n\n- Provide to DSS on request, technical architecture information 
  concerning the use of the Services, for use in service planning and configuration 
  management;\n- Maintain, and provide to DSS on request, current non-functional business 
  requirements regarding expected levels of performance and number of individual users 
  supported;\n- Regression test integration, backup and recovery plans and processes, as 
  appropriate;\n- Manage end-user access, as applicable.\n\nWith respect to the Services, 
  DSS agrees to:\n\n- Maintain the Services software and data such that the Services can be 
  restored;
  \n\n## 5. Availability and Continuity Management\n- DSS will recover the Services to the 
  most recent and stable state available on a best efforts basis. Service restoration time 
  varies and is dependent on the scope and complexity of the outage.\n- DSS is not responsible 
  for infrastructure and services beyond its direct control, e.g., Shared Services BC 
  infrastructure.\n- The Client will avoid activities that could cause failure or issues for 
  the Services.\n\n## 6. Capacity and Performance Management\n\n- DSS monitors the health of 
  the Services on an ongoing basis during standard business hours.\n- The Client will inform DSS 
  if it is separately monitoring the Services.\n- The Services may be subject to specific 
  performance and quality standards, as applicable.
  \n\n## 7. Security and Privacy Management \n\n- DSS confirms that the Services comply with 
  BC Government security policies. \n- DSS will inform the Client of any identified security 
  incidents such as inappropriate access, breaches or denial of service attacks associated with 
  the Services.\n- DSS acknowledges that a Privacy Impact Assessment (PIA) has been completed 
  and is in place for the Services. \n- The Client is solely responsible for any Privacy 
  Impact Assessments (PIAs) that are required for their use of the Services. \n- The Client is 
  solely responsible for appropriately securing and classifying its content and data. \n- The 
  Client acknowledges that should any information exposure take place, the Client accepts full 
  responsibility for all security and privacy breaches. \n\n## 8. Payment of Services\n\n- If 
  applicable and unless otherwise specified, DSS will invoice the client on a quarterly basis for using the services. \n- If applicable, the Client will advise DSS of any changes to their financial coding. 
`;

  return (
    <>
      <Head>
        <title>Terms of Service</title>
      </Head>
      <FooterPage
        pageHeader={pageHeader}
        updateDate={updateDate}
        content={content}
      />
    </>
  );
};

export default AboutPage;
