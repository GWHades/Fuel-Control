# Controle de Abastecimento (MVP) — Atualizado

## Banco (Supabase Session Pooler)
Pela sua tela, o Supabase já mostrou a URI do **Session pooler** no formato:

`postgresql://postgres.<project-ref>:[YOUR-PASSWORD]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres`

Para usar no backend (SQLAlchemy), coloque no `backend/.env` assim:

`DATABASE_URL=postgresql+psycopg2://postgres.<project-ref>:SUA_SENHA@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require`

## Rodar
- Backend: veja `backend/README.md`
- Frontend: veja `frontend/README.md`
