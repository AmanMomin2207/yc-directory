// import NextAuth from "next-auth";
// import GitHub from "next-auth/providers/github";
// import { AUTHOR_BY_GITHU_ID_QUERY } from "./sanity/lib/queries";
// import { client } from "./sanity/lib/client";
// import { writeClient } from "./sanity/lib/write-client";

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   providers: [GitHub],
//   callbacks: {
//     async signIn({
//       user: { name, email, image },
//       profile: { id, login, bio },
//     }) {
//       const existingUser = await client
//         .withConfig({useCdn: false})
//         .fetch(AUTHOR_BY_GITHU_ID_QUERY, {
//         id ,
//       });

//       if (!existingUser) {
//         await writeClient.create({
//           _type: "author",
//           id,
//           name,
//           username: login,
//           email,
//           image,
//           bio: bio || "",
//         });
//       }
//         return true;
//     },
//     async jwt({ token, account, profile }) {
//       if (account && profile) {
//         const user = await client 
//           .withConfig({useCdn: false})
//           .fetch(AUTHOR_BY_GITHU_ID_QUERY, {
//             id: profile?.id,
//           });

//         token.id = user?._id;
//       }

//       return token;
//     },
//     async session({session , token}){
//       Object.assign(session , { id : token.id});
//       return session;
//     }
//   },
// });

import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { AUTHOR_BY_GITHU_ID_QUERY } from "./sanity/lib/queries";
import { client } from "./sanity/lib/client";
import { writeClient } from "./sanity/lib/write-client";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // 👇 Explicit provider setup (instead of passing GitHub directly)
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],

  // 👇 Add this section — the key fix
  trustedHosts: [
    "localhost:3000",                   // for local dev
    "https://yc-directory4.onrender.com",   // your Render domain
  ],

  secret: process.env.AUTH_SECRET,

  callbacks: {
    async signIn({ user: { name, email, image }, profile: { id, login, bio } }) {
      const existingUser = await client
        .withConfig({ useCdn: false })
        .fetch(AUTHOR_BY_GITHU_ID_QUERY, { id });

      if (!existingUser) {
        await writeClient.create({
          _type: "author",
          id,
          name,
          username: login,
          email,
          image,
          bio: bio || "",
        });
      }
      return true;
    },

    async jwt({ token, account, profile }) {
      if (account && profile) {
        const user = await client
          .withConfig({ useCdn: false })
          .fetch(AUTHOR_BY_GITHU_ID_QUERY, {
            id: profile?.id,
          });

        token.id = user?._id;
      }

      return token;
    },

    async session({ session, token }) {
      Object.assign(session, { id: token.id });
      return session;
    },
  },
});
