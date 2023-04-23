// Handles user auth state

// Ideas
// Use a one way hash to do password checks, if login in right then return a token and some user attributes like user id, name, etc (Easy password hash idea: reverse the string)
// Use a cookie or "state" on the Next.JS side to keep token and attributes
// On any requests that are on that are specific to users, pass the token and/or relevant attributes
// Logout deletes the cookie & state