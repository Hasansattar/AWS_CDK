import React, { useState, useRef, useEffect } from "react"
import { addTodo } from "../graphql/mutations"
import { getTodos } from "../graphql/queries"
import { generateClient } from "aws-amplify/api"
import shortid from "shortid"

const client=    generateClient();

// interface title {
//   title: string
// }

// interface incomingData {
//   data: {
//     getTodos: title[]
//   }
// }

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [todoData, setTodoData] = useState(null)
  const todoTitleRef = useRef("")

  const addTodoMutation = async () => {
    try {
      const todo = {
        id: shortid.generate(),
        title: todoTitleRef.current.value,
        done: false,
      }
      const data = await client.graphql({
        query: addTodo,
        variables: {
          todo: todo,
        },
      })
      todoTitleRef.current.value = ""
      fetchTodos()
    } catch (e) {
      console.log(e)
    }
  }

  const fetchTodos = async () => {
    try {
      const data = await client.graphql({
        query: getTodos,
      })
      setTodoData(data)
      setLoading(false)
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  return (
    <div>
      {loading ? (
        <h1>Loading ...</h1>
      ) : (
        <div>
          <label>
            Todo:
            <input ref={todoTitleRef} />
          </label>
          <button onClick={() => addTodoMutation()}>Create Todo</button>
          {todoData.data &&
            todoData.data.getTodos.map((item, ind) => (
              <div style={{ marginLeft: "1rem", marginTop: "2rem" }} key={ind}>
                {item.title}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}