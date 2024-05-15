import React, {useState, useEffect} from "react";
import {useNavigate, useParams, Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import api from "../../services/api";
import "./styles.css";
import logoImage from "../../assets/logo.svg";

export default function NewBook(){

    const [id, setId] = useState(null);
    const [author, setAuthor] = useState("");
    const [launchDate, setLaunchDate] = useState("");
    const [price, setPrice] = useState("");
    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [filename, setFileName] = useState("");
    const [fileDownloadUri, setFileUrl] = useState("");
    const [fileType, setFileType] = useState("");
    const [fileSize, setFileSize] = useState(null);


    const {bookId} = useParams();

    const navigate = useNavigate();

    const accessToken = localStorage.getItem("accessToken");

    const authorization = {
        headers:{
            Authorization: `Bearer ${accessToken}`
        }
    };

    useEffect(() => {
        if (bookId ==="0") return;
        else loadBooks();
    }, [bookId]);

    async function loadBooks() {
        try {
            const response = await api.get(`api/books/v1/${bookId}`, authorization);

            let adjustedDate = response.data.launchDate.split("T", 10)[0];

            setId(response.data.id);
            setAuthor(response.data.author);
            setTitle(response.data.title);
            setLaunchDate(adjustedDate);
            setPrice(response.data.price);

        } catch (error) {
            alert("Failed, please try again.");
            navigate("/books");
        }
    };



    async function uploadsFile() {
        
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", file);
            const response = await api.post("api/file/v1/uploadFile", formData, authorization);
                setFileName(response.data.filename);
                setFileUrl(response.data.fileDownloadUri);
                setFileType(response.data.fileType);
                setFileSize(response.data.fileSize);
            alert("Upload completed!");
        }
            // Handle response if needed
            catch (error) {
            alert("Failed to upload file, please try again.");
        } finally {
            setUploading(false);
        }
    };

    async function saveOrUpdate(e) {
        e.preventDefault();

        const data = {
            author,
            launchDate,
            price,
            title
        };

        try {
            if(bookId === "0") {
                await api.post("api/books/v1", data, authorization);
            } else {
                data.id = bookId;
                await api.put("api/books/v1", data, authorization);
            }

        } catch (error) {
            alert("Login failed, try again.");
        }
        navigate("/books");
    };

    return(
        <div className="new-book-container">
            <div className="content">
                <section className="form">
                    <img src={logoImage} alt="logo" />
                    <h1>{bookId === '0' ? "Add New" : "Update"} Book</h1>
                    <p>{bookId === '0' ? `Fill in the blanks with` : `Update`} book information and click on <em>{bookId === '0' ? `"Add"` : `"Update"`}</em> button!</p>
                    <Link className="back-link" to="/books">
                        <FiArrowLeft size={16} color="#251fc5"/>
                        Home
                    </Link>
                </section>
                <form onSubmit={saveOrUpdate}>
                    <input placeholder="Title" 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    />
                    <input placeholder="Author"
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                     />
                    <input type="date"
                    value={launchDate}
                    onChange={e => setLaunchDate(e.target.value)}
                    />
                    <input placeholder="Price"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    />
                    <input type="file"
                    onChange={e => setFile(e.target.files[0])}/>
                    <button onClick={uploadsFile} disabled={uploading}> {uploading ? "Uploading..." : "Upload"}</button>

                    <button className="button" type="submit">{bookId === '0' ? "Add" : "Update"}</button>
                </form>
            </div>
        </div>
    );
}