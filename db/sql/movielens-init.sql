CREATE DATABASE movielens;

CREATE TABLE movielens.movies (
	movieId varchar(100) NOT NULL,
	imdbId varchar(100) NULL,
	tmdbId varchar(100) NULL,
	title varchar(100) NOT NULL,
	genres varchar(1000) NULL,
	CONSTRAINT Movies_pk PRIMARY KEY (movieId)
)
ENGINE=InnoDB
DEFAULT CHARSET=latin1
COLLATE=latin1_swedish_ci;

CREATE TABLE movielens.tags (
	userId varchar(100) NOT NULL,
	movieId varchar(100) NOT NULL,
	tag varchar(500) NOT NULL,
	`timestamp` varchar(100) NOT NULL,
	CONSTRAINT Tags_FK FOREIGN KEY (movieId) REFERENCES movielens.movies(movieId) ON DELETE CASCADE ON UPDATE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=latin1
COLLATE=latin1_swedish_ci;

CREATE TABLE movielens.ratings (
	userId varchar(100) NOT NULL,
	movieId varchar(100) NOT NULL,
	rating FLOAT NOT NULL,
	`timestamp` varchar(100) NOT NULL,
	CONSTRAINT Ratings_FK FOREIGN KEY (movieId) REFERENCES movielens.movies(movieId) ON DELETE CASCADE ON UPDATE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=latin1
COLLATE=latin1_swedish_ci;

CREATE TABLE movielens.state (
	data_initialized BOOL NOT NULL
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

INSERT INTO movielens.state (data_initialized) VALUES(0);
