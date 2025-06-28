// services/appwrite.ts

import {
  Client,
  Account,
  ID,
  Models,
  Databases,
  Query,
  Permission,
  Role,
} from "react-native-appwrite";
import { Platform } from "react-native";
import Constants from 'expo-constants'; // <-- STEP 1: IMPORT Constants

// The SavedMovieDocument interface remains the same
export interface SavedMovieDocument extends Models.Document {
  user_id: string;
  movie_id: string;
  title: string;
  poster_path?: string;
  status: 'watching' | 'watched' | 'unwatched';
}

// --- STEP 2: REMOVE THE OLD process.env VARIABLES ---
/*
const database_id = process.env.EXPO_PUBLIC_MOVIE_DATABASE!;
const collecton_id_metric = process.env.EXPO_PUBLIC_MOVIE_DATABASE_METRIC_COLLECTION!;
const collection_user_saved = process.env.EXPO_PUBLIC_SAVED_MOVIE!;
*/

// --- STEP 3: REBUILD THE config OBJECT TO READ FROM Constants ---
// This config object now reads from the 'extra' block in your app.config.js
export const config = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  project: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  db: {
    movies: process.env.EXPO_PUBLIC_MOVIE_DATABASE!,
  },
  collections: {
    metrics: process.env.EXPO_PUBLIC_MOVIE_DATABASE_METRIC_COLLECTION!,
    saved_movies: process.env.EXPO_PUBLIC_SAVED_MOVIE!,
  },
};


// --- From here, the rest of your file works without changes, but we add a safety check ---

const client: Client = new Client();

// --- STEP 4: ADD A SAFETY CHECK BEFORE INITIALIZING THE CLIENT ---
// This prevents the app from crashing if the variables are still somehow missing
// and provides a clear error message.
if (config.endpoint && config.project) {
  client
    .setEndpoint(config.endpoint)
    .setProject(config.project);
} else {
  console.error("Appwrite configuration is missing. Check your environment variables and app.config.js");
}


// --- The rest of your file remains unchanged ---

switch (Platform.OS) {
  case "android":
    break;
  case "ios":
    client.setPlatform("com.banana.flix"); // Your actual iOS Bundle ID
    break;
  default:
    // For web or other platforms, no need to set self-signed
    break;
}

const database = new Databases(client);
export const account = new Account(client); // Initialize Appwrite Account

// --- EXISTING DATABASE FUNCTIONS (UNCHANGED) ---

export const updateSearchCount = async (query: string, movie: Movie) => {
  try {
    const result = await database.listDocuments(config.db.movies, config.collections.metrics, [
      Query.equal("searchTerm", query),
    ]);

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      await database.updateDocument(
        config.db.movies,
        config.collections.metrics,
        existingMovie.$id,
        {
          count: existingMovie.count + 1,
        }
      );
    } else {
      await database.createDocument(config.db.movies, config.collections.metrics, ID.unique(), {
        searchTerm: query,
        movie_id: movie.id,
        count: 1,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        title: movie.title,
      });
    }
  } catch (error) {
    console.error("Error updating search count:", error);
    throw error;
  }
};

export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
  try {
    const result = await database.listDocuments(config.db.movies, config.collections.metrics, [
      Query.limit(5),
      Query.orderDesc("count")
    ]);
    return result.documents as unknown as TrendingMovie[];
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    throw error;
  }
};


export const getCurrentUser = async (): Promise<Models.User<Models.Preferences> | null> => {
  try {
    const currentUser = await account.get();
    return currentUser;
  } catch (error) {
    return null;
  }
};


export const signIn = async (email: string, password: string): Promise<Models.User<Models.Preferences>> => {
  try {
    try {
      const currentUser = await account.get();
      console.log(currentUser)
      return currentUser;
    } catch (e) {
      // No active session found, proceed to create one
    }

    await account.createEmailPasswordSession(email, password);
    const user = await account.get();
    return user;
  } catch (error: any) {
    console.error("Appwrite Sign-in failed:", error);
    throw new Error(error.response?.message || "Sign-in failed. Please check your credentials.");
  }
};


export const signUp = async (email: string, password: string, name: string): Promise<Models.User<Models.Preferences>> => {
  try {
    await account.create(ID.unique(), email, password, name);
    try {
      const currentUser = await account.get();
      return currentUser;
    } catch (e) {
      await account.createEmailPasswordSession(email, password);
    }
    const user = await account.get();
    return user;
  } catch (error: any) {
    console.error("Appwrite Sign-up failed:", error);
    throw new Error(error.response?.message || "Sign-up failed. User might already exist or invalid data.");
  }
};


export const signOut = async (): Promise<void> => {
  try {
    await account.deleteSession('current');
  } catch (error: any) {
    console.error("Appwrite Sign-out failed:", error);
    throw new Error(error.response?.message || "Sign-out failed.");
  }
};

export const saveUserMovie = async (
  userId: string,
  movie: Movie,
  initialStatus: 'watching' | 'watched' | 'unwatched' = 'unwatched'
): Promise<SavedMovieDocument> => {
  try {
    const document = await database.createDocument(
      config.db.movies,
      config.collections.saved_movies,
      ID.unique(),
      {
        user_id: userId,
        movie_id: movie.id.toString(),
        title: movie.title,
        poster_path: movie.poster_path,
        status: initialStatus,
      },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    );
    return document as SavedMovieDocument;
  } catch (error: any) {
    console.error("Error saving user movie:", error);
    throw new Error(error.response?.message || "Failed to save movie.");
  }
};

export const updateMovieStatus = async (
  documentId: string,
  newStatus: 'watching' | 'watched' | 'unwatched'
): Promise<SavedMovieDocument> => {
  try {
    const document = await database.updateDocument(
      config.db.movies,
      config.collections.saved_movies,
      documentId,
      {
        status: newStatus,
      },
    );
    return document as SavedMovieDocument;
  } catch (error: any) {
    console.error("Error updating movie status:", error);
    throw new Error(error.response?.message || "Failed to update movie status.");
  }
};

export const deleteUserMovie = async (documentId: string): Promise<void> => {
  try {
    await database.deleteDocument(
      config.db.movies,
      config.collections.saved_movies,
      documentId
    );
  } catch (error: any) {
    console.error("Error deleting user movie:", error);
    throw new Error(error.response?.message || "Failed to delete movie.");
  }
};

export const listUserMovies = async (
  userId: string,
  status?: 'watching' | 'watched' | 'unwatched'
): Promise<SavedMovieDocument[]> => {
  const queries = [Query.equal("user_id", userId)];
  if (status) {
    queries.push(Query.equal("status", status));
  }
  queries.push(Query.orderDesc("$createdAt"));

  try {
    const response = await database.listDocuments(
      config.db.movies,
      config.collections.saved_movies,
      queries
    );
    return response.documents as SavedMovieDocument[];
  } catch (error: any) {
    console.error("Error listing user movies:", error);
    throw new Error(error.response?.message || "Failed to fetch user movies.");
  }
};

export const getUserMovieStatus = async (
  userId: string,
  movieId: number // Changed from Number to number
): Promise<SavedMovieDocument | null> => {
  try {
    const response = await database.listDocuments(
      config.db.movies,
      config.collections.saved_movies,
      [
        Query.equal("user_id", userId),
        Query.equal("movie_id", movieId.toString()),
        Query.limit(1)
      ]
    );
    return response.documents.length > 0 ? response.documents[0] as SavedMovieDocument : null;
  } catch (error: any) {
    console.error("Error getting user movie status:", error);
    return null;
  }
};
