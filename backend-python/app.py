import click
import flask
import pymysql
import requests
import zipfile
import os
import shutil
import csv
import logging
import traceback
import math

app = flask.Flask(__name__)
db = pymysql.connect(
    user="root",
    password="testpass",
    host="db",
    database="movielens",
)


@app.route("/test")
def test():
    with db.cursor() as cur:
        cur.execute("SELECT (`value_bool`) FROM movielens.state WHERE `parameter` = 'data_initialized';")
        (result,) = cur.fetchone()
        return flask.jsonify(dict(result=result, backend="python"))


@app.route("/ping")
def ping():
    return flask.jsonify(dict(result="200", backend="python"))


@app.route("/search")
def search():
    page = flask.request.args.get('page', default = 1, type = int)
    mode = flask.request.args.get('mode', default = 'movies', type = str)
    term = flask.request.args.get('term', default = "*", type = str)
    items_per_page = 10

    if mode == "movies":
        query = f"SELECT * FROM movielens.movies WHERE (title LIKE '%{term}%') LIMIT {items_per_page} OFFSET {items_per_page * (page - 1)};"
        # click.echo(f"searching for movie with title: {term}")
        click.echo(f"using query: {query}")

        results = sql_select_query(query)

        def convert_movie_row(row):
            row_dict = dict(
                movieId=row[0],
                imdbId=row[1],
                tmdbId=row[2],
                title=row[3],
                genres=row[4]
            )
            return row_dict

        result_dict = list(map(convert_movie_row, results))
        # click.echo(f"converted results: {result_dict}")

        query = f"SELECT COUNT(*) FROM movielens.movies WHERE (title LIKE '%{term}%');"
        num_results = sql_select_query(query)[0][0]
        num_pages = math.ceil(num_results / items_per_page)

        return flask.jsonify(dict(
            result=result_dict, 
            backend="python", 
            num_pages=num_pages, 
            num_results=num_results
            )
        )
    else:
        return flask.jsonify(dict(result="mode not supported", backend="python"))


def sql_select_query(query):
    with db.cursor() as cur:
        try:
            cur.execute(query)
        except Exception as e:
            logging.error(traceback.format_exc())
            while not db.open:
                db.ping(reconnect=True)
    return cur.fetchall()


@app.cli.command("load-movielens")
def load_movielens():
    # check if dataset is not already initialized
    click.echo(f"check if dataset is not already initialized")
    with db.cursor() as cur:
        cur.execute("SELECT (`value_bool`) FROM movielens.state WHERE `parameter` = 'data_initialized';")
        (is_initialized,) = cur.fetchone()
        click.echo(f"result {is_initialized}")

    if is_initialized:
        return
    else:
        clear_database()

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
    with open(os.path.join(movielens_dir, "ml-latest-small", 'movies.csv'), newline='') as movie_csvfile, \
         open(os.path.join(movielens_dir, "ml-latest-small", 'links.csv'), newline='') as link_csvfile:
        moviereader = csv.DictReader(movie_csvfile)
        linkreader = csv.DictReader(link_csvfile)
        for (movierow, linkrow) in zip(moviereader, linkreader):
            if movierow["movieId"] != linkrow["movieId"]:
                click.echo("ERROR: MALFORMED DATA. Check movielens data contracts")
                return
            add_movie(movierow["movieId"], linkrow["imdbId"], linkrow["tmdbId"], movierow["title"], movierow["genres"])
    with open(os.path.join(movielens_dir, "ml-latest-small", 'ratings.csv'), newline='') as rating_csvfile:
        ratingreader = csv.DictReader(rating_csvfile)
        for ratingrow in ratingreader:
            add_rating(ratingrow["userId"], ratingrow["movieId"], ratingrow["rating"], ratingrow["timestamp"])
    with open(os.path.join(movielens_dir, "ml-latest-small", 'tags.csv'), newline='') as tag_csvfile:
        tagreader = csv.DictReader(tag_csvfile)
        for tagrow in tagreader:
            add_tag(tagrow["userId"], tagrow["movieId"], tagrow["tag"], tagrow["timestamp"])

    # set 'data_initialized' in database to true
    click.echo(f"setting dataset's state marker to initialized")
    with db.cursor() as cur:
        cur.execute("UPDATE movielens.state SET value_bool=1 WHERE `parameter`='data_initialized';")
        db.commit()


    # clean up downloaded and extracted files
    click.echo("attempting to remove movielens files")
    os.remove(movielens_archive)
    shutil.rmtree(movielens_dir)
    click.echo("removed movielens files")

def add_movie(movieId, imdbId, tmdbId, title, genres):
    print("Adding movie: (" + movieId + ", " + imdbId + ", " + tmdbId + ", " + title + ", " + genres + ")")
    title = title.replace("'", "''") # need to escape single quotes otherwise they'll break the sql statement
    genres = genres.replace("'", "''")
    with db.cursor() as cur:
        cur.execute(f"INSERT INTO movies (`movieId`, `imdbId`, `tmdbId`, `title`, `genres`)"
                    f"VALUES ('{movieId}', '{imdbId}', '{tmdbId}', '{title}', '{genres}');")
    db.commit()

def add_rating(userId, movieId, rating, timestamp):
    print("Adding rating: (" + userId + ", " + movieId + ", " + rating + ", " + timestamp + ")")
    with db.cursor() as cur:
        cur.execute(f"INSERT INTO ratings (`userId`, `movieId`, `rating`, `timestamp`)"
                    f"VALUES ('{userId}', '{movieId}', '{rating}', '{timestamp}');")
    db.commit()

def add_tag(userId, movieId, tag, timestamp):
    print("Adding tag: (" + userId + ", " + movieId + ", " + tag + ", " + timestamp + ")")
    tag = tag.replace("'", "''")
    with db.cursor() as cur:
        cur.execute(f"INSERT INTO tags (`userId`, `movieId`, `tag`, `timestamp`)"
                    f"VALUES ('{userId}', '{movieId}', '{tag}', '{timestamp}');")
    db.commit()

def clear_database():
    print("Clearing database")
    with db.cursor() as cur:
        cur.execute(f"DELETE FROM movies;")
        cur.execute(f"DELETE FROM ratings;")
        cur.execute(f"DELETE FROM tags;")
        cur.execute("UPDATE movielens.state SET value_bool=0 WHERE `parameter`='data_initialized';")
    db.commit()

