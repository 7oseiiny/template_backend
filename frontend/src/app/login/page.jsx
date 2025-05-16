'use client'

import { useState } from 'react'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (res.ok) {
      // احفظ التوكن في localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('userId', data.user._id)

      Swal.fire({
        icon: 'success',
        title: 'Welcome!',
        text: data.message,
        confirmButtonText: 'Continue',
        confirmButtonColor: '#0070f3',
      }).then(() => {
        router.push('/clipboard') // ← هنا التعديل
      })

    } else {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: data.message,
        confirmButtonColor: '#d33',
      })
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Login</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          style={styles.input}
          name="ref"
          type="text"
          placeholder="Email or Username"
          onChange={handleChange}
        />
        <input
          style={styles.input}
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
        />
        <button type="submit" style={styles.button}>Login</button>
      </form>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '40px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
    gap: '10px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
  },
}
