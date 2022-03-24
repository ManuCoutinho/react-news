import { render, screen } from "@testing-library/react";
import Posts, { getStaticProps } from "../../pages/posts";
import { getPrismicClient } from "../../services/prismic";

const posts = [
  {
    slug: "my-post",
    title: "Title here",
    excerpt: "Post content",
    updatedAt: "23 de março de 2022",
  },
];

jest.mock("../../services/prismic");

describe("Posts page", () => {
  it("renders correctly", () => {
    render(<Posts posts={posts} />);

    expect(screen.getByText("Title here")).toBeInTheDocument();
  });

  it("loads initial data", async () => {
    const getPrismicClientMocked = jest.mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: "my-post",
            data: {
              title: [{ type: "heading", text: "Title here" }],
              content: [{ type: "paragraph", text: "Post content" }],
            },
            last_publication_date: "03-23-2022",
          },
        ],
      }),
    } as any);

    const response = await getStaticProps({
      previewData: undefined,
    });
    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [
            {
              slug: "my-post",
              title: "Title here",
              excerpt: "Post content",
              updatedAt: "23 de março de 2022",
            },
          ],
        },
      })
    );
  });
});
