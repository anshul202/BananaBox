import {
  Client,
  Account,
  ID,
  Models,
  Databases,
  Query,
  Permission, // Added for document-level permissions
  Role,       // Added for document-level permissions
} from "react-native-appwrite";
import { Platform } from "react-native";

export interface SavedMovieDocument extends Models.Document {
  user_id: string;
  movie_id: string; // <--- CHANGED FROM number TO string
  title: string;
  poster_path?: string;
  status: 'watching' | 'watched' | 'unwatched';
}


const database_id = process.env.EXPO_PUBLIC_MOVIE_DATABASE!;
const collecton_id_metric = process.env.EXPO_PUBLIC_MOVIE_DATABASE_METRIC_COLLECTION!;
const collection_user_saved=process.env.EXPO_PUBLIC_SAVED_MOVIE!;

const config = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  project: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  db: { // Changed to object for better structure, assuming this maps to the database ID
    movies: database_id, // Use the actual database ID from env
  },
  collections: {
    metrics: collecton_id_metric, // Use the actual collection ID from env
    saved_movies: collection_user_saved, // Make sure this matches your Appwrite collection ID
  }
}
const client: Client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.project);

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
    const result = await database.listDocuments(config.db.movies, config.collections.metrics, [ // Use config for clarity
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
    const result = await database.listDocuments(config.db.movies, config.collections.metrics, [ // Use config for clarity
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
    // console.log("No active user session or error fetching user:", error); // For debugging
    return null; // Return null if no user is logged in or an error occurs
  }
};


export const signIn = async (email: string, password: string): Promise<Models.User<Models.Preferences>> => {
  try {
    // Attempt to get the current session first.
    // If successful, the user is already logged in, so return that user.
    try {
      const currentUser = await account.get();
      console.log(currentUser)
      return currentUser; // User already logged in, no need to create new session
    } catch (e) {
      // No active session found, proceed to create one
      // console.log("No active session, proceeding to create new one."); // For debugging
    }

    // Create a new email/password session
    await account.createEmailPasswordSession(email, password);

    // Get the user object for the newly created session
    const user = await account.get();
    return user;
  } catch (error: any) {
    console.error("Appwrite Sign-in failed:", error);
    // Provide a more user-friendly error message from Appwrite response if available
    throw new Error(error.response?.message || "Sign-in failed. Please check your credentials.");
  }
};


export const signUp = async (email: string, password: string, name: string): Promise<Models.User<Models.Preferences>> => {
  try {
    // 1. Create the user account
    await account.create(ID.unique(), email, password, name);

    // 2. Automatically create a session for the newly registered user (log them in)
    // Check for existing session before creating new one, similar to signIn
    try {
      const currentUser = await account.get();
      // If a user is somehow already logged in (unlikely after fresh create, but good practice)
      // then we don't need to create a session, just return current user
      return currentUser;
    } catch (e) {
      // No active session, proceed to create one
      await account.createEmailPasswordSession(email, password);
    }

    // 3. Get the user object for the newly active session
    const user = await account.get();
    return user;
  } catch (error: any) {
    console.error("Appwrite Sign-up failed:", error);
    // Provide a more user-friendly error message from Appwrite response if available
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
  movie: Movie, // Assuming your Movie interface from TMDB has id, title, poster_path
  initialStatus: 'watching' | 'watched' | 'unwatched' = 'unwatched'
): Promise<SavedMovieDocument> => {
  try {
    const document = await database.createDocument(
      config.db.movies,
      config.collections.saved_movies,
      ID.unique(), // Let Appwrite generate a unique document ID
      {
        user_id: userId,
        movie_id: movie.id.toString(),
        title: movie.title,
        poster_path: movie.poster_path, // Use movie.poster_path directly
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

/**
 * Updates the status of a user's saved movie.
 * @param documentId The Appwrite document ID of the saved movie entry.
 * @param newStatus The new status ('watching', 'watched', 'unwatched').
 * @returns The updated document.
 */
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
      // Permissions are already set on document creation, but specifying them here ensures
      // that the user has update permissions if they are not the creator.
      // For security, Appwrite will only allow this if the user has appropriate permissions.
    );
    return document as SavedMovieDocument;
  } catch (error: any) {
    console.error("Error updating movie status:", error);
    throw new Error(error.response?.message || "Failed to update movie status.");
  }
};

/**
 * Removes a movie from a user's saved list.
 * @param documentId The Appwrite document ID of the saved movie entry.
 */
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

/**
 * Fetches all saved movies for a specific user, optionally filtered by status.
 * @param userId The ID of the user.
 * @param status Optional status to filter by.
 * @returns An array of SavedMovieDocument objects.
 */
export const listUserMovies = async (
  userId: string,
  status?: 'watching' | 'watched' | 'unwatched'
): Promise<SavedMovieDocument[]> => {
  const queries = [Query.equal("user_id", userId)];
  if (status) {
    queries.push(Query.equal("status", status));
  }
  queries.push(Query.orderDesc("$createdAt")); // Order by creation date, newest first

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

/**
 * Checks if a specific movie is saved by a user and returns the document if it exists.
 * Useful for checking if a "Save" button should say "Save" or "Unsave".
 * @param userId The ID of the user.
 * @param movieId The TMDB ID of the movie.
 * @returns The SavedMovieDocument if found, otherwise null.
 */


export const getUserMovieStatus = async (
  userId: string,
  movieId: Number
): Promise<SavedMovieDocument | null> => {
  try {
    const response = await database.listDocuments(
      config.db.movies,
      config.collections.saved_movies,
      [
        Query.equal("user_id", userId),
        Query.equal("movie_id", movieId.toString()),
        Query.limit(1) // Only need one to confirm existence
      ]
    );
    return response.documents.length > 0 ? response.documents[0] as SavedMovieDocument : null;
  } catch (error: any) {
    console.error("Error getting user movie status:", error);
    // Return null on error, as it implies the movie isn't saved or couldn't be checked
    return null;
  }
};





