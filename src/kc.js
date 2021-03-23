//import KcAdminClient from 'keycloak-admin';

const KcAdminClient = require('keycloak-admin').default;

const config = {
    baseUrl: 'https://dev.oidc.gov.bc.ca/auth',
    realmName: 'xtmke7ky',
}

async function doit() {
    const kcAdminClient = new KcAdminClient(config);

    await kcAdminClient.auth({
        grantType: 'client_credentials',
        clientId: 'ADM',
        clientSecret: '7a4f5f4f-df84-4524-b0f3-9f7c53b5b3bd'
    });

    // const res = await kcAdminClient.clients.find({clientId:"DE8398521611406C-6F984240"})
    // console.log(JSON.stringify(res, null, 4))

    const res = await kcAdminClient.clients.listRoles({id:'8876e278-b533-464f-8e51-5b432f3d75e5'})

    console.log(JSON.stringify(res, null, 4))

    await kcAdminClient.clients.delRole({id:'8876e278-b533-464f-8e51-5b432f3d75e5', roleName: "blah"})

    const result  = await kcAdminClient.clients.createRole({id:'8876e278-b533-464f-8e51-5b432f3d75e5', name: "blah"})
    console.log(JSON.stringify(result, null, 4))


    const result2  = await kcAdminClient.clients.getServiceAccountUser({id:'8876e278-b533-464f-8e51-5b432f3d75e5'})
    console.log(JSON.stringify(result2, null, 4))

    const result3  = await kcAdminClient.users.listRoleMappings({id:result2.id})
    console.log(JSON.stringify(result3, null, 4))

    // const users = await kcAdminClient.users.find();
    // console.log(JSON.stringify(users, null, 4))
}

doit()
