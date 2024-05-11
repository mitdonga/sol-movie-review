import { FC } from 'react';
import { Movie } from '../models/Movie';
import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, Textarea } from '@chakra-ui/react';
import { Transaction, PublicKey, TransactionInstruction, SystemProgram } from "@solana/web3.js"
import { useConnection, useWallet } from '@solana/wallet-adapter-react'

const MOVIE_REVIEW_PROGRAM_ID = 'CenYq6bDRB7p73EjsPEpiYN7uveyPUTdXkDkgUduboaN'

export const Form: FC = () => {
    const [title, setTitle] = useState('')
    const [rating, setRating] = useState(0)
    const [message, setMessage] = useState('')
		const { connection } = useConnection()
		const { publicKey, sendTransaction } = useWallet()

    const handleSubmit = (event: any) => {
        event.preventDefault()
        const movie = new Movie(title, rating, message)
        handleTransactionSubmit(movie)
    }

    const handleTransactionSubmit = async (movie: Movie) => {
			if (!publicKey) return
        // console.log(JSON.stringify(movie))
				const moviePID = new PublicKey(MOVIE_REVIEW_PROGRAM_ID)
				const [pda, dump] = PublicKey.findProgramAddressSync([publicKey.toBuffer(), Buffer.from(movie.title)], moviePID)
				const transaction = new Transaction()
				const instruction = new TransactionInstruction({
					programId: new PublicKey(MOVIE_REVIEW_PROGRAM_ID),
					keys: [
						{
							pubkey: publicKey,
							isSigner: true,
							isWritable: true
						},
						{
							pubkey: pda,
							isSigner: false,
							isWritable: true
						},
						{
							pubkey: SystemProgram.programId,
							isSigner: false,
							isWritable: false
						},
					],
					data: movie.serialize()
				})
				transaction.add(instruction)
				try {
					const sign = await sendTransaction(transaction, connection)
					console.log(sign)
				} catch (error) {
					alert(error)
				}
    }

    return (
        <Box
					p={4}
					display={{ md: "flex" }}
					maxWidth="32rem"
					borderWidth={1}
					margin={2}
					justifyContent="center"
        >
            <form onSubmit={handleSubmit}>
							<FormControl isRequired>
								<FormLabel color='gray.200'>
									Movie Title
								</FormLabel>
								<Input 
									id='title' 
									color='gray.400'
									onChange={event => setTitle(event.currentTarget.value)}
								/>
							</FormControl>
							<FormControl isRequired>
								<FormLabel color='gray.200'>
									Add your review
								</FormLabel>
								<Textarea 
									id='review' 
									color='gray.400'
									onChange={event => setMessage(event.currentTarget.value)}
								/>
							</FormControl>
							<FormControl isRequired>
								<FormLabel color='gray.200'>
										Rating
										</FormLabel>
								<NumberInput 
										max={5} 
										min={1} 
										onChange={(valueString) => setRating(parseInt(valueString))}
								>
									<NumberInputField id='amount' color='gray.400' />
									<NumberInputStepper color='gray.400'>
										<NumberIncrementStepper />
										<NumberDecrementStepper />
									</NumberInputStepper>
								</NumberInput>
							</FormControl>
							<Button width="full" mt={4} type="submit">
								Submit Review
							</Button>
            </form>
        </Box>
    );
}