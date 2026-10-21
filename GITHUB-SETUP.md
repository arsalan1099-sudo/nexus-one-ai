# Create the private GitHub repository

Target: `arsalan1099-sudo/nexus-one-ai`

## GitHub web interface

1. Open https://github.com/new
2. Owner: `arsalan1099-sudo`. Repository name: `nexus-one-ai`. Visibility: **Private**.
3. Leave **Add a README**, `.gitignore`, and license **unchecked**; they are already in this project.
4. Select **Create repository**.
5. From your own terminal in the project directory, run:

```bash
git remote add origin https://github.com/arsalan1099-sudo/nexus-one-ai.git
git push -u origin main
```

GitHub will ask you to authenticate if needed; use your own credentials through your Git credential manager. Never paste tokens into ChatGPT or repository files.

## CLI alternative — one command after authentication

Run `bash create-github-repo.sh` from the cloned project. This checks GitHub CLI authentication, then creates a **private** repository and pushes the `main` branch. It stops if the target repository already exists.

## Git bundle alternative

The separate `NEXUS-ONE-RC7-initial.bundle` contains the actual initial Git commit. On a system with Git:

```bash
git clone NEXUS-ONE-RC7-initial.bundle nexus-one-ai
cd nexus-one-ai
# Create the empty private repo on GitHub, then run the remote/push commands above.
```

## Post-push requirements

- Confirm GitHub Actions CI succeeds under Node 24; dependency install and full tests have not been run in this build environment.
- Configure Firebase credentials and provider keys **only** in your hosting provider's secret settings.
- Review `render.yaml` before enabling it: persistent Redis service is paid.
- Independently verify HTTPS, login, email verification, allowlist, Redis, inference, image and vision flows before enabling public access.
