# osmhydra 🐉

OSM/Hydra is an example of using OSM as an identity provider to Ory [Hydra](https://www.ory.sh/). 

- The example app in `app/manage` is an OAuth2 provider that uses OSM as a login.
- The example client uses an access token and secret to read profile data created by a user in `app/manage`.


## Installation
### Requirements
- Postgresql. On macOS, the easiest is to install [Postgres.app](https://postgresapp.com/).
- NodeJS v8+ 
- Docker & Docker Compose

Build the images:
```
docker-compose build
```

### Setting up Hydra

1. Create the database for tokens
```
createdb osmhydra
```
For the rest of this documentation, we will assume that the database location is `postgres://postgres@localhost/osmhydra?sslmode=disable` on your local machine. Inside docker, that location is `postgres://postgres@host.docker.internal/osmhydra?sslmode=disable`

2. Create a a `docker.env` file with the following entries. `OSM_CONSUMER_KEY` and `OSM_CONSUMER_SECRET` are values obtained by creating a new OAuth app on openstreetmap.org
```
OSM_CONSUMER_KEY=<osm-hydra-app>
OSM_CONSUMER_SECRET=<osm-hydra-app-secret>
DSN=postgres://postgres@host.docker.internal/osmhydra?sslmode=disable
SECRETS_SYSTEM=<random-guid>
```

3. Migrate the database
```
docker-compose run --rm hydra migrate sql --yes postgres://postgres@host.docker.internal/osmhydra?sslmode=disable
```

4. Start Hydra and the server
```
docker-compose up
```

This will start hydra where the token issuer is at `http://localhost:4444` and the admin interface is at `http://localhost:4445`. This also sets up the consent and login interface at `http://localhost:8989` (where we will create a first-party oauth app)

### Starting the first party app

Create the first party "manage" app
```
docker-compose exec hydra hydra clients create --endpoint http://localhost:4445 \
  --id manage \
  --secret manage-secret \
  --response-types code,id_token \
  --grant-types refresh_token,authorization_code \
  --scope openid,offline,clients \
  --callbacks http://localhost:8989/login/accept
```

✨ You can now login to the app at http://localhost:8989

## Running the example
The example app authenticates using an access token minted by `app/manage`, so first we need to create a key pair.

1. Go to `http://localhost:8989/clients`
2. Create an app with the following inputs:
```
Name:
example-client

Callback URL:
http://localhost:9090/callback
```
3. Click on "Add new app"
4. Record the `client_id` and `client_secret`

Then, start the example-client:
```
npm install 
npm run example-client
```

When you navigate to `http://localhost:9090` it will ask you for a key pair. After you enter your id and secret, you will be redirected to an example app. 

This app uses the profile information in `http://localhost:8989/profile` to call OSMOSE. Try adding new places in your profile and see them displayed in the example client! Then try building your own client!.