import { render, screen } from "@testing-library/react";
import { getSession } from "next-auth/react";
import Post, { getServerSideProps } from "../../pages/posts/[slug]";
import { getPrismicClient } from "../../services/prismic";

const post = {
  slug: "my-post",
  title: "Title here",
  content: "<p>Post content</p>",
  updatedAt: "23 de março de 2022",
};

jest.mock("next-auth/react");
jest.mock("../../services/prismic");

describe("Post page", () => {
  it("renders correctly", () => {
    render(<Post post={post} />);

    expect(screen.getByText("Title here")).toBeInTheDocument();
    expect(screen.getByText("Post content")).toBeInTheDocument();
  });

  it("redirects user if no subscription is found", async () => {
    const getSessionMocked = jest.mocked(getSession);
    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: null,
      expires: "fake-expire",
    });

    const response = await getServerSideProps({
      params: { slug: "my-post" },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: "/",
        }),
      })
    );
  });

  it("loads ", async () => {
    const getSessionMocked = jest.mocked(getSession);
    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: "fake-active-subscription",
      expires: "fake-expire",
    });
    const getPrismicClientMocked = jest.mocked(getPrismicClient);
    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: "heading", text: "Title here" }],
          content: [{ type: "paragraph", text: "Post content" }],
        },
        last_publication_date: "03-23-2022",
      }),
    } as any);
    const response = await getServerSideProps({
      params: { slug: "my-post" },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: "my-post",
            title: "Title here",
            content: "<p>Post content</p>",
            updatedAt: "23 de março de 2022",
          },
        },
      })
    );
  });
});
