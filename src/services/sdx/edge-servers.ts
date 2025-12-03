export async function LookupEdgeServer(host: string) {
  const servers = await fetch(
    'https://sdx-beta-api-gov-bc-ca-lab.dev.api.gov.bc.ca/api/rd/access-points',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const serverData = await servers.json();
  return serverData.filter((server: any) => server.host === host).pop();
}
