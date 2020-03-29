#!/usr/bin/env python
import argparse
import commands
import os
import subprocess
import sys


def front_end_run(command):
    prefix = 'cd static && '
    command = prefix + command
    print("CMD:\t{0}".format(command))
    so = commands.getoutput(command)
    print("OUTPUT:\t{0}".format(so.replace('\n', '\n\t')))


def run(cmd, retcode=0):
    print("CMD:\t{0}".format(cmd))
    rc = subprocess.call(cmd, shell=True)
    if retcode:
        assert rc == retcode, 'CMD Returned Non Zero Code:\n\t{0}'.format(cmd)


def customize_deployment_exit():
    run("psql -h db -c 'create database tara'", retcode=None)
    run("python manage.py migrate")

    # Django related modifications
    import sys
    sys.path.append(os.path.abspath('{0}/..'.format(os.path.dirname(__file__))))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'press_site.settings')

    import django
    django.setup()

    from django.contrib.auth.models import User

    if not User.objects.filter(username='dev-admin').first():
        User.objects.create_superuser('dev-admin', 'dev-admin@example.com', 'nopassword')

    dev_admin = User.objects.get(username='dev-admin')


def deploy_prod_clone(db_path, reset=False, refresh=False):
    _ = run
    _("sudo chmod 777 /mnt/press-data/")
    if reset:
        _('sudo rm -rf /mnt/press-data/pgdata')

    if refresh:
        _('sudo rsync -a %s /mnt/press-data/' % db_path)
        _('sudo cp /mnt/press-data/pgdata/postgresql.conf.orig /mnt/press-data/pgdata/postgresql.conf')


if __name__ == '__main__':
    rc, _ = commands.getstatusoutput("grep 'PRESS_PRODUCTION_SERVER' .env | grep 1")
    if rc == 0:
        print("Please do not run dev_deploy.py on production server")
        sys.exit(1)

    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(BASE_DIR)
    parser = argparse.ArgumentParser()

    parser.add_argument('--clone_prod', action='store_true',
                        help="Refresh data from production and destroy local copy")
    parser.add_argument('--clone_prod_only', action='store_true',
                        help="Don't deploy. Just clone prod")
    parser.add_argument('--deploy_empty', action='store_true',
                        help="Deploy a emtpy db")
    parser.add_argument('--no_build', action='store_true',
                        help="Don't build before deploying")
    parser.add_argument('--customize_deployment', action='store_true',
                        help="Additional steps to customize a deployment")
    parser.add_argument('--prod_db_path', type=str,
                        default="/net/10.0.124.2/mnt/press-data/backup/pgdata",
                        help="use a local prod clone copy")

    args = parser.parse_args()

    if args.clone_prod:
        deploy_prod_clone(args.prod_db_path, refresh=True, reset=True)
    elif args.deploy_empty:
        deploy_prod_clone(args.prod_db_path, reset=True)
    elif args.customize_deployment:
        customize_deployment_exit()
    elif args.clone_prod_only:
        deploy_prod_clone(args.prod_db_path, refresh=True, reset=True)
        sys.exit()

    front_end_cmds = []

    cmds = [
        "docker-compose down",

        # start services
        "docker-compose up -d db",
        "sleep 5",
        "docker-compose up dev_customize_deployment",
        'docker-compose up -d web',
        'docker-compose up -d dev_web_debug',
    ]

    if not args.no_build:
        cmds.insert(0, "docker-compose build")
        front_end_cmds = [
            # build front end
            ('npm install',),
            ('npm run build',),
        ]

    for cmd in front_end_cmds:
        front_end_run(*cmd)

    for cmd in cmds:
        run(cmd)
