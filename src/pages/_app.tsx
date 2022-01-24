import { AppProps } from "next/app";
import { Header } from "../components/Header";
import { SessionProvider as NextAuthProvider} from "next-auth/react";

import "../styles/_global.scss";

function MyApp({ 
    Component, 
    pageProps:{ session, ...pageProps } }: AppProps) {
  return (
    <NextAuthProvider session={pageProps.session}>
      <Header />
      <Component {...pageProps} />
    </NextAuthProvider>
  );
}

export default MyApp;
