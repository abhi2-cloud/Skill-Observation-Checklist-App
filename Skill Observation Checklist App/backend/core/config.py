from dotenv import load_dotenv
import os

load_dotenv()


class Settings:

    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "skill_observation_secret_key_2026"
    )

    ALGORITHM = os.getenv(
        "ALGORITHM",
        "HS256"
    )

    ACCESS_TOKEN_EXPIRE_MINUTES = int(
        os.getenv(
            "ACCESS_TOKEN_EXPIRE_MINUTES",
            "1440"
        )
    )


settings = Settings()

print("SECRET_KEY =", settings.SECRET_KEY)
print("ALGORITHM =", settings.ALGORITHM)