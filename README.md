# The Digital Workshop — portfolio with Django backend

Serves the portfolio page and a protected contact API. Free to run; no paid services.

## Run locally
```
&& source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export DJANGO_DEBUG=1                                # Windows: set DJANGO_DEBUG=1
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
Open http://127.0.0.1:8000/ . Messages appear in http://127.0.0.1:8000/manage-site/ (set ADMIN_PATH to change).

## Test
```
DJANGO_DEBUG=1 python manage.py test
```

## Edit content
Edit the data blocks near the top of the script in `templates/index.html` (PROJECTS, SKILLS, OPPS, TIMELINE, NOTES). Restart the server after editing.

## Behaviour to know
- Contact messages are stored in SQLite, not emailed. Check the admin to reply.
- Rate limit is 5 attempts per IP per hour, kept in memory: it resets on restart and is per-process.
python -m venv .venv # portfolio
