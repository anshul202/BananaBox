//track searches made by a user
import {
  Client,
  Account,
  ID,
  Models,
  Databases,
  Query,
} from "react-native-appwrite";
import { Platform } from "react-native"; 

const database_id = process.env.EXPO_PUBLIC_MOVIE_DATABASE!;
const collecton_id_metric = process.env.EXPO_PUBLIC_MOVIE_DATABASE_METRIC_COLLECTION!;
const config={
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    project: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    db:"movies",
    col:{
        metrics:"metric",
        user:"user"
    }
}
const client: Client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.project);

switch(Platform.OS){
    case "android":
        // client.setPlatform();
        break;
    case "ios":
        client.setPlatform("com.banana.flix");
        break;
    default:
        // For web or other platforms, no need to set self-signed
        break;
}

const database = new Databases(client);

export const updateSearchCount = async (query: string, movie: Movie) => {
  //get appwrite api check if doument exists already if yes then icnrease count by1 and if not then create new document;
  // const results=await

  try {
    const result = await database.listDocuments(database_id, collecton_id_metric, [
      Query.equal("searchTerm", query),
    ]);

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      await database.updateDocument(
        database_id,
        collecton_id_metric,
        existingMovie.$id,
        {
          count: existingMovie.count + 1,
        }
      );
    } else {
      await database.createDocument(database_id, collecton_id_metric, ID.unique(), {
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

export const getTrendingMovies=async():Promise<TrendingMovie[] | undefined>=>{
    try {
        const result = await database.listDocuments(database_id, collecton_id_metric, [
      Query.limit(5),
      Query.orderDesc("count")
    ]);
    return result.documents as unknown as TrendingMovie[];
    } catch (error) {
      console.error("Error fetching trending movies:", error);
      throw error; // Re-throw the error to handle it in the calling function
        
    }
}

export {database,client,config}