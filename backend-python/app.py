import click
import flask
import pymysql
import requests
import zipfile
import os
import shutil

app = flask.Flask(__name__)
db = pymysql.connect(
    user="root",
    password="testpass",
    host="db",
    database="challenge",
)


@app.route("/test")
def test():
    with db.cursor() as cur:
        cur.execute("SELECT col FROM test;")
        (result,) = cur.fetchone()
        return flask.jsonify(dict(result=result, backend="python"))


@app.cli.command("load-movielens")
def load_movielens():
    # pull the movielens dataset
    click.echo("attempting to pull movielens dataset")
    URL = "https://files.grouplens.org/datasets/movielens/ml-latest-small.zip"
    movielens_archive = "ml-latest-small.zip"
    movielens_dir = "movielens"
    response = requests.get(URL)
    open(movielens_archive, "wb").write(response.content)
    click.echo("movielens dataset pulled")

    # decompress the dataset
    click.echo("attempting to decompress movielens dataset")
    with zipfile.ZipFile(movielens_archive, "r") as archive:
        archive.extractall(movielens_dir)
    click.echo("decompressed movielens dataset")

    # load the dataset into mariadb
    with db.cursor() as cur:
        cur.execute("SELECT col FROM test;")
        (result,) = cur.fetchone()
        click.echo(f"result {result}")

    # clean up downloaded and extracted files
    click.echo("attempting to remove movielens files")
    os.remove(movielens_archive)
    shutil.rmtree(movielens_dir)
    click.echo("removed movielens files")
