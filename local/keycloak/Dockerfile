ARG KC_VERSION="26.5.3"
FROM quay.io/keycloak/keycloak:${KC_VERSION} as builder

ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

ENV KC_DB=postgres
RUN /opt/keycloak/bin/kc.sh build --http-relative-path=/auth

FROM quay.io/keycloak/keycloak:${KC_VERSION}

COPY --from=builder /opt/keycloak/ /opt/keycloak/
WORKDIR /opt/keycloak
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]

CMD ["start", "--optimized", "--hostname", "http://localhost:8080", "--http-enabled", "true"]
