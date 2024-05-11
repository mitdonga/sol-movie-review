import { Card } from './Card'
import { FC, useEffect, useState } from 'react'
import { Movie } from '../models/Movie'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
interface MovieProgramData {
	publicKey: string,
	data: Movie
}

const MOVIE_REVIEW_PROGRAM_ID = 'CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN'

export const MovieList: FC = () => {
    const [movies, setMovies] = useState<Movie[]>([])
		const { connection } = useConnection()

		async function getProgramAccounts() {
			const rawData = await connection.getProgramAccounts(new PublicKey(MOVIE_REVIEW_PROGRAM_ID))
			
			const movies: Movie[] = []
			rawData.forEach((e) => {
				var decodedData = Movie.deserialize(e.account.data)
				if (decodedData !== null) {
					movies.push(decodedData)
				}
			})
			setMovies(movies)
		}

    useEffect(() => {
				getProgramAccounts()
        // setMovies(Movie.mocks)
    }, [])
    
    return (
        <div>
            {
                movies.map((movie, i) => {
                    return (
                        <Card key={i} movie={movie} />
                    )
                })
            }
        </div>
    )
}