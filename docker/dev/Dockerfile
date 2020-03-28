FROM ubuntu:16.04
RUN apt-get update
RUN apt-get install -y php php-curl git python-pip sudo vim curl autofs
RUN cd /tmp; curl -fsSL get.docker.com -o get-docker.sh
RUN cd /tmp; sudo sh get-docker.sh
RUN pip install --upgrade pip
ADD docker/dev/auto.master /etc/auto.master

RUN mkdir -p /opt/arc
WORKDIR /opt/arc/
RUN git clone https://github.com/phacility/libphutil.git
RUN git clone https://github.com/phacility/arcanist.git
RUN ln -s /opt/arc/arcanist/bin/* /usr/bin/

WORKDIR /tmp/
ADD docker/dev/requirements.txt dev_requirements.txt
ADD docker/web/requirements.txt web_requirements.txt
RUN pip install -r dev_requirements.txt -r web_requirements.txt
RUN rm -rf /tmp/*

WORKDIR /bin/
ADD docker/dev/service.sh .

RUN sudo apt-get update
RUN sudo apt-get install nodejs -y
RUN sudo apt-get install npm -y
RUN sudo ln -s /usr/bin/nodejs /usr/bin/node

ARG USER_DEV_NAME
ARG USER_DEV_UID
ARG USER_DEV_GUID

RUN useradd -d /home/$USER_DEV_NAME -m $USER_DEV_NAME
RUN usermod -u $USER_DEV_UID -U $USER_DEV_NAME
RUN usermod -aG sudo $USER_DEV_NAME
#RUN groupmod -g $USER_DEV_GUID $USER_DEV_NAME
RUN echo $USER_DEV_NAME:$USER_DEV_NAME | chpasswd
RUN usermod -aG docker $USER_DEV_NAME
RUN echo "$USER_DEV_NAME ALL=(ALL) NOPASSWD:ALL" | sudo tee -a /etc/sudoers

# Set Default user and service
USER $USER_DEV_NAME
WORKDIR /home/$USER_DEV_NAME