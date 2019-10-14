const data = require('mongoose');



const actorSchema = new data.Schema({
    
    name: String,
    birthday: Date,
    country: String

});

module.exports.actor = data.model('actor', actorSchema);





const userSchema = new data.Schema({
    
    username: String,
    password: String

});

module.exports.user = data.model('user', userSchema);



const movieSchema = new data.Schema({

    title: String,
    year: Date,
    rating: Number,
    actors:[{ type: data.Schema.Types.ObjectId, ref: 'actor' }]

})

module.exports.movie = data.model('movie', movieSchema);
