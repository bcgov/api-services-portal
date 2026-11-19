// ============================================================
// POLICY 1 — SDX.R0.00 Connection Request Validation
//
// Rule: clientId, serviceId, isApproved MUST be present.
// isApproved is set by the service system owner (not the requester).
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
    context has isApproved &&

    // clientId and serviceId must be non-empty strings
    context.clientId != "" &&
    context.serviceId != "" &&

    // isApproved is a boolean (its presence as a bool satisfies the type rule)
    (context.isApproved == true || context.isApproved == false)
};

// Deny explicitly if any required Connection Request field is missing
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

forbid ( // Deny if environment is anything except dev
    principal,
    action == SDX::Action::"SubmitConnectionRequest",
    resource is SDX::ConnectionRequest
)
unless {
    context has environment &&
    (context.environment == "apsdev" || context.environment == "apstst" || context.environment == "dev")
};

forbid ( // Require approval and activation before applying AsyncAPI patterns
    principal,
    action == SDX::Action::"SubmitConnectionRequest",
    resource is SDX::ConnectionRequest
)
when {
    context.action == "apply" &&
    ((context has serviceResources && context.serviceResources has gatewayPatterns &&
      context.serviceResources.gatewayPatterns has "sdx-async-publisher.r1") ||
     (context has clientResources && context.clientResources has gatewayPatterns &&
      context.clientResources.gatewayPatterns has "sdx-async-subscriber.r1"))
}
unless {
    context.isApproved && context has isActive && context.isActive
};

forbid ( // Require the subscriber route for publisher webhook delivery
    principal,
    action == SDX::Action::"SubmitConnectionRequest",
    resource is SDX::ConnectionRequest
)
when {
    context has serviceResources && context.serviceResources has gatewayPatterns &&
    context.serviceResources.gatewayPatterns has "sdx-async-publisher.r1"
}
unless {
    context has clientResources && context.clientResources has gatewayPatterns &&
    context.clientResources.gatewayPatterns has "sdx-async-subscriber.r1"
};
