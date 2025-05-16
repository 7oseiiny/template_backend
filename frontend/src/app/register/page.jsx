'use client'
import { useState } from 'react'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export default function RegisterPage() {
    const router = useRouter()
    const [form, setForm] = useState({
        name: '',
        email: '',
        userName: '',
        password: '',
        number: '',
        role: 'user'
    })

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async () => {
        const res = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })

        const data = await res.json()

        if (res.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Registered!',
                text: data.message,
                confirmButtonText: 'Go to Login',
                confirmButtonColor: '#0070f3',
            }).then((result) => {
                if (result.isConfirmed) {
                    router.push('/login') // ← توجيه المستخدم لصفحة تسجيل الدخول
                }
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: data.message,
                confirmButtonColor: '#d33',
            })
        }
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Register</h2>
            <div style={styles.form}>
                <input style={styles.input} name="name" placeholder="Name" onChange={handleChange} />
                <input style={styles.input} name="email" placeholder="Email" onChange={handleChange} />
                <input style={styles.input} name="userName" placeholder="Username" onChange={handleChange} />
                <input style={styles.input} name="password" type="password" placeholder="Password" onChange={handleChange} />
                <input style={styles.input} name="number" placeholder="Phone Number" onChange={handleChange} />
                <button style={styles.button} onClick={handleSubmit}>Register</button>
            </div>
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
