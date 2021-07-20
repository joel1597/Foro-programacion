'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');
const secret = 'clave-secreta-para-generar-el-token';

exports.authenticated = (req, res, next) => {

	if( !req.headers.authorization ){

		return res.status(403).send({
			message: "La peticion no tiene la cabezara de authorization"
		});
	}

	let payload;
	let token = req.headers.authorization.replace(/['"]+/g,'');

	try{

		 payload = jwt.decode(token, secret);

		if( payload.exp <= moment().unix() ){

			return res.status(404).send({
				message: "el token ah expirado"
			})

		}

	}catch(ex){

		return res.status(404).send({
				message: "El token no es valido"
			})
	}


	req.user = payload;

	next();

};