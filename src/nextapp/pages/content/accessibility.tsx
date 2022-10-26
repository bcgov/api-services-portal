import FooterPage from '@/components/footer-page';
import Head from 'next/head';

const AccessibilityPage: React.FC = () => {
  let pageHeader = 'Accessibility';
  let content = `
  We're committed to providing accessible information and services for all British Columbians. This means working toward meeting the [World Wide Web Consortium (W3C) Web Content Accessibility Guidelines (WCAG) 2.0 and 2.1 (AA).](https://www.w3.org/WAI/standards-guidelines/wcag/)
  
  ## [Services](https://www2.gov.bc.ca/gov/content/home/accessible-government/accessibility-services)
  
  Find services and supports for people with disabilities.
  
  ## [Accessibility and Inclusion Toolkit](https://www2.gov.bc.ca/gov/content/home/accessible-government/toolkit)
  
  Everyone has a role in making information and services more accessible. These guides will support you with step-by-step instructions on how to do your work in a more inclusive way.
  
  ## [Accessibility policy and guidelines](https://www2.gov.bc.ca/gov/content/home/accessible-government/accessibility-policy-guidelines)
  
  Learn about our accessibility policies and goals.
  
  ## [Accessibility contact information](https://www2.gov.bc.ca/gov/content/home/accessible-government/accessibility-contact)
  
  Find out who to contact about accessibility in the public service.
  `;

  return (
    <>
      <Head>
        <title>Accessibility</title>
      </Head>
      <FooterPage pageHeader={pageHeader} content={content} />
    </>
  );
};

export default AccessibilityPage;
