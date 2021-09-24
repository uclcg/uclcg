# UCLComputerGraphics

This project implements an online framework for testing and debugging code in javascript and webGL for use at UCL. It also servers as a platform for designing and editing coursework.

## Prerequisites

1. [Mongo DB](https://docs.mongodb.com/manual/administration/install-on-linux/)
2. [Node.js](https://nodejs.org/en/download/package-manager/)
3. [npm](https://www.npmjs.com/get-npm)
4. [grunt](https://gruntjs.com/) (grunt-cli)
    - npm install -g grunt-cli
4. [Ruby](http://www.ruby-lang.org/en/downloads/)
    - yum -y install gcc mysql-devel ruby-devel rubygems
5. [Sass](https://sass-lang.com/install)
    - gem install sass

## How to use


```bash
### Clone git repo
git https://github.com/thigitogatiamas/UCLComputerGraphics.git
or
git clone git@github.com:thigitogatiamas/UCLComputerGraphics.git

cd UCLComputerGraphics

### Check MongoDB service status
sudo systemctl status mongod.service

### Start MongoDB service
sudo systemctl start mongod.service

### Remove all node_modules
rm -rf node_modules

### Load all node_modules required
npm install

### Start Node.js server as sudo
sudo su
cd /home/henzler/UCLComputerGraphics && /usr/bin/forever start -c /usr/bin/node server.js

```

## Development

The code can be found in the `build` directory. All necessary steps to compile / copy / ugly / etc. files are done via 
Grunt. Most external libraries can be found in the
### Grunt

To run the application go to the root folder of the application and run:

Before you are able to use grunt install:

```
npm install -g grunt-cli
```

Then use:

```
grunt
```

   - Transforms the `build/pug/**/*.pug` to `public/html/**/*.html`
   - Transforms the `build/sass/**/*.scss` to `public/css/**/*.css`
   - Uglifies the code in `'build/js/**/*js'` to `'public/js/main.min.js'`

## Deployment

```
git pull origin master

# change port in config file to 80 (if need be)
grunt
```


## Miscellaneous

### Crontab

```
### Restart Node.js server on reboot
sudo crontab -e

### Add following line
@reboot cd /home/henzler/UCLComputerGraphics && /usr/bin/forever start -c /usr/bin/node server.js
```

### Config


Edit the config file under:

```
nano ./server.config.js
```

