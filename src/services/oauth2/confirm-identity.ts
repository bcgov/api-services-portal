export class ConfirmIdentity {
  /*
    Prepare the Auth URL using the information from the CredentialIssuer
                var redirectUri = window.location.href.split('?')[0];
                var args = new URLSearchParams({
                    response_type: "code",
                    client_id: clientId,
                    code_challenge_method: "S256",
                    code_challenge: codeChallenge,
                    redirect_uri: redirectUri
                });
                window.location = authorizeEndpoint + "/?" + args;

    The codeChallenge needs to be retained in the user's session, during this handshake.
    
  */
  prepareAuthUrl(): string {
    return '';
  }

  /*
    Get the information from the IdP callback, use the code to get the Token, and figure out the next action.
    Next actions: Take the user to the Request Access page with this additional information
    about the user displayed; but keep it in the session to avoid it being mutated.

                xhr.open("POST", tokenEndpoint, true);
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                xhr.send(new URLSearchParams({
                    client_id: clientId,
                    code_verifier: window.sessionStorage.getItem("code_verifier"),
                    grant_type: "authorization_code",
                    redirect_uri: location.href.replace(location.search, ''),
                    code: code    
  */
  handleCallback(): void {}

  /*
    Use the Session information to populate the RequestControls.
    Called before updating the AccessRequest record with the `controls`
  */
  updateRequestControlsSubject(): void {}
}
