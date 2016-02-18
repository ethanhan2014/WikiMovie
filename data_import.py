# -*- coding: utf-8 -*-
"""
Script that reads in data from the movie dataset and saves to a mysql db.
"""

import argparse
import csv
import json
import os
import MySQLdb

from ConfigParser import ConfigParser


# Parses an ini file, returning a config object
def parse_ini(fname):
    config = ConfigParser()
    config.read(fname)
    return config

# Given a csv file, returns an iterator that parses to a dict
# Takes an array of header values and a flag whether to skip the first line
# Can optionally specify separators besides commas
def parse_csv(fname, headers, skip, delim = ','):
    with open(fname, 'rb') as f:
        reader = csv.DictReader(f, fieldnames = headers, delimiter = delim)
        if skip:
            reader.next()
        for v in reader:
            yield v

# Given a json file, returns an iterator that parses the json as a dict
def parse_json(fname):
    with open(fname, 'rb') as f:
        for line in f:
            yield json.loads(line)

# Creates a MySQL connection given the db config
def create_connection(config):
    vals = dict()
    # host, user, pass, and db are required
    vals['host'] = config.get('db', 'host')
    vals['user'] = config.get('db', 'user')
    vals['passwd'] = config.get('db', 'pass')
    vals['db'] = config.get('db', 'db')
    # port is optional
    if config.has_option('db', 'port'):
        vals['port'] = config.get('db', 'port')
    vals['charset'] = 'utf8'

    return MySQLdb.connect(**vals)

# Returns a dictionary of link information, keyed by tmdbId
def get_links(link_fname):
    result = dict()
    link_iter = parse_csv(link_fname, ['movieId', 'imdbId', 'tmdbId'], True)
    for l in link_iter:
        if len(l["tmdbId"]) > 0:
            tmdbId = int(l["tmdbId"])
            result[tmdbId] = {"movieId": int(l["movieId"])}
            if len(l["imdbId"]) > 0:
                result[tmdbId]["imdbId"] = int(l["imdbId"])

    return result

# Given the tag data filename, writes the data to
def process_tag(tag_fname, conn):
    cur = conn.cursor()
    tag_iter = parse_csv(tag_fname, ["tagId", "tagName", "tagCount"], False, '\t')
    # The tag data is small enough, so store it and execute one big insert
    tuples = []
    tag_map = dict()
    for tag in tag_iter:
        if int(tag["tagCount"]) < 50:
            continue
        tagName = tag["tagName"].lower()
        tagId = int(tag["tagId"])
        tuples.append((tagId, tagName))
        tag_map[tagName] = tagId
    stmt = "INSERT INTO Tag (tag_id, tag) VALUES (%s, %s)"
    cur.executemany(stmt, tuples)
    return tag_map

# Given a cursor, creates an item and returns the new id
def create_item(cur, name, type):
    cur.execute("INSERT INTO Item (name, type) VALUES (%s, %s)",
      (name, type))
    return cur.lastrowid

# Processes the studio data, returning a dictionary keyed by studio ids to
# the new item ids
def process_studio(studio_fname, conn):
    cur = conn.cursor()
    studio_iter = parse_json(studio_fname)
    id_map = dict()
    stmt = "INSERT INTO Studio (item_id, location, name, logo_url, description)" + \
        " VALUES (%s, %s, %s, %s, %s)"
    for studio in studio_iter:
        new_id = create_item(cur, studio["name"], "studio")
        entry = (new_id, studio["headquarters"], studio["name"],
                     studio["logo"], studio["description"])
        id_map[studio["studioId"]] = new_id
        cur.execute(stmt, entry)
    return id_map

# Processes the person data, returning a dictionary keyed by person ids to
# the new item ids
def process_person(person_fname, conn):
    cur = conn.cursor()
    person_iter = parse_json(person_fname)
    id_map = dict()
    stmt = "INSERT INTO Person (item_id, name, image_url, birth_date, " + \
        "death_date, biography, tmdb_id) VALUES (%s, %s, %s, %s, %s, %s, %s)"
    repl = lambda x: None if x == "" else x
    for person in person_iter:
        new_id = create_item(cur, person["name"], "person")
        entry = (new_id, person["name"], person["profile"],
                 repl(person["dayofbirth"]),
                 repl(person["dayofdeath"]), person["biography"], person["personId"])
        id_map[person["personId"]] = new_id
        cur.execute(stmt, entry)
    return id_map

