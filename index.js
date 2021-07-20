'use strict'

const mongoose = require('mongoose');
const app = require('./app');
const port = 3700;

mongoose.connect('mongodb://127.0.0.1:27017/foro', { useNewUrlParser: true, 
													 useUnifiedTopology: true, 
													 useFindAndModify: false} )
		
const db = mongoose.connection;
		db.on('error', console.error.bind(console, 'connection error:'));
		db.once('open', function(){			
			console.log('Connected!');

			//crear el servidor
			app.listen(port, ()=> {
				console.log('servidor corriendo en el puerto', port);
			})

		});