

```
alter table public."Environment" add column approval boolean NOT NULL default false;  
```

## Organization.publicBodyId

Optional reference from an Organization to a Public Body in the authoritative
data registry (FOIPPA).  The column is nullable so that Organizations which
are not Public Bodies can leave it unset, but every non-null value must be
unique across the table.  The partial unique index excludes NULLs so multiple
rows may coexist without a `publicBodyId`.

```
alter table public."Organization" add column "publicBodyId" text;

create unique index organization_publicbodyid_unique
    on public."Organization" ("publicBodyId")
    where "publicBodyId" is not null;
```

## Activity.filterKey indexes

Composite indexes on each `filterKey` column with `createdAt` descending
(`createdAt_utc` in the database) for activity queries.

```
create index activity_filterkey1_createdat_index
  on public."Activity" ("filterKey1", "createdAt_utc" desc);

create index activity_filterkey2_createdat_index
  on public."Activity" ("filterKey2", "createdAt_utc" desc);

create index activity_filterkey3_createdat_index
  on public."Activity" ("filterKey3", "createdAt_utc" desc);

create index activity_filterkey4_createdat_index
  on public."Activity" ("filterKey4", "createdAt_utc" desc);
```

## SubsystemIntegration zero-or-one relationship (APS-4992)

New databases receive the required and unique subsystem relationship from
`local/db/keystone-init.sql`. Persistent environments must apply
`migrations/portal/postgres/migrations/mig-3.0.12-sdx-subsystem-integration.sql`
from the `bcgov-c/api-serv-infra` repository before deploying the APS-4992
application changes.

The migration reports and rejects orphaned or duplicate
`SubsystemIntegration` rows instead of modifying them automatically. Back up
the database, resolve any reported invalid data, and rerun the migration before
deploying the application.
