# Push UI to GitHub

## Option 1: Create New Repository on GitHub
1. Go to https://github.com/new
2. Repository name: `ops-guide-ui`
3. Description: "React TypeScript UI for OpsGuide operational intelligence platform"
4. Keep it **Public** (or Private if preferred)
5. **Don't** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Option 2: Push to Existing Repo
If you want to add UI to the same repo as backend, use a different branch or subdirectory.

## After Creating Repo, Run:
```bash
cd /Users/hiteshtawar/ops-guide-ui
git remote add origin https://github.com/hiteshtawar/ops-guide-ui.git
git branch -M main
git push -u origin main
```

OR if adding to same repo:
```bash
cd /Users/hiteshtawar/ops-guide-ui
git remote add origin https://github.com/hiteshtawar/ops-guide-ai.git
git push -u origin main:ui-main  # Different branch
```

