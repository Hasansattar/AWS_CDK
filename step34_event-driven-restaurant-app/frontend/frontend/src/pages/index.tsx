import React, { FC, useState,useEffect } from 'react';
import * as  API  from "aws-amplify/api";
import * as Auth from "aws-amplify/auth";
import {Authenticator } from '@aws-amplify/ui-react';
//import { AuthState, onAuthUIStateChange, CognitoUserInterface } from '@aws-amplify/ui-components';
import { onGenerateAction } from '../graphql/subscriptions';
import { AdminPage, CustomerPage } from '../components';
import { PageProps } from 'gatsby';
import { constants } from 'zlib';

// import awsconfig from '../aws-exports';
// Amplify.configure(awsconfig);


     const client =API.generateClient();
    

     export interface CognitoUser {
      username: string;
      signInUserSession?: {
        accessToken?: {
          jwtToken?: string;
          payload?: {
            ['cognito:groups']?: string[];
            username?: string;
          };
        };
        idToken?: object;
        refreshToken?: object;
      };
    }

//////////////////////////////  COMPONENT ///////////////////////////////

const AuthStateApp: FC<PageProps> = () => {
    const [user, setUser] = useState<CognitoUser | null>(null);
    const [groups, setGroups] = useState<string[] | undefined>();


    useEffect(() => {
      const fetchGroups = async () => {
        try {
          const findUserInGroup = await Auth.fetchAuthSession();
          const userGroups = findUserInGroup.tokens?.accessToken?.payload?.['cognito:groups'];
          console.log("User Groups:", userGroups);
          setGroups(userGroups);
        } catch (error) {
          console.error('Error fetching user groups:', error);
        }
      };
  
      fetchGroups();
    }, []);
    
     
     

    
  console.log("groups",groups);
  const userGroup = groups;
    

    
    //const subscription = client.graphql(graphqlOperation(onGenerateAction)) as any;
  //  const userGroup = user?.signInUserSession?.accessToken?.payload?.['cognito:groups'];
    const subscription = client.graphql({query:onGenerateAction}) as any;
     
    console.log("userGroupuserGroup=======",userGroup);

    const handleSubscription = () => {

      subscription.subscribe({
            next: (status) => {   // when mutation will run the next will trigger
                console.log("New SUBSCRIPTION ==> ", status.value.data);
            },
        })
    }

    useEffect(() => {
      
        handleSubscription();
    }, []);

    return (
      <Authenticator signUpAttributes={['email', 'phone_number']}>
      {({ signOut, user: authUser }) => {
        setUser(authUser as CognitoUser);
       console.log("authUser--------",authUser);
      
        return (
          <main className="App">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Logged in User: {authUser.username}</h3>
              <button onClick={signOut}>Sign out</button>
            </div>
            {userGroup && userGroup.includes('admins') ? (
              <AdminPage user={authUser as CognitoUser} />
            ) : (
              <CustomerPage user={authUser as CognitoUser} />
            )}
          </main>
        );
      }}
    </Authenticator>
    )
    
    
    
    
  
}

export default AuthStateApp;