# Fuel Control (Backend)

## Supabase: use Session Pooler (IPv4)
No Supabase, selecione **Method = Session pooler** e copie a URI.

Ela aparece parecida com:
`postgresql://postgres.<project-ref>:SENHA@aws-1-sa-east-1.pooler.supabase.com:5432/postgres`

Para este projeto (SQLAlchemy), use assim no `.env`:
`postgresql+psycopg2://postgres.<project-ref>:SENHA@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require`

## Rodar local
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Docs: http://127.0.0.1:8000/docs
