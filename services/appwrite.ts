//track searches made by a user
import {
  Client,
  Account,
  ID,
  Models,
  Databases,
  Query,
} from "react-native-appwrite";

const database_id = process.env.EXPO_PUBLIC_MOVIE_DATABASE!;
const collecton_id = process.env.EXPO_PUBLIC_MOVIE_DATABASE_METRIC_COLLECTION!;

const client: Client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

export const updateSearchCount = async (query: string, movie: Movie) => {
  //get appwrite api check if doument exists already if yes then icnrease count by1 and if not then create new document;
  // const results=await

  try {
    const result = await database.listDocuments(database_id, collecton_id, [
      Query.equal("searchTerm", query),
    ]);

    console.log(result);
    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      await database.updateDocument(
        database_id,
        collecton_id,
        existingMovie.$id,
        {
          count: existingMovie.count + 1,
        }
      );
    } else {
      await database.createDocument(database_id, collecton_id, ID.unique(), {
        searchTerm: query,
        movie_id: movie.id,
        count: 1,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        title:movie.title,
      });
    }
  } catch (error) {
    console.error("Error updating search count:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};
