FROM quay.io/keycloak/keycloak:26.0.6 as builder

ENV KC_DB=postgres
RUN /opt/keycloak/bin/kc.sh build --http-relative-path=/auth

FROM quay.io/keycloak/keycloak:26.0.6
COPY --from=builder /opt/keycloak/ /opt/keycloak/
WORKDIR /opt/keycloak
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized", "--hostname", "http://localhost:8080", "--http-enabled", "true"]