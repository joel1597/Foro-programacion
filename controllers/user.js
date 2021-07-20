'use strict';

const validator = require('validator');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('../services/jwt');
const fs = require('fs');
const path = require('path');

const UserController = {

	prueba: (req, res) => {
		res.status(200).send({
			message: "hola desde el controlador de Usuarios",
			value: 30
		})
	},

	save: (req, res) => {
		let params = req.body;

		let vald_name = !validator.isEmpty(params.name);
		let vald_surname = !validator.isEmpty(params.surname);
		let vald_email = !validator.isEmpty(params.email) && validator.isEmail(params.email)
		let vald_pass = !validator.isEmpty(params.password);

		if( vald_name && vald_surname && vald_email && vald_pass ){

			let user = new User();

			user.name = params.name;
			user.surname = params.surname;
			user.email = params.email;			
			user.role = 'ROLE_USER';
			user.image = null;

			User.findOne({ email: user.email }, (err, issetUser) => {

				if( err ){

					return res.status(500).send({
						message: "Error al comprobar duplicidad de usuario"
					});
				}

				if( !issetUser ){

					const saltRounds = 10;
					bcrypt.hash(params.password, saltRounds, (err, hash) => {
    					user.password = hash;

    					user.save( (err, userStored) => {

    						if( err ){
								return res.status(500).send({
									message: "Error al guardar el usuario"
								});
							}

							if( !userStored ){

								return res.status(400).send({
									message: "El usuario no se ah guardado"
								});
							}

							return res.status(200).send({
								status: "success",
								user: userStored					
							});
    					});	    				

					});
					

				}else{

					return res.status(500).send({
						message: "El usuario ya esta registrado"
					});
				}

			});

		}else{

			return res.status(200).send({
				message: "Ingresar datos correctamente"				
			})

		}

	},

	login: (req, res) => {

		let params = req.body;

		let vald_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
		let vald_password = !validator.isEmpty(params.password);

		if( !vald_email || !vald_password ){

			return res.status(200).send({
				message: "los datos son incorrectos, envialos bien"
			});

		}

		User.findOne({ email: params.email.toLowerCase() }, (err, user) => {

			if( err ){

				return res.status(500).send({
					message: "Error al intentar identificarse"
				});									
			}

			if( !user ){

				return res.status(404).send({
					message: "El usuario no existe"
				});	

			}

			bcrypt.compare(params.password, user.password, (err, check) => {

				if( check ){

					if( params.gettoken ){

						return res.status(200).send({
							token: jwt.createToken(user)						
						});

					}else{

						user.password = undefined;

						return res.status(200).send({
							status: "success",
							user						
						});
					}
					
				}else{
					return res.status(500).send({
						message: "credenciales incorrectas"						
					});

				}

			});

		});

	},

	update: (req, res) => {

		let params = req.body;

		try{

			let vald_name = !validator.isEmpty(params.name);
			let vald_surname = !validator.isEmpty(params.surname);
			let vald_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);

		}catch(ex){
			
			return res.status(200).send({
				message: "faltan datos por enviar"						
			});

		}
		
		delete params.password;

		let userId = req.user.sub;

		if( req.user.email != params.email ){

			User.findOne({ email: params.email.toLowerCase() }, (err, issetUser) => {

				if( err ){

					return res.status(500).send({
						message: "Error al intentar modificaes"
					});
				}

				if( issetUser && issetUser.email==params.email){

					return res.status(404).send({
						message: "El email no puede ser modificado"
					});

				}else{

					User.findOneAndUpdate({_id: userId}, params, {new: true}, (err, userUpdated) => {

						if( err ){

							return res.status(500).send({
								status: "error",
								message: "Error al actualizar el usuario",
								err					
							});
						}

						if( !userUpdated ){

							return res.status(500).send({
								status: "error",
								message: "No se ah actualizado el usuario"					
							});

						}

						return res.status(200).send({
							status: "success",
							user: userUpdated						
						});

					});
				}
			
			});

		}else{

			User.findOneAndUpdate({_id: userId}, params, {new: true}, (err, userUpdated) => {

				if( err ){

					return res.status(500).send({
						status: "error",
						message: "Error al actualizar el usuario",
						err					
					});
				}

				if( !userUpdated ){

					return res.status(500).send({
						status: "error",
						message: "No se ah actualizado el usuario"					
					});

				}

				return res.status(200).send({
					status: "success",
					user: userUpdated						
				});

			});


		}	

	},

	uploadAvatar: (req, res) => {		

		if( !req.files ){
			return res.status(404).send({
				status: 'error',
				message: file_name
			});
		}

		let file_path = req.files.file0.path;
		let file_split = file_path.split('\\');

		//Obtener el nombre del archivo/foto
		let file_name = file_split[2];

		//Obtener la extension del archivo/foto
		let ext_split = file_name.split('\.');
		let file_ext = ext_split[1];

		if(file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif'){

			fs.unlink(file_path, (err) => {

				return res.status(500).send({
					status: 'error',
					message: 'La extension del archivo no es valida'					
				});

			});

		}else{

			let userId = req.user.sub;

			User.findOneAndUpdate({_id: userId}, {image: file_name}, {new: true}, (err, userUpdated) => {

				if(err || !userUpdated){

					return res.status(500).send({
						status: 'error',
						message: 'Error al guardar el usuario'
					});
				}

				return res.status(200).send({
					status: 'success',
					user: userUpdated
				});		

			});

		}

	},

	avatar: (req, res) => {

		let fileName = req.params.fileName;
		let pathFile = './uploads/users/'+fileName;

		fs.exists(pathFile, (exists) => {

			if(exists){
				return res.sendFile(path.resolve(pathFile));
			}else{
				return res.status(404).send({
					message: 'la imagen no existe'
				});
			}

		});

	},

	getUsers: (req, res) => {

		User.find().exec((err, users) => {

			if(err || !users){
				return res.status(404).send({
					status: 'error',
					message: 'No hay usuarios que mostrar'
				});
			}

			return res.status(200).send({
				status: 'success',
				users
			});

		});

	},

	getUser: (req, res) => {

		let userId = req.params.userId;

		User.findById(userId).exec((err, user) => {

			if(err || !user){
				return res.status(404).send({
					status: 'error',
					message: 'No existe el usuario'
				});
			}

			return res.status(200).send({
				status: 'success',
				user
			});

		});

	}


}

module.exports = UserController;