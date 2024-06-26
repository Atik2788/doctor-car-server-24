/*****

    
 * 
 * 
 ****/


/***
 * How to store token in teh client side
 * 1. memory
 * 2. local storage
 * 3. cookies: http only
 * 4. 
 * 
 */

/**
1. jwt --> json web token
2. generate a token by using jwt.sign
3. create api set to cookie. http only, secure, same|Site
4. from client side: axios withCredentials true.
5. cors setup origin and credentials: true
 * 
 */

/*
1. for secure api calls
2. server side: install cookie parser and use it as a middleware
3. req.cookies
4. on the client side: make api call using axios withCredentials: true pr credentials include while fetch
5. 
*/