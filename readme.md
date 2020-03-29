### Contribute code
 1. Clone `https://github.com/rpandya1990/django-react-redux-docker.git`
 1. cd newly cloned repo
 1. Create `.env` file at the same place where this readme exists
 1. Add the following content in that file
        
        ATLANTIS_PRODUCTION_SERVER=0
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
 1. Stop apache server as our local atlantis uses the same port (80) .If you donot stop apache ,our atlantis cannot access port 80.
    Use `sudo service apache2 stop`
 1. Restart the docker service `sudo service docker restart`
 1. Build dev_box env `docker-compose build dev_box`
 1. Get a bash with dev env`docker-compose run dev_box`
    * your username is your password if required
 1. Get sandbox to debug/develop read more at [Dev Notes](docs/dev.md#deploy-local-instance-of-atlantis)
 1. Check whether the images are running inside the docker.
    `sudo docker ps`
    You must see many images related to atlantis running
 1. Create branch `arc feature <featureName>`
 1. Once happy `git commit.... arc diff... ... git rebase... arc land...`

### Atlantis Doc Index

1. [Dev Notes](docs/dev.md)
1. [Production Notes](docs/production.md)
1. [Redash](docs/redash.md)



### Random sutff
* docker-compose run redash create_db

