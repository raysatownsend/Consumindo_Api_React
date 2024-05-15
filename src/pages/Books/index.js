import React, {useState, useEffect} from "react";
import {useNavigate, Link } from 'react-router-dom';
import { FiPower, FiEdit, FiTrash2, FiDownload } from 'react-icons/fi';
import api from "../../services/api";
import logoImage from "../../assets/logo.svg";
import "./styles.css";

export default function Books() {

    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(0);
    const [files, setFiles] = useState([]);

    const navigate = useNavigate();

    const accessToken = localStorage.getItem("accessToken");
    const username = localStorage.getItem("username");

    const authorization = {
        headers:{
            Authorization: `Bearer ${accessToken}`
        }
    };

    const contentType = {
        headers: {
            "Content-Type": "application/octet-stream"
        }
    }

    const responseType = {
        headers: {
            responseType: 'blob',
        }
    }

    useEffect(() => {
        fetchMoreBooks();
    }, [accessToken])

    async function fetchMoreBooks() {
        const response = await api.get(`api/books/v1?page=${page}&size=8&direction=asc`, authorization)
        setBooks([...books, ...response.data._embedded.authorVOList]);
        setPage(page + 1);
    }

    async function editBook(id) {
        try {
            navigate(`/books/book/new/${id}`);
        } catch (error) {
            alert("Edit book failed, please try again.")
        }
    }

    async function downloadBook() {
        try {
            const response = await api.get("api/file/v1/downloadFile/PRESSMAN_Engenharia_de_software_Uma_Abor.pdf", authorization, contentType, responseType)
            // Create a Blob object from the response data
            const blob = new Blob([response.data], { type: response.headers["Content-Type"] });

            // Create a temporary anchor element
            const downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(blob);
            downloadLink.setAttribute('download', 'PRESSMAN_Engenharia_de_software_Uma_Abor.pdf'); // Set the download attribute with desired filename

            // Trigger the download by programmatically clicking the anchor element
            downloadLink.click();

            // Cleanup
            window.URL.revokeObjectURL(downloadLink.href);
        } catch (error) {
            alert("ERROR: Can't download choosen item, please try again.");
        }
    }

    async function deleteBook(id) {
        try {
            await api.delete(`api/books/v1/${id}`, authorization)
            setBooks(books.filter(book => book.id !== id))
        } catch (error) {
            alert("ERROR: Can't delete choosen item, please try again.")
        }
    }

    async function logout() {
        try {
            localStorage.clear()
            navigate("/")
        } catch (error) {
            alert("Logout failed, please try again.")
        }
    }


    return (
        <div className="book-container">
            <header>
                <img src={logoImage} alt="Logo" />
                <span>Bem-Vindo, <strong>{username.toUpperCase()}</strong>!</span>
                <Link className="button" to="book/new/0">Add New Book</Link>
                <button onClick={logout} type="button">
                    <FiPower size={18} color='#251FC5'/>
                </button>
            </header>

            <h1>Registered Books</h1>
            <ul>
                {books.map(book => (
                    <li key={book.id}>
                    <strong>Title:</strong>
                    <p>{book.title}</p>
                    <strong>Author:</strong>
                    <p>{book.author}</p>
                    <strong>Price:</strong>
                    <p>{Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(book.price)}</p>
                    <strong>Release Date:</strong>
                    <p>{Intl.DateTimeFormat('pt-BR').format(new Date(book.launchDate))}</p>

                    <button onClick={() => editBook(book.id)} type="button">
                        <FiEdit size={20} color="#251FC5"/>
                    </button>
                    <button onClick={() => downloadBook()} type="button">
                        <FiDownload size={20} color="#251FC5"/>
                    </button>
                    <button onClick={() => deleteBook(book.id)} type="button">
                        <FiTrash2 size={20} color="#251FC5"/>
                    </button>
                </li>
                ))}
            </ul>
            <button className="button" onClick={fetchMoreBooks} type="button">Load more</button>
        </div>
    );
}