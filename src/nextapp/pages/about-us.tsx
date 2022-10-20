import FooterPage from '@/components/footer-page';

const AboutPage: React.FC = () => {
  // Should this be passed in from somewhere? Or is it ok to have hardcoded, like it is now?
  let data = {
    title: 'About Us',
    header: 'About Us',
    updateDate: 'August 27, 2021',
    body:
      'API Program Services (APS) is a centrally managed platform that delivers support for deploying and operating Application Programming Interface (API). The APS Platform enables government data providers to deliver services quickly using tools that provide security, authentication, routing, and publishing.\n\n## Improving data\n\n- Application Programming Interfaces (APIs) are a powerful means of sharing your data within organizations and more widely as part of Open Government initiatives. APIs enable the standard, secure, and easy reuse of data between applications and systems.\n- The data within government systems has enormous value. The mission of APS is to enable ongoing access to the data by citizens and across the public sector by ensuring the efficient sharing, distribution and operation of APIs.',
  };

  return (
    <>
      <FooterPage
        title={data.title}
        header={data.header}
        updateDate={data.updateDate}
        body={data.body}
      />
    </>
  );
};

export default AboutPage;
