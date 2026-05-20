

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