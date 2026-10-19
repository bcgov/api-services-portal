# APS-4994: Reconcile OAuth client consumers

Before enabling the R1 integration-access callback, complete the APS-4992 audit
and migration of legacy connection records so every `requesterDetails` object
has an explicit `scopes` array. Submission and normal apply paths intentionally
fail closed when scope data is missing or malformed. Delete/revocation remains
available and skips malformed legacy rows with a structured warning so stale
access can still be removed.

After APS-4992 is deployed, backfill the Kong consumer identity before enabling
strict token matching:

1. Run `npm run datafix:aps-4994` from `provisioner-api` and review the dry-run
   output. Each active R1 subsystem/environment must produce exactly one
   consumer whose `username` and `custom_id` match the OAuth client ID selected
   from the latest connection record.
2. Resolve every reported mismatch. The command does not publish gateway
   changes without `--apply`.
3. Run `npm run datafix:aps-4994 -- --apply` to re-provision one representative
   active connection per subsystem/environment.
4. Re-run the dry run and require `failed: 0` before APS-4995 enables strict
   `azp`-to-`custom_id` matching.
