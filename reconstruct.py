import os
import subprocess
import sys
import shlex

def run(cmd, env=None):
    print(f"Running: {cmd}")
    # Merge custom env with parent env
    custom_env = os.environ.copy()
    if env:
        custom_env.update(env)
    args = shlex.split(cmd)
    res = subprocess.run(args, shell=False, capture_output=True, text=True, encoding="utf-8", errors="ignore", env=custom_env)
    if res.returncode != 0:
        print(f"STDOUT: {res.stdout}")
        print(f"STDERR: {res.stderr}")
        raise Exception(f"Command failed: {cmd}")
    return res.stdout.strip()

milestones = [
    {
        "hash": "1a9e635",
        "msg": "feat: initialize project structure and setup core backend models",
        "date": "2026-04-29 10:00:00 +0530"
    },
    {
        "hash": "8951843",
        "msg": "feat: implement frontend layout, styling, and authentication modules",
        "date": "2026-04-29 18:00:00 +0530"
    },
    {
        "hash": "c42433f",
        "msg": "feat: implement car fleet management and admin command center",
        "date": "2026-04-30 10:00:00 +0530"
    },
    {
        "hash": "72302f5",
        "msg": "feat: implement user booking system and dashboard",
        "date": "2026-05-02 14:00:00 +0530"
    },
    {
        "hash": "dfcebda",
        "msg": "chore: final production hardening, documentation, and deployment configurations",
        "date": "2026-05-08 18:07:27 +0530"
    },
    {
        "hash": "cf5bf6c",
        "msg": "feat: add robust auth middleware, rate limiters, and controllers",
        "date": "2026-05-08 18:08:06 +0530"
    },
    {
        "hash": "b5e6504",
        "msg": "feat: add owner CRM portal and public fleet pages",
        "date": "2026-05-08 18:09:02 +0530"
    },
    {
        "hash": "5f93848",
        "msg": "refactor: restructure project layout and migrate to src/apps monorepo",
        "date": "2026-05-11 13:04:48 +0530"
    },
    {
        "hash": "204eeb0",
        "msg": "feat: implement document verification and digital signature workflow",
        "date": "2026-05-11 13:05:11 +0530"
    },
    {
        "hash": "fe347a6",
        "msg": "feat: integrate Google Authentication and migrate deployment to Vercel + Render",
        "date": "2026-05-12 18:14:55 +0530"
    },
    {
        "hash": "bcfbbe2",
        "msg": "feat: implement manual offline booking system and custom invoice generation",
        "date": "2026-05-16 18:55:42 +0530"
    },
    {
        "hash": "0f7f756",
        "msg": "style: complete migration to premium cream/off-white theme across all public components",
        "date": "2026-05-20 12:00:00 +0530"
    },
    {
        "hash": "e0c8334",
        "msg": "perf: implement database indexing, caching, and payment reconciliation",
        "date": "2026-05-26 02:31:59 +0530"
    },
    {
        "hash": "1f4e378",
        "msg": "feat: add promo code support, vehicle calendars, and booking validation rules",
        "date": "2026-06-03 12:00:00 +0530"
    },
    {
        "hash": "9d949b7",
        "msg": "seo: optimize SEO, sitemaps, robots.txt, and complete final cleanup",
        "date": "2026-06-10 02:07:22 +0530"
    }
]

def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass
    # Make sure we don't have local modifications
    status = run("git status --porcelain")
    # Exclude reconstruct.py and commits_raw.txt from status checks
    untracked = [line for line in status.split("\n") if line.strip() and "reconstruct.py" not in line and "commits_raw.txt" not in line]
    if untracked:
        print("Error: You have unstaged changes!")
        print("\n".join(untracked))
        sys.exit(1)

    print("Creating temporary branch...")
    # Checkout first commit as detached HEAD
    run(f"git checkout {milestones[0]['hash']}")
    
    # Create and checkout a new branch temp-reconstruct
    run("git checkout -B temp-reconstruct")
    
    # Commit 1 date adjustment (author and committer date)
    env1 = {
        "GIT_AUTHOR_DATE": milestones[0]["date"],
        "GIT_COMMITTER_DATE": milestones[0]["date"]
    }
    run(f"git commit --amend -m \"{milestones[0]['msg']}\" --allow-empty", env=env1)

    for i in range(1, len(milestones)):
        m = milestones[i]
        print(f"\nProcessing milestone {i+1}/{len(milestones)}: {m['msg']}")
        
        # Clean index and workspace (except .git, commits_raw.txt, and reconstruct.py)
        # We delete everything except .git and reconstruct.py
        for item in os.listdir("."):
            if item == ".git" or item == "reconstruct.py" or item == "commits_raw.txt":
                continue
            if os.path.isdir(item):
                shutil.rmtree(item, ignore_errors=True)
            else:
                try:
                    os.remove(item)
                except:
                    pass
        
        # Restore files from target commit
        run(f"git checkout {m['hash']} -- .")
        
        # Stage all changes
        run("git add -A")
        
        # Commit with custom date
        env_commit = {
            "GIT_AUTHOR_DATE": m["date"],
            "GIT_COMMITTER_DATE": m["date"]
        }
        run(f"git commit -m \"{m['msg']}\" --allow-empty", env=env_commit)
        
    print("\nReconstruction completed. Switching master to temp-reconstruct...")
    run("git checkout master")
    run("git reset --hard temp-reconstruct")
    run("git branch -D temp-reconstruct")
    print("Done!")

if __name__ == "__main__":
    import shutil
    main()
