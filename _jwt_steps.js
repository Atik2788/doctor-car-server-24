/***
 * insstall jsonwebtoken
 * jwt.sign(playlod, secret, {expiresIn:})
 * token client
 * 
 * 
 */


/***
 * How to store token in teh client side
 * 1. memory
 * 2. local storage
 * 3. cookies: http only
 * 4. 
 * 
 */

/**
 * 1. set cookies with http only. for development secure: false, 
 * 
 * 2. cors
 * app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
 * 
 * 3. client side axios setting
 * in axios set withCedentials: true;
 * 
 */