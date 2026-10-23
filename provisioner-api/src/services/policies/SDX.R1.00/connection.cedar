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

forbid ( // Deny if connection request is not approved
    principal,
    action == SDX::Action::"SubmitConnectionRequest",
    resource is SDX::ConnectionRequest
)
unless {
    context.isApproved == true
};

forbid ( // Deny unless the managed R1 security settings are canonical
    principal,
    action == SDX::Action::"SubmitConnectionRequest",
    resource is SDX::ConnectionRequest
)
unless {
    context.clientResources.gatewayPatterns["sdx-p2p-consumer.r1"].upgrades has token &&
    context.clientResources.gatewayPatterns["sdx-p2p-consumer.r1"].upgrades.token.consumerMatch == true &&
    context.clientResources.gatewayPatterns["sdx-p2p-consumer.r1"].upgrades.token.consumerMatchClaim == "azp" &&
    context.clientResources.gatewayPatterns["sdx-p2p-consumer.r1"].upgrades.token.consumerMatchClaimCustomId == true &&
    context.clientResources.gatewayPatterns["sdx-p2p-consumer.r1"].upgrades.token.consumerMatchIgnoreNotFound == false &&
    context.clientResources.gatewayPatterns["sdx-p2p-consumer.r1"].upgrades.token.allowedAud == context.globals.environment.sdx_token_exchange_client_id &&
    context.clientResources.gatewayPatterns["sdx-p2p-consumer.r1"].upgrades has acl &&
    context.clientResources.gatewayPatterns["sdx-p2p-consumer.r1"].upgrades has tokenExchange &&
    context.clientResources.gatewayPatterns["sdx-p2p-consumer.r1"].upgrades.tokenExchange.clientId == context.globals.environment.sdx_token_exchange_client_id &&
    context.clientResources.gatewayPatterns["sdx-p2p-consumer.r1"].upgrades.tokenExchange.audience == context.requesterDetails.service.clientId &&
    context.clientResources.gatewayPatterns["sdx-p2p-consumer.r1"].upgrades.tokenExchange.targetPrivacyZoneScope == context.requesterDetails.service.privacyZone &&
    context.clientResources.gatewayPatterns["sdx-p2p-consumer.r1"].upgrades.tokenExchange.scopes == [] &&
    !(context.clientResources.gatewayPatterns["sdx-p2p-consumer-access.r1"] has integrationClientId) &&
    context has serviceResources &&
    context.serviceResources has gatewayPatterns &&
    context.serviceResources.gatewayPatterns has "sdx-p2p-provider.r1" &&
    context.serviceResources.gatewayPatterns["sdx-p2p-provider.r1"].upgrades has token &&
    context.serviceResources.gatewayPatterns["sdx-p2p-provider.r1"].upgrades.token.consumerMatch == false &&
    context.serviceResources.gatewayPatterns["sdx-p2p-provider.r1"].upgrades.token.allowedAud == context.requesterDetails.service.clientId &&
    !(context.serviceResources.gatewayPatterns["sdx-p2p-provider.r1"].upgrades has tokenExchange)
};
