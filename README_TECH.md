# UCLComputerGraphics

This is a static build of the dynamic rendering system hosted by UCL CS. 
The DB access has been removed. This project implements an online framework for testing and debugging code in javascript and WebGL for use at UCL. It also serves as a platform for designing and editing coursework.


## Prerequisites

1. [Mongo DB](https://docs.mongodb.com/manual/administration/install-on-linux/)
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

### Remove all node_modules
rm -rf node_modules

### Load all node_modules required
npm install

### Start Node.js server as sudo
sudo su
cd /home/henzler/UCLComputerGraphics && /usr/bin/forever start -c /usr/bin/node server.js

### Notes: 
# if npm install throws gyp-rebuild error: switch to node v11.10.0, with eg: nvm use 11.10.0
# full forever path might be unnecessary: forever start server.js
# when the source code has changed, it is necessary to recompile with grunt for the changes to be shown  
```

This should fire up `server.js` at `localhost:8080`, if no other port is specified (cf.`server/config.js`) 

## Deployment (github-pages)

The code can be found in the `build` directory. All necessary steps to compile / copy / ugly / etc. files are done via 
Grunt. For use with Github pages, the grunt-created files must be sanitized after creation (see below). 
### Grunt

To compile, go to the source directory and call

```
grunt
```
 This will execute the following steps: 
   - Transforms the `build/pug/**/*.pug` to `public/html/**/*.html`
   - Transforms the `build/sass/**/*.scss` to `public/css/**/*.css`
   - Uglifies the code in `'build/js/**/*js'` to `'public/js/main.min.js'`

After that, call 
```
python sanitize.py  
```
to modify the path variables in `index.html`. You can then proceed to push to Github. Note that it might take some time (~2-5 min) for the changes to be shown on the live website. 

