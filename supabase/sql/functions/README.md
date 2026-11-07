# Funções Postgres (uma por arquivo)

Fonte editável das funções do banco. As migrations `0009`–`0011` aplicam o mesmo SQL.

| Arquivo                     | Uso                                                      |
| --------------------------- | -------------------------------------------------------- |
| `sync_registered_email.sql` | Mantém `registered_emails` único entre staff e moradores |
| `enforce_photo_limit.sql`   | Máximo de 5 fotos por ocorrência                         |
| `is_staff.sql`              | Helper de RLS: `auth.uid()` é funcionário                |
| `handle_new_staff_user.sql` | Cria `staff_profiles` ao inserir em `auth.users`         |
