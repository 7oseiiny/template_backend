'use client'
import { useEffect, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import ClipboardJS from 'clipboard'
import io from 'socket.io-client'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export default function ClipboardPage() {
    const [showForm, setShowForm] = useState(false)
    const [content, setContent] = useState('')
    const [clipboards, setClipboards] = useState([])
    const [type, setType] = useState('text')
    const [file, setFile] = useState(null)
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const socketRef = useRef(null) // ✅ استخدم useRef علشان ما يتغيرش

    const limit = 5 // نفس اللي في API

    // زرار تحميل سكريبت الويندوز
    const handleDownloadScript = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/user/windows-script`);
            if (!res.ok) throw new Error('Failed to fetch script');
            const scriptText = await res.text();
            const blob = new Blob([scriptText], { type: 'text/x-python' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'windows_script.py';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Download Failed',
                text: err.message,
                confirmButtonColor: '#d33',
            });
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) return

        const decoded = JSON.parse(atob(token.split('.')[1]))
        const userId = decoded._id

        // ✅ هنا بننشئ الـ socket على العميل فقط
        socketRef.current = io(`${window.location.origin}`, {
            query: { userId },
        })

        socketRef.current.emit('join', userId)

        socketRef.current.on('notification', (clip) => {
            // alert('📢 New clipboard received:', clip)
            Swal.fire({
                icon: 'success',
                title: 'Clipboard Saved!',
                text: '📢 New clipboard received:',
                confirmButtonColor: '#0070f3',
            })
            // if (clip && clip.data) {
            //     setClipboards(prev => [...prev, clip.data])
            //   }
        })

        fetchClipboards()

        return () => {
            socketRef.current?.disconnect()
        }
    }, [])
    useEffect(() => {
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [loading, hasMore])


    const fetchClipboards = async () => {
        if (loading || !hasMore) return;
        setLoading(true);

        const token = localStorage.getItem('token')
        const res = await fetch(`${BASE_URL}/api/clipboard?skip=${page * limit}&limit=${limit}`, {
            headers: { Authorization: `Bearer ${token}` }
        })

        const data = await res.json()

        if (Array.isArray(data.data)) {
            setClipboards(prev => [...prev, ...data.data])
            setHasMore((page + 1) * limit < data.total)
            setPage(prev => prev + 1)
        }

        setLoading(false)
    }


    const handleAddClipboard = async () => {
        const token = localStorage.getItem('token')

        let res, data

        if (type === 'text') {
            res = await fetch(`${BASE_URL}/api/clipboard`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content,
                    type: 'text'
                }),
            })
        } else {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('type', 'file')

            res = await fetch(`${BASE_URL}/api/clipboard`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            })
        }

        data = await res.json()

        if (res.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Clipboard Saved!',
                text: 'The clipboard has been added successfully.',
                confirmButtonColor: '#0070f3',
            })
            setContent('')
            setFile(null)
            setType('text')
            setShowForm(false)
            setClipboards(prev => [data.data, ...prev])
            setPage(0)
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: data.message || 'Something went wrong.',
                confirmButtonColor: '#d33',
            })
        }
    }

    const handleCopy = (text) => {
        const tempButton = document.createElement('button')
        tempButton.setAttribute('data-clipboard-text', text)
        document.body.appendChild(tempButton)

        const clipboard = new ClipboardJS(tempButton)
        clipboard.on('success', () => {
            Swal.fire({
                icon: 'success',
                title: 'Copied to Clipboard!',
                text: 'The content has been copied successfully.',
                confirmButtonColor: '#28a745',
            })
            clipboard.destroy()
            document.body.removeChild(tempButton)
        })

        clipboard.on('error', () => {
            Swal.fire({
                icon: 'info',
                title: 'Copy Manually',
                html: `<p>Unable to copy automatically. Please copy the text below:</p><textarea style="width: 100%; height: 80px;">${text}</textarea>`,
                confirmButtonColor: '#0070f3',
            })
            clipboard.destroy()
            document.body.removeChild(tempButton)
        })

        tempButton.click()
    }

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token')
        const res = await fetch(`${BASE_URL}/api/clipboard`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ _id: id }),
        })

        const data = await res.json()

        if (res.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Clipboard Deleted!',
                text: 'The clipboard has been deleted successfully.',
                confirmButtonColor: '#d33',
            })
            setClipboards(prev => prev.filter(clip => clip._id !== id))
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: data.message || 'Something went wrong.',
                confirmButtonColor: '#d33',
            })
        }
    }
    const handleScroll = () => {
        if (
            window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
            !loading &&
            hasMore
        ) {
            fetchClipboards()
        }
    }

    return (
        <div onScroll={handleScroll} style={styles.container}>
            <h2 style={styles.title}>My Clipboard</h2>
            <button style={{ ...styles.addButton, marginBottom: 10, backgroundColor: '#28a745' }} onClick={handleDownloadScript}>
                تحميل سكريبت ويندوز (Python)
            </button>

            {showForm ? (
                <div style={styles.form}>
                    <select value={type} onChange={(e) => setType(e.target.value)} style={styles.select}>
                        <option value="text">Text</option>
                        <option value="file">File</option>
                    </select>

                    {type === 'text' ? (
                        <textarea
                            style={styles.textarea}
                            placeholder="Write your clipboard content here..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    ) : (
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            style={styles.inputFile}
                        />
                    )}

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button style={styles.saveButton} onClick={handleAddClipboard}>
                            Save
                        </button>
                        <button style={styles.cancelButton} onClick={() => setShowForm(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button style={styles.addButton} onClick={() => setShowForm(true)}>
                    + Add Clipboard
                </button>
            )}

            {/* ✅ عرض الكليبات */}
            <div style={styles.clipList}

            >
                {clipboards.length === 0 ? (
                    <p style={{ marginTop: '20px' }}>No clipboards found.</p>
                ) : (
                    clipboards.map((clip, i) => {
                        if (!clip) return null // ← تجاهل الكليب الفارغ

                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(clip.content || '')
                        const fileUrl = clip.content

                        return (
                            <div key={i} style={styles.card}>
                                {clip.type === 'file' ? (
                                    isImage ? (
                                        <img
                                            src={fileUrl}
                                            alt="Clipboard Image"
                                            style={{ width: '100%', borderRadius: '6px' }}
                                        />
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span>📄</span>
                                            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                                Download File
                                            </a>
                                        </div>
                                    )
                                ) : (
                                    <p style={{ color: "black" }}>{clip.content}</p>
                                )}
                                <small style={{ color: '#555' }}>{new Date(clip.createdAt).toLocaleString()}</small>
                                <div style={styles.buttons}>
                                    {clip.type === 'text' ? (
                                        <button
                                            style={styles.copyButton}
                                            onClick={() => handleCopy(clip.content)}
                                        >
                                            Copy
                                        </button>
                                    ) : (
                                        <a
                                            href={fileUrl}
                                            download
                                            style={{
                                                ...styles.copyButton,
                                                textDecoration: 'none',
                                                textAlign: 'center',
                                            }}
                                        >
                                            Download
                                        </a>
                                    )}
                                    <button
                                        style={styles.deleteButton}
                                        onClick={() => handleDelete(clip._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )
                    })



                )}
            </div>
        </div>
    )
}

const styles = {
    container: {
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowY: 'auto', /* تأكد من أن التمرير يعمل */
        // maxHeight: '100vh',
    },
    title: {
        fontSize: '26px',
        marginBottom: '20px',
    },
    addButton: {
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#0070f3',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginBottom: '20px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '400px',
        marginBottom: '20px',
    },
    textarea: {
        width: '100%',
        height: '120px',
        padding: '10px',
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '6px',
    },
    inputFile: {
        padding: '10px',
        fontSize: '16px',
    },
    select: {
        padding: '8px',
        fontSize: '16px',
        borderRadius: '6px',
        border: '1px solid #ccc',
    },
    saveButton: {
        flex: 1,
        padding: '10px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
    },
    cancelButton: {
        flex: 1,
        padding: '10px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
    },
    clipList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        width: '400px',
    },
    card: {
        padding: '15px',
        backgroundColor: '#f9f9f9',
        borderRadius: '6px',
        border: '1px solid #ddd',
        wordBreak: 'break-word',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    buttons: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '10px',
    },
    copyButton: {
        padding: '6px 12px',
        backgroundColor: '#0070f3',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
    },
    deleteButton: {
        padding: '6px 12px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
    },
}
