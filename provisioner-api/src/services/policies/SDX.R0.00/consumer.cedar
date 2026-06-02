// ============================================================
// POLICY 2 — Pattern sdx-p2p-consumer.r1 Validation
//
// MUST: conn_id, client_id, service_id
// MAY:  tls_verify (bool, default true), upgrades (object)
//
// upgrades sub-fields (all optional objects):
//   sign, verify, counter_sign, dpop
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
// upgrades.token_exchange (optional object) — if present, sub-rules apply:
//   .client_id       string    REQUIRED
//   .token_endpoint  string    REQUIRED (any value)
//   .scopes          string[]  optional
//   .audience        string    optional
// ============================================================

permit (
    principal,
    action == SDX::Action::"ApplyConsumerPattern",
    resource == SDX::ConsumerPattern::"sdx-p2p-consumer.r1"
)
when {
    // --- Required fields ---
    context has conn_id     && context.conn_id != "" &&
    context has client_id   && context.client_id != "" &&
    context has service_id  && context.service_id != "" &&

    // --- tls_verify: optional bool, no constraint on value ---
    (
        !(context has tls_verify) ||
        context has tls_verify && context.tls_verify == true ||
        context has tls_verify && context.tls_verify == false
    ) &&

    // --- upgrades: optional object ---
    // If upgrades.token is present, its required sub-fields must exist
    (
        !(context has upgrades) ||
        !(context has upgrades && context.upgrades has token) ||
        (
            context has upgrades && context.upgrades has token && context.upgrades.token has allowed_aud &&
            context.upgrades.token.allowed_aud != "" &&
            context.upgrades.token has allowed_iss
        )
    ) &&

    // If upgrades.token_exchange is present, required sub-fields must exist
    (
        !(context has upgrades) ||
        !(context has upgrades && context.upgrades has token_exchange) ||
        (
            context has upgrades && context.upgrades has token_exchange && context.upgrades.token_exchange has client_id &&
            context.upgrades.token_exchange.client_id != "" &&
            context.upgrades.token_exchange has token_endpoint &&
            context.upgrades.token_exchange.token_endpoint != ""
        )
    )
};

// Deny consumer pattern if required top-level fields are missing
forbid (
    principal,
    action == SDX::Action::"ApplyConsumerPattern",
    resource is SDX::ConsumerPattern
)
unless {
    context has conn_id     && context.conn_id != "" &&
    context has client_id   && context.client_id != "" &&
    context has service_id  && context.service_id != ""
};

// Deny consumer pattern if token block is present but missing required sub-fields
forbid (
    principal,
    action == SDX::Action::"ApplyConsumerPattern",
    resource is SDX::ConsumerPattern
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

// Deny consumer pattern if token_exchange block is present but missing required sub-fields
forbid (
    principal,
    action == SDX::Action::"ApplyConsumerPattern",
    resource is SDX::ConsumerPattern
)
when {
    context has upgrades &&
    context.upgrades has token_exchange &&
    (
        !(context.upgrades.token_exchange has client_id) ||
        context.upgrades.token_exchange.client_id == "" ||
        !(context.upgrades.token_exchange has token_endpoint) ||
        context.upgrades.token_exchange.token_endpoint == ""
    )
};
