import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import {resolvers} from './graphql/resolvers/index.js';
import {typeDefs} from './graphql/typeDefs.js'
import mongoose from "mongoose";
import {config} from "dotenv";
import {isAuth} from './middleware/is-auth.js'
config();

const server = new ApolloServer({
    typeDefs,
    resolvers
});
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.6m957ol.mongodb.net/green-board?retryWrites=true&w=majority`
    ).then( async () => {
        const { url } = await startStandaloneServer(server, {
            context: (ctx) => isAuth(ctx)
        });
        console.log(`Server ready at ${url}`);
    }).catch(error => {
        console.log(error);
});