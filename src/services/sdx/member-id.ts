export async function LookupMemberOrganization(id: string) {
  const member = await fetch(
    'https://sdx-beta-api-gov-bc-ca-lab.dev.api.gov.bc.ca/api/rd/members',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const memberData = await member.json();
  return memberData.filter((member: any) => member.id === id).pop();
}
