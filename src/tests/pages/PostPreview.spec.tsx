import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]'
import { getPrismicClient } from '../../services/prismic'

const post = {
	slug: 'my-post',
	title: 'Title here',
	content: '<p>Post content</p>',
	updatedAt: '23 de março de 2022',
}

jest.mock('next-auth/react')
jest.mock('../../services/prismic')
jest.mock('next/router')

describe('Post preview page', () => {
	it('renders correctly', () => {
		const useSessionMocked = jest.mocked(useSession)
		useSessionMocked.mockReturnValueOnce({
			data: null,
			status: 'unauthenticated',
		})

		render(<Post post={post} />)

		expect(screen.getByText('Title here')).toBeInTheDocument()
		expect(screen.getByText('Post content')).toBeInTheDocument()
		expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument()
	})

	it('redirects user to full post when is subscribed', async () => {
		const useSessionMocked = jest.mocked(useSession)
		const useRouterMocked = jest.mocked(useRouter)
		const pushMock = jest.fn()

		useSessionMocked.mockReturnValueOnce([
			{
				data: {
					activeSubscription: 'fake-active-subscription',
				},
			},
			false,
		] as any)

		useRouterMocked.mockReturnValueOnce({
			push: pushMock,
		} as any)

		render(<Post post={post} />)

		expect(pushMock).toHaveBeenCalledWith('/posts/my-post')
	})

	it('loads correctly', async () => {
		const getPrismicClientMocked = jest.mocked(getPrismicClient)
		getPrismicClientMocked.mockReturnValueOnce({
			getByUID: jest.fn().mockResolvedValueOnce({
				data: {
					title: [{ type: 'heading', text: 'Title here' }],
					content: [{ type: 'paragraph', text: 'Post content' }],
				},
				last_publication_date: '03-23-2022',
			}),
		} as any)

		const response = await getStaticProps({
			params: { slug: 'my-post' },
		} as any)

		expect(response).toEqual(
			expect.objectContaining({
				props: {
					post: {
						slug: 'my-post',
						title: 'Title here',
						content: '<p>Post content</p>',
						updatedAt: '23 de março de 2022',
					},
				},
			})
		)
	})
})
