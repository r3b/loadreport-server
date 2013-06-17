process.env.NODE_ENV = process.env.NODE_ENV||'local';
if(process.env.NODE_ENV === 'local'){
	process.env.AMQP_URL = "amqp://localhost";
	process.env.COUCH_URL = 'http://localhost';
	process.env.COUCH_PORT = 5984;
}else if(process.env.NODE_ENV === 'local-multiple'){
	process.env.AMQP_URL = "amqp://10.11.14.2";
	process.env.COUCH_URL = 'http://10.11.14.3';
	process.env.COUCH_PORT = 5984;
}