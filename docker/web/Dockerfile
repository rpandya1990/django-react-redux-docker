FROM python:2.7
ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y postgresql-client zip tree sshpass vim
RUN pip install --upgrade pip

COPY docker/web/requirements.txt /tmp/web_requirements.txt
RUN pip install -r /tmp/web_requirements.txt

RUN rm -rf /tmp/*


RUN mkdir -p /src/
WORKDIR /src/

ADD bin bin
ADD manage.py manage.py
ADD uwsgi.ini uwsgi.ini
ADD newrelic.ini newrelic.ini
ADD templates templates
ADD static static
RUN python manage.py collectstatic

VOLUME /src/