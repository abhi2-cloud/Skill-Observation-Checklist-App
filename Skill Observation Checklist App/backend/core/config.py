import os
import sys
import secrets
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend root (ignored on platforms that inject env vars directly)
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

# ---------------------------------------------------------------------------
# Known placeholder / example values that must never be used in production
# ---------------------------------------------------------------------------
_PLACEHOLDER_VALUES = {
    # Generic placeholders
    "your_secret_key",
    "your_jwt_secret",
    "your-secret-key",
    "change_me",
    "changeme",
    "replace_me",
    "replaceme",
    "secret",
    "default_secret",
    "default",
    "placeholder",
    "example",
    "test",
    "test_secret",
    "mysecret",
    "my_secret",
    "supersecret",
    "super_secret",
    # Values from this project's own docs / old defaults
    "skill_observation_secret_key_2026",
    "generate_a_secure_random_secret_here",
    "replace_with_your_secure_random_secret_here",
    # .env.example template sentinel — must never be copied verbatim
    "replace_this_with_output_of_python_-c_import_secrets_print_secrets.token_hex_32",
    # Common tutorial values found online
    "jwt_secret",
    "jwtsecret",
    "12345",
    "123456",
    "password",
    "abc123",
}


class Settings:
    """
    Application settings loaded from environment variables.

    All required secrets are validated at startup — the server refuses to
    start if any critical variable is missing or set to a placeholder value.

    Required environment variables
    --------------------------------
    DATABASE_URL   — Neon / PostgreSQL connection string
    JWT_SECRET     — 64-char random hex (generate: python -c "import secrets; print(secrets.token_hex(32))")
    NODE_ENV       — "development" | "production"
    """

    # ------------------------------------------------------------------ #
    # Database
    # ------------------------------------------------------------------ #
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # ------------------------------------------------------------------ #
    # JWT / Auth
    # JWT_SECRET takes priority; falls back to SECRET_KEY for compatibility.
    # NEVER uses a hard-coded default.
    # ------------------------------------------------------------------ #
    JWT_SECRET: str = os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY", "")

    # Backwards-compatible alias so existing code using settings.SECRET_KEY works
    @property
    def SECRET_KEY(self) -> str:
        return self.JWT_SECRET

    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")

    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440")
    )

    # ------------------------------------------------------------------ #
    # Runtime environment
    # ------------------------------------------------------------------ #
    NODE_ENV: str = os.getenv("NODE_ENV", "development")

    @property
    def is_production(self) -> bool:
        return self.NODE_ENV.lower() == "production"

    # ------------------------------------------------------------------ #
    # CORS — comma-separated list of allowed origins
    # ------------------------------------------------------------------ #
    ALLOWED_ORIGINS: list[str] = [
        o.strip()
        for o in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if o.strip()
    ]

    # ------------------------------------------------------------------ #
    # Startup validation
    # ------------------------------------------------------------------ #
    def validate(self) -> None:
        """
        Validate all required environment variables at startup.
        Calls sys.exit(1) with a clear, actionable error message if anything
        is missing or insecure, so deployment platforms (Render, Railway, etc.)
        surface the problem immediately in build logs.
        """
        errors: list[str] = []

        # --- DATABASE_URL ---
        if not self.DATABASE_URL:
            errors.append(
                "  ✗ DATABASE_URL is not set.\n"
                "    → Add your Neon PostgreSQL connection string.\n"
                "    → Example: postgresql://user:pass@host/dbname?sslmode=require"
            )

        # --- JWT_SECRET ---
        if not self.JWT_SECRET:
            suggested = secrets.token_hex(32)
            errors.append(
                "  ✗ JWT_SECRET (or SECRET_KEY) is not set.\n"
                "    → A cryptographically secure secret is required for signing JWTs.\n"
                f"    → Use this generated value: {suggested}\n"
                "    → Or run: python -c \"import secrets; print(secrets.token_hex(32))\""
            )
        elif len(self.JWT_SECRET) < 32:
            suggested = secrets.token_hex(32)
            errors.append(
                f"  ✗ JWT_SECRET is too short ({len(self.JWT_SECRET)} chars, minimum 32).\n"
                "    → Use a 64-character random hexadecimal string.\n"
                f"    → Use this generated value: {suggested}"
            )
        elif self.JWT_SECRET.lower() in _PLACEHOLDER_VALUES:
            suggested = secrets.token_hex(32)
            errors.append(
                f"  ✗ JWT_SECRET is set to a placeholder/example value: \"{self.JWT_SECRET}\"\n"
                "    → This is NOT secure. Replace it with a real random secret.\n"
                f"    → Use this generated value: {suggested}\n"
                "    → On Render: Dashboard → Environment → JWT_SECRET → paste the value above.\n"
                "    → On Railway: Variables tab → JWT_SECRET → paste the value above."
                f"  [X] JWT_SECRET is set to a placeholder/example value: \"{self.JWT_SECRET}\"\n"
                "    => This is NOT secure. Replace it with a real random secret.\n"
                f"    => Use this generated value: {suggested}\n"
                "    => On Render: Dashboard => Environment => JWT_SECRET => paste the value above.\n"
                "    => On Railway: Variables tab => JWT_SECRET => paste the value above."
            )

        # --- NODE_ENV ---
        valid_envs = {"development", "production", "test"}
        if self.NODE_ENV.lower() not in valid_envs:
            errors.append(
                f"  [X] NODE_ENV has an unrecognised value: \"{self.NODE_ENV}\"\n"
                "    => Allowed values: development | production | test"
            )

        # --- Print errors and exit ---
        if errors:
            print("\n" + "=" * 70)
            print("  [STARTUP ERROR] Missing or invalid environment variables")
            print("=" * 70)
            print()
            for err in errors:
                print(err)
                print()
            print("-" * 70)
            print("  How to fix:")
            print("  * Local   => Add the variables to your .env file")
            print("  * Render  => Dashboard => Select Service => Environment => Add Variable")
            print("  * Railway => Project => Variables => Add Variable")
            print("  * Vercel  => Project Settings => Environment Variables")
            print("-" * 70 + "\n")
            sys.exit(1)

        # --- Success banner ---
        env_label = self.NODE_ENV.upper()
        masked_secret = self.JWT_SECRET[:6] + "..." + self.JWT_SECRET[-4:]
        print(f"[CONFIG] Environment     : {env_label}")
        print(f"[CONFIG] Database        : {'[OK] Connected' if self.DATABASE_URL else '[X] Missing'}")
        print(f"[CONFIG] JWT_SECRET      : {masked_secret} ({len(self.JWT_SECRET)} chars)")
        print(f"[CONFIG] Algorithm       : {self.ALGORITHM}")
        print(f"[CONFIG] Token expiry    : {self.ACCESS_TOKEN_EXPIRE_MINUTES} min")
        print(f"[CONFIG] CORS origins    : {self.ALLOWED_ORIGINS}")
        print(f"[CONFIG] API Docs        : {'disabled (production)' if self.is_production else 'enabled => /docs'}")


settings = Settings()
settings.validate()