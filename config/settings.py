import os
from dotenv import load_dotenv
load_dotenv()
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
env = lambda k, d="": os.environ.get(k, d)

DEBUG = env("DJANGO_DEBUG", "0") == "1"
# Safety: force DEBUG off on Render production
if os.environ.get("RENDER") == "true":
    DEBUG = False
SECRET_KEY = env("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = "dev-only-insecure-key"
    else:
        raise RuntimeError("Set DJANGO_SECRET_KEY (see .env.example).")
ALLOWED_HOSTS = [h.strip() for h in env("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",") if h.strip()]
# Fallback: always allow the live Render deployment URL
if "dericks-portfolio.onrender.com" not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append("dericks-portfolio.onrender.com")
if ".onrender.com" not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(".onrender.com")

INSTALLED_APPS = [
    "django.contrib.admin", "django.contrib.auth", "django.contrib.contenttypes",
    "django.contrib.sessions", "django.contrib.messages",
    "django.contrib.staticfiles",
    "storages", "django.contrib.sitemaps", "access", "contact",
]
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "contact.middleware.CSPMiddleware",
]
ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
TEMPLATES = [{"BACKEND": "django.template.backends.django.DjangoTemplates", "DIRS": [BASE_DIR / "templates"],
              "APP_DIRS": True, "OPTIONS": {"context_processors": [
                  "django.template.context_processors.request",
                  "django.contrib.auth.context_processors.auth",
                  "django.contrib.messages.context_processors.messages",
                  "access.context_processors.search_data"]}}]
DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": BASE_DIR / "db.sqlite3"}}
CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
AUTH_PASSWORD_VALIDATORS = [{"NAME": f"django.contrib.auth.password_validation.{n}"} for n in
    ["UserAttributeSimilarityValidator", "MinimumLengthValidator", "CommonPasswordValidator", "NumericPasswordValidator"]]
STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
ADMIN_PATH = env("ADMIN_PATH", "manage-site/").strip("/") + "/"

SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "same-origin"
X_FRAME_OPTIONS = "DENY"
if not DEBUG:
    SESSION_COOKIE_SECURE = CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = env("DJANGO_SSL_REDIRECT", "1") == "1"
    SECURE_HSTS_SECONDS = 31536000
    if env("DJANGO_BEHIND_PROXY") == "1":
        SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")


# --- Static and media (portfolio assets) ---
STATICFILES_DIRS = [BASE_DIR / "static"]
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"





LOGIN_REDIRECT_URL = '/dashboard/'
LOGIN_URL = '/manage-secret/'



# WhiteNoise for serving static files on Render
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"



# ==========================================
AWS_ACCESS_KEY_ID = os.environ.get("SUPABASE_ACCESS_KEY")
AWS_SECRET_ACCESS_KEY = os.environ.get("SUPABASE_SECRET_KEY")
AWS_STORAGE_BUCKET_NAME = os.environ.get("SUPABASE_BUCKET", "media")
AWS_S3_ENDPOINT_URL = os.environ.get("SUPABASE_ENDPOINT")
AWS_S3_REGION_NAME = os.environ.get("SUPABASE_REGION", "us-east-1")
AWS_S3_ADDRESSING_STYLE = "path"
AWS_QUERYSTRING_AUTH = False

STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3.S3Storage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

if AWS_S3_ENDPOINT_URL and AWS_STORAGE_BUCKET_NAME:
    MEDIA_URL = f"{AWS_S3_ENDPOINT_URL.rstrip('/')}/{AWS_STORAGE_BUCKET_NAME}/"

# ==========================================
# STORAGE — Supabase S3 (Corrected)
# ==========================================
AWS_ACCESS_KEY_ID = os.environ.get("SUPABASE_ACCESS_KEY")
AWS_SECRET_ACCESS_KEY = os.environ.get("SUPABASE_SECRET_KEY")
AWS_STORAGE_BUCKET_NAME = os.environ.get("SUPABASE_BUCKET", "media")
AWS_S3_ENDPOINT_URL = os.environ.get("SUPABASE_ENDPOINT")
AWS_S3_REGION_NAME = os.environ.get("SUPABASE_REGION", "us-east-1")
AWS_S3_ADDRESSING_STYLE = "path"
AWS_QUERYSTRING_AUTH = False

# THIS IS THE CRITICAL FIX: Tell Django to use the public URL, not the S3 API
# It must NOT include https://
AWS_S3_CUSTOM_DOMAIN = f"{os.environ.get('SUPABASE_PROJECT_REF')}.supabase.co/storage/v1/object/public/{AWS_STORAGE_BUCKET_NAME}"

STORAGES = {
    "default": {
        "BACKEND": "storages.backends.s3.S3Storage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

