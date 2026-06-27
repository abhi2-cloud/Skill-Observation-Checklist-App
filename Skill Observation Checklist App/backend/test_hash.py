from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"]
)

print(
    pwd_context.hash("admin123")
)