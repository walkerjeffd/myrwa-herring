# Export User List from Firebase

To export user list:

```bash
npm install -g firebase-tools
firebase logout
firebase login
firebase auth:export ~/herring_users.csv --format=csv --project myrwa-herring
awk -F "," '{print $1, $2}' ~/herring_users.csv > ~/herring_emails.csv
rm ~/herring_users.csv
```

```sql
\copy (select * from users) to 'db_users.csv' with CSV HEADER; 
```
