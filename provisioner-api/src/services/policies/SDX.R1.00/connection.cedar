// ============================================================
// POLICY SDX.R1.00 - Connection Request Validation
// ============================================================

permit ( // Permit if all required fields are present and valid
    principal,
    action == SDX::Action::"SubmitConnectionRequest",
    resource is SDX::ConnectionRequest
)
when {
    // Required fields must be present and non-empty
    context has clientId &&
    context has serviceId &&
    context has environment &&
    context has isApproved &&
    context has policyVersion &&
    context has requesterDetails &&
    context has clientResources &&
    context.clientResources has gatewayPatterns &&
    context.clientResources.gatewayPatterns has "sdx-p2p-consumer.r1" &&

    // clientId and serviceId must be non-empty strings
    context.clientId != "" &&
    context.serviceId != "" &&

    // requesterDetails has scopes and its an array (ok to be empty)
    context.requesterDetails has scopes &&

    // isApproved is a boolean (its presence as a bool satisfies the type rule)
    (context.isApproved == true || context.isApproved == false)
};

forbid ( // Deny if any required field is missing or invalid
    principal,
    action == SDX::Action::"SubmitConnectionRequest",
    resource is SDX::ConnectionRequest
)
unless {
    context has clientId &&
    context has serviceId &&
    context has isApproved &&
    context.clientId != "" &&
    context.serviceId != ""
};

forbid ( // Deny if misconfiguration of token exchange
    principal,
    action == SDX::Action::"SubmitConnectionRequest",
    resource is SDX::ConnectionRequest
)
unless {
    context.clientResources has gatewayPatterns &&
    context.clientResources.gatewayPatterns["sdx-p2p-consumer.r1"].upgrades.tokenExchange.clientId == context.globals.environment.client_id &&
    context.clientResources.gatewayPatterns["sdx-p2p-consumer.r1"].upgrades.tokenExchange.tokenEndpoint == context.globals.environment.oauth_token_url &&
    context.clientResources.gatewayPatterns["sdx-p2p-consumer.r1"].upgrades.tokenExchange.audience == context.requesterDetails.service.clientId &&
    context.clientResources.gatewayPatterns["sdx-p2p-consumer.r1"].upgrades.tokenExchange.scopes.contains(context.requesterDetails.service.privacyZone) &&
    context.clientResources.gatewayPatterns["sdx-p2p-consumer.r1"].upgrades.tokenExchange.scopes == context.combinedScopes
};

forbid ( // Deny if connection request is not approved
    principal,
    action == SDX::Action::"SubmitConnectionRequest",
    resource is SDX::ConnectionRequest
)
unless {
    context.isApproved == true
};