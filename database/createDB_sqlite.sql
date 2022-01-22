CREATE TABLE user (
	id integer PRIMARY KEY AUTOINCREMENT,
	login string,
	passhash string,
	email string,
	name string,
	type integer,
	role integer,
	state integer,
	registerDate datetime
);

CREATE TABLE template (
	id integer PRIMARY KEY AUTOINCREMENT,
	title string,
	ownerId integer,
	data text,
	lastDate datetime,
	version integer,
	shared boolean
);

CREATE TABLE task (
	id integer PRIMARY KEY AUTOINCREMENT,
	userId integer,
	ownerId integer,
	title string,
	result text,
	templateId integer,
	gradeValue integer,
	gradeMax integer,
	isFinished boolean,
	isExamMode boolean
);

CREATE TABLE shareLink (
	id integer PRIMARY KEY AUTOINCREMENT,
	ownerId integer,
	title string,
	link string,
	templateId integer,
	createDate datetime,
	deleteDate datetime,
	taskId binary,
	isExamMode boolean
);

CREATE TABLE templateVersion (
	id integer PRIMARY KEY AUTOINCREMENT,
	templateId integer,
	version integer,
	data text
);

CREATE TABLE meta (
	version integer
);

CREATE TABLE category (
	id integer PRIMARY KEY AUTOINCREMENT,
	title string,
	parent integer,
	desc string,
	user integer,
	sort integer,
	isPublic boolean
);

CREATE TABLE templateCategory (
	id integer PRIMARY KEY AUTOINCREMENT,
	template integer,
	category integer,
	sort integer
);