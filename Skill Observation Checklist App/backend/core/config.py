import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend root
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)


class Settings:
    """
    Application settings loaded from environment variables.
    All required secrets are validated at startup — the server
    will refuse to start if any critical variable is missing.
    """

    # ------------------------------------------------------------------ #
    # Database
    # ------------------------------------------------------------------ #
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # ------------------------------------------------------------------ #
    # JWT / Auth  — consolidated: JWT_SECRET takes priority, falls back
    # to SECRET_KEY for backwards compatibility, but NEVER uses a
    # hard-coded default in production.
    # ------------------------------------------------------------------ #
    JWT_SECRET: str = os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY", "")

    # Expose as SECRET_KEY so existing code that references settings.SECRET_KEY
    # keeps working without any changes.
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
        return self.NODE_ENV == "production"

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
        Validate that all required environment variables are present.
        Raises SystemExit with a descriptive message so the server never
        boots with a missing or insecure configuration.
        """
        errors: list[str] = []

        if not self.DATABASE_URL:
            errors.append(
                "  • DATABASE_URL  — PostgreSQL connection string is required."
            )

        if not self.JWT_SECRET:
            errors.append(
                "  • JWT_SECRET (or SECRET_KEY)  — "
                "A cryptographically secure secret is required for signing JWTs.\n"
                "    Generate one with:  python -c \"import secrets; print(secrets.token_hex(32))\""
            )
        elif len(self.JWT_SECRET) < 32:
            errors.append(
                "  • JWT_SECRET is too short (< 32 chars).  "
                "Use at least a 64-character random hex string in production."
            )
        elif self.is_production and self.JWT_SECRET in (
            "secret",
            "your_secret_key",
            "skill_observation_secret_key_2026",
            "changeme",
        ):
            errors.append(
                "  • JWT_SECRET looks like a placeholder.  "
                "Set a real random secret before deploying to production."
            )

        if errors:
            print("\n[CONFIG ERROR] Server cannot start — missing or invalid environment variables:\n")
            for err in errors:
                print(err)
            print(
                "\nSet these variables in your .env file (local) or in your "
                "deployment dashboard (Render / Railway / Vercel).\n"
            )
            sys.exit(1)


settings = Settings()
settings.validate()