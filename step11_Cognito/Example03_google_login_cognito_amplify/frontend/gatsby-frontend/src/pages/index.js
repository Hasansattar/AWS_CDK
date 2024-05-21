
import React  from 'react';
import  { Amplify} from 'aws-amplify';

import '@aws-amplify/ui-react/styles.css';
import { Authenticator } from '@aws-amplify/ui-react';
import awsconfig from '../aws-exports';

Amplify.configure(awsconfig);
export default function Index() {
  return (
    <Authenticator socialProviders={['google']}>
      {({ signOut, user }) => (
        <main>
          <h1>Hello {user.username}</h1>
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  );
}