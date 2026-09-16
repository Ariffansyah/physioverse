Screenshots used by the root README. Captured at 1600x900 against a production
build (`pnpm build && pnpm start`), browser chrome cropped out.

| File | Page |
| --- | --- |
| `menu.png` | Main menu (`/`) |
| `play.png` | Mission list (`/play`) |
| `mission.png` | Hoops Court, console open (`/play/court-01`) |
| `learn.png` | Learning mode, Ballistic Bay (`/belajar/ballistics`) |
| `admin.png` | Operator console, top (`/admin`) |
| `moderation.png` | Operator console, account table (`/admin`) |

They live here rather than in `public/` because `public/` ships to the
deployment as site assets, and these are documentation only.
