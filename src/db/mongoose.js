const mongoose = require('mongoose');

// const connectionURL
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser : true,
    useCreateIndex : true,
    useFindAndModify : false
});

