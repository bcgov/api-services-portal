CREATE ROLE keystonejsuser WITH LOGIN PASSWORD 'keystonejsuser';
CREATE DATABASE keystonejs OWNER keystonejsuser;

CREATE ROLE konguser WITH LOGIN PASSWORD 'konguser';
CREATE DATABASE kong OWNER konguser;

-- Dedicated database for the SDX hybrid-mode control plane (kong-sdx-control).
-- Kept separate from the traditional `kong` database above.
CREATE ROLE sdxkonguser WITH LOGIN PASSWORD 'sdxkonguser';
CREATE DATABASE sdxkong OWNER sdxkonguser;

CREATE ROLE keycloakuser WITH LOGIN PASSWORD 'keycloakuser';
CREATE DATABASE keycloak OWNER keycloakuser;