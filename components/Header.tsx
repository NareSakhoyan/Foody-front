'use client';
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from '@clerk/nextjs';
import { Button } from './ui/button';
import { Spinner } from './ui/spinner';
const Header = () => {
  const { isLoaded } = useUser();
  if (!isLoaded)
    return (
      <div className="flex items-center gap-6">
        <Spinner className="size-8" />
      </div>
    );

  return (
    <header className="flex justify-end items-center p-4 gap-4 h-16">
      <SignedOut>
        <SignInButton />
        <SignUpButton>
          <Button>Sign Up</Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
};

export default Header;
