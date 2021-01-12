export const getMeQuery = `query {me {errors {field message} user {id}}}`;
export const signupMutation = `mutation {
   signup(
     signupOptions: {
       name: "andre"
       password: "Password1234"
       email: "email@example1.com"
     }
   ) {
     errors {
       field
       message
     }
     user {
       id
     }
   }
 }
 `;

export const logoutMutation = `mutation {logout}`;
