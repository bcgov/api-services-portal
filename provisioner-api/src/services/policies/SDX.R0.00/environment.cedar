// ============================================================
// POLICY 4 — Environment gate for SDX.R0.00
//
// SDX.R0.00 is development-only.
// Test and production environments must NOT use this policy release
// without required controls configured.
// ============================================================

forbid (
    principal,
    action in [
        SDX::Action::"SubmitConnectionRequest",
        SDX::Action::"ApplyConsumerPattern",
        SDX::Action::"ApplyProviderPattern"
    ],
    resource
)
when {
    // Block R0.00 usage in test or production environments
    context has policy_release &&
    context.policy_release == "SDX.R0.00" &&
    context has environment &&
    (context.environment == "test" || context.environment == "production")
};
