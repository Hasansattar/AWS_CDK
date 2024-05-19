/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onAddTodo = /* GraphQL */ `subscription OnAddTodo {
  onAddTodo {
    id
    title
    done
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnAddTodoSubscriptionVariables,
  APITypes.OnAddTodoSubscription
>;
