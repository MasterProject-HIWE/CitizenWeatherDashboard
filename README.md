# MSc Project: Visual Analysis of the Social Dynamics of Weather Spotters
Visual Analysis of high-impact weather events (HIWEs) based on crowd-sourced data by MeteoSwiss and sturmforum.ch

## Scripts
#### First, we need to install the "installer": yarn
sudo npm install --global yarn
#### Then,  install all the components
yarn install or npm install --legacy-peer-deps
#### The backend runs in the api folder
cd api
#### Create the environment
#### [https://flask.palletsprojects.com/en/2.2.x/installation/](https://flask.palletsprojects.com/en/2.2.x/installation/)
python3 -m venv venv
. venv/bin/activate

python3 -m pip install Flask
python3 -m pip install python-dotenv
python3 -m pip install pymongo
python3 -m pip install -U flask-cors

Start the front end with:

### `yarn start` or 'npm run start'

Run the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.


Start the back end with:

### `yarn start-api` or 'npm run start-api'

Runs the back end  in the development mode on [http://localhost:5000](http://localhost:5000).

Add new libraries with:

### `yarn add library_name`

Remove libraries with:

### `yarn remove library_name`

## Further installations

#### You also need to install the MongoDB database. 
#### It is not an easy task, you might need to grant permissions. It is your Google journey: permissions denied Mongodb on Mac :-)
brew install mongodb-community@5.0

Start MongoDB with (on Mac):
### `brew services start mongodb-community@5.0`

Use the respective version number of MongoDB

Stop mongoDB:
### `brew services stop mongodb-community@5.0`

Run the instance with (from a new terminal):
### `mongosh`


The data (in json format) has to be given by an authorized party. If you get it in the raw format, remove at the beginning:

#### {"type:"FeatureCollection", "features":

and the curly bracket (}) at the end of the file. If not, the file can't be divided in chunks and imported.

Import with:

### `mongoimport ...project name.../data/dwd_crowd_meldungen_20220602_edited.json -d weatherdb -c reports --drop --jsonArray`
(See [https://www.mongodbtutorial.org/mongodb-tools/mongoimport/](https://www.mongodbtutorial.org/mongodb-tools/mongoimport/))
