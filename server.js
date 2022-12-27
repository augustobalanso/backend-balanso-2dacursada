import { http , io } from "./app.js"
import mongoose, { mongo } from "mongoose";
import MessageSchema from "./src/config/mongo.config.js";
import productsRandom from "./src/services/productos.random.js";
import { schema, normalize } from "normalizr";
import util from 'util'
import { v4 as uuid } from "uuid";

const PORT = process.env.PORT || 8000

const mongoModel = mongoose.model('chats', MessageSchema)

http.listen(PORT, () => console.info(`Server up and running on port ${PORT}`));

const authorSchema = new schema.Entity('author')
const textSchema = new schema.Entity('text')
const mongoidSchema = new schema.Entity('_id')
const messageSchema = new schema.Entity('messages',{
    author: authorSchema,
    text: textSchema
})

io.on('connection', async (socket) => {
    const fetchedChat = await mongoModel.find()

    console.info('Nuevo cliente conectado, id:', socket.id)
    socket.emit('UPDATE_CHAT', normalize(fetchedChat, messageSchema))
    console.log(util.inspect(normalize(fetchedChat, messageSchema), false, 7, true))


    socket.on('RECEIVE_PRODUCTS', async () => {
        const products5 = await productsRandom.get5random()
        io.sockets.emit('UPDATE_PRODUCTS', products5)
    })

    socket.on('NEW_MESSAGE_TO_SERVER', async (data) => {
        io.sockets.emit('NEW_MESSAGE_TO_SERVER', data)
        data._id = uuid()
        mongoModel.create(data)
    })
})

