import FooterPage from '@/components/footer-page';
import Head from 'next/head';

const AboutPage: React.FC = () => {
  let pageHeader = 'Copyright';
  let updateDate = 'August 27, 2021';
  let content = `
  The following policy governs the operation and management of the government's main website and all websites of ministries, and agencies reporting to ministries.
  
  Copyright © 2021, Province of British Columbia.
  
  All rights reserved.
  
  This material is owned by the Government of British Columbia and protected by copyright law. It may not be reproduced or redistributed without the prior written permission of the Province of British Columbia.
  
  ## Permission
  
  To request permission to reproduce all or part of any other materials on this website, please complete the Copyright Permission Request Form.
  
  ## Exceptions
  
  For the reproduction of provincial legislation found on the BC Laws website, permission is subject to the terms of the Queen's Printer License - British Columbia.
  
  For the reproduction of specified b-roll, interview and podium video footage found on the BC Gov News website, permission is subject to the terms of the News Footage License - British Columbia.
  
  For the reproduction of materials found in the BC Data Catalogue, either a license agreement (as specified in the BC Data Catalogue) will apply or the materials are “access only” and reproduction is not permitted without written permission. To request permission, please complete the Copyright Permission Request Form. If a license agreement applies, permission is subject to the terms of the specified license.
  
  ## Questions or concerns?
  
  For more information, please read the Frequently Asked Questions or contact the Intellectual Property Program.
  
  e-mail: QPIPPCopyright@gov.bc.ca
  
  phone: 250-216-8935
  `;

  return (
    <>
      <Head>
        <title>Copyright</title>
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
