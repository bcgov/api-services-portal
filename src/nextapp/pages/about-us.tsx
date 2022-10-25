import FooterPage from '@/components/footer-page';
import Head from 'next/head';

const AboutPage: React.FC = () => {
  let pageHeader = 'About Us';
  let updateDate = 'August 27, 2021';
  let content = `API Program Services (APS) is a centrally managed platform that delivers support
    for deploying and operating Application Programming Interface (API). The APS Platform enables
    government data providers to deliver services quickly using tools that provide security,
    authentication, routing, and publishing.\n\n## Improving data\n\n- Application Programming
    Interfaces (APIs) are a powerful means of sharing your data within organizations and more
    widely as part of Open Government initiatives. APIs enable the standard, secure, and easy
    reuse of data between applications and systems.\n- The data within government systems has
    enormous value. The mission of APS is to enable ongoing access to the data by citizens and
    across the public sector by ensuring the efficient sharing, distribution and operation of
    APIs.\n\n## Supporting data access\n\n- Digital teams within the B.C. government can use the
    APS platform and services to set up APIs in a centralized environment that lets them securely
    share data.\n- By providing a central environment to create and operate APIs enabling access
    to data on-demand, APS enables teams to connect their systems and manage the flow of data to
    create better experiences for everyone in British Columbia.\n- We help you break down
    information silos by integrating systems. We support the management of multiple types of APIs
    ranging from custom- built to third-party purchased.\n\n## Platform Features\n\nOur platform
    provides a range of features and functionality to choose from depending on your needs:
    \n- Manage your API policies and plugins across their full life cycle\n - Use government-standard
    digital identities, such as IDIR and other government common services\n- Implement
    comprehensive authentication and security including threat protection, encryption, and
    third-party authentication\n- Expedite processes for Privacy Impact Assessments (PIA) and
    Security Threat and Risk Assessments (STRA)\n- Control your branding and user experience
    with customizable URLs\n\n## Platform Technology\n\nOur platform provides a range of features
    and functionality to choose from depending on your needs:\n\n- Built on Kong open-source
    microservice gateway software\n- Uses RESTful APIs and includes support for Simple Object
    Access Protocol (SOAP)\n- Provides console and command-line interfaces for gateway
    administration\n- Includes functionality for managing endpoints, rate limitation, API keys,
    etc.\n- Supports integrated authentication with COTS and custom APIs\n- Supports Transport
    Layer Security (TLS) connections to a stable domain\n\n# Services\n\n## API Directory\n\nOur
    API Directory is a centralized repository that makes it easy for everyone to find and
    securely access APIs. The API Directory contributes to increasing government capability for
    developing, using and sharing data.\n\n## API Management\n\nOur API Management Service
    ensures your APIs are properly set up and controlled. You can: Configure, test and deploy
    APIs, enforce API policies, track API usage and other metrics\n\n## Expert Support\n\nOur
    team's integration experts can help you determine the best strategy and technical solution
    for your data and information sharing goals from architecture to deployment.\n\n## API Community\n\nOur community of API providers and technical experts is a place to connect
    with others to share tips, learn about APS related products and features, access technical
    resources, and have your voice heard in our sprint reviews.`;

  return (
    <>
      <Head>
        <title>About Us</title>
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
