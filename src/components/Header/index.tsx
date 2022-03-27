import { ActiveLink } from '../ActiveLink'
import { SignInButton } from '../SignInButton'
import Image from 'next/image'

import styles from './styles.module.scss'

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Image
          src='/images/logo.svg'
          alt='logo da News Page'
          loading='lazy'
          width='100px'
          height='50px'
        />
        <nav aria-label='menu'>
          <ActiveLink href='/' activeClassName={styles.active}>
            <a role='menu'>Home</a>
          </ActiveLink>
          <ActiveLink href='/posts' prefetch activeClassName={styles.active}>
            <a role='menu'>Posts</a>
          </ActiveLink>
        </nav>
        <SignInButton />
      </div>
    </header>
  )
}
