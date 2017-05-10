Mystic Herring Migration - Database
===================================

## Configuration

See `/config/index.template.js`

```js
{
  db: {
    host: '',
    port: 5432,
    database: '',
    user: '',
    password: ''
  },
  ...
}
```

## Users

Assumes two users have been created

```
myrwa_admin // superuser
myrwa_www   // primary web user
```

## Set Up

```
psql -h <hostname> -p 5432 -U myrwa_admin -d herring -f schema.sql

# manually create myrwa_www role
psql -d herring -f db/permissions.sql
```

## Populate with Fixtures

Add location fixtures

```
psql -h <hostname> -p 5432 -U myrwa_admin -d herring -f fixtures/locations.sql
```

## Migrations

Manually migrate database using scripts in `migrations/`. Only necessary if database schema is outdated. The `schema.sql` will always be up to date and match the latest migration.
