# hoenn-auth
Single Sign-On service (Identity server) for my projects

Implements OAuth2 and OpenID Connect protocol.
Does not use any session, authentication, authorization or oauth frameworks or libraries (such as express-session, passportjs, etc.).

While coded with security in mind, this project is not verified in any way by OpenID committee.

# Design

## Authentication

To authenticate user for the main application (dashboard) and oauth flows, cookies are used.
Session cookies are:
 - opaque (random hex string as a key)
 - long-lived (users are supposed to stay logged in even after several months)
 - http-only and secure (to provide some protection against XSS)
 - doubles with same-site: strict cookie

To authenticate and authorize the request can also be used OAuth2 access code or personal access token.

### CSRF mitigation
When user logs in, server sets two cookies: one with same-site set to lax, and other with same-site set to strict

This prevents CSRF attacks on post (patch, put, delete...) endpoints while allowing top-level navigation from other websites (for get requests) 

Unfortunately, same-site property for cookies is not supported by old browsers. To cover these cases, good old CSRF-token is also used (WIP)

## Authorization

This project uses permission-based authorization.

Permissions to access or modify a resource are given based on:
 - Subject (user roles, scopes, claims) - is this user is allowed to perform the action at all
 - Context (parameters, query) - is user allowed to perform this action with provided parameters (e.i. owning a resource)
 - Object - is this operation is allowed to be performed on the resource (e.i. some resource was marked as sealed, therefore cannot be changed)


# OAuth

WIP
