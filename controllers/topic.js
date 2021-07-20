'use strict'

const validator = require('validator');
const Topic = require('../models/topic');

const TopicController = {

	save: (req, res) => {

		let params = req.body;

		let validate_title;
		let validate_content;
		let validate_lang;

		try{

			validate_title = !validator.isEmpty(params.title);
			validate_content = !validator.isEmpty(params.content);			
			validate_lang = !validator.isEmpty(params.lang);

		}catch(err){

			return res.status(200).send({
				message: "Faltan datos por enviar"
			})
		}

		if( validate_title &&  validate_content && validate_lang ){

			let topic = new Topic();

			topic.title = params.title;
			topic.content = params.content;
			topic.code = params.code;
			topic.lang = params.lang;
			topic.user = req.user.sub;

			topic.save( (err, topicStored) => {

				if(err || !topicStored){
					return res.status(500).send({
						status: 'error',
						message: "El tema no se ah guardado"
					})
				}

				return res.status(200).send({
					status: 'success',
					topic: topicStored
				})

			});

		}else{

			return res.status(500).send({
				message: "Los datos no son validos"
			})
		}		

	},

	getTopics: (req, res) => {

		//cargar libreria de paginacion en el objeto y el modelo
		let page;

		if( !req.params.page || req.params.page==null || req.params.page==undefined || req.params.page==0 || req.params.page=="0"){
			page = 1;
		}else{
			page = parseInt(req.params.page);
		}

		let options = {
			sort: { date: -1 },
			populate: 'user',
			limit: 5,
			page: page 
		}

		Topic.paginate({}, options, (err, topics) => {

			if( err ){
				return res.status(500).send({
					status: 'error',
					message: "Error al hacer la consulta"
				});
			}

			if( !topics ){
				return res.status(404).send({
					status: 'error',
					message: "No hay topics"
				});
			}

			return res.status(200).send({
				status: 'success',
				topics: topics.docs,
				totalDocs: topics.totalDocs,
				totalPages: topics.totalPages
			});

		});

	},

	getTopicByUser: (req, res) => {

		let userId = req.params.user;

		Topic.find({
			user: userId
		})
		.sort([['date', 'descending']])
		.exec((err, topics) => {

			if(err){
				return res.status(500).send({
					stattus: 'error',
					message:'Error en la peticion'
				});
			}

			if(!topics){
				return res.status(404).send({
					stattus: 'error',
					message:'No hay temas para mostrar'
				});
			}

			return res.status(200).send({
				stattus: 'success',
				topics
			});
		})

	},

	getTopic: (req, res) => {

		let topcId = req.params.id;

		Topic.findById(topcId)
			 .populate('user')
			 .populate('comments.user')
			 .exec((err, topic) => {

			 	if(err){
			 		return res.status(500).send({
				 		status: 'error',
						message: 'Error en la peticion'
					});
			 	}

			 	if(!topic){
			 		return res.status(404).send({
				 		status: 'error',
						message: 'No existe el tema'
					});
			 	}

			 	return res.status(200).send({
			 		status: 'success',
					topic
				});

			 })

	},

	update: (req, res ) => {

		let topicId = req.params.id;
		let params = req.body;

		let update;
		let validate_title;
		let validate_content;
		let validate_lang;

		try{

			validate_title = !validator.isEmpty(params.title);
			validate_content = !validator.isEmpty(params.content);			
			validate_lang = !validator.isEmpty(params.lang);

		}catch(err){

			return res.status(200).send({
				message: "Faltan datos por enviar"
			})
		}

		if( validate_title &&  validate_content && validate_lang ){

			update = {
				title: params.title,
				content: params.content,
				code: params.code,
				lang: params.lang
			};	

			Topic.findOneAndUpdate({_id: topicId, user: req.user.sub}, update, {new: true}, (err, topicUpdated) => {


				if(err){
					return res.status(500).send({
						status: 'error',
						message: 'Error en la peticion'	
					});
				}

				if(!topicUpdated){
					return res.status(404).send({
						status: 'error',
						message: 'No se ah actualizado el tema'	
					});
				}

				return res.status(200).send({
					status: 'success',
					topicUpdated	
				});

			})	


		}else{

			return res.status(200).send({
				message: 'la validacion de los datos no es correcta'	
			});

		}

	},

	delete: (req, res) => {

		let topicId = req.params.id;

		Topic.findOneAndDelete({_id: topicId, user: req.user.sub}, (err, topicRemoved) => {

			if(err){
				return res.status(500).send({
					status: 'error',
					message: 'Error en la peticion'	
				});
			}

			if(!topicRemoved){
				return res.status(404).send({
					status: 'error',
					message: 'No se ah borrado el tema'	
				});
			}

			return res.status(200).send({
				status: 'success',
				topicRemoved
			})

		});

	},

	search: (req, res) => {

		let searchString = req.params.search;

		Topic.find({ "$or": [
				{ "title": { "$regex": searchString, "$options": "i" } },
				{ "content": { "$regex": searchString, "$options": "i" } },
				{ "code": { "$regex": searchString, "$options": "i" } },
				{ "lang": { "$regex": searchString, "$options": "i" } },
		]})
		.populate('user')
		.sort([['date', 'descending']])
		.exec((err, topic) => {

			if(err){
				return res.status(500).send({
					status: 'error',
					message: 'Error en la peticion'
				});
			}

			if(!topic){
				return res.status(404).send({
					status: 'error',
					message: 'No hay temas disponibles'
				});
			}

			return res.status(200).send({
				status: 'success',
				topic
			});

		});

	}

};

module.exports = TopicController;