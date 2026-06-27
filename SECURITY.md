# Security Policy

Agent Context Doctor checks repository context files and safety boundaries. It must be conservative with secrets and local environment files.

## Supported Versions

This project is pre-1.0. Security-sensitive fixes will target the latest main branch until the first public release.

## Reporting A Vulnerability

After the repository is public, please report vulnerabilities through GitHub security advisories if available. Until then, contact the maintainer privately.

## Secret Handling Rules

- Do not print `.env` contents.
- Do not include secret values in JSON output.
- Do not add diagnostics that require reading private tokens.
- Prefer checking file paths and references over reading secret-bearing files.
- Treat autofix as more dangerous than diagnosis.
