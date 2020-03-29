 1. Clone `https://github.com/rpandya1990/django-react-redux-docker.git`
 1. cd newly cloned repo
 1. Create `.env` file at the same place where this readme exists
 1. Add the following content in that file
        
        PRESS_PRODUCTION_SERVER=0
        USER_DEV_NAME=<YourUserName::use__whoami__cmd> (which means run whoami command and enter the output here)
        USER_DEV_UID=<YourUserID::use__id__cmd_and_enter___uid__part>  (which means run id command and enter uid value here)
        USER_DEV_GUID=<YourUserGUID::use__id__cmd_and_enter___gid__part>  (which means run id command and enter qid value here)
 1. Make sure docker and docker-compose is installed (Check whether it is already installed using the commands `docker --version` and `docker-compose --version`)
    1. [Install docker-ce](https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/)
    1. Enable tcp control for docker host
       * [Ubuntu 16](https://success.docker.com/article/how-do-i-enable-the-remote-api-for-dockerd)
       * [ubuntu 14](https://www.virtuallyghetto.com/2014/07/quick-tip-how-to-enable-docker-remote-api.html)
    1. [Make sure autofs works on your docker host as well](docs/dev.md#setup-autofs)
 1. Update the DOCKER_OPTS env variable in /etc/default/docker `DOCKER_OPTS="--dns 8.8.8.8 --dns 8.8.4.4 -H tcp://0.0.0.0:2376 -H unix:///var/run/docker.sock"`
 1. Stop apache server as project uses the same port (80) .If you do not stop apache, project cannot access port 80.
    Use `sudo service apache2 stop`
 1. Restart the docker service `sudo service docker restart`
 1. Build dev_box env `docker-compose build dev_box`
 1. Get a bash with dev env`docker-compose run dev_box`
    * your username is your password if required

### Deploy local instance
1. Outside of your dev-box, go into the `./static` and run:
   1. `npm config set registry https://registry.npmjs.org/`
   1. `npm install`
   1. `npm run build`
1. Go into your dev_box (`cd ..` into your project directory and run `docker-compose run dev_box`)
1. Get Development instance to debug/develop with your workspace code `./bin/dev_deploy.py`    
1. Run `python manage.py runserver 0.0.0.0:8000`
1. Access UI with user `dev-admin`:`nopassword`
1. Want a shell in app stack to interact with other services `docker-compose run web /bin/bash`
1. Services Connection Info:
    1. Web `80`
    1. Db`5432`
    1. PGAdminUI `5050`  

### Setup Autofs      
1. Enable Autofs on dev vm
   
        sudo apt-get install autofs
        sudo vi /etc/auto.master
        Add
            /net    -hosts
        sudo service autofs restart
     
         Access nfs share
            cd /net/<host>/mnt/press-data/