# Processes the movie data, modifies the link data structure with the new ids.
# Besides creating new movies, also makes the involved in and
def process_movie(movie_fname, conn, links, studio, person):
    cur = conn.cursor()
    movie_iter = parse_json(movie_fname)
    stmt = "INSERT INTO Movie (item_id, title, duration, image_url, " + \
        "description, release_date, tmdb_rating, tmdb_id) " + \
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
    create_stmt = "INSERT INTO Creates_Movie (studio_id, movie_id) VALUES " + \
        "(%s, %s)"
    cast_stmt = "INSERT INTO Involved (person_id, movie_id, role_name, cast_order)" + \
        " VALUES (%s, %s, %s, %s)"
    crew_stmt = "INSERT INTO Involved (person_id, movie_id, role_name)" + \
        " VALUES (%s, %s, %s)"
    repl = lambda x: None if x == "" else x
    # Keep track of movie genres
    movie_genres = dict()
    for movie in movie_iter:
        new_id = create_item(cur, movie["title"], "movie")
        movie_genres[int(new_id)] = movie["genres"]
        # Create the movie
        entry = (new_id, movie["title"], repl(movie["runtime"]), movie["poster"],
                 movie["overview"], repl(movie["releasedate"]), movie["userrating"], movie["id"])
        cur.execute(stmt, entry)
        # Add the id to the link data structure (if the id exists)
        movie_id = movie['id']
        if movie_id in links:
            links[movie['id']]['item_id'] = new_id
        # Add the studios that created it
        for s in movie['studios']:
            cur.execute(create_stmt, (studio[s['studioId']], new_id))
        # Add the cast and crew to involved in
        for p in movie['cast']:
            entry = (person[p['personId']], new_id, p['character'], p['order'])
            cur.execute(cast_stmt, entry)
        for p in movie['crew']:
            # Slightly problematic that there's both a dept and a job, so just
            # putting the dept next to the job in parentheses. If its a problem
            # it can be split into another column/table
            entry = (person[p['personId']], new_id,
                     '(' + p['department'] + ') ' + p['job'])
            cur.execute(crew_stmt, entry)
    return movie_genres

# Builds the tag relation table
def process_tag_rel(tag_rel_fname, conn, links, tag_names, movie_genres):
    cur = conn.cursor()
    rel_iter = parse_csv(tag_rel_fname, ["movieId", "tagId", "rel"], False, "\t")
    # Links is keyed by "tmdbId", but we want to index by "movieId" here. So
    # just build the link structure here (it's small enough)
    mlinks = dict()
    movies_left = set(movie_genres.keys())
    for k in links:
        if "item_id" in links[k]:
            mlinks[links[k]["movieId"]] = links[k]["item_id"]
    stmt = "INSERT INTO Tag_Belongs (tag_id, movie_id, relevance) VALUES (%s, %s, %s)"
    cur_tuples = []
    cur_id = None
    tag_ids = set(tag_names.values())
    for rel in rel_iter:
        mId = int(rel["movieId"])
        if mId != cur_id:
            # When the id changes, commit any values collected
            if cur_id != None:
                if cur_id in mlinks and mlinks[cur_id] in movies_left:
                    movies_left.remove(mlinks[cur_id])
                cur.executemany(stmt, cur_tuples)
            cur_id = mId
            cur_tuples = []
        if float(rel["rel"]) < 0.5 or int(rel["tagId"]) not in tag_ids:
            continue
        if mId in mlinks:
            cur_tuples.append((rel["tagId"], mlinks[mId], rel["rel"]))
    # Do the same thing at the end
    if cur_id != None:
        if cur_id in mlinks and mlinks[cur_id] in movies_left:
            movies_left.remove(mlinks[cur_id])
        cur.executemany(stmt, cur_tuples)
    # Go through the remaining movies and default to movie_genres
    new_id = max(tag_names.values())+1
    tag_stmt = "INSERT INTO Tag (tag_id, tag) VALUES (%s, %s)"
    for mid in movies_left:
        # Add each entry in the genres list
        for genre in movie_genres[mid]:
            genre = genre.lower()
            # Get the tag id of the genre, if it doesn't exist, create it!
            if genre in tag_names:
                tag_id = tag_names[genre]
            else:
               cur.execute(tag_stmt, (new_id, genre))
               tag_id = new_id
               # Mark that we have seen this tag now
               tag_names[genre] = tag_id
               new_id += 1
            cur.execute(stmt, (tag_id, mid, None))
    # Compute the tag counts
    cur.execute("UPDATE Tag SET gen_count = (SELECT COUNT(tag) FROM Tag_Belongs WHERE Tag.tag_id = Tag_Belongs.tag_id GROUP BY tag_id)")



