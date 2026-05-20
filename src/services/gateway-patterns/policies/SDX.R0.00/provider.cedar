// ============================================================
// POLICY 3 — Pattern sdx-p2p-provider.r1 Validation
//
// MUST: conn_id, client_id, service_id
// MAY:  upgrades (object)
//
// upgrades sub-fields (all optional objects):
//   mtls_auth, mtls_acl, sign, verify, counter_sign
//
// upgrades.token (optional object) — if present, sub-rules apply:
//   .allowed_aud   string    REQUIRED
//   .allowed_iss   string[]  REQUIRED
//   .scope         string    optional
//   .consumer_match               boolean  optional
//   .consumer_match_claim         string   optional
//   .consumer_match_claim_custom_id  boolean optional
//   .consumer_match_ignore_not_found boolean optional
//
// Note: provider pattern does NOT include token_exchange or dpop.
// ============================================================

permit (
    principal,
    action == SDX::Action::"ApplyProviderPattern",
    resource is SDX::ProviderPattern
)
when {
    // --- Required fields ---
    context has conn_id     && context.conn_id != "" &&
    context has client_id   && context.client_id != "" &&
    context has service_id  && context.service_id != "" &&

    // --- upgrades.token: if present, required sub-fields must exist ---
    (
        !(context has upgrades) ||
        !(context has upgrades && context.upgrades has token) ||
        (
            context has upgrades && context.upgrades has token && context.upgrades.token has allowed_aud &&
            context.upgrades.token.allowed_aud != "" &&
            context.upgrades.token has allowed_iss
        )
    )
};

// Deny provider pattern if required top-level fields are missing
forbid (
    principal,
    action == SDX::Action::"ApplyProviderPattern",
    resource is SDX::ProviderPattern
)
unless {
    context has conn_id     && context.conn_id != "" &&
    context has client_id   && context.client_id != "" &&
    context has service_id  && context.service_id != ""
};

// Deny provider pattern if token block is present but missing required sub-fields
forbid (
    principal,
    action == SDX::Action::"ApplyProviderPattern",
    resource is SDX::ProviderPattern
)
when {
    context has upgrades &&
    context.upgrades has token &&
    (
        !(context.upgrades.token has allowed_aud) ||
        context.upgrades.token.allowed_aud == "" ||
        !(context.upgrades.token has allowed_iss)
    )
};

// Deny provider pattern if dpop is attempted (not permitted for provider)
forbid (
    principal,
    action == SDX::Action::"ApplyProviderPattern",
    resource is SDX::ProviderPattern
)
when {
    context has upgrades &&
    context.upgrades has dpop
};
