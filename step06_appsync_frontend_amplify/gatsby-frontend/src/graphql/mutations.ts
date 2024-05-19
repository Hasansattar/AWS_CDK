/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const addTodo = /* GraphQL */ `mutation AddTodo($todo: TodoInput!) {
  addTodo(todo: $todo) {
    id
    title
    done
    __typename
  }
}
` as GeneratedMutation<
  APITypes.AddTodoMutationVariables,
  APITypes.AddTodoMutation
>;
export const updateTodo = /* GraphQL */ `mutation UpdateTodo($todo: TodoInput!) {
  updateTodo(todo: $todo) {
    id
    title
    done
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateTodoMutationVariables,
  APITypes.UpdateTodoMutation
>;
export const deleteTodo = /* GraphQL */ `mutation DeleteTodo($todoId: String!) {
  deleteTodo(todoId: $todoId)
}
` as GeneratedMutation<
  APITypes.DeleteTodoMutationVariables,
  APITypes.DeleteTodoMutation
>;