# Merges the rotten tomato data into the dataset
def process_rt_movie(rt_movie_fname, conn, links):
    cur = conn.cursor()
    movie_iter = parse_json(rt_movie_fname)
    # Need to build links again since we want to index by imdbId
    mlinks = dict()
    for k in links:
        if "item_id" in links[k]:
            mlinks[links[k]["imdbId"]] = links[k]["item_id"]
    stmt = "UPDATE Movie SET rt_audience_rating = %s, rt_critic_rating = %s " + \
        "WHERE item_id = %s"
    for movie in movie_iter:
        ratings = movie["ratings"]
        imdbId = int(movie["alternate_ids"]["imdb"])
        if imdbId in mlinks:
            cur.execute(stmt, (ratings["audience_score"],
                               ratings["critics_score"], mlinks[imdbId]))

if __name__ == "__main__":
    # Define arguments and reasonable default values for the data files.
    argparser = argparse.ArgumentParser()
    argparser.add_argument("-q", "--data", dest="prefix",
        default="ProjectData", help="Location of data files except db config")
    argparser.add_argument("-l", "--link", dest="link",
        default="MovieLens/links.csv", help="Links the datasets")
    argparser.add_argument("-t", "--tags", dest="tag",
        default="MovieLens/tag-genome/tags.dat", help="List of tags")
    argparser.add_argument("-s", "--studio", dest="studio",
        default="TMDB/TMDBStudioInfo", help="Studio related info file")
    argparser.add_argument("-p", "--person", dest="person",
        default="TMDB/TMDBPersonInfo", help="Person info file")
    argparser.add_argument("-m", "--movie", dest="movie",
        default="TMDB/TMDBMovieInfo", help="Movie info file")
    argparser.add_argument("-r", "--tag-rel", dest="tag_rel",
        default="MovieLens/tag-genome/tag_relevance.dat", help="Tag relevance")
    argparser.add_argument("-u", "--rt-movie", dest="rt_movie",
        default="RottenTomatoes/RottenTomatoes-MovieInfo",
        help="Rotten tomatoes movie info (update ratings)")
    argparser.add_argument("-d", "--database", dest="database",
        default="db.ini", help="Database credentials")
    args = argparser.parse_args()

    try:
        pre = lambda x: os.path.join(args.prefix, x)
        # Get the database connection
        db_config = parse_ini(args.database)
        conn = create_connection(db_config)
        # Process the files based on the dependency order
        print "Parsing link data..."
        links = get_links(pre(args.link))
        print "Processing tags..."
        tags = process_tag(pre(args.tag), conn)
        print "Processing studios..."
        studio = process_studio(pre(args.studio), conn)
        print "Processing people..."
        person = process_person(pre(args.person), conn)
        # Note: Movie passes data back through links
        print "Processing movies + relations..."
        genres = process_movie(pre(args.movie), conn, links, studio, person)

        print "Processing tag relevance..."
        process_tag_rel(pre(args.tag_rel), conn, links, tags, genres)
        print "Adding RT rating data..."
        process_rt_movie(pre(args.rt_movie), conn, links)
        conn.commit()
    finally:
        # Always close the connection
        if conn:
            conn.close()
