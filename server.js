const express = require('express');
var cors = require('cors')
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const path = require('path');
const NominateProducts = require('./models/NominateProduct');
const auth = require('./middleware/auth');
const req = require('express/lib/request');

const app = express();
const server = require('http').createServer(app);

//connecting the db first
connectDB();

app.use(cors());
app.use(bodyParser.json());

const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

//defining routes
app.use('/api/users', require('./routes/api/user'));
app.use('/api/admin', require('./routes/api/admin'));

const defaultValue = '';

io.on('connection', (socket) => {

    socket.on('bid', async (documentId, sec) => {
        const document = await findOrCreateDocument(documentId);
        console.log(document);
        const data = ''
        socket.join(documentId);
        //socket.emit('load-bid', document.currBid, document.userBought, sec);

        socket.on('bid-submit', (currBid, id, name) => {
            socket.broadcast.to(documentId).emit('receive-changes', currBid, id, name, '30');
            // NominateProducts.findByIdAndUpdate(documentId, { currBid: currBid, userBought: id });
        });

        socket.on('win', async (price, id) => {
            await NominateProducts.findByIdAndUpdate(documentId, { currBid: price, userBought: id });
        })

    });
});

const findOrCreateDocument = async (id) => {
    if (id == null) return;

    const document = await NominateProducts.findById(id);
    if (document) return document;

};

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log("Server started on port " + PORT));
