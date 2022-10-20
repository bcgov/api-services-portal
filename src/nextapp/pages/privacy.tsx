import FooterPage from '@/components/footer-page';

const AboutPage: React.FC = () => {
  // Should this be passed in from somewhere? Or is it ok to have hardcoded, like it is now?
  let data = {
    title: 'Privacy Notice',
    header: 'B.C. Government Website Privacy Statement',
    updateDate: 'August 27, 2021',
    body:
      '## Introduction\n\nThe British Columbia (B.C.) government is committed to protecting your privacy. The B.C. Government collects, uses and discloses your personal information in accordance with the Freedom of Information and Protection of Privacy Act (FOIPPA) and other applicable legislation. ‘Personal information’ is defined broadly in the Freedom of Information and Protection of Privacy Act as recorded information about an identifiable individual, other than contact information, which is the information used to contact a person at a place of business. The purpose of this privacy statement is to inform you of the personal information that may be collected from you when visiting a B.C. government website and how that information may be used.\n\n## Scope\n\nThis privacy statement relates only to the information automatically collected from you as a result of your visit to the website. It does not include information a website requests from you. Any additional collections of personal information by a website will be addressed in a collection notice on that website.',
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
