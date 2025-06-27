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


// const url = 'https://api.themoviedb.org/3/tv/top_rated?language=en-US&page=1';
// const options = {
//   method: 'GET',
//   headers: {
//     accept: 'application/json',
//     Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkZDk0ZmJjZTEyZjViOTFiMDVmYmVlNzBlMjM0YzI3ZiIsIm5iZiI6MTc1MDk0NDMwNS40Niwic3ViIjoiNjg1ZDRhMzEzZWZhNTcyZWRlNzQ0NmY3Iiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.ZrrOhvMkXV9gBCy4H_eFQHyy4mrdsKp2laTy8SQWTLg'
//   }
// };

// fetch(url, options)
//   .then(res => res.json())
//   .then(json => console.log(json))
//   .catch(err => console.error(err));