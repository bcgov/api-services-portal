import FooterPage from '@/components/footer-page';
import Head from 'next/head';

const AboutPage: React.FC = () => {
  let pageHeader = 'Accessibility';
  let updateDate = 'August 27, 2021';
  let content = `We're committed to providing accessible information and services for all 
  British Columbians. This means working toward meeting the World Wide Web Consortium (W3C) 
  Web Content Accessibility Guidelines (WCAG) 2.0 and 2.1 (AA).
  \n\n## Services\n\nFind services and supports for people with disabilities.
  \n\n## Accessibility and Inclusion Toolkit\n\nEveryone has a role in making information and 
  services more accessible. These guides will support you with step-by-step instructions on how 
  to do your work in a more inclusive way.
  \n\n## Accessibility policy and guidelines\n\nLearn about our accessibility policies and goals.
  \n\n## Accessibility contact information\n\nFind out who to contact about accessibility in 
  the public service.`;

  return (
    <>
      <Head>
        <title>Accessibility</title>
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
