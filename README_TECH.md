# UCLComputerGraphics

This is a static build of the dynamic rendering system hosted by UCL CS. 
The DB access has been removed. This project implements an online framework for testing and debugging code in javascript and WebGL for use at UCL. It also serves as a platform for designing and editing coursework.


## Prerequisites

1. [Mongo DB](https://docs.mongodb.com/manual/administration/install-on-linux/) - for local development, for legacy reasons
2. [Node.js](https://nodejs.org/en/download/package-manager/)
3. [npm](https://www.npmjs.com/get-npm)
4. [grunt](https://gruntjs.com/) (grunt-cli)
    - npm install -g grunt-cli
5. [Ruby](http://www.ruby-lang.org/en/downloads/)
    - yum -y install gcc mysql-devel ruby-devel rubygems
6. [Sass](https://sass-lang.com/install)
    - gem install sass


## Development (local)


```bash
### Clone git repo
# git clone <repo-address> 

cd uclcg

### For legacy reasons & local dev: check and start MongoDB service
sudo systemctl status mongod.service
sudo systemctl start mongod.service

### Remove all node_modules
rm -rf node_modules

### Load all node_modules required
npm install

### Start Node.js server as sudo
sudo su
cd uclcg && /usr/bin/forever start -c /usr/bin/node server.js

### Notes: 
# if npm install throws gyp-rebuild error: switch to node v11.10.0, with eg: nvm use 11.10.0
# full forever path might be unnecessary: forever start server.js
# when the source code has changed, it is necessary to recompile with grunt for the changes to be shown
# if forever errors out with MongoError, check if MongoDB is running correctly.   
```

This should fire up `server.js` at `localhost:8080`, if no other port is specified (cf.`server/config.js`) 

## Deployment (github-pages)

The code can be found in the `build` directory. All necessary steps to compile/copy/uglify/etc. the source code are done via 
Grunt. For use with Github pages, the grunt-created files must be sanitized after creation (see below). 
### Grunt

To compile, go to the source directory and call

```
grunt
```
 This will execute the following steps: 
   - Transforms the `build/pug/**/*.pug` to `public/html/**/*.html`
   - Transforms the `build/sass/**/*.scss` to `public/css/**/*.css`
   - Uglifies the code in `build/js/**/*js` to `public/js/main.min.js`

After that, call 
```
python sanitize.py  
```
to modify the path variables in `index.html`. You can then proceed to push to Github. Note that it might take some 
time (~2-5 min) for the changes to be shown on the live website. 

Notes: 
- If you're simultaneously running a local version 
on `localhost:80xx`, running `sanitize.py` is going to break it, as the path names will be changed. Simply run `grunt` once more after 
pushing, to have the local server work again.
- The `localhost` version currently cannot display the tabgroups and images. This is due to jQuerys inability of fetching
   cross-domain content, cf. [this](https://stackoverflow.com/questions/8035629/jquery-getscript-returns-undefined/8036430) question. 
   This can be solved by changing the variable `scriptPath` to the local, relative path of the `.uclcg` files, which in
   turn will break the working github-pages version, when pushed. 


### Initial github-pages setup
If you push to a new repository that is not yet configured to serve a github webpage, the following step needs to be executed once. 
After successfully pushing your code (cf. above), go (through the github web client) to `Repository`&rarr;`Settings`, and select `Pages`on the left-side menu. 
Choose a publishing source, and click `Save.` The site will be available as soon as the blue box turns green upon refreshing. 

## Adding / Changing Coursework 
To add/remove/alter the current coursework configuration, follow the following steps: 
- If you changed any files, upload your changed `.uclcg` and `.png` files to `/demos`. 
- Edit the `pathFile.txt` to contain the new/modified entry you wish to add to the database.
  - The file `pathFile.txt` contains info about the current coursework in CSV format. The formatting is explained in the header. 
  Note that both `.urls` must refer to this repository to avoid `CORS errors` when fetching their content via `jQuery` URL requests. 
   
Github will then automatically run an action (cf. `.github/workflows`) that will detect the change in `pathFile.txt` and 
call a python script that updates `demos/db.json`, which is then automatically read by `build/index.js` everytime the 
site is accessed. Note: this may take a few minutes. 

## TODOs: 
- Add Github Actions, such that: the repository is monitored, and stuff happens on push/pull actions. Ideally: whenever
  a new file is pushed to the CW repository, we would run make_json.py, which in turn creates a db.json
  object in said repo, which is then read by the system and transformed into tabgroups and tabs. 