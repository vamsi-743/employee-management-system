var jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET = 'swsh23hjddnns';
const REFRESH_TOKEN_SECRET = 'dhw782wujnd99ahmmakhanjkajikhiwn2n';

function jwtTokens(payloadData) {
	//console.log(payloadData);
	const accessToken = jwt.sign(payloadData, ACCESS_TOKEN_SECRET);
	const refreshToken = jwt.sign(payloadData, REFRESH_TOKEN_SECRET);
	return { accessToken, refreshToken };
}

function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization']; //Bearer TOKEN
	const token = authHeader && authHeader.split(' ')[1];
	//console.log(token);
	if (token == null) return res.status(401).json({ error: 'Unauthorized: null token' });
	jwt.verify(token, ACCESS_TOKEN_SECRET, (error, user) => {
		if (error) return res.status(403).json({ error: 'Unauthorized: Invalid token ' + error.message });
		// console.log("User123456789",user);
		req.user = user;
		next();
	});
}

module.exports = { authenticateToken, jwtTokens };
