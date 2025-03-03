import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  Requisicion: a
    .model({
      cargo: a.string(),
      jefeInmediato: a.string(),
      area: a.string(),
      funciones: a.string(),
      salario: a.string(),
      estado: a.string(),
      etapa: a.string(),
      detalle: a.string(),
      postulantes: a.hasMany('Postulante', 'requisicionId'),
    })
    .authorization((allow) => [allow.publicApiKey()]),
  Postulante: a
    .model({
      nombre: a.string(),
      email: a.string(),
      telefono: a.string(),
      cvUrl: a.string(),
      experiencia: a.string(),
      etapa: a.string(),
      puntajeP1: a.string(),
      puntajeP2: a.string(),
      puntajeP3: a.string(),
      puntajeP4: a.string(),
      requisicionId: a.string(),
      requisicion: a.belongsTo('Requisicion', 'requisicionId'),
    })
    .authorization((allow) => [allow.publicApiKey()])

});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
