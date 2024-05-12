import { Card } from './Card'
import { FC, useEffect, useRef, useState } from 'react'
import { Movie } from '../models/Movie'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { Center, Input } from '@chakra-ui/react'
import bs58 from 'bs58'

const MOVIE_REVIEW_PROGRAM_ID = 'CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN'
const MOVIE_REVIEW_ACCOUNT = new PublicKey(MOVIE_REVIEW_PROGRAM_ID)

export const MovieList: FC = () => {
    const [movies, setMovies] = useState<Movie[]>([])
		const { connection } = useConnection()
		const [page, setPage] = useState(1)
		const [query, setQuery] = useState("")
		const [prgAccountPubKeys, setPrgAccountPubKeys] = useState<PublicKey[]>([])

		async function getPrgAccountPubKeys() {
			let prgAccounts = await connection.getProgramAccounts(
				MOVIE_REVIEW_ACCOUNT,
				{ 
					dataSlice: {offset: 6, length: 5},
					filters: [
						{
							memcmp: {offset: 6, bytes: bs58.encode(Buffer.from(query))}
						}
					]
			  }
			)
			let prgAccountArr = prgAccounts.slice()
			prgAccountArr.sort((a, b) => {
				const dataA = a.account.data
				const dataB = b.account.data
				return dataA.compare(dataB)
			})
			const accountPubKeys = prgAccountArr.map(a => a.pubkey)
			setPage(1)
			setPrgAccountPubKeys([...accountPubKeys])
		}
		async function getProgramAccounts() {
			const perPage = 10
			const paginatedAccounts = prgAccountPubKeys.slice((page-1)*perPage, page*perPage)
			const paginatedAccountData = await connection.getMultipleAccountsInfo(paginatedAccounts)

			const movies: Movie[] = []
			paginatedAccountData.forEach((e) => {
				if (e === null) return
				var decodedData = Movie.deserialize(e.data)
				if (decodedData !== null) {
					movies.push(decodedData)
				}
			})
			setMovies(movies)
		}

    useEffect(() => {
			getPrgAccountPubKeys()
    }, [])

		useEffect(() => {
			getPrgAccountPubKeys()
		}, [query])

		useEffect(() => {
			getProgramAccounts()
		}, [page, prgAccountPubKeys])
    
    return (
			<>
				<div>
					<Center>
						<Input
							id='search'
							color='gray.400'
							onChange={event => setQuery(event.currentTarget.value)}
							placeholder='Search'
							w='97%'
							mt={2}
							mb={2}
						/>
					</Center>
				</div>
        <div>
            {
                movies.map((movie, i) => {
                    return (
                        <Card key={i} movie={movie} />
                    )
                })
            }
        </div>
				<div className='movie-page-btn-container'> 	
					<button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
					<button onClick={() => setPage(page + 1)}>Next</button>
				</div>
			</>
    )
}