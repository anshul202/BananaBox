export const TMDB_CONFIG={
    BASE_URL:'https://api.themoviedb.org/3',
    API_KEY:process.env.EXPO_PUBLIC_API_READ_ACCESS_KEY,
    headers:{
        accept:"application/json",
        Authorization:`Bearer ${process.env.EXPO_PUBLIC_API_READ_ACCESS_KEY}`
    }
}

export const fetchMovies=async({query}:{query:string})=>{
    const endpoint=query?`${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}`:`${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc&language=en_US&page=1`;
    const response=await fetch(endpoint,{
        method:'GET',
        headers:TMDB_CONFIG.headers
    })
    if(!response.ok){
        throw new Error(`Error fetching movies: ${response.statusText}`);
    }
    const data=await response.json();
    return data.results;
}

export const fetchMovieDetails=async(movieId:string):Promise<MovieDetails>=>{
    try {
        const response=await fetch(`${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`, {
            method:'GET',
            headers:TMDB_CONFIG.headers
        })
        if(!response.ok){
            throw new Error(`Error fetching movie details: ${response.statusText}`);
        }
        const data=await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching movie details:", error);
        throw error; // Re-throw the error to handle it in the calling function
    }
}

