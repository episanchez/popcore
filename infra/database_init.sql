
-- CREATE TABLES FOR DB | 17/07/2018

CREATE TABLE media
(
    id INT NOT NULL auto_increment,
    name VARCHAR(100),
    host_name VARCHAR(255),
    url_rss  VARCHAR(255),
    is_indie boolean,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE article
(
    id INT NOT NULL auto_increment,
    id_media INT,
    url VARCHAR(255),
    title VARCHAR(255),
    category VARCHAR(100),
    processed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    published_date DATETIME,
    PRIMARY KEY (id),
    FOREIGN KEY (id_media) REFERENCES media(id)
);

-- CREATE AFTER ...

CREATE TABLE user
(
    id INT PRIMARY KEY NOT NULL,
    fb_id TEXT,
    name VARCHAR(100),
    email VARCHAR(255),
    created_date DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_visited_date DATE
);

CREATE TABLE page_visited
(
    id INT PRIMARY KEY NOT NULL,
    user_id INT,
    article_id INT,
    visited_date DATE,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (article_id) REFERENCES article(id)
);
