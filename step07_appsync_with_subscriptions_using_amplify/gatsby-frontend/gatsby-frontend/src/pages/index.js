import React, { useState, useRef, useEffect } from "react";
//import { API } from "aws-amplify";
import { generateClient } from "aws-amplify/api"
import { addTodo } from "../graphql/mutations";
import { getTodos } from "../graphql/queries";
import { onAddTodo } from "../graphql/subscriptions";
import shortid from "shortid";

const client=    generateClient();

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [subscriptionTitle, setSubscriptionTitle] = useState('nothing available right now');
  //const [inputTitle, setInputTitle] = useState('');
  const [todoData, setTodoData] = useState();
  const todoTitleRef = useRef("")

  
  const addTodoMutation = async () => {
    try {
      const todo = {
        id: shortid.generate(),
        title: todoTitleRef.current.value,
        done: false,
      };
      await client.graphql({
        query: addTodo,
        variables: {
          todo: todo,
        },
      });
      todoTitleRef.current.value = ""
      fetchTodos();
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const fetchTodos = async () => {
    try {
      const data = await client.graphql({ query: getTodos });
      setTodoData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  

  useEffect(()=>{
    client.graphql({
      query:onAddTodo
    }).subscribe({
      next:(status)=>{
        console.log("New SUBSCRIPTION ==> ", status);
        console.log("New SUBSCRIPTION ==> ", status.value.data);
        setSubscriptionTitle(status.value.data.onAddTodo.title);
      }
    })

  },[]);

 

  useEffect(() => {
    fetchTodos();
    
   
  }, []);




  return (
    <div>
      {loading ? (
        <h1>Loading ...</h1>
      ) : (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div>
            <label>
              <input
                ref={todoTitleRef}
                placeholder="Todo title"
              />
            </label>
            <button onClick={() => addTodoMutation()}>Add Todo</button>
            <ul>
              {todoData?.data.getTodos.map((item, ind) => (
                <li style={{ marginLeft: "1rem", marginTop: "1rem" }} key={ind}>
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ marginLeft: "5rem" }}>
            <h2>Latest Todo Title</h2>
            <p>{subscriptionTitle}</p>
          </div>
        </div>
      )}
    </div>
  );
}
