PRINT 'Starting init.sql execution...';
CREATE DATABASE RandlabDB;
GO
PRINT 'Creating login django_admin...';
CREATE LOGIN django_admin WITH PASSWORD='StrongPass123!';
GO
PRINT 'Switching to RandlabDB...';
USE RandlabDB;
GO
PRINT 'Creating user django_admin...';
CREATE USER django_admin FOR LOGIN django_admin;
GO
PRINT 'Assigning db_owner role...';
ALTER ROLE db_owner ADD MEMBER django_admin;
GO
PRINT 'init.sql completed successfully.';