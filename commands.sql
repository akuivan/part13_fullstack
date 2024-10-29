/*
Create a blogs table with the following columns:

id (unique, incrementing id)
author (string)
url (string that cannot be empty)
title (string that cannot be empty)
likes (integer with default value zero)
*/

CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    author text,
    url text NOT NULL,
    title text NOT NULL,
    likes integer DEFAULT 0
);

--Add at least two blogs to the database:
insert into blogs (author, url, title) values ('Susan', 'www.susanity.com', 'Susanity');

insert into blogs (author, url, title, likes) values ('Matt', 'www.matty.com', 'Matty', 2);

