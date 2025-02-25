const { MongoClient,ObjectId  } = require("mongodb");
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const formidable = require('formidable');
const fs = require('fs');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use('/files', express.static('files'));

// Static file serving for images and JS files
app.get('/images/Graphicloads-100-Flat-2-Chat-2.ico', (req, res) => {
    res.sendFile(__dirname + '/images/Graphicloads-100-Flat-2-Chat-2.ico');
});

app.get('/js/jquery-3.4.1.min.js', (req, res) => {
    res.sendFile(__dirname + '/js/jquery-3.4.1.min.js');
});

app.get('/js/e-commerce.js', (req, res) => {
    res.sendFile(__dirname + '/js/e-commerce.js');
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/home', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/product', (req, res) => {
    res.sendFile(__dirname + '/product.html');
});

app.get('/cart', (req, res) => {
    res.sendFile(__dirname + '/cart.html');
});

app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/chat.html');
});

app.get('/style', (req, res) => {
    res.sendFile(__dirname + '/style.css');
});
app.get('/payment', (req, res) => {
    res.sendFile(__dirname + '/payment.html');
});
///Group Chat
var usernames = {};
app.use(express.static(__dirname + "/public"));

app.get("/Groupchat", (req, res)=>{
 res.sendFile(__dirname + "/public/indexchat.html");
});

io.on('connection', function(socket){
    console.log('User Connected...')
    socket.on('message', (msg) => {
       // socket.broadcast.emit('message', msg)    // Normal broadcast
       
        socket.to(socket.room).emit('message', msg);
    });  

    socket.on('adduser', function(username, roomname){
        socket.join(roomname);
        socket.room = roomname;
		socket.username = username;
		usernames[username+"_"+roomname] = username;
        io.sockets.in(socket.room).emit('updateusers', usernames);

        socket.emit('greeting', username );

	});

    // socket.on('uploadFile', function (data) {
    //     socket.to(socket.room).emit('publishFile', data);
    // });
	 
	 socket.on('uploadImage', function (data, username) {
        socket.to(socket.room).emit('publishImage', data, username);
    });


    socket.on('disconnect', function(){
        console.log("User Disconnected");
        delete usernames[socket.username + '_' + socket.room];
        socket.leave(socket.room);
        socket.to(socket.room).emit('updateusers', usernames);
    })
})


// Start the server
http.listen(3000, () => {
    console.log('listening on *:3000');
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});

// MongoDB connection string
const uri = "mongodb+srv://ah9312248:G5C3JAoYN0K0AsTh@cluster0.nrfjp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
async function getProducts() {
    const client = new MongoClient(uri);
    try {
        const database = client.db('SportsMart');
        const products = database.collection('Items');
        return await products.find().toArray();
    } finally {
        await client.close();
    }
}

async function getSalesOrder() {
    const client = new MongoClient(uri);
    try {
        const database = client.db('SportsMart');
        const products = database.collection('OrderRequest');
        return await products.find().toArray();
    } finally {
        await client.close();
    }
}
// Fetch a single product by code
async function getProduct(_code) {
    const client = new MongoClient(uri);
    try {
        const database = client.db('SportsMart');
        const products = database.collection('Items');
        const query = { code: _code };
        return await products.findOne(query);
    } finally {
        await client.close();
    }
}

// Add new sales order
async function addSalesOrder(data) {
    const client = new MongoClient(uri);
    try {
        const database = client.db('SportsMart');
        const SalesOrders = database.collection('OrderRequest');

        let docs = [];
        for (let i = 0; i < data.products.length; i++) {
            docs.push({
                customer: data.name,
                email: data.email,
                phone: data.phone,
                address: data.address,
                code: data.products[i].code,
                price: data.products[i].price,
                qty: data.products[i].qty,
                total: data.products[i].total,
                date: new Date().toLocaleDateString('en-US')
            });
        }
        
        const options = { ordered: true };
        const result = await SalesOrders.insertMany(docs, options);
        return await client.close();
    } finally {
        await client.close();
    }
}
async function addProductOrder(data) {
    const client = new MongoClient(uri);
    try {
        const database = client.db('SportsMart');
        const products = database.collection('Items'); // Correct collection name
       
        // Create a document to insert
        let doc = {
            code: data.code,
            name: data.name,
            price: data.price,
            picture:data.picture
        };
       
        // Insert the product into the collection
        const result = await products.insertOne(doc);
        console.log("Inserted Items:", result.insertedId);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}


// delete Product
app.delete('/api/products/:id', async (req, res) => {
    const productId = req.params.id; // Get the ID from the URL parameters
    const client = new MongoClient(uri);
    try {
        const database = client.db('SportsMart');
        const products = database.collection('Items');
        const result = await products.deleteOne({ _id: new ObjectId(productId) });
        
        if (result.deletedCount === 1) {
            res.status(200).send({ message: 'Items deleted successfully' });
            // alert(message);
        } else {
            res.status(404).send({ message: 'Items not found' });
        }
    } catch (error) {
        console.error('Error deleting Items:', error);
        res.status(500).send({ message: 'Internal server error' });
    } finally {
        await client.close();
    }
});
// delete OrderRequest

app.delete('/api/OrderRequest/:id', async (req, res) => {
    const productId = req.params.id; // Get the ID from the URL parameters
    const client = new MongoClient(uri);
    try {
        const database = client.db('SportsMart');
        const products = database.collection('OrderRequest');
        const result = await products.deleteOne({ _id: new ObjectId(productId) });
        
        if (result.deletedCount === 1) {
            res.status(200).send({ message: 'Items deleted successfully' });
            // alert(message);
        } else {
            res.status(404).send({ message: 'Items not found' });
        }
    } catch (error) {
        console.error('Error deleting Items:', error);
        res.status(500).send({ message: 'Internal server error' });
    } finally {
        await client.close();
    }
});

app.post('/api/createproduct', function (req, res){
    try {
        addProductOrder(req.body).then(function(result) {
            console.log('/api/createproduct');
            res.sendStatus(200);
         });
    } finally {
        // No further action needed here
    }
});
// API to get all products
app.get('/api/products', (req, res) => {
    try {
        getProducts().then(function(result) {
            res.send(result);
        });
    } finally {
        // Client will close on function exit
    }
});

// API to get all products
app.get('/api/OrderRequest', (req, res) => {
    try {
        getSalesOrder().then(function(result) {
            res.send(result);
        });
    } finally {
        // Client will close on function exit
    }
});

// API to get a product by code
app.get('/api/Items', (req, res) => {
    try {
        getProduct(req.query.code).then(function(result) {
            res.send(result);
        });
    } finally {
        // Client will close on function exit
    }
});



// API to create sales order
app.post('/api/createsales', function (req, res){
    try {
        addSalesOrder(req.body).then(function(result) {
            res.sendStatus(200);
        });
    } finally {
        // Client will close on function exit
    }
});

// API for file upload
app.post('/uploadfile', function (req, res){
    var strFilePath = '';
    var form = new formidable.IncomingForm();

    form.parse(req);

    form.on('fileBegin', function (name, file){
        file.picture = __dirname + '/files/' + file.picture;
    });

    form.on('file', function (name, file){
        strFilePath = '/files/' + file.name;
        res.send(JSON.stringify({"filePath": strFilePath, "fileName": file.name}));
    });
});
