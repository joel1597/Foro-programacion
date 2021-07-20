'use strict'

const Topic = require('../models/topic');
const validator = require('validator');

const CommentController = {

	add: (req, res) => {

		let topicId = req.params.topicId;

		Topic.findById(topicId).exec((err, topic) => {

			if(err){
				return res.status(500).send({
					status: 'error',
					message: 'Error en la peticion'
				});
			}

			if(!topic){
				return res.status(500).send({
					status: 'error',
					message: 'No existe el tema'
				});
			}

			if(req.body.content){

				let validate_content;

				try{

				validate_content = !validator.isEmpty(req.body.content);			
	
				}catch(err){

					return res.status(200).send({
						message: 'No has comentado nada'
					})
				}

				if(validate_content){

					let comment = {	
						user: req.user.sub,
						content: req.body.content,
					};

					topic.comments.push(comment);

					topic.save((err) => {

						if(err){
							return res.status(500).send({
								status: 'error',
								message: 'Error al guardar el comentario'
							});
						}

						Topic.findById(topic._id)
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

					})

				}else{
					return res.status(200).send({
						message: 'No se han validado los datos del comentario'
					});
				}

			}else{
				return res.status(500).send({
					message: 'No hay comentario por agregar'
				});
			}

		});

	},

	update: (req, res) => {

		let commentId = req.params.commentId;
		let params = req.body;
		let validate_content;

		try{

		validate_content = !validator.isEmpty(req.body.content);			

		}catch(err){

			return res.status(200).send({
				message: 'No has comentado nada'
			})
		}

		if(validate_content){

			Topic.findOneAndUpdate(
				{"comments._id": commentId },
				{
					"$set": {
						"comments.$.content": params.content
					}
				},
				{new: true},
				(err, topicUpdated) => {

					if(err){
						return res.status(500).send({
							status: 'error',
							message: 'Error en la peticion'
						});
					}

					if(!topicUpdated){
						return res.status(404).send({
							status: 'error',
							message: 'No existe el tema'
						});
					}

					return res.status(200).send({
						status: 'success',
						topic: topicUpdated
					});

				})

		}

	},

	delete: (req, res) => {

		let topicId = req.params.topicId;
		let commentId = req.params.commentId;

		Topic.findById(topicId, (err, topic) => {

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

			let comment = topic.comments.id(commentId);

			if( comment ){
				comment.remove();

				topic.save((err) => {

					if(err){
						return res.status(500).send({
							status: 'error',
							message: 'Error en la peticion'
						});
					}

					Topic.findById(topic._id)
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

				});

			}else{

				return res.status(404).send({
					message: 'No existe el comentario'
				})
			}

		});	

	}

};

module.exports = CommentController;