ARG KC_VERSION="26.8.2"
FROM quay.io/keycloak/keycloak:${KC_VERSION} AS builder

ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_DB=postgres

# stateless is build-time and disabled by default. Each site sets its own
# --cache-embedded-cluster-name at start so the two nodes do not form one cluster.
RUN /opt/keycloak/bin/kc.sh build --features=stateless --http-relative-path=/auth --http-management-relative-path=/

FROM quay.io/keycloak/keycloak:${KC_VERSION}

COPY --from=builder /opt/keycloak/ /opt/keycloak/
WORKDIR /opt/keycloak
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]

CMD ["start", "--optimized", "--hostname", "http://localhost:8080", "--http-enabled", "true"]
