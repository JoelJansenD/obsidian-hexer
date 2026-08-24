# Triage Labels

The skills speak in terms of canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `needs-info`         | Waiting on reporter for more information |
| `ready-for-human`          | `ready-for-human`    | Fully specified, ready to implement      |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |

**`ready-for-agent` is intentionally not used.** A human always implements the work in this repo, so there is no AFK-agent-ready state. When a skill would apply `ready-for-agent`, use `ready-for-human` instead.

When a skill mentions a role (e.g. "apply the triage label"), use the corresponding label string from this table.

Edit the right-hand column to match whatever vocabulary you actually use.
