CREATE TABLE category (id integer PRIMARY KEY AUTOINCREMENT, title string, parent integer,	desc string,	user integer,	sort integer, 	isPublic boolean)
CREATE TABLE templateCategory (	id integer PRIMARY KEY AUTOINCREMENT,	template integer,	category integer,	sort integer)
ALTER TABLE template ADD COLUMN shared boolean