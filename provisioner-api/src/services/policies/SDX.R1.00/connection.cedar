// ============================================================
// POLICY 1 — SDX.R1.00 Connection Request Validation
//
// Rule: clientId, serviceId, isApproved MUST be present.
// isApproved is set by the service system owner (not the requester).
// ============================================================


permit (
    principal,
    action == SDX::Action::"SubmitConnectionRequest",
    resource is SDX::ConnectionRequest
)
when {
    // Required fields must be present and non-empty
    context has clientId &&
    context has serviceId &&
    context has isApproved &&
    context has requesterDetails &&
    context has clientResources &&
    context has serviceResources &&

    // clientId and serviceId must be non-empty strings
    context.clientId != "" &&
    context.serviceId != "" &&

    // requesterDetails has scopes and its an array (ok to be empty)
    context.requesterDetails has scopes &&

    // serviceResources has a subsystemId
    context.serviceResources has subsystemId &&
    context.serviceResources.subsystemId != "" &&

    // isApproved is a boolean (its presence as a bool satisfies the type rule)
    (context.isApproved == true || context.isApproved == false)
};

// Deny explicitly if any required Connection Request field is missing
forbid (
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